'use strict';
/**
 * Lecture Buddy through the Preplit transcription service. The service is a
 * local stand-in that behaves as its specification says: the key in
 * X-API-Key, a synchronous route for short pieces, and jobs polled with
 * consume=true that can fail in the background while still answering 200.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
for (const k of ['OPENROUTER_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'GROQ_BASE_URL']) delete process.env[k];
const KEY = 'service-key-for-tests';

const requests = [];
const jobs = new Map();
let server;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-transcribe-'));
const audio = (name, body) => { const p = path.join(dir, name); fs.writeFileSync(p, body); return p; };

const SPEECH = { detected_language: 'en', no_speech_detected: false, full_text: 'Round robin. Quantum.',
  segments: [{ start: 0.5, end: 2, text: ' Round robin. ' }, { start: 3.2, end: 5, text: 'Quantum.' }, { start: 6, end: 6.5, text: '  ' }],
  summary: null, audio_stats: { original_duration_seconds: 20.4, trimmed_duration_seconds: 5, silence_removed_seconds: 15.4, silence_removed_percent: 75, speech_segments_count: 2 },
  audio_deleted: true, r2_deleted: true, provider: 'modal:lecture-transcriber', warnings: [] };
const SILENCE = { ...SPEECH, no_speech_detected: true, full_text: '', segments: [], provider: 'vad:no-speech' };

before(async () => {
  server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('latin1');
      const url = new URL(req.url, 'http://x');
      const field = (name) => { const m = new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)`).exec(body); return m ? m[1] : undefined; };
      requests.push({ method: req.method, path: url.pathname, consume: url.searchParams.get('consume'), key: req.headers['x-api-key'],
        skip: field('skip_summary'), mode: field('language_mode'), keywords: field('course_keywords'), filename: (/filename="([^"]+)"/.exec(body) || [])[1] });
      const send = (status, json) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(json)); };
      if (req.headers['x-api-key'] !== KEY) return send(401, { detail: 'Invalid API key' });
      const outcome = body.includes('BROKEN') ? 'broken' : body.includes('SILENCE') ? 'silence' : body.includes('FAILJOB') ? 'fail' : 'speech';
      if (req.method === 'POST' && url.pathname === '/api/transcribe') {
        if (outcome === 'broken') return send(400, { detail: 'Audio could not be decoded' });
        return send(200, outcome === 'silence' ? SILENCE : SPEECH);
      }
      if (req.method === 'POST' && url.pathname === '/api/transcribe/jobs') {
        const id = 'job' + (jobs.size + 1);
        jobs.set(id, { outcome, polls: 0 });
        return send(202, { job_id: id, status: 'queued', stage: 'Queued for audio processing...' });
      }
      const m = /^\/api\/transcribe\/jobs\/([^/]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m && jobs.has(m[1])) {
        const job = jobs.get(m[1]);
        job.polls += 1;
        if (job.polls < 2) return send(200, { job_id: m[1], status: 'processing', stage: 'Transcribing', result: null, error: null });
        if (url.searchParams.get('consume') === 'true') jobs.delete(m[1]);
        if (job.outcome === 'fail') return send(200, { job_id: m[1], status: 'failed', stage: 'Failed', result: null, error: 'GPU worker crashed' });
        return send(200, { job_id: m[1], status: 'completed', stage: 'Done', result: job.outcome === 'silence' ? SILENCE : SPEECH, error: null });
      }
      send(404, { detail: 'Not found' });
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.env.TRANSCRIBE_SERVICE_URL = `http://127.0.0.1:${server.address().port}/`;
  process.env.TRANSCRIBE_INTERNAL_API_KEY = KEY;
});
after(() => { server.close(); fs.rmSync(dir, { recursive: true, force: true }); });

const { transcribeChunk, transcribeFile } = require('../services/transcription');

test('a live piece is transcribed by the service, stamped from where it falls in the class', async () => {
  const piece = await transcribeChunk(audio('piece.webm', 'SPEECH'), { prompt: 'Operating Systems. the ready queue', language: 'ko', offsetSeconds: 40, fallbackSeconds: 20 });
  assert.deepEqual(piece, { lines: ['[00:40] Round robin.', '[00:43] Quantum.'], seconds: 20.4, speechSegments: 2 });
  const sent = requests.at(-1);
  assert.equal(sent.path, '/api/transcribe');
  assert.equal(sent.key, KEY);
  assert.equal(sent.skip, 'true', 'notes are written by our own pipeline, so no summary is asked for');
  assert.equal(sent.mode, 'ko');
  assert.equal(sent.keywords, 'Operating Systems. the ready queue');
  assert.equal(sent.filename, 'lecture.webm', 'the file keeps its kind');

  await transcribeChunk(audio('piece2.m4a', 'SPEECH'), { language: 'Korean' });
  assert.equal(requests.at(-1).mode, 'auto', 'anything but a language code means automatic detection');
});

test('a piece with no speech adds no lines but still counts its time', async () => {
  assert.deepEqual(await transcribeChunk(audio('quiet.webm', 'SILENCE'), { offsetSeconds: 60, fallbackSeconds: 20 }), { lines: [], seconds: 20.4, speechSegments: 0 });
});

test('a whole recording goes through a job, polled until done and consumed', async () => {
  const before = requests.length;
  const result = await transcribeFile(audio('class.m4a', 'SPEECH'), { prompt: 'Operating Systems' });
  assert.deepEqual(result, { transcript: '[00:00] Round robin.\n[00:03] Quantum.', durationSeconds: 20, unclearRanges: [], speechSegments: 2 });
  const made = requests.slice(before);
  assert.equal(made[0].path, '/api/transcribe/jobs');
  assert.equal(made[0].skip, 'true');
  assert.ok(made.filter((r) => r.method === 'GET').length >= 2, 'polled until finished');
  assert.ok(made.filter((r) => r.method === 'GET').every((r) => r.consume === 'true'), 'results are not kept by the service');

  const silent = await transcribeFile(audio('empty.m4a', 'SILENCE'), {});
  assert.equal(silent.speechSegments, 0, 'so the lecture fails as no_speech');
});

test('failures are reported, not hidden: a job that failed in the background, a wrong key, unreadable audio', async () => {
  await assert.rejects(transcribeFile(audio('bad-job.m4a', 'FAILJOB'), {}), /Transcription job failed: GPU worker crashed/);
  await assert.rejects(transcribeChunk(audio('broken.webm', 'BROKEN'), {}), (err) => err.code === 'AUDIO_UNREADABLE');
  process.env.TRANSCRIBE_INTERNAL_API_KEY = 'wrong';
  try {
    await assert.rejects(transcribeChunk(audio('nokey.webm', 'SPEECH'), {}), (err) => err.status === 401 && err.code === 'TRANSCRIBE_FAILED');
  } finally {
    process.env.TRANSCRIBE_INTERNAL_API_KEY = KEY;
  }
});

test('the key may also be set as INTERNAL_API_KEY, the name the service itself uses', async () => {
  delete process.env.TRANSCRIBE_INTERNAL_API_KEY;
  process.env.INTERNAL_API_KEY = KEY;
  try {
    const piece = await transcribeChunk(audio('alias.webm', 'SPEECH'), {});
    assert.equal(piece.speechSegments, 2);
    assert.equal(requests.at(-1).key, KEY);
  } finally {
    delete process.env.INTERNAL_API_KEY;
    process.env.TRANSCRIBE_INTERNAL_API_KEY = KEY;
  }
});

test('without the service key, transcription goes to the language model instead', async () => {
  const count = requests.length;
  delete process.env.TRANSCRIBE_INTERNAL_API_KEY;
  try {
    await assert.rejects(transcribeChunk(audio('model.webm', 'SPEECH'), {}), (err) => err.code === 'LLM_NOT_CONFIGURED');
    assert.equal(requests.length, count, 'the service was not called');
  } finally {
    process.env.TRANSCRIBE_INTERNAL_API_KEY = KEY;
  }
});
