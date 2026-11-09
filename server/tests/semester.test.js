'use strict';
/**
 * The semester companion: weeks, gaps, exam countdowns, what the bee says, and
 * what it sends to a phone. A real Postgres (PGlite), the real routes, a stubbed
 * notes generator, and a push sender that records instead of sending.
 */
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'junbee-semester-test-'));
process.env.NODE_ENV = 'test';
process.env.DB_DRIVER = 'pglite';
process.env.PGLITE_DIR = dataDir;
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-the-check-0123456789';
process.env.VAPID_PUBLIC_KEY = 'test-public-key';
process.env.VAPID_PRIVATE_KEY = 'test-private-key';

const lectureServicePath = require.resolve('../services/lectureService');
require.cache[lectureServicePath] = {
  id: lectureServicePath,
  filename: lectureServicePath,
  loaded: true,
  exports: {
    buildNotes: async () => ({
      title: '교착 상태',
      summary: '교착 상태의 조건.',
      sections: [{ heading: '조건', points: ['네 가지 조건이 모두 성립해야 한다.'] }],
      flagged: [{ quote: '네 가지 조건은 중간고사에 나옵니다.', at: '31:05', note: '네 가지 조건' }],
      cards: [
        { front: '교착 상태란?', back: '서로의 자원을 기다리며 멈춘 상태.' },
        { front: '네 가지 조건은?', back: '상호 배제, 점유 대기, 비선점, 순환 대기.' },
      ],
    }),
  },
};

const app = require('../app');
const db = require('../db/database');
const semesterStore = require('../services/semesterStore');
const { weekOf, addDays, kstDate, chooseMessage } = semesterStore;
const { remindersFor, runReminders } = require('../services/reminders');
const pushService = require('../services/pushService');

let server;
let base;
let sent = [];

before(async () => {
  await db.ready;
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
  pushService.setSender(async (subscription, body) => {
    sent.push({ endpoint: subscription.endpoint, ...JSON.parse(body) });
  });
});

