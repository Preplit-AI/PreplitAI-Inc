'use strict';
/**
 * End-to-end tests for the pilot API: a real Postgres (PGlite, in a temp
 * directory), the real routes, and a stubbed notes generator so no test calls
 * an external AI service.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'junbee-test-'));
process.env.NODE_ENV = 'test';
process.env.DB_DRIVER = 'pglite';
process.env.PGLITE_DIR = dataDir;
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-the-check-0123456789';

// Stub the notes generator before anything requires it.
let notesBehaviour = 'ok';
const lectureServicePath = require.resolve('../services/lectureService');
require.cache[lectureServicePath] = {
  id: lectureServicePath,
  filename: lectureServicePath,
  loaded: true,
  exports: {
    buildNotes: async () => {
      if (notesBehaviour === 'fail') {
        const err = new Error('model unavailable');
        err.code = 'LLM_UNAVAILABLE';
        throw err;
      }
      return {
        title: '교착 상태',
        summary: '교착 상태의 정의와 네 가지 조건.',
        sections: [{ heading: '정의', points: ['프로세스가 서로의 자원을 기다리며 멈춘 상태.'] }],
        flagged: [{ quote: '네 가지 조건은 중간고사에 나옵니다.', at: '31:05', note: '네 가지 조건' }],
        cards: [
          { front: '교착 상태란?', back: '서로의 자원을 기다리며 멈춘 상태.' },
          { front: '네 가지 조건은?', back: '상호 배제, 점유 대기, 비선점, 순환 대기.' },
          { front: '순환 대기를 막는 법은?', back: '자원에 순서를 매긴다.' },
        ],
      };
    },
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

const TRANSCRIPT = Array.from({ length: 60 }, (_, i) => `문장 ${i} 교착 상태는 프로세스가 자원을 기다리는 상태입니다.`).join('\n');

async function call(method, url, { token, body, cookie, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + url, { method, headers, body: payload });
  const json = await res.json().catch(() => null);
  return { status: res.status, json, headers: res.headers };
}

const cookieFrom = (res) => (res.headers.get('set-cookie') || '').split(';')[0];

async function signup(email) {
  const res = await call('POST', '/auth/signup', { body: { email, password: 'correct horse battery', name: '테스트' } });
  assert.equal(res.status, 201);
  return { token: res.json.accessToken, cookie: cookieFrom(res), user: res.json.user };
}

async function waitForLecture(token, id) {
  for (let i = 0; i < 100; i += 1) {
    const res = await call('GET', '/junbee', { token });
    if (res.json.message && res.json.message.lectureId === id) return res.json.message;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('lecture did not finish');
}

function textLecture(courseId, text = TRANSCRIPT, title = '9주차') {
  const form = new FormData();
  form.append('courseId', courseId);
  form.append('title', title);
  form.append('text', text);
  return form;
}

test('sign-up sets a strict httpOnly refresh cookie and never returns the password hash', async () => {
  const res = await call('POST', '/auth/signup', { body: { email: 'A@Example.com ', password: 'correct horse battery', name: ' 민지 ' } });
  assert.equal(res.status, 201);
  assert.ok(res.json.accessToken);
  assert.deepEqual(Object.keys(res.json.user).sort(), ['createdAt', 'email', 'google', 'hasPassword', 'id', 'name']);
  assert.equal(res.json.user.hasPassword, true);
  assert.equal(res.json.user.google, false);
  assert.doesNotMatch(JSON.stringify(res.json), /\$2[aby]\$/, 'no bcrypt hash anywhere in the answer');
  assert.equal(res.json.user.email, 'a@example.com');
  assert.equal(res.json.user.name, '민지');
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, /jb_rt=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  assert.match(cookie, /Path=\/api\/auth/i);
});

test('duplicate e-mail, weak password and bad login are refused', async () => {
  assert.equal((await call('POST', '/auth/signup', { body: { email: 'a@example.com', password: 'correct horse battery', name: 'x' } })).status, 409);
  assert.equal((await call('POST', '/auth/signup', { body: { email: 'b@example.com', password: 'short', name: 'x' } })).status, 400);
  assert.equal((await call('POST', '/auth/login', { body: { email: 'a@example.com', password: 'wrong password' } })).status, 401);
  assert.equal((await call('POST', '/auth/login', { body: { email: 'nobody@example.com', password: 'wrong password' } })).status, 401);
  const ok = await call('POST', '/auth/login', { body: { email: 'a@example.com', password: 'correct horse battery' } });
  assert.equal(ok.status, 200);
});

test('refresh rotates the cookie, and a stolen old cookie ends every session', async () => {
  const { cookie } = await signup('rotate@example.com');
  const first = await call('POST', '/auth/refresh', { cookie });
  assert.equal(first.status, 200);
  const rotated = cookieFrom(first);
  assert.notEqual(rotated, cookie);

  // A second tab refreshing with the same cookie at the same moment is not theft.
  assert.equal((await call('POST', '/auth/refresh', { cookie })).status, 200);

  // Age the rotation past the grace window, as if the old cookie were replayed later.
  await db.query("UPDATE refresh_tokens SET rotated_at = now() - interval '1 hour' WHERE rotated_at IS NOT NULL");
  const replay = await call('POST', '/auth/refresh', { cookie });
  assert.equal(replay.status, 401);
  assert.equal(replay.json.error, 'SessionRevoked');
  assert.equal((await call('POST', '/auth/refresh', { cookie: rotated })).status, 401);
});

test('protected routes need a valid token', async () => {
  assert.equal((await call('GET', '/courses')).status, 401);
  assert.equal((await call('GET', '/courses', { token: 'not-a-token' })).status, 401);
});

test('a student cannot see or touch another student\'s course', async () => {
  const a = await signup('owner@example.com');
  const b = await signup('other@example.com');
  const created = await call('POST', '/courses', { token: a.token, body: { name: '운영체제' } });
  assert.equal(created.status, 201);
  const id = created.json.course.id;
  assert.equal((await call('GET', '/courses', { token: b.token })).json.courses.length, 0);
  assert.equal((await call('PATCH', `/courses/${id}`, { token: b.token, body: { name: 'x' } })).status, 404);
  assert.equal((await call('DELETE', `/courses/${id}`, { token: b.token })).status, 404);
  assert.equal((await call('DELETE', '/courses/not-a-uuid', { token: a.token })).status, 404);
});

test('the full loop: transcript to notes to cards to review', async () => {
  notesBehaviour = 'ok';
  const { token } = await signup('loop@example.com');
  const course = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json.course;

  const posted = await call('POST', '/lectures', { token, form: textLecture(course.id) });
  assert.equal(posted.status, 202);
  assert.equal(posted.json.lecture.status, 'processing');

  const message = await waitForLecture(token, posted.json.lecture.id);
  assert.equal(message.kind, 'ready');
  assert.equal(message.cardCount, 3);
  assert.equal(message.lectureTitle, '9주차');

  const detail = await call('GET', `/lectures/${posted.json.lecture.id}`, { token });
  assert.equal(detail.json.lecture.status, 'ready');
  assert.equal(detail.json.lecture.cards.length, 3);
  assert.equal(detail.json.lecture.notes.flagged.length, 1);

  const today = await call('GET', '/review/today', { token });
  assert.equal(today.json.cards.length, 3);
  assert.equal(today.json.done, 0);

  const cardId = today.json.cards[0].id;
  assert.equal((await call('POST', `/review/cards/${cardId}`, { token, body: { rating: 3 } })).status, 200);
  assert.equal((await call('POST', `/review/cards/${cardId}`, { token, body: { rating: 3 } })).status, 409);
  assert.equal((await call('POST', `/review/cards/${today.json.cards[1].id}`, { token, body: { rating: 9 } })).status, 400);

  const after1 = await call('GET', '/review/today', { token });
  assert.equal(after1.json.done, 1);
  assert.equal(after1.json.cards.length, 2);

  // Dismissed messages never come back.
  assert.equal((await call('POST', `/junbee/${message.lectureId}/dismiss`, { token })).status, 200);
  assert.equal((await call('GET', '/junbee', { token })).json.message, null);
});

test('a failed lecture keeps nothing and Junbee says so', async () => {
  notesBehaviour = 'fail';
  const { token } = await signup('fail@example.com');
  const course = (await call('POST', '/courses', { token, body: { name: '통계' } })).json.course;
  const posted = await call('POST', '/lectures', { token, form: textLecture(course.id) });
  const message = await waitForLecture(token, posted.json.lecture.id);
  assert.equal(message.kind, 'failed');
  assert.equal(message.cardCount, 0);

  const row = (await db.query('SELECT transcript, notes, card_count FROM lectures WHERE id = $1', [message.lectureId])).rows[0];
  assert.equal(row.transcript, null);
  assert.equal(row.notes, null);
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM cards WHERE lecture_id = $1', [message.lectureId])).rows[0].n, 0);
  assert.equal((await call('GET', '/lectures', { token })).json.lectures.length, 0);

  await call('POST', `/junbee/${message.lectureId}/dismiss`, { token });
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM lectures WHERE id = $1', [message.lectureId])).rows[0].n, 0);
  notesBehaviour = 'ok';
});

test('too little speech fails instead of producing notes', async () => {
  const { token } = await signup('short@example.com');
  const course = (await call('POST', '/courses', { token, body: { name: '철학' } })).json.course;
  const posted = await call('POST', '/lectures', { token, form: textLecture(course.id, '너무 짧은 녹취록.') });
  const message = await waitForLecture(token, posted.json.lecture.id);
  assert.equal(message.kind, 'failed');
});

test('uploads must be audio files', async () => {
  const { token } = await signup('upload@example.com');
  const course = (await call('POST', '/courses', { token, body: { name: '화학' } })).json.course;
  const form = new FormData();
  form.append('courseId', course.id);
  form.append('audio', new Blob(['<script>alert(1)</script>'], { type: 'text/html' }), 'evil.html');
  assert.equal((await call('POST', '/lectures', { token, form })).status, 415);
});

test('deleting the account removes everything it owned', async () => {
  const { token, user } = await signup('leave@example.com');
  const course = (await call('POST', '/courses', { token, body: { name: '경제' } })).json.course;
  const posted = await call('POST', '/lectures', { token, form: textLecture(course.id) });
  await waitForLecture(token, posted.json.lecture.id);

  assert.equal((await call('DELETE', '/auth/account', { token, body: { password: 'wrong password!' } })).status, 400);
  assert.equal((await call('DELETE', '/auth/account', { token, body: { password: 'correct horse battery' } })).status, 200);
  for (const table of ['courses', 'lectures', 'cards', 'refresh_tokens']) {
    const n = (await db.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE user_id = $1`, [user.id])).rows[0].n;
    assert.equal(n, 0, table);
  }
  assert.equal((await call('GET', '/auth/me', { token })).status, 401);
});

test('API responses carry restrictive security headers', async () => {
  const res = await call('GET', '/health');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.match(res.headers.get('content-security-policy'), /default-src 'none'/);
  assert.equal(res.headers.get('x-powered-by'), null);
});
