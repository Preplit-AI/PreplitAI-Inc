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
 * Audio in, transcript out - with the parts that could not be heard marked
 * rather than guessed.
 *
 * 1. ffmpeg re-encodes whatever the phone produced to 16 kHz mono and cuts it
 *    into ten-minute pieces, which keeps every request well under the API's
 *    file-size limit and decodes anything ffmpeg can (m4a, mp3, wav, webm...).
 * 2. Each piece goes to Whisper with timestamps.
 * 3. Segments Whisper reports as non-speech are dropped (a student who starts
 *    recording twelve minutes late gets no invented first twelve minutes).
 *    Segments it was not confident about become "[불명확]" and their time
 *    ranges are returned, so Junbee can say which minutes it left out.
 */

const SEGMENT_SECONDS = 600;
const UNCLEAR = '[불명확]';

// Whisper's well-known inventions on silence or noise. A segment that is only
// one of these is dropped.
const KNOWN_HALLUCINATIONS = [
  '시청해 주셔서 감사합니다', '시청해주셔서 감사합니다', '구독과 좋아요 부탁드립니다',
  '감사합니다', 'thank you for watching', 'thanks for watching', 'mbc 뉴스',
];

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

function classify(segment) {
  const text = (segment.text || '').trim();
  const normalised = text.toLowerCase().replace(/[.!?。,\s]+$/g, '');
  if (!text || segment.no_speech_prob >= 0.6 || KNOWN_HALLUCINATIONS.includes(normalised)) return 'silence';
  if (segment.avg_logprob < -1.0 || segment.compression_ratio > 2.4) return 'unclear';
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

/**
 * @param {string} inputPath audio file on disk (deleted by the caller)
 * @param {{ prompt?: string }} options prompt: course name, to help with jargon
 * @returns {Promise<{ transcript: string, durationSeconds: number, unclearRanges: {start:number,end:number}[], speechSegments: number }>}
 */
async function transcribeFile(inputPath, { prompt } = {}) {
  const groq = getClient();
  const workDir = path.join(os.tmpdir(), 'junbee-audio-' + crypto.randomBytes(8).toString('hex'));
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
      const result = await groq.audio.transcriptions.create({
        file: fs.createReadStream(path.join(workDir, part)),
        model: TRANSCRIBE_MODEL,
        response_format: 'verbose_json',
        temperature: 0,
        ...(prompt ? { prompt: prompt.slice(0, 200) } : {}),
      });

      for (const segment of result.segments || []) {
        const start = offset + segment.start;
        const end = offset + segment.end;
        const kind = classify(segment);
        if (kind === 'silence') continue;
        if (kind === 'unclear') {
          unclear.push({ start, end });
          if (lines[lines.length - 1]?.endsWith(UNCLEAR)) continue;
          lines.push('[' + stamp(start) + '] ' + UNCLEAR);
        } else {
          speechSegments += 1;
          lines.push('[' + stamp(start) + '] ' + segment.text.trim());
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
 * One short piece of a class that is being listened to live. It goes to Whisper
 * as it is: a piece of a minute or less needs no ffmpeg, which is what lets a
 * serverless function do this.
 *
 * @param {string} filePath the piece, with its extension (deleted by the caller)
 * @param {{ prompt?: string, offsetSeconds?: number, fallbackSeconds?: number }} options
 *   offsetSeconds: how far into the class this piece starts
 * @returns {Promise<{ lines: string[], seconds: number, speechSegments: number }>}
 */
async function transcribeChunk(filePath, { prompt, offsetSeconds = 0, fallbackSeconds = 0 } = {}) {
  const groq = getClient();
  const result = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: TRANSCRIBE_MODEL,
    response_format: 'verbose_json',
    temperature: 0,
    ...(prompt ? { prompt: prompt.slice(0, 200) } : {}),
  });
  const lines = [];
  let speechSegments = 0;
  for (const segment of result.segments || []) {
    const kind = classify(segment);
    if (kind === 'silence') continue;
    const at = '[' + stamp(offsetSeconds + segment.start) + '] ';
    if (kind === 'unclear') {
      if (lines[lines.length - 1]?.endsWith(UNCLEAR)) continue;
      lines.push(at + UNCLEAR);
    } else {
      speechSegments += 1;
      lines.push(at + segment.text.trim());
    }
  }
  return { lines, seconds: Number(result.duration) || fallbackSeconds, speechSegments };
}

module.exports = { transcribeFile, transcribeChunk, classify, mergeRanges, stamp, UNCLEAR };