after(async () => {
  server.closeAllConnections();
  server.close();
  await db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

beforeEach(() => {
  sent = [];
});

const today = kstDate();
const TRANSCRIPT = Array.from({ length: 60 }, (_, i) => `[${String(i).padStart(2, '0')}:00] 문장 ${i} 교착 상태는 프로세스가 자원을 기다리는 상태입니다.`).join('\n');

async function call(method, url, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, json: await res.json().catch(() => null) };
}

let counter = 0;
async function signup() {
  counter += 1;
  const res = await call('POST', '/auth/signup', { body: { email: `sem${counter}@example.com`, password: 'correct horse battery', name: '테스트' } });
  assert.equal(res.status, 201);
  return { token: res.json.accessToken, user: res.json.user };
}

async function waitReady(token, id) {
  for (let i = 0; i < 100; i += 1) {
    const detail = await call('GET', `/lectures/${id}`, { token });
    if (detail.status === 200 && detail.json.lecture.status === 'ready') return detail.json.lecture;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('lecture did not finish');
}

async function record(token, courseId, { recordedAt, title } = {}) {
  const form = new FormData();
  form.append('courseId', courseId);
  form.append('text', TRANSCRIPT);
  if (recordedAt) form.append('recordedAt', recordedAt);
  if (title) form.append('title', title);
  const res = await fetch(`${base}/lectures`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const { lecture } = await res.json();
  return waitReady(token, lecture.id);
}

/** A semester that started so that today falls in the given week. */
function startForWeek(week) {
  return addDays(today, -7 * (week - 1));
}

const daysAgoIso = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// ── Dates ────────────────────────────────────────────────────────────────────

test('weeks run Monday to Sunday and week 1 is the week the semester starts in', () => {
  // 1 September 2026 is a Tuesday.
  assert.equal(weekOf('2026-09-01', '2026-09-01'), 1);
  assert.equal(weekOf('2026-09-01', '2026-08-31'), 1);
  assert.equal(weekOf('2026-09-01', '2026-09-06'), 1);
  assert.equal(weekOf('2026-09-01', '2026-09-07'), 2);
  assert.equal(weekOf('2026-09-01', '2026-11-06'), 10);
  assert.equal(weekOf('2026-09-01', '2026-08-30'), 0);
});

test('semester dates are validated, and correcting one does not start another', async () => {
  const { token } = await signup();
  assert.equal((await call('PUT', '/semester', { body: { startsOn: '2026-09-01' } })).status, 401);
  assert.equal((await call('PUT', '/semester', { token, body: { startsOn: 'soon' } })).status, 400);
  assert.equal((await call('PUT', '/semester', { token, body: { startsOn: '2026-02-31' } })).status, 400);
  assert.equal((await call('PUT', '/semester', { token, body: { startsOn: '2026-09-01', weeks: 99 } })).status, 400);

  const saved = await call('PUT', '/semester', { token, body: { startsOn: '2026-09-01' } });
  assert.equal(saved.status, 200);
  assert.equal(saved.json.semester.name, '2026년 2학기');
  assert.equal(saved.json.semester.weeks, 16);

  const corrected = await call('PUT', '/semester', { token, body: { startsOn: '2026-09-07', weeks: 15 } });
  assert.equal(corrected.json.semester.id, saved.json.semester.id);
  assert.equal(corrected.json.semester.weeks, 15);

  const next = await call('PUT', '/semester', { token, body: { startsOn: '2027-03-02', fresh: true } });
  assert.notEqual(next.json.semester.id, saved.json.semester.id);
  assert.equal(next.json.semester.name, '2027년 1학기');
});

test('course schedules are validated and belong to their owner', async () => {
  const a = await signup();
  const b = await signup();
  const { course } = (await call('POST', '/courses', { token: a.token, body: { name: '운영체제', classDays: [3, 1, 1], midtermOn: '2026-10-20' } })).json;
  assert.deepEqual(course.classDays, [1, 3]);
  assert.equal(course.midtermOn, '2026-10-20');

  const id = course.id;
  assert.equal((await call('PATCH', `/courses/${id}`, { token: a.token, body: { classDays: [9] } })).status, 400);
  assert.equal((await call('PATCH', `/courses/${id}`, { token: a.token, body: { finalOn: 'december' } })).status, 400);
  assert.equal((await call('PATCH', `/courses/${id}`, { token: b.token, body: { finalOn: '2026-12-15' } })).status, 404);

  const updated = await call('PATCH', `/courses/${id}`, { token: a.token, body: { finalOn: '2026-12-15', midtermOn: null } });
  assert.equal(updated.status, 200);
  assert.equal(updated.json.course.name, '운영체제');
  assert.equal(updated.json.course.midtermOn, null);
  assert.equal(updated.json.course.finalOn, '2026-12-15');

  assert.equal((await call('PATCH', `/courses/${id}`, { token: a.token, body: {} })).status, 400);
});

// ── Filing a recording ───────────────────────────────────────────────────────

test('a recording files itself under its course and week with no form to fill in', async () => {
  const { token } = await signup();
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(5) } });
  const { course } = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json;

  const first = await record(token, course.id);
  assert.equal(first.title, '5주차');
  const second = await record(token, course.id);
  assert.equal(second.title, '5주차 2');
  const named = await record(token, course.id, { title: '보강' });
  assert.equal(named.title, '보강');

  // A recording that reached the server late still goes under the week of the class.
  const late = await record(token, course.id, { recordedAt: daysAgoIso(14) });
  assert.equal(late.title, '3주차');

  // A nonsense date is ignored rather than filing the lecture years away.
  const odd = await record(token, course.id, { recordedAt: '2001-01-01T00:00:00Z' });
  assert.equal(odd.title, '5주차 4');
});

test('before a semester exists a recording is named by its date', async () => {
  const { token } = await signup();
  const { course } = (await call('POST', '/courses', { token, body: { name: '통계' } })).json;
  const lecture = await record(token, course.id);
  assert.match(lecture.title, /^\d{1,2}월 \d{1,2}일 강의$/);
});

