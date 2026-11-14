'use strict';
/**
 * Reading deadlines out of a picture. The model that reads pictures is a
 * stand-in here; what is tested is everything around it: what is asked, how
 * its answer is checked, and that nothing is saved until the student chooses.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-scan-'));
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
});

let answer = '';
const asked = [];
const llmPath = require.resolve('../services/llmService');
const realLlm = require('../services/llmService');
require.cache[llmPath].exports = {
  ...realLlm,
  getClient: () => ({
    chat: { completions: { create: async (request) => { asked.push(request); return { choices: [{ message: { content: answer } }] }; } } },
  }),
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

const picture = (type = 'image/png', name = 'lms.png') => {
  const form = new FormData();
  form.append('image', new Blob([Buffer.from('not really a picture')], { type }), name);
  return form;
};

test('the deadlines in a screenshot come back as a list to choose from, and nothing is saved', async () => {
  const signup = await call('POST', '/auth/signup', { body: { email: 'scan@example.com', password: 'correct horse battery', name: 'Test' } });
  const token = signup.json.accessToken;
  const course = (await call('POST', '/courses', { token, body: { name: 'Operating Systems' } })).json.course;

  answer = 'Here you go:\n```json\n' + JSON.stringify({ items: [
    { title: 'HW3: Scheduling', course: 'operating systems', due_at: '2031-03-14T23:59', kind: 'assignment' },
    { title: 'Midterm', course: 'Linear Algebra', due_at: '2031-04-20', kind: 'exam' },
    { title: 'Reading week 4', course: null, due_at: null, kind: 'banana' },
    { title: '   ', course: null, due_at: '2031-01-01', kind: 'task' },
    { title: 'Bad date', course: null, due_at: 'soon', kind: 'task' },
  ] }) + '\n```';
  const res = await call('POST', '/tasks/from-image', { token, form: picture() });
  assert.equal(res.status, 200);
  assert.equal(asked.at(-1).messages[0].content[1].image_url.url.startsWith('data:image/png;base64,'), true);
  assert.match(asked.at(-1).messages[0].content[0].text, /Never invent a date/);

  assert.deepEqual(res.json.items.map((item) => item.title), ['HW3: Scheduling', 'Midterm', 'Reading week 4', 'Bad date']);
  assert.equal(res.json.items[0].courseId, course.id, 'matched to the student\'s own course');
  assert.equal(res.json.items[0].dueAt, '2031-03-14T14:59:00.000Z');
  assert.equal(res.json.items[1].courseId, null);
  assert.equal(res.json.items[1].courseName, 'Linear Algebra', 'a course the student has not added is still named');
  assert.equal(res.json.items[2].kind, 'assignment');
  assert.equal(res.json.items[3].dueAt, null, 'a date that cannot be read is left empty, not guessed');
  assert.equal((await call('GET', '/tasks?state=all', { token })).json.tasks.length, 0, 'nothing is saved by reading');

  answer = 'I could not see anything.';
  assert.equal((await call('POST', '/tasks/from-image', { token, form: picture() })).status, 422);
  assert.equal((await call('POST', '/tasks/from-image', { token, form: picture('application/pdf', 'x.pdf') })).status, 415);
  assert.equal((await call('POST', '/tasks/from-image', { form: picture() })).status, 401);
});
