'use strict';
/**
 * The campus board and the community. The university's website and the model
 * that translates titles are stand-ins; the routes and the database are real.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-campus-'));
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
});

// One notice as the university's boards lay it out.
const notice = (no, title, { pinned = false, date = '2026-11-10', cate = 'General' } = {}) => `
  <td>${cate}</td><td class="b-td-left"><div class="b-title-box">
    <a href="?mode=view&amp;articleNo=${no}&amp;article.offset=0" title="${title} 자세히 보기">
      ${pinned ? '<span class="b-notice">[공지]</span>' : ''} ${title}
    </a>
    <div class="b-m-con"><span class="b-cate">${cate}</span><span class="b-writer">국제교류팀</span><span class="b-date"> ${date} </span></div>
  </div></td>`;

let siteDown = false;
const fetched = [];
const realFetch = global.fetch;
global.fetch = async (url, options) => {
  if (typeof url === 'string' && url.includes('ajou.ac.kr')) {
    fetched.push(url);
    if (siteDown) return new Response('down', { status: 503 });
    const page = url.includes('/oia/')
      ? notice(101, '2026 Spring Semester Tuition Payment &amp; Visa Extension Guide', { pinned: true }) + notice(102, '외국인 유학생 근로장학생 모집', { date: '2026-11-12', cate: 'Scholarship' })
      : url.includes('scholarship') ? notice(201, '2027학년도 1학기 국가장학금 신청 안내') : notice(301 + fetched.length, 'Library closed on Sunday');
    return new Response(`<html><body><table>${page}</table></body></html>`, { status: 200 });
  }
  return realFetch(url, options);
};

let modelFails = false;
const llmPath = require.resolve('../services/llmService');
const realLlm = require('../services/llmService');
require.cache[llmPath].exports = {
  ...realLlm,
  callLLM: async ({ userPrompt }) => {
    if (modelFails) throw new Error('model unavailable');
    const items = userPrompt.split('\n').map((line) => {
      const i = Number(line.split('.')[0]);
      if (line.includes('근로장학생')) return { i, en: 'Work-study students wanted (international students)', kind: 'job' };
      if (line.includes('국가장학금')) return { i, en: 'National scholarship applications, 2027 spring', kind: 'scholarship' };
      if (line.includes('Visa')) return { i, en: 'x', kind: 'visa' };
      return { i, en: 'x', kind: 'general' };
    });
    return JSON.stringify({ items });
  },
};

const app = require('../app');
const db = require('../db/database');
const { campusFor } = require('../services/campusFeed');
const { parseBoard } = require('../services/campusBoards');

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
  global.fetch = realFetch;
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
  const res = await realFetch(base + url, { method, headers, body: payload });
  return { status: res.status, json: await res.json().catch(() => null), res };
}

async function student(email, university, name = 'Linh Tran') {
  const res = await call('POST', '/auth/signup', { body: { email, password: 'correct horse battery', name } });
  assert.equal(res.status, 201);
  const token = res.json.accessToken;
  if (university) await call('PATCH', '/profile', { token, body: { country: 'KR', university } });
  return token;
}

test('a board page becomes notices with their link, date and whether they are pinned', () => {
  const board = { id: 'ajou-oia', url: 'https://www.ajou.ac.kr/oia/notice/notice.do' };
  const items = parseBoard(notice(7, 'A &amp; B', { pinned: true }) + notice(7, 'A &amp; B') + notice(8, '둘째', { date: '26.11.01' }), board);
  assert.equal(items.length, 2, 'the same notice listed twice is one notice');
  assert.deepEqual(items[0], { source: 'ajou-oia', article: '7', title: 'A & B', category: 'General', url: board.url + '?mode=view&articleNo=7', postedOn: '2026-11-10', pinned: true });
  assert.equal(items[1].postedOn, '2026-11-01');
  assert.equal(campusFor('Ajou University').key, 'ajou');
  assert.equal(campusFor('아주대학교').key, 'ajou');
  assert.equal(campusFor('Hanyang University'), null);
});

test('a student at a connected campus gets its board, in English, without saying where they study again', async () => {
  const token = await student('ajou@example.com', 'Ajou University');
  const res = await call('GET', '/campus', { token });
  assert.equal(res.status, 200);
  assert.equal(res.json.connected, true);
  assert.equal(res.json.campus.name, 'Ajou University');
  assert.ok(res.json.campus.links.some((link) => link.url.includes('eclass2')));
  assert.equal(fetched.length, 4, 'each board was read once');

  const byTitle = Object.fromEntries(res.json.items.map((item) => [item.title, item]));
  const job = byTitle['Work-study students wanted (international students)'];
  assert.equal(job.kind, 'job');
  assert.equal(job.original, '외국인 유학생 근로장학생 모집', 'the university\'s own words stay beside the translation');
  assert.match(job.url, /articleNo=102/);
  assert.equal(job.forInternational, true);
  assert.equal(byTitle['National scholarship applications, 2027 spring'].kind, 'scholarship');
  const visa = res.json.items.find((item) => item.title.includes('Visa Extension'));
  assert.equal(visa.kind, 'visa');
  assert.equal(visa.original, null, 'a title already in English is not rewritten');
  assert.equal(visa.pinned, true);

  await call('GET', '/campus', { token });
  assert.equal(fetched.length, 4, 'asking again soon does not read the university\'s site again');
});

test('a campus that is not set up says so, and a site that is down is not hidden', async () => {
  const elsewhere = await student('hanyang@example.com', 'Hanyang University');
  const res = await call('GET', '/campus', { token: elsewhere });
  assert.equal(res.json.connected, false);
  assert.equal(res.json.university, 'Hanyang University');
  assert.equal((await call('GET', '/campus', {})).status, 401);

  // A refresh that fails keeps what was read before.
  await db.query(`UPDATE campus_fetches SET fetched_at = now() - interval '5 hours'`);
  siteDown = true;
  const stale = await call('GET', '/campus', { token: await student('ajou2@example.com', 'ajou university') });
  assert.equal(stale.json.connected, true);
  assert.ok(stale.json.items.length >= 3);
  siteDown = false;
});

test('with a campus reader set up, the board comes only from what the reader sends, and only with its key', async () => {
  const before = fetched.length;
  assert.equal((await call('POST', '/campus/ingest', { body: { campus: 'ajou', boards: [] } })).status, 404, 'closed while no key is set');

  process.env.CAMPUS_INGEST_KEY = 'reader-key-for-the-tests-0123456789';
  try {
    const send = (body, key = process.env.CAMPUS_INGEST_KEY) =>
      realFetch(base + '/campus/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) })
        .then(async (res) => ({ status: res.status, json: await res.json() }));
    assert.equal((await send({ campus: 'ajou', boards: [] }, 'wrong')).status, 401);
    assert.equal((await send({ campus: 'nowhere', boards: [] })).status, 400);

    const oia = 'https://www.ajou.ac.kr/oia/notice/notice.do';
    const sent = await send({
      campus: 'ajou',
      boards: [
        { id: 'ajou-oia', items: [
          { article: '501', title: '2027 동계 단기연수 참가자 모집', category: 'Program', url: `${oia}?mode=view&articleNo=501`, postedOn: '2026-11-14', pinned: false },
          { article: '502', title: 'A link to somewhere else', url: 'https://example.com/?mode=view&articleNo=502' },
          { article: '../1', title: 'Not an article', url: `${oia}?mode=view&articleNo=../1` },
        ] },
        { id: 'ajou-notice', error: 'answered 503' },
        { id: 'hanyang-notice', items: [{ article: '1', title: 'Another campus', url: 'https://www.hanyang.ac.kr/?mode=view&articleNo=1' }] },
      ],
    });
    assert.equal(sent.status, 200);
    assert.deepEqual([sent.json.boards, sent.json.notices, sent.json.dropped], [1, 1, 2], 'only a notice linking to its own board is kept');

    // Students are answered from what was sent; the API does not read the university's site itself.
    await db.query(`UPDATE campus_fetches SET fetched_at = now() - interval '9 hours'`);
    await send({ campus: 'ajou', boards: [{ id: 'ajou-oia', items: [] }] });
    const board = await call('GET', '/campus', { token: await student('reader@example.com', 'Ajou University') });
    assert.equal(fetched.length, before, 'the university\'s site was not read by the API');
    assert.ok(board.json.items.some((item) => item.url.endsWith('articleNo=501')));
    assert.ok(Date.now() - new Date(board.json.fetchedAt).getTime() < 60_000, 'updated when the reader last sent a board');
    assert.equal(board.json.items.some((item) => item.url.includes('example.com')), false);
  } finally {
    delete process.env.CAMPUS_INGEST_KEY;
  }
});

test('the campus reader reads every board one at a time and sends them in with its key', async () => {
  const { sendCampus } = require('../services/campusSend');
  process.env.CAMPUS_INGEST_KEY = 'reader-key-for-the-tests-0123456789';
  try {
    const before = fetched.length;
    const lines = [];
    const sent = await sendCampus('ajou', { target: base + '/campus/ingest', key: process.env.CAMPUS_INGEST_KEY, log: (line) => lines.push(line) });
    assert.equal(fetched.length - before, 4, 'each board read once');
    assert.equal(sent.boards, 4);
    assert.ok(sent.notices >= 4);
    assert.ok(lines.some((line) => line.includes('sent:')));
    await assert.rejects(sendCampus('ajou', { target: base + '/campus/ingest', key: 'wrong', log: () => {} }), /401/);
    await assert.rejects(sendCampus('ajou', { target: base + '/campus/ingest', log: () => {} }), /not set/);
  } finally {
    delete process.env.CAMPUS_INGEST_KEY;
  }
});

test('the community is one room per university: posts, a picture, replies, likes, reports', async () => {
  const linh = await student('linh@example.com', 'Inha University', 'Linh Tran');
  const omar = await student('omar@example.com', ' inha  university ', 'Omar Farooq');
  const outsider = await student('out@example.com', 'Hanyang University', 'Out Sider');
  const nowhere = await student('nowhere@example.com', null);

  const form = new FormData();
  form.append('body', 'Autumn at the main gate');
  form.append('image', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])], { type: 'image/jpeg' }), 'gate.jpg');
  const made = await call('POST', '/community', { token: linh, form });
  assert.equal(made.status, 201);
  assert.equal(made.json.post.author, 'Linh', 'first name only');
  assert.equal(made.json.post.mine, true);
  const id = made.json.post.id;

  const image = await realFetch(base.replace('/api', '') + made.json.post.image);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/jpeg');
  assert.equal((await image.arrayBuffer()).byteLength, 7);

  const question = await call('POST', '/community', { token: omar, body: { body: 'Where do I print on campus?', kind: 'question' } });
  assert.equal(question.status, 201);

  const room = await call('GET', '/community', { token: omar });
  assert.equal(room.json.room.name, 'inha  university');
  assert.equal(room.json.room.members, 2, 'the same university written two ways is one room');
  assert.deepEqual(room.json.posts.map((post) => post.body), ['Where do I print on campus?', 'Autumn at the main gate']);
  assert.equal(room.json.posts[1].mine, false);

  assert.equal((await call('GET', '/community', { token: outsider })).json.posts.length, 0, 'another university is another room');
  assert.equal((await call('GET', `/community/${id}`, { token: outsider })).status, 404);
  assert.equal((await call('GET', '/community', { token: nowhere })).json.room, null);
  assert.equal((await call('POST', '/community', { token: nowhere, body: { body: 'hello' } })).status, 409);
  assert.equal((await call('POST', '/community', { token: linh, body: { body: '   ' } })).status, 400);

  assert.equal((await call('POST', `/community/${id}/comments`, { token: omar, body: { body: 'Beautiful!' } })).status, 201);
  const liked = await call('POST', `/community/${id}/like`, { token: omar });
  assert.deepEqual([liked.json.liked, liked.json.likes], [true, 1]);
  const unliked = await call('POST', `/community/${id}/like`, { token: omar });
  assert.deepEqual([unliked.json.liked, unliked.json.likes], [false, 0]);

  const one = await call('GET', `/community/${id}`, { token: linh });
  assert.equal(one.json.post.comments, 1);
  assert.deepEqual(one.json.comments.map((c) => [c.author, c.body, c.mine]), [['Omar', 'Beautiful!', false]]);

  assert.equal((await call('DELETE', `/community/${id}`, { token: omar })).status, 404, 'only the author deletes a post');

  // Three students reporting a post hides it, picture included.
  const third = await student('third@example.com', 'Inha University', 'Third Person');
  const fourth = await student('fourth@example.com', 'Inha University', 'Fourth Person');
  for (const token of [omar, third, fourth]) assert.equal((await call('POST', `/community/${id}/report`, { token, body: { reason: 'test' } })).status, 200);
  assert.equal((await call('GET', `/community/${id}`, { token: linh })).status, 404);
  assert.equal((await realFetch(base.replace('/api', '') + made.json.post.image)).status, 404);

  assert.equal((await call('DELETE', `/community/${question.json.post.id}`, { token: omar })).status, 200);
  assert.equal((await call('GET', '/community', { token: linh })).json.posts.length, 0);
});