// ── The comb ─────────────────────────────────────────────────────────────────

test('weeks before a first recording are not counted as missed; weeks since then are', async () => {
  const { token } = await signup();
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(9) } });
  const { course } = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json;

  // Joined late: nothing recorded yet, so no week is held against the student.
  let overview = (await call('GET', '/semester', { token })).json;
  assert.equal(overview.semester.currentWeek, 9);
  assert.deepEqual(overview.courses[0].gaps, []);
  assert.equal(overview.cells[3].state, 'past');
  assert.equal(overview.cells[8].state, 'now');
  assert.equal(overview.cells[9].state, 'future');

  await record(token, course.id, { recordedAt: daysAgoIso(7 * 4) });
  await record(token, course.id, { recordedAt: daysAgoIso(7 * 2) });
  overview = (await call('GET', '/semester', { token })).json;
  assert.equal(overview.cells[4].state, 'done');
  assert.equal(overview.cells[6].state, 'done');
  assert.deepEqual(overview.courses[0].gaps, [6, 8]);
  assert.equal(overview.cells[5].state, 'gap');
  assert.deepEqual(overview.cells[5].missing, ['운영체제']);
  assert.equal(overview.cells[3].state, 'past');
  assert.equal(overview.courses[0].flaggedCount, 2);
});

test('an exam week is marked from the real date, and is not a gap', async () => {
  const { token } = await signup();
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(9) } });
  const midtermOn = addDays(today, -7);
  const { course } = (await call('POST', '/courses', { token, body: { name: '운영체제', midtermOn } })).json;
  await record(token, course.id, { recordedAt: daysAgoIso(7 * 3) });

  const { cells, courses } = (await call('GET', '/semester', { token })).json;
  assert.equal(cells[7].exam, 'midterm');
  assert.equal(cells[7].state, 'past');
  assert.deepEqual(courses[0].gaps, [7]);
  assert.equal(courses[0].nextExam, null);
});

test('with no exam date there is no countdown, because the bee does not guess', async () => {
  const { token } = await signup();
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(7) } });
  await call('POST', '/courses', { token, body: { name: '운영체제' } });
  const overview = (await call('GET', '/semester', { token })).json;
  assert.equal(overview.courses[0].nextExam, null);
  assert.deepEqual(overview.exams, []);
  assert.ok(overview.cells.every((cell) => cell.exam === null));
});

test('hard cards are the ones last rated 다시 or 어려움', async () => {
  const { token } = await signup();
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(3) } });
  const { course } = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json;
  await record(token, course.id);
  const { cards } = (await call('GET', '/review/today', { token })).json;
  assert.equal(cards[0].courseId, course.id);
  await call('POST', `/review/cards/${cards[0].id}`, { token, body: { rating: 1 } });
  await call('POST', `/review/cards/${cards[1].id}`, { token, body: { rating: 4 } });
  const { courses } = (await call('GET', '/semester', { token })).json;
  assert.equal(courses[0].hardCards, 1);
});

// ── What the bee says ────────────────────────────────────────────────────────

const facts = (overrides = {}) => ({
  hasCourses: true,
  junbee: null,
  processing: null,
  semester: { currentWeek: 5, weeks: 16 },
  classToday: [],
  exams: [],
  review: { due: 0, done: 0 },
  totals: { lectures: 0, cards: 0 },
  ...overrides,
});

