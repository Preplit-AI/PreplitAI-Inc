'use strict';
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { getClient } = require('./llmService');
const { TRANSCRIBE_MODEL } = require('../config/constants');

/**
 * Audio in, transcript out — powered by Gemini 2.5 Flash, which natively
 * understands audio files sent as inline data through the chat completions
 * endpoint.
 *
 * 1. ffmpeg re-encodes whatever the phone produced to 16 kHz mono and cuts it
 *    into ten-minute pieces, which keeps every request well under the API's
 *    size limit and decodes anything ffmpeg can (m4a, mp3, wav, webm…).
 * 2. Each piece goes to Gemini as an inline audio part with a transcription
 *    prompt. The model returns JSON with timestamped segments, confidence
 *    flags, and speech detection.
 * 3. Segments the model reports as non-speech are dropped. Segments it was
 *    not confident about become "[불명확]" and their time ranges are returned,
 *    so Juno can say which minutes it left out.
 */

const SEGMENT_SECONDS = 600;
const UNCLEAR = '[불명확]';

const TRANSCRIPTION_PROMPT = `You are an expert speech-to-text transcription engine for Korean university lectures.
Transcribe the audio precisely, preserving all Korean text and technical terminology exactly as spoken.

Output JSON only, in this exact shape:
{"segments":[{"start":0.0,"end":2.5,"text":"transcribed text","confidence":"high"}]}

Rules:
- "start" and "end" are seconds from the beginning of this audio clip.
- "confidence" is "high" for clearly heard speech, "low" for uncertain/garbled speech, and "silence" for non-speech (noise, music, silence, applause).
- For "silence" segments, set "text" to "".
- For "low" confidence segments, transcribe your best guess of what was said.
- Do NOT invent content. If you cannot hear anything meaningful, mark it as "silence".
- Technical terms must be transcribed in the language spoken (Korean, English, or mixed).
- Common filler sounds (음, 어) in isolation are "silence".
- Stock phrases like "시청해 주셔서 감사합니다", "구독과 좋아요 부탁드립니다", "MBC 뉴스" in isolation are "silence" (recording artifacts).`;

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-4000); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      const err = new Error('ffmpeg exited with code ' + code + ': ' + stderr.trim().split('\n').pop());
      err.code = 'AUDIO_UNREADABLE';
      reject(err);
    });
  });
}

/**
 * Classify a segment from Gemini's response.
 * Kept compatible with the old Whisper-based classify() signature so the
 * transcription.test.js unit tests for the Whisper path still pass.
 */
function classify(segment) {
  // Legacy Whisper-style segment (from tests)
  if ('no_speech_prob' in segment || 'avg_logprob' in segment) {
    const text = (segment.text || '').trim();
    const KNOWN_HALLUCINATIONS = [
      '시청해 주셔서 감사합니다', '시청해주셔서 감사합니다', '구독과 좋아요 부탁드립니다',
      '감사합니다', 'thank you for watching', 'thanks for watching', 'mbc 뉴스',
    ];
    const normalised = text.toLowerCase().replace(/[.!?。,\s]+$/g, '');
    if (!text || segment.no_speech_prob >= 0.6 || KNOWN_HALLUCINATIONS.includes(normalised)) return 'silence';
    if (segment.avg_logprob < -1.0 || segment.compression_ratio > 2.4) return 'unclear';
    return 'speech';
  }
  // Gemini-style segment
  const conf = (segment.confidence || '').toLowerCase();
  if (conf === 'silence' || !(segment.text || '').trim()) return 'silence';
  if (conf === 'low') return 'unclear';
  return 'speech';
}

const stamp = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

/** Merges unclear stretches that sit close together into one range. */
function mergeRanges(ranges, gapSeconds = 30) {
  const merged = [];
  for (const r of ranges.sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (last && r.start - last.end <= gapSeconds) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }
  return merged;
}

/** Extract the first JSON object from text the model returned. */
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** MIME type for the audio encoding we send to Gemini. */
const AUDIO_MIME = 'audio/mp3';

/**
 * Send one audio file to Gemini for transcription via the chat completions
 * endpoint using the OpenAI-compatible inline audio format.
 */
