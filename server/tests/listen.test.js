'use strict';
/**
 * Lecture Buddy listening live: a class arrives a piece at a time, each piece
 * is transcribed and added in order, and stopping turns the transcript into a
 * lecture in the course. Real routes over a real Postgres (PGlite); the speech
 * model and the notes generator are stand-ins.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-listen-'));
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
});

// The speech model's stand-in: it "hears" what the test wrote into the file,
// and records the file it was given so the test can check it was deleted.
const heardFiles = [];
const transcriptionPath = require.resolve('../services/transcription');
const realTranscription = require('../services/transcription');
require.cache[transcriptionPath].exports = {
  ...realTranscription,
  transcribeChunk: async (filePath, { offsetSeconds = 0, prompt } = {}) => {
    heardFiles.push({ filePath, prompt, ext: path.extname(filePath) });
    const said = fs.readFileSync(filePath, 'utf8');
    if (said === 'BROKEN') throw new Error('the model could not read this piece');
    if (!said.trim()) return { lines: [], seconds: 20, speechSegments: 0 };
    return { lines: ['[' + realTranscription.stamp(offsetSeconds) + '] ' + said], seconds: 20, speechSegments: 1 };
  },
};

const notesFrom = [];
const lectureServicePath = require.resolve('../services/lectureService');
const realLectureService = require('../services/lectureService');
require.cache[lectureServicePath].exports = {
  ...realLectureService,
  buildNotes: async ({ transcript, language }) => {
    notesFrom.push({ transcript, language });
    return {
      title: 'Deadlock',
      summary: 'What deadlock is.',
      sections: [{ heading: 'Definition', points: ['Processes wait on each other for ever.'] }],
      flagged: [],
      cards: [{ front: 'What is deadlock?', back: 'Processes waiting on each other.' }],
      terms: [],
    };
  },
};

const app = require('../app');
const db = require('../db/database');

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

async function call(method, url, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
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

function piece(said, seq, { name = 'piece.webm', type = 'audio/webm' } = {}) {
  const form = new FormData();
  form.append('seq', String(seq));
  form.append('seconds', '20');
  form.append('audio', new Blob([said], { type }), name);
  return form;
}

async function waitUntilReady(token, id) {
  for (let i = 0; i < 100; i += 1) {
    const res = await call('GET', `/lectures/${id}`, { token });
    if (res.json.lecture && res.json.lecture.status === 'ready') return res.json.lecture;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('lecture did not finish');
}

const SENTENCE = 'A deadlock happens when two processes each hold a resource the other one needs and neither can go on.';

test('a class is heard a piece at a time and saved to its course when the student stops', async () => {
  const token = await student('listen@example.com');
  const courseId = await course(token);

  const started = await call('POST', '/listen', { token, body: { courseId } });
  assert.equal(started.status, 201);
  const id = started.json.session.id;
  assert.equal(started.json.session.chunks, 0);

  const first = await call('POST', `/listen/${id}/chunk`, { token, form: piece(SENTENCE, 0) });
  assert.equal(first.status, 200);
  assert.deepEqual(first.json.lines, ['[00:00] ' + SENTENCE]);
  assert.equal(first.json.session.seconds, 20);

  const second = await call('POST', `/listen/${id}/chunk`, { token, form: piece(SENTENCE + ' ' + SENTENCE, 1) });
  assert.equal(second.json.lines[0].startsWith('[00:20] '), true, 'the second piece is timed from where the first ended');
  assert.equal(second.json.session.chunks, 2);
  assert.equal(heardFiles[1].prompt.startsWith('Operating Systems'), true, 'the course name and the last words help the next piece');
  assert.equal(heardFiles[0].ext, '.webm', 'the piece keeps its extension so the model knows the format');
  for (const heard of heardFiles) assert.equal(fs.existsSync(heard.filePath), false, 'no audio is kept');

  const finished = await call('POST', `/listen/${id}/finish`, { token, body: {} });
  assert.equal(finished.status, 202);
  assert.equal(finished.json.lecture.courseId, courseId);
  const lecture = await waitUntilReady(token, finished.json.lecture.id);
  assert.equal(lecture.durationSeconds, 40);
  assert.equal(lecture.material, 'live');
  assert.equal(lecture.notes.summary, 'What deadlock is.');
  assert.match(notesFrom.at(-1).transcript, /\[00:20\] A deadlock/);

  const listed = await call('GET', `/lectures?courseId=${courseId}`, { token });
  assert.equal(listed.json.lectures.length, 1, 'the notes are in the course workspace');
  const again = await call('POST', `/listen/${id}/finish`, { token, body: {} });
  assert.equal(again.status, 404, 'a class is saved once');
});

test('pieces count once and in order, and a piece that cannot be heard is marked, not guessed', async () => {
  const token = await student('order@example.com');
  const courseId = await course(token);
  const id = (await call('POST', '/listen', { token, body: { courseId } })).json.session.id;

  await call('POST', `/listen/${id}/chunk`, { token, form: piece(SENTENCE, 0) });
  const twice = await call('POST', `/listen/${id}/chunk`, { token, form: piece(SENTENCE, 0) });
  assert.equal(twice.json.duplicate, true);
  assert.equal(twice.json.session.chunks, 1, 'a piece sent twice is in the transcript once');

  const skipped = await call('POST', `/listen/${id}/chunk`, { token, form: piece(SENTENCE, 5) });
  assert.equal(skipped.status, 409);

  const broken = await call('POST', `/listen/${id}/chunk`, { token, form: piece('BROKEN', 1) });
  assert.equal(broken.status, 200);
  assert.equal(broken.json.heard, false);
  assert.deepEqual(broken.json.lines, ['[00:20] [불명확]']);

  const silent = await call('POST', `/listen/${id}/chunk`, { token, form: piece(' ', 2) });
  assert.deepEqual(silent.json.lines, [], 'silence adds nothing');

  const text = await call('POST', `/listen/${id}/chunk`, { token, form: piece('notes', 3, { name: 'notes.txt', type: 'text/plain' }) });
  assert.equal(text.status, 415);
});

test('stopping after too little was said keeps nothing', async () => {
  const token = await student('short@example.com');
  const courseId = await course(token);
  const id = (await call('POST', '/listen', { token, body: { courseId } })).json.session.id;
  await call('POST', `/listen/${id}/chunk`, { token, form: piece('Hello everyone.', 0) });

  const finished = await call('POST', `/listen/${id}/finish`, { token, body: {} });
  assert.equal(finished.status, 422);
  assert.equal(finished.json.error, 'TooShort');
  const listed = await call('GET', `/lectures?courseId=${courseId}`, { token });
  assert.equal(listed.json.lectures.length, 0);
});

test('a class belongs to the student who started it, and needs one of their courses', async () => {
  const owner = await student('owner@example.com');
  const other = await student('other@example.com');
  const courseId = await course(owner);

  assert.equal((await call('POST', '/listen', { token: other, body: { courseId } })).status, 404, 'not their course');
  assert.equal((await call('POST', '/listen', { token: owner, body: {} })).status, 400);
  assert.equal((await call('POST', '/listen', { body: { courseId } })).status, 401);

  const id = (await call('POST', '/listen', { token: owner, body: { courseId } })).json.session.id;
  assert.equal((await call('POST', `/listen/${id}/chunk`, { token: other, form: piece(SENTENCE, 0) })).status, 404);
  assert.equal((await call('POST', `/listen/${id}/finish`, { token: other, body: {} })).status, 404);

  // Starting again drops the class that was left open.
  const second = (await call('POST', '/listen', { token: owner, body: { courseId } })).json.session.id;
  assert.notEqual(second, id);
  assert.equal((await call('POST', `/listen/${id}/chunk`, { token: owner, form: piece(SENTENCE, 0) })).status, 404);

  assert.equal((await call('DELETE', `/listen/${second}`, { token: owner })).status, 200);
  assert.equal((await call('POST', `/listen/${second}/finish`, { token: owner, body: {} })).status, 404);
});