test('the bee says the most urgent thing, and only one thing', () => {
  const lecture = { kind: 'ready', lectureId: 'l1' };
  const klass = [{ courseId: 'c1', courseName: '운영체제', recordedToday: false }];
  const exam = [{ courseId: 'c1', courseName: '운영체제', exam: 'midterm', days: 13, flagged: 6, hard: 9, gaps: [3] }];
  const review = { due: 12, done: 0 };

  assert.equal(chooseMessage(facts({ hasCourses: false })).kind, 'first-course');
  assert.deepEqual(chooseMessage(facts({ junbee: lecture, classToday: klass, exams: exam, review })), { kind: 'lecture', message: lecture });
  assert.equal(chooseMessage(facts({ processing: { id: 'l', courseName: 'x', title: 'y' }, classToday: klass })).kind, 'processing');
  assert.equal(chooseMessage(facts({ semester: null })).kind, 'setup');
  assert.equal(chooseMessage(facts({ classToday: klass, exams: exam, review })).kind, 'class-today');
  assert.equal(chooseMessage(facts({ exams: exam, review })).kind, 'exam-soon');
  assert.equal(chooseMessage(facts({ review })).kind, 'cards-due');
  assert.equal(chooseMessage(facts({ review: { due: 0, done: 4 } })).kind, 'cards-finished');
  assert.equal(chooseMessage(facts()).kind, 'quiet');
});

test('a class already recorded today, or an exam still far off, stays quiet', () => {
  const recorded = [{ courseId: 'c1', courseName: '운영체제', recordedToday: true }];
  const far = [{ courseId: 'c1', courseName: '운영체제', exam: 'final', days: 30, flagged: 0, hard: 0, gaps: [] }];
  assert.equal(chooseMessage(facts({ classToday: recorded, exams: far })).kind, 'quiet');
});

test('past the last week the bee reports what was counted', () => {
  const message = chooseMessage(facts({ semester: { currentWeek: 17, weeks: 16 }, totals: { lectures: 14, cards: 96 } }));
  assert.deepEqual(message, { kind: 'semester-over', lectures: 14, cards: 96 });
});

test('the overview tells the student what to do first, end to end', async () => {
  const { token } = await signup();
  assert.equal((await call('GET', '/semester', { token })).json.message.kind, 'first-course');

  const { course } = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json;
  assert.equal((await call('GET', '/semester', { token })).json.message.kind, 'setup');

  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(6) } });
  assert.equal((await call('GET', '/semester', { token })).json.message.kind, 'quiet');

  const dayIndex = new Date(`${today}T00:00:00Z`).getUTCDay();
  await call('PATCH', `/courses/${course.id}`, { token, body: { classDays: [dayIndex], midtermOn: addDays(today, 13) } });
  let overview = (await call('GET', '/semester', { token })).json;
  assert.deepEqual(overview.message, { kind: 'class-today', courseId: course.id, courseName: '운영체제' });

  const lecture = await record(token, course.id);
  overview = (await call('GET', '/semester', { token })).json;
  assert.equal(overview.message.kind, 'lecture');
  assert.equal(overview.message.message.lectureId, lecture.id);
  assert.equal(overview.latestNote.id, lecture.id);
  assert.equal(overview.courses[0].recordedToday, true);

  await call('POST', `/junbee/${lecture.id}/dismiss`, { token });
  overview = (await call('GET', '/semester', { token })).json;
  assert.equal(overview.message.kind, 'exam-soon');
  assert.equal(overview.message.days, 13);
  assert.equal(overview.message.exam, 'midterm');
  assert.equal(overview.message.flagged, 1);
  assert.equal(overview.review.due, 2);
});

// ── The course workspace ─────────────────────────────────────────────────────

test('a course workspace gathers its lectures, weeks and exam hints', async () => {
  const a = await signup();
  const b = await signup();
  await call('PUT', '/semester', { token: a.token, body: { startsOn: startForWeek(4) } });
  const { course } = (await call('POST', '/courses', { token: a.token, body: { name: '운영체제' } })).json;
  const other = (await call('POST', '/courses', { token: a.token, body: { name: '통계' } })).json.course;
  const lecture = await record(a.token, course.id);
  await record(a.token, other.id);

  const space = (await call('GET', `/semester/courses/${course.id}`, { token: a.token })).json;
  assert.equal(space.course.name, '운영체제');
  assert.deepEqual(space.lectures.map((l) => [l.id, l.week]), [[lecture.id, 4]]);
  assert.deepEqual(space.flagged, [{ note: '네 가지 조건', quote: '네 가지 조건은 중간고사에 나옵니다.', at: '31:05', lectureId: lecture.id, lectureTitle: '4주차' }]);
  assert.equal(space.course.cells[3].state, 'done');

  assert.equal((await call('GET', `/semester/courses/${course.id}`, { token: b.token })).status, 404);
  assert.equal((await call('GET', '/semester/courses/not-a-uuid', { token: a.token })).status, 404);
});

