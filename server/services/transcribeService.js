'use strict';
const fsp = require('fs/promises');
const path = require('path');

/**
 * Preplit Transcribe (https://transcribe.iw12.org): Whisper on a GPU, with
 * silence removed first and timestamps mapped back to the original recording.
 * Lecture Buddy uses it for live pieces and for whole recordings whenever
 * TRANSCRIBE_INTERNAL_API_KEY is set; otherwise transcription.js uses the
 * language model directly.
 *
 * Only transcription is asked for (skip_summary): notes, terms, exam hints and
 * review cards are written by lectureService.js, under the product's rules.
 * The service deletes the audio as soon as it is transcribed, and results are
 * fetched with consume=true so they are not kept in its memory either.
 *
 * The service never retries by itself, so a failure surfaces here with a code
 * the callers know: AUDIO_UNREADABLE for audio it cannot read, TRANSCRIBE_FAILED
 * for anything else.
 */

const DEFAULT_URL = 'https://transcribe.iw12.org';
const baseUrl = () => (process.env.TRANSCRIBE_SERVICE_URL || DEFAULT_URL).replace(/\/+$/, '');
/** Set up when the key is. Tests load server/.env too, so under test only a local stand-in counts: no test ever reaches the real service. */
const configured = () => Boolean((process.env.TRANSCRIBE_INTERNAL_API_KEY || '').trim())
  && (process.env.NODE_ENV !== 'test' || /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(process.env.TRANSCRIBE_SERVICE_URL || ''));
const authHeaders = () => ({ 'X-API-Key': process.env.TRANSCRIBE_INTERNAL_API_KEY.trim() });

const TYPES = {
  '.webm': 'audio/webm', '.m4a': 'audio/mp4', '.mp4': 'audio/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.ogg': 'audio/ogg', '.aac': 'audio/aac', '.flac': 'audio/flac',
};

/** A teaching language the service accepts ("ko", "en", "zh-CN"), else automatic detection. */
const languageMode = (code) => (typeof code === 'string' && /^[a-z]{2}(-[A-Za-z]{2})?$/.test(code) ? code : 'auto');

/** Course names and the end of what was just said, as Whisper's hint. The service accepts 300 characters. */
const keywordsFrom = (text) => String(text || '').replace(/\s+/g, ' ').trim().slice(0, 300);

function failure(message, code = 'TRANSCRIBE_FAILED', status) {
  const err = new Error(message);
  err.code = code;
  if (status) err.status = status;
  return err;
}

/** What the service said went wrong, without echoing anything we sent. */
async function reason(res) {
  const body = await res.json().catch(() => null);
  const detail = body && (body.detail || body.error);
  return typeof detail === 'string' ? detail : detail ? JSON.stringify(detail).slice(0, 300) : res.statusText;
}

async function formFor(filePath, { keywords, language }) {
  const ext = path.extname(filePath).toLowerCase();
  const form = new FormData();
  form.append('file', new Blob([await fsp.readFile(filePath)], { type: TYPES[ext] || 'application/octet-stream' }), 'lecture' + (TYPES[ext] ? ext : '.m4a'));
  form.append('skip_summary', 'true');
  form.append('language_mode', languageMode(language));
  const hint = keywordsFrom(keywords);
  if (hint) form.append('course_keywords', hint);
  return form;
}

async function request(url, options, timeoutMs) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    throw failure('Transcription service unreachable: ' + (err.cause ? err.cause.code || err.cause.message : err.message));
  }
}

function checkStart(res, detail) {
  if (res.status === 400) throw failure('Audio could not be read: ' + detail, 'AUDIO_UNREADABLE', 400);
  throw failure(`Transcription service answered ${res.status}: ${detail}`, 'TRANSCRIBE_FAILED', res.status);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One short piece (a live 20-second piece), answered in the same request.
 * @returns {Promise<object>} the service's TranscribeResponse
 */
async function transcribeClip(filePath, { keywords, language, timeoutMs = 90 * 1000 } = {}) {
  const res = await request(baseUrl() + '/api/transcribe', { method: 'POST', headers: authHeaders(), body: await formFor(filePath, { keywords, language }) }, timeoutMs);
  if (!res.ok) checkStart(res, await reason(res));
  return res.json();
}

/**
 * A whole recording: queued as a job and polled until it is done. A full queue
 * (429) is waited out a few times before giving up.
 * @returns {Promise<object>} the service's TranscribeResponse
 */
async function transcribeRecording(filePath, { keywords, language, timeoutMs = 30 * 60 * 1000, pollMs = 2000, busyWaitMs = 15000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let started;
  for (let attempt = 0; ; attempt += 1) {
    const res = await request(baseUrl() + '/api/transcribe/jobs', { method: 'POST', headers: authHeaders(), body: await formFor(filePath, { keywords, language }) }, 10 * 60 * 1000);
    if (res.status === 429 && attempt < 3 && Date.now() + busyWaitMs < deadline) { await sleep(busyWaitMs); continue; }
    if (!res.ok) checkStart(res, await reason(res));
    started = await res.json();
    break;
  }
  if (!started || !started.job_id) throw failure('Transcription service gave no job id');

  const url = `${baseUrl()}/api/transcribe/jobs/${encodeURIComponent(started.job_id)}?consume=true`;
  while (Date.now() < deadline) {
    await sleep(pollMs);
    const res = await request(url, { headers: authHeaders() }, 60 * 1000);
    if (!res.ok) throw failure(`Transcription job lost (${res.status}): ${await reason(res)}`);
    const job = await res.json();
    // A job that failed in the background still answers 200: the status says so.
    if (job.status === 'failed') throw failure('Transcription job failed: ' + (job.error || 'no reason given'));
    if (job.status === 'completed') {
      if (!job.result) throw failure('Transcription job finished without a result');
      return job.result;
    }
  }
  throw failure('Transcription job did not finish in time');
}

module.exports = { configured, transcribeClip, transcribeRecording, languageMode, keywordsFrom };