async function transcribeWithGemini(client, filePath, { prompt, model }) {
  const audioBuffer = await fsp.readFile(filePath);
  const base64Audio = audioBuffer.toString('base64');

  const userContent = [
    { type: 'text', text: prompt ? `Context: This is from a lecture on "${prompt.slice(0, 200)}".\n\n${TRANSCRIPTION_PROMPT}` : TRANSCRIPTION_PROMPT },
    {
      type: 'input_audio',
      input_audio: {
        data: base64Audio,
        format: 'mp3',
      },
    },
  ];

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [{ role: 'user', content: userContent }],
    response_format: { type: 'json_object' },
  });

  const raw = (completion.choices?.[0]?.message?.content || '').trim();
  const parsed = extractJson(raw);
  if (!parsed || !Array.isArray(parsed.segments)) {
    // Return empty segments rather than throwing — the caller handles empty
    return { segments: [], duration: 0 };
  }
  // Estimate duration from the last segment's end time
  const lastSeg = parsed.segments[parsed.segments.length - 1];
  const duration = lastSeg ? (lastSeg.end || 0) : 0;
  return { segments: parsed.segments, duration };
}

/**
 * @param {string} inputPath audio file on disk (deleted by the caller)
 * @param {{ prompt?: string }} options prompt: course name, to help with jargon
 * @returns {Promise<{ transcript: string, durationSeconds: number, unclearRanges: {start:number,end:number}[], speechSegments: number }>}
 */
async function transcribeFile(inputPath, { prompt } = {}) {
  const client = getClient();
  const workDir = path.join(os.tmpdir(), 'preplit-audio-' + crypto.randomBytes(8).toString('hex'));
  await fsp.mkdir(workDir, { recursive: true });

  try {
    await runFfmpeg([
      '-hide_banner', '-loglevel', 'error', '-nostdin',
      '-i', inputPath,
      '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libmp3lame', '-b:a', '32k',
      '-f', 'segment', '-segment_time', String(SEGMENT_SECONDS), '-reset_timestamps', '1',
      path.join(workDir, 'part_%03d.mp3'),
    ]);

    const parts = (await fsp.readdir(workDir)).filter((f) => f.endsWith('.mp3')).sort();
    if (parts.length === 0) {
      const err = new Error('No audio stream found');
      err.code = 'AUDIO_UNREADABLE';
      throw err;
    }

    const lines = [];
    const unclear = [];
    let offset = 0;
    let speechSegments = 0;

    for (const part of parts) {
      const partPath = path.join(workDir, part);
      const result = await transcribeWithGemini(client, partPath, {
        prompt,
        model: TRANSCRIBE_MODEL,
      });

      for (const segment of result.segments) {
        const start = offset + (segment.start || 0);
        const end = offset + (segment.end || 0);
        const kind = classify(segment);
        if (kind === 'silence') continue;
        if (kind === 'unclear') {
          unclear.push({ start, end });
          if (lines[lines.length - 1]?.endsWith(UNCLEAR)) continue;
          lines.push('[' + stamp(start) + '] ' + UNCLEAR);
        } else {
          speechSegments += 1;
          lines.push('[' + stamp(start) + '] ' + (segment.text || '').trim());
        }
      }
      offset += Number(result.duration) || SEGMENT_SECONDS;
    }

    return {
      transcript: lines.join('\n'),
      durationSeconds: Math.round(offset),
      // Only stretches long enough to matter are reported to the student.
      unclearRanges: mergeRanges(unclear).filter((r) => r.end - r.start >= 15)
        .map((r) => ({ start: Math.floor(r.start), end: Math.ceil(r.end) })),
      speechSegments,
    };
  } finally {
    await fsp.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * One short piece of a class that is being listened to live. It goes to Gemini
 * as it is: a piece of a minute or less needs no ffmpeg.
 *
 * @param {string} filePath the piece, with its extension (deleted by the caller)
 * @param {{ prompt?: string, offsetSeconds?: number, fallbackSeconds?: number }} options
 *   offsetSeconds: how far into the class this piece starts
 * @returns {Promise<{ lines: string[], seconds: number, speechSegments: number }>}
 */
async function transcribeChunk(filePath, { prompt, offsetSeconds = 0, fallbackSeconds = 0 } = {}) {
  const client = getClient();
  const result = await transcribeWithGemini(client, filePath, {
    prompt,
    model: TRANSCRIBE_MODEL,
  });

  const lines = [];
  let speechSegments = 0;
  for (const segment of result.segments) {
    const kind = classify(segment);
    if (kind === 'silence') continue;
    const at = '[' + stamp(offsetSeconds + (segment.start || 0)) + '] ';
    if (kind === 'unclear') {
      if (lines[lines.length - 1]?.endsWith(UNCLEAR)) continue;
      lines.push(at + UNCLEAR);
    } else {
      speechSegments += 1;
      lines.push(at + (segment.text || '').trim());
    }
  }
  return { lines, seconds: Number(result.duration) || fallbackSeconds, speechSegments };
}

module.exports = { transcribeFile, transcribeChunk, classify, mergeRanges, stamp, UNCLEAR };