// ── Phone notifications ──────────────────────────────────────────────────────

const overviewFacts = (overrides = {}) => ({
  today: '2026-11-06',
  classToday: [],
  exams: [],
  review: { due: 0, done: 0 },
  ...overrides,
});

test('nothing is sent at night, and each reminder waits for its hour', () => {
  const full = overviewFacts({
    classToday: [{ courseId: 'c', courseName: '운영체제', recordedToday: false }, { courseId: 'd', courseName: '통계', recordedToday: false }],
    exams: [{ courseId: 'c', courseName: '운영체제', exam: 'midterm', days: 7, flagged: 6 }],
    review: { due: 12, done: 0 },
  });
  assert.deepEqual(remindersFor(full, 7), []);
  assert.deepEqual(remindersFor(full, 22), []);

  const morning = remindersFor(full, 8);
  assert.equal(morning.length, 1);
  assert.equal(morning[0].body, '오늘 운영체제, 통계 수업이 있어요. 수업이 시작되면 녹음을 눌러 주세요.');

  assert.equal(remindersFor(full, 9)[1].body, '운영체제 중간고사까지 7일 남았어요. 시험에 나온다고 한 부분 6개가 모여 있어요.');
  assert.equal(remindersFor(full, 20)[2].body, '오늘 카드 12장이에요.');
});

test('exam reminders go out on set days only, and no reminder praises or nags', () => {
  const on = (days) => remindersFor(overviewFacts({ exams: [{ courseId: 'c', courseName: '통계', exam: 'final', days, flagged: 0 }] }), 10);
  assert.equal(on(13).length, 0);
  assert.equal(on(14).length, 1);
  assert.equal(on(1)[0].body, '통계 기말고사까지 1일 남았어요.');
  const all = remindersFor(overviewFacts({
    classToday: [{ courseId: 'c', courseName: '통계', recordedToday: false }],
    exams: [{ courseId: 'c', courseName: '통계', exam: 'final', days: 3, flagged: 2 }],
    review: { due: 3, done: 0 },
  }), 21).map((r) => r.body).join(' ');
  assert.doesNotMatch(all, /[!！]|잘했|대단|훌륭|축하|화이팅|안 했|왜 /);
});

const ENDPOINT = (n) => `https://fcm.googleapis.com/fcm/send/${n}`;
const subscription = (n) => ({ endpoint: ENDPOINT(n), keys: { p256dh: 'key', auth: 'secret' } });

test('subscriptions only accept real push services, so the server cannot be aimed elsewhere', async () => {
  const { token } = await signup();
  assert.equal((await call('POST', '/push/subscribe', { body: subscription('a') })).status, 401);
  const bad = ['http://fcm.googleapis.com/x', 'https://localhost/x', 'https://169.254.169.254/latest', 'https://fcm.googleapis.com.evil.example/x', 'not a url'];
  for (const endpoint of bad) {
    assert.equal((await call('POST', '/push/subscribe', { token, body: { endpoint, keys: { p256dh: 'k', auth: 's' } } })).status, 400, endpoint);
  }
  assert.equal((await call('POST', '/push/subscribe', { token, body: { endpoint: ENDPOINT('x') } })).status, 400);
  assert.equal((await call('POST', '/push/subscribe', { token, body: subscription('good') })).status, 201);
  assert.equal((await call('GET', '/push/config', { token })).json.publicKey, 'test-public-key');
});

