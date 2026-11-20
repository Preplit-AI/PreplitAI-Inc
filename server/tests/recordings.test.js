'use strict';
/**
 * Lecture Buddy recordings: the phone records the whole class as one file and
 * sends it after Stop, in slices. The slices arrive in any order, can be resent,
 * and are put back together into exactly the file that was recorded; then one
 * transcription job runs and the notes end with the class in English. Real
 * routes over a real Postgres (PGlite); transcription and notes are stand-ins.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-recordings-'));
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
});

const SENTENCE = 'A deadlock happens when two processes each hold a resource the other one needs and neither can go on.';

// The transcription stand-in records what file it got and whether it was asked for English.
const heard = [];
let english = 'The professor said a deadlock is two processes waiting on each other.';
const transcriptionPath = require.resolve('../services/transcription');
const realTranscription = require('../services/transcription');
require.cache[transcriptionPath].exports = {
  ...realTranscription,
  transcribeFile: async (filePath, options) => {
    heard.push({ filePath, options, hash: crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex'), ext: path.extname(filePath) });
    return { transcript: `[00:00] ${SENTENCE} ${SENTENCE} ${SENTENCE}`, durationSeconds: 0, unclearRanges: [], speechSegments: 1, english };
  },
};

const translated = [];
const lectureServicePath = require.resolve('../services/lectureService');
const realLectureService = require('../services/lectureService');
require.cache[lectureServicePath].exports = {
  ...realLectureService,
  buildNotes: async () => ({
    title: 'Deadlock',
    summary: 'What deadlock is.',
    guide: ['The professor began by defining deadlock.'],
    sections: [{ heading: 'Definition', points: ['Processes wait on each other for ever.'] }],
    flagged: [],
    cards: [{ front: 'What is deadlock?', back: 'Processes waiting on each other.' }],
    terms: [{ term: '교착 상태', english: 'deadlock', meaning: 'Processes waiting on each other.' }],
  }),
  translateTranscript: async (transcript) => {
    translated.push(transcript);
    return 'Translated by the model.';
  },
};

const app = require('../app');
const db = require('../db/database');

const PART = 4 * 1024 * 1024;
let server;
let base;

before(async () => {
  await db.ready;
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

async function call(method, url, { token, body, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (raw) {
    headers['Content-Type'] = 'application/octet-stream';
    payload = raw;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + url, { method, headers, body: payload });
  return { status: res.status, json: await res.json().catch(() => null) };
}

async function student(email) {
  const res = await call('POST', '/auth/signup', { body: { email, password: 'correct horse battery', name: 'Test' } });
  assert.equal(res.status, 201);
  return res.json.accessToken;
}

async function course(token, name = 'Operating Systems') {
  const res = await call('POST', '/courses', { token, body: { name } });
  assert.equal(res.status, 201);
  return res.json.course.id;
}

async function waitUntilDone(token, id) {
  for (let i = 0; i < 200; i += 1) {
    const res = await call('GET', `/lectures/${id}`, { token });
    if (res.json.lecture && res.json.lecture.status !== 'processing') return res.json.lecture;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('lecture did not finish');
}

const slice = (file, n) => file.subarray(n * PART, Math.min(file.length, (n + 1) * PART));

test('a recording sent in slices, out of order and with a resend, becomes one lecture with an English transcript', async () => {
  const token = await student('record@example.com');
  const courseId = await course(token);
  const file = crypto.randomBytes(PART * 2 + 12345);

  const started = await call('POST', '/recordings', { token, body: { courseId, ext: '.m4a', parts: 3, bytes: file.length, seconds: 4500, recordedAt: '2026-11-20T01:00:00Z' } });
  assert.equal(started.status, 201);
  assert.equal(started.json.partBytes, PART);
  const id = started.json.upload.id;

  assert.equal((await call('PUT', `/recordings/${id}/parts/2`, { token, raw: slice(file, 2) })).status, 200);
  assert.equal((await call('PUT', `/recordings/${id}/parts/0`, { token, raw: slice(file, 0) })).status, 200);
  // A slice cut short is refused rather than stored.
  assert.equal((await call('PUT', `/recordings/${id}/parts/1`, { token, raw: slice(file, 1).subarray(1) })).status, 400);

  const early = await call('POST', `/recordings/${id}/finish`, { token, body: {} });
  assert.equal(early.status, 409);
  assert.deepEqual(early.json.missing, [1], 'finish says which slice is still missing');

  const progress = await call('GET', `/recordings/${id}`, { token });
  assert.deepEqual(progress.json.upload.received, [0, 2], 'the app can resume from what arrived');

  assert.equal((await call('PUT', `/recordings/${id}/parts/1`, { token, raw: slice(file, 1) })).status, 200);
  // Sending a slice again replaces it.
  assert.equal((await call('PUT', `/recordings/${id}/parts/0`, { token, raw: slice(file, 0) })).status, 200);

  const finished = await call('POST', `/recordings/${id}/finish`, { token, body: {} });
  assert.equal(finished.status, 202);
  const lecture = await waitUntilDone(token, finished.json.lecture.id);
  assert.equal(lecture.status, 'ready');

  assert.equal(heard.length, 1, 'the whole class is one transcription job');
  assert.equal(heard[0].hash, crypto.createHash('sha256').update(file).digest('hex'), 'the slices are put back together exactly');
  assert.equal(heard[0].ext, '.m4a');
  assert.equal(heard[0].options.translate, true, 'the job is asked for English too');
  assert.equal(heard[0].options.prompt, 'Operating Systems');
  assert.equal(fs.existsSync(heard[0].filePath), false, 'the rebuilt file is deleted');

  assert.equal(lecture.notes.englishTranscript, english);
  assert.deepEqual(lecture.notes.guide, ['The professor began by defining deadlock.']);
  assert.equal(lecture.durationSeconds ?? lecture.duration_seconds, 4500, 'the recorded length is kept when the service reports none');
  assert.equal(translated.length, 0, 'no second translation when the service gave one');

  const left = await db.query('SELECT count(*)::int AS n FROM recording_parts');
  assert.equal(left.rows[0].n, 0, 'no slice is kept once the file is rebuilt');
  assert.equal((await call('GET', `/recordings/${id}`, { token })).status, 404);
});

test('without an English transcript from the service, the notes model translates', async () => {
  english = null;
  const token = await student('translate@example.com');
  const courseId = await course(token);
  const file = Buffer.from('a short recording');
  const started = await call('POST', '/recordings', { token, body: { courseId, ext: '.webm', parts: 1, bytes: file.length } });
  const id = started.json.upload.id;
  assert.equal((await call('PUT', `/recordings/${id}/parts/0`, { token, raw: file })).status, 200);
  const finished = await call('POST', `/recordings/${id}/finish`, { token, body: {} });
  const lecture = await waitUntilDone(token, finished.json.lecture.id);
  assert.equal(lecture.notes.englishTranscript, 'Translated by the model.');
  assert.equal(translated.length, 1);
});

test('uploads are checked: sizes, formats, owners, and discarding', async () => {
  const token = await student('checks@example.com');
  const other = await student('other@example.com');
  const courseId = await course(token);

  assert.equal((await call('POST', '/recordings', { token, body: { courseId, ext: '.exe', parts: 1, bytes: 10 } })).status, 400);
  assert.equal((await call('POST', '/recordings', { token, body: { courseId, ext: '.m4a', parts: 1, bytes: PART + 1 } })).status, 400, 'the slice count must match the size');
  assert.equal((await call('POST', '/recordings', { token, body: { courseId, ext: '.m4a', parts: 100, bytes: 500 * 1024 * 1024 } })).status, 413);
  assert.equal((await call('POST', '/recordings', { token: other, body: { courseId, ext: '.m4a', parts: 1, bytes: 10 } })).status, 404, 'only into your own course');

  const started = await call('POST', '/recordings', { token, body: { courseId, ext: '.m4a', parts: 1, bytes: 10 } });
  const id = started.json.upload.id;
  assert.equal((await call('PUT', `/recordings/${id}/parts/0`, { token: other, raw: Buffer.alloc(10) })).status, 404, 'nobody else can add to it');
  assert.equal((await call('PUT', `/recordings/${id}/parts/1`, { token, raw: Buffer.alloc(10) })).status, 400);
  assert.equal((await call('PUT', `/recordings/${id}/parts/0`, { token, raw: Buffer.alloc(10) })).status, 200);
  assert.equal((await call('DELETE', `/recordings/${id}`, { token: other })).status, 404);
  assert.equal((await call('DELETE', `/recordings/${id}`, { token })).status, 200);
  assert.equal((await call('GET', `/recordings/${id}`, { token })).status, 404);
  assert.equal((await call('GET', '/recordings/not-a-uuid', { token })).status, 404);
});