test('a reminder reaches the phone once, and only the right student', async () => {
  const a = await signup();
  const b = await signup();
  await call('POST', '/push/subscribe', { token: a.token, body: subscription('a1') });
  await call('PUT', '/semester', { token: a.token, body: { startsOn: startForWeek(3) } });
  const dayIndex = new Date(`${today}T00:00:00Z`).getUTCDay();
  await call('POST', '/courses', { token: a.token, body: { name: '운영체제', classDays: [dayIndex] } });
  await call('POST', '/courses', { token: b.token, body: { name: '통계', classDays: [dayIndex] } });

  const nineAmKst = new Date(`${today}T00:00:00Z`);
  await runReminders(nineAmKst);
  const mine = sent.filter((s) => s.endpoint === ENDPOINT('a1'));
  assert.equal(mine.length, 1);
  assert.equal(mine[0].url, '/workspace');
  assert.match(mine[0].body, /운영체제 수업이 있어요/);
  assert.ok(!sent.some((s) => s.body.includes('통계')));

  sent = [];
  await runReminders(nineAmKst);
  assert.equal(sent.filter((s) => s.endpoint === ENDPOINT('a1')).length, 0);
});

test('nothing goes out overnight even if a reminder is due', async () => {
  const { token } = await signup();
  await call('POST', '/push/subscribe', { token, body: subscription('night') });
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(2) } });
  const threeAmKst = new Date(`${addDays(today, -1)}T18:00:00Z`);
  assert.equal(await runReminders(threeAmKst), 0);
});

test('finished notes reach the phone with a link straight to them', async () => {
  const { token } = await signup();
  await call('POST', '/push/subscribe', { token, body: subscription('notes') });
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(2) } });
  const { course } = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json;
  const lecture = await record(token, course.id);
  for (let i = 0; i < 50 && !sent.some((s) => s.endpoint === ENDPOINT('notes')); i += 1) await new Promise((r) => setTimeout(r, 20));
  const note = sent.find((s) => s.endpoint === ENDPOINT('notes'));
  assert.equal(note.body, '2주차 노트 정리했어요. 카드 2장.');
  assert.equal(note.url, `/app/learn/${lecture.id}`);
});

test('a subscription the push service says is gone is removed, and a failure breaks nothing', async () => {
  const { token, user } = await signup();
  await call('POST', '/push/subscribe', { token, body: subscription('gone') });
  pushService.setSender(async () => {
    const err = new Error('Gone');
    err.statusCode = 410;
    throw err;
  });
  assert.equal(await pushService.sendToUser(user.id, { body: 'x', url: '/' }), true);
  const left = await db.query('SELECT COUNT(*)::int AS n FROM push_subscriptions WHERE user_id = $1', [user.id]);
  assert.equal(left.rows[0].n, 0);
  pushService.setSender(async (s, body) => { sent.push({ endpoint: s.endpoint, ...JSON.parse(body) }); });
});

test('turning notifications off stops them, and only the owner can do it', async () => {
  const a = await signup();
  const b = await signup();
  await call('POST', '/push/subscribe', { token: a.token, body: subscription('off') });
  await call('POST', '/push/unsubscribe', { token: b.token, body: { endpoint: ENDPOINT('off') } });
  let n = await db.query('SELECT COUNT(*)::int AS n FROM push_subscriptions WHERE user_id = $1', [a.user.id]);
  assert.equal(n.rows[0].n, 1);
  await call('POST', '/push/unsubscribe', { token: a.token, body: { endpoint: ENDPOINT('off') } });
  n = await db.query('SELECT COUNT(*)::int AS n FROM push_subscriptions WHERE user_id = $1', [a.user.id]);
  assert.equal(n.rows[0].n, 0);
});

test('deleting the account removes the semester, subscriptions and notification log', async () => {
  const { token, user } = await signup();
  await call('PUT', '/semester', { token, body: { startsOn: startForWeek(2) } });
  await call('POST', '/push/subscribe', { token, body: subscription('leave') });
  await pushService.sendToUser(user.id, { body: 'x', url: '/' }, 'once');
  assert.equal((await call('DELETE', '/auth/account', { token, body: { password: 'correct horse battery' } })).status, 200);
  for (const table of ['semesters', 'push_subscriptions', 'notification_log']) {
    const n = (await db.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE user_id = $1`, [user.id])).rows[0].n;
    assert.equal(n, 0, table);
  }
});
