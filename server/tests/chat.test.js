'use strict';
/**
 * End-to-end tests for the workspace chat: a real Postgres (PGlite, in a temp
 * directory), the real routes, tools and search, and a scripted model so no
 * test calls an external AI service. What the model would say is scripted; what
 * the server does with it is what is under test.
 */
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'junbee-chat-test-'));
process.env.NODE_ENV = 'test';
process.env.DB_DRIVER = 'pglite';
process.env.PGLITE_DIR = dataDir;
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-the-check-0123456789';
process.env.MONTHLY_CHAT_LIMIT = '50';

/** Each turn is an array of events, or a function of the messages that returns one. */
let script = [];
let seenTurns = [];

const llmPath = require.resolve('../services/llmService');
require.cache[llmPath] = {
  id: llmPath,
  filename: llmPath,
  loaded: true,
  exports: {
    getClient() {
      throw new Error('tests do not call the provider');
    },
    callLLM() {
      throw new Error('tests do not call the provider');
    },
    async *streamTurn({ messages, tools, signal }) {
      seenTurns.push({ messages: JSON.parse(JSON.stringify(messages)), tools });
      const next = script.shift();
      if (next === undefined) throw new Error('the script ran out of turns');
      const events = typeof next === 'function' ? await next(messages, signal) : next;
      for (const event of events) {
        if (event.type === 'throw') {
          const err = new Error(event.message);
          err.code = 'LLM_UNAVAILABLE';
          throw err;
        }
        if (event.type === 'wait') {
          await new Promise((resolve, reject) => {
            if (signal.aborted) return reject(new Error('aborted'));
            signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
          });
        }
        yield event;
      }
    },
  },
};

const lectureServicePath = require.resolve('../services/lectureService');
require.cache[lectureServicePath] = {
  id: lectureServicePath,
  filename: lectureServicePath,
  loaded: true,
  exports: {
    buildNotes: async () => ({
      title: '교착 상태',
      summary: '교착 상태의 정의와 네 가지 조건을 다룬다.',
      sections: [
        { heading: '교착 상태의 조건', points: ['상호 배제, 점유 대기, 비선점, 순환 대기가 모두 성립해야 한다.'] },
        { heading: '예방', points: ['자원에 순서를 매기면 순환 대기를 막을 수 있다.'] },
      ],
      flagged: [{ quote: '네 가지 조건은 중간고사에 나옵니다.', at: '31:05', note: '교착 상태의 네 가지 조건' }],
      cards: [{ front: '교착 상태란?', back: '서로의 자원을 기다리며 멈춘 상태.' }],
    }),
  },
};

const app = require('../app');
const db = require('../db/database');
const { queryWords, searchChunks } = require('../services/lectureChunks');

let server;
let base;

before(async () => {
  await db.ready;
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.closeAllConnections();
  server.close();
  await db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

beforeEach(() => {
  script = [];
  seenTurns = [];
});

const TRANSCRIPT = [
  '[00:10] 오늘은 운영체제의 교착 상태를 다룹니다. 교착 상태는 프로세스들이 서로의 자원을 기다리며 영원히 멈춘 상태입니다.',
  '[05:20] 교착 상태가 일어나려면 네 가지 조건이 동시에 성립해야 합니다. 상호 배제, 점유 대기, 비선점, 순환 대기입니다.',
  '[12:40] [불명확]',
  '[18:00] 은행원 알고리즘은 자원을 할당하기 전에 안전 상태인지 검사해서 교착 상태를 회피합니다.',
  '[31:05] 네 가지 조건은 중간고사에 나옵니다. 꼭 외워 두세요.',
  ...Array.from({ length: 30 }, (_, i) => `[${String(40 + i)}:00] 페이지 교체 알고리즘의 ${i}번째 예시로 가상 메모리의 동작을 살펴봅니다. 페이지 부재가 발생하면 디스크에서 읽어 옵니다.`),
].join('\n');

async function call(method, url, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  return { status: res.status, json, headers: res.headers };
}

/** Sends a question and reads the whole event stream. */
async function ask(token, body, { headers = {} } = {}) {
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const events = [];
  for (const block of text.split('\n\n')) {
    const event = block.match(/^event: (.+)$/m);
    const data = block.match(/^data: (.+)$/m);
    if (event && data) events.push({ event: event[1], data: JSON.parse(data[1]) });
  }
  return { status: res.status, headers: res.headers, events, of: (name) => events.find((e) => e.event === name)?.data };
}

let counter = 0;
async function signup() {
  counter += 1;
  const res = await call('POST', '/auth/signup', { body: { email: `chat${counter}@example.com`, password: 'correct horse battery', name: '테스트' } });
  assert.equal(res.status, 201);
  return { token: res.json.accessToken, user: res.json.user };
}

async function addLecture(token, courseName = '운영체제', title = '9주차', transcript = TRANSCRIPT) {
  const course = (await call('POST', '/courses', { token, body: { name: courseName } })).json.course;
  const form = new FormData();
  form.append('courseId', course.id);
  form.append('title', title);
  form.append('text', transcript);
  const posted = await fetch(`${base}/lectures`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const lecture = (await posted.json()).lecture;
  for (let i = 0; i < 100; i += 1) {
    const detail = await call('GET', `/lectures/${lecture.id}`, { token });
    if (detail.status === 200 && detail.json.lecture.status === 'ready') return { course, lecture: detail.json.lecture };
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('lecture did not finish');
}

const toolCall = (name, args = {}) => ({ type: 'tool_calls', calls: [{ id: `call_${name}`, name, arguments: JSON.stringify(args) }] });
const say = (...parts) => parts.map((text) => ({ type: 'text', text }));

/** The tool result the model was given in the most recent turn. */
const lastToolResult = () => {
  const { messages } = seenTurns[seenTurns.length - 1];
  return JSON.parse(messages.filter((m) => m.role === 'tool').pop().content);
};

// ── Search ───────────────────────────────────────────────────────────────────

test('search finds Korean words whatever particle follows them, and nothing for topics never covered', async () => {
  const { token, user } = await signup();
  await addLecture(token);

  for (const query of ['교착 상태 조건', '교착상태의 조건을', '순환 대기', '은행원 알고리즘']) {
    const rows = await searchChunks(user.id, { query });
    assert.ok(rows.length > 0, `no results for ${query}`);
    assert.ok(rows[0].content.includes(query.split(' ')[0].slice(0, 2)), `first result for ${query} looks unrelated`);
  }
  assert.ok((await searchChunks(user.id, { query: '은행원 알고리즘' }))[0].content.includes('은행원'));

  for (const query of ['광합성 명반응', '미분 방정식 풀이', '화학 반응식', '프랑스 혁명 원인']) {
    assert.deepEqual(await searchChunks(user.id, { query }), [], `should find nothing for ${query}`);
  }
});

test('search terms drop particles and question words, and keep Latin terms whole', () => {
  assert.deepEqual(queryWords('상태를'), [['상태']]);
  assert.deepEqual(queryWords('어떻게 설명해줘'), []);
  assert.deepEqual(queryWords('Deadlock'), [['deadlock']]);
  assert.deepEqual(queryWords('교착 상태'), [['교착'], ['상태']]);
  assert.deepEqual(queryWords('교착상태의'), [['교착', '착상', '상태']]);
});

test('a shared word is not enough: the rare word in the question has to be there too', async () => {
  const { token, user } = await signup();
  await addLecture(token);
  // The lecture has 가상 메모리 and 페이지, but not these.
  for (const query of ['가상 화폐', '메모리 반도체', '페이지 디자인']) {
    assert.deepEqual(await searchChunks(user.id, { query }), [], `should find nothing for ${query}`);
  }
  assert.ok((await searchChunks(user.id, { query: '가상 메모리' })).length > 0);
});

test('lectures finished before chunks existed become searchable on first search', async () => {
  const { token, user } = await signup();
  const { lecture } = await addLecture(token);
  await db.query('DELETE FROM lecture_chunks WHERE lecture_id = $1', [lecture.id]);
  assert.ok((await searchChunks(user.id, { query: '은행원 알고리즘' })).length > 0);
});

// ── Answering ────────────────────────────────────────────────────────────────

test('a cited answer streams, is saved, and shows where each citation came from', async () => {
  const { token } = await signup();
  const { lecture } = await addLecture(token);

  script = [
    [toolCall('search_lectures', { query: '교착 상태 조건' })],
    () => {
      const source = lastToolResult().results.find((r) => r.text.includes('상호 배제')).source;
      return say('네 가지 조건은 상호 배제, ', `점유 대기, 비선점, 순환 대기예요. [${source}]`);
    },
  ];
  const res = await ask(token, { question: '교착 상태의 네 가지 조건이 뭐야?' });

  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/event-stream/);
  assert.equal(res.of('status').tool, 'search_lectures');
  assert.equal(res.events.filter((e) => e.event === 'delta').length, 2);

  const { conversation, messages } = res.of('done');
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, 'user');
  const answer = messages[1];
  assert.equal(answer.grounding, 'cited');
  assert.equal(answer.citations.length, 1);
  assert.equal(answer.citations[0].lectureId, lecture.id);
  assert.equal(answer.citations[0].lectureTitle, '9주차');
  assert.equal(answer.citations[0].courseName, '운영체제');
  assert.ok(answer.citations[0].excerpt.includes('상호 배제'));

  const reread = await call('GET', `/chat/conversations/${conversation.id}`, { token });
  assert.equal(reread.status, 200);
  assert.deepEqual(reread.json.conversation.messages.map((m) => m.role), ['user', 'assistant']);
  assert.equal(reread.json.conversation.messages[1].citations[0].lectureId, lecture.id);
  assert.equal((await call('GET', '/chat/conversations', { token })).json.conversations[0].title, '교착 상태의 네 가지 조건이 뭐야?');
});

test('a citation to anything the tools did not return is removed, and the answer is labelled', async () => {
  const { token } = await signup();
  await addLecture(token);

  script = [
    [toolCall('search_lectures', { query: '광합성' })],
    () => {
      assert.deepEqual(lastToolResult().results, []);
      return say('올린 강의에서는 찾지 못했어요. 광합성은 빛 에너지를 쓰는 과정이에요. [S1][S9]');
    },
  ];
  const { messages } = (await ask(token, { question: '광합성이 뭐야?' })).of('done');
  assert.equal(messages[1].content, '올린 강의에서는 찾지 못했어요. 광합성은 빛 에너지를 쓰는 과정이에요.');
  assert.deepEqual(messages[1].citations, []);
  assert.equal(messages[1].grounding, 'general');
});

test('a mark for having no source is removed, because the label under the answer says so', async () => {
  const { token } = await signup();
  script = [say('일반적인 설명이에요. [출처 없음]')];
  const { messages } = (await ask(token, { question: '질문' })).of('done');
  assert.equal(messages[1].content, '일반적인 설명이에요.');
  assert.equal(messages[1].grounding, 'general');
});

test('citations survive the odd forms real models write', async () => {
  const { token } = await signup();
  await addLecture(token);
  script = [
    [toolCall('search_lectures', { query: '교착 상태' })],
    () => {
      const { source } = lastToolResult().results[0];
      return say(`하나예요. [ ${source} ] 둘이에요. 【${source}】 셋이에요. [${source}, ${source}]`);
    },
  ];
  const { messages } = (await ask(token, { question: '교착 상태?' })).of('done');
  assert.equal(messages[1].grounding, 'cited');
  assert.equal(messages[1].citations.length, 1);
  assert.doesNotMatch(messages[1].content, /\[ S|【|S\d+,/);
});

test('an English word the lecture never used does not sink the Korean words beside it', async () => {
  const { token, user } = await signup();
  await addLecture(token);
  assert.ok((await searchChunks(user.id, { query: 'deadlock 조건' })).length > 0);
  assert.ok((await searchChunks(user.id, { query: '교착 상태 deadlock' })).length > 0);
  // Alone it finds nothing, and the same goes for a Korean topic that is not there.
  assert.deepEqual(await searchChunks(user.id, { query: 'deadlock' }), []);
  assert.deepEqual(await searchChunks(user.id, { query: 'photosynthesis 광합성' }), []);
});

test('the bee can read what was said at a given time, and sees an unclear stretch as unclear', async () => {
  const a = await signup();
  const b = await signup();
  const { lecture } = await addLecture(a.token);
  script = [
    [toolCall('get_transcript_at', { lecture_id: lecture.id, time: '12:50' })],
    () => {
      assert.match(lastToolResult().results[0].text, /불명확/);
      return [toolCall('get_transcript_at', { lecture_id: lecture.id, time: 'noon' })];
    },
    () => {
      assert.match(lastToolResult().error, /mm:ss/);
      return say('그 부분은 잘 안 들려서 [불명확]으로 남아 있어요.');
    },
  ];
  assert.ok((await ask(a.token, { question: '12분 50초쯤에 뭐라고 했어?' })).of('done'));

  script = [
    [toolCall('get_transcript_at', { lecture_id: lecture.id, time: '12:50' })],
    () => {
      assert.equal(lastToolResult().error, '그 강의를 찾을 수 없어요.');
      return say('찾을 수 없어요.');
    },
  ];
  assert.ok((await ask(b.token, { question: '다른 사람 강의' })).of('done'));
});

test('two failed searches end the looking, because more would only spend money', async () => {
  const { token } = await signup();
  await addLecture(token);
  script = [
    [toolCall('search_lectures', { query: '광합성' })],
    () => {
      assert.match(lastToolResult().note, /한 번 더/);
      return [toolCall('search_lectures', { query: 'photosynthesis' })];
    },
    () => {
      assert.match(lastToolResult().note, /더 찾지 말고/);
      return say('올린 강의에서는 찾지 못했어요.');
    },
  ];
  await ask(token, { question: '광합성?' });
  assert.ok(seenTurns[0].tools.length > 0);
  assert.ok(seenTurns[1].tools.length > 0);
  assert.equal(seenTurns[2].tools, undefined);
});

test('lecture text reaches the model with a reminder to add nothing to it', async () => {
  const { token } = await signup();
  await addLecture(token);
  script = [
    [toolCall('search_lectures', { query: '교착 상태' })],
    () => {
      assert.match(lastToolResult().reminder, /덧붙이지 않는다/);
      return say('답이에요.');
    },
  ];
  await ask(token, { question: '교착 상태?' });
});

test('an answer with no tool use is labelled as not from the lectures', async () => {
  const { token } = await signup();
  script = [say('안녕하세요. 강의에 관해 물어보세요.')];
  assert.equal((await ask(token, { question: '안녕' })).of('done').messages[1].grounding, 'general');
});

test('answers about the account are not labelled as general knowledge', async () => {
  const { token } = await signup();
  const { course } = await addLecture(token);
  script = [
    [toolCall('list_courses')],
    (messages) => {
      const result = JSON.parse(messages.filter((m) => m.role === 'tool').pop().content);
      assert.deepEqual(result.courses.map((c) => c.id), [course.id]);
      return say('운영체제 과목이 있어요.');
    },
  ];
  assert.equal((await ask(token, { question: '내 과목 뭐 있어?' })).of('done').messages[1].grounding, 'account');
});

test('exam flags and notes reach the model with citable sources', async () => {
  const { token } = await signup();
  const { lecture } = await addLecture(token);

  script = [
    [toolCall('get_exam_flags')],
    () => {
      const [flag] = lastToolResult().results;
      assert.equal(flag.at, '31:05');
      assert.equal(flag.kind, '시험 언급');
      return say(`교착 상태의 네 가지 조건이 나온다고 했어요. [${flag.source}]`);
    },
  ];
  const flags = (await ask(token, { question: '시험에 뭐 나와?' })).of('done').messages[1];
  assert.equal(flags.grounding, 'cited');
  assert.equal(flags.citations[0].at, '31:05');

  script = [
    [toolCall('get_lecture_notes', { lecture_id: lecture.id })],
    () => {
      const result = lastToolResult();
      assert.equal(result.lecture, '9주차');
      assert.deepEqual(result.results.map((r) => r.kind), ['노트 요약', '시험 언급', '노트', '노트']);
      return say('요약이에요.');
    },
  ];
  await ask(token, { question: '9주차 요약해 줘' });
});

test('review status comes from the real counts', async () => {
  const { token } = await signup();
  await addLecture(token);
  script = [
    [toolCall('get_review_status')],
    () => {
      assert.deepEqual(lastToolResult(), { due_now: 1, done_today: 0 });
      return say('오늘 복습할 카드가 1장 있어요.');
    },
  ];
  await ask(token, { question: '오늘 복습 몇 장이야?' });
});

test('a preamble before a tool call is discarded, and the loop always ends in an answer', async () => {
  const { token } = await signup();
  await addLecture(token);

  script = [
    [...say('찾아볼게요.'), toolCall('search_lectures', { query: '교착 상태' })],
    say('답이에요.'),
  ];
  const res = await ask(token, { question: '교착 상태?' });
  assert.deepEqual(res.events.map((e) => e.event), ['delta', 'reset', 'status', 'delta', 'done']);
  assert.equal(res.of('done').messages[1].content, '답이에요.');

  // A model that keeps calling tools is cut off, and the last turn offers none.
  seenTurns = [];
  script = [
    [toolCall('list_courses')],
    [toolCall('list_courses')],
    [toolCall('list_courses')],
    [toolCall('list_courses')],
    say('끝냈어요.'),
  ];
  assert.equal((await ask(token, { question: '과목?' })).of('done').messages[1].content, '끝냈어요.');
  assert.ok(seenTurns[0].tools.length > 0);
  assert.equal(seenTurns[seenTurns.length - 1].tools, undefined);
});

test('history goes back to the model without old source numbers', async () => {
  const { token } = await signup();
  await addLecture(token);
  script = [
    [toolCall('search_lectures', { query: '교착 상태' })],
    () => say(`교착 상태는 멈춘 상태예요. [${lastToolResult().results[0].source}]`),
  ];
  const first = (await ask(token, { question: '교착 상태?' })).of('done');

  seenTurns = [];
  script = [say('이어서요.')];
  await ask(token, { question: '더 설명해 줘', conversationId: first.conversation.id });
  const roles = seenTurns[0].messages.map((m) => m.role);
  assert.deepEqual(roles, ['system', 'user', 'assistant', 'user']);
  assert.equal(seenTurns[0].messages[2].content, '교착 상태는 멈춘 상태예요.');
});

// ── Failure saves nothing ────────────────────────────────────────────────────

test('when the model fails, the student is told and nothing is saved or counted', async () => {
  const { token, user } = await signup();
  script = [[...say('반쯤 쓴 '), { type: 'throw', message: 'secret provider detail' }]];
  const res = await ask(token, { question: '질문' });

  assert.equal(res.status, 200);
  assert.equal(res.of('error').message, '답변을 만들지 못했어요. 저장된 건 없습니다.');
  assert.ok(!JSON.stringify(res.events).includes('secret provider detail'));
  assert.equal(res.of('done'), undefined);
  assert.equal((await call('GET', '/chat/conversations', { token })).json.conversations.length, 0);
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM messages WHERE user_id = $1', [user.id])).rows[0].n, 0);
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM chat_usage WHERE user_id = $1', [user.id])).rows[0].n, 0);
});

test('an empty answer is a failure, not a blank message', async () => {
  const { token } = await signup();
  script = [say('   ', '[S4]')];
  const res = await ask(token, { question: '질문' });
  assert.ok(res.of('error'));
  assert.equal(res.of('done'), undefined);
});

test('cancelling mid-answer stops the model and saves nothing, and frees the student to ask again', async () => {
  const { token, user } = await signup();
  let aborted = false;
  script = [
    (messages, signal) => {
      signal.addEventListener('abort', () => { aborted = true; }, { once: true });
      return [...say('쓰는 중'), { type: 'wait' }];
    },
  ];
  const controller = new AbortController();
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: '긴 질문' }),
    signal: controller.signal,
  });
  const reader = res.body.getReader();
  await reader.read();
  controller.abort();

  for (let i = 0; i < 100 && !aborted; i += 1) await new Promise((r) => setTimeout(r, 20));
  assert.ok(aborted, 'the model call should be aborted');

  // Released once the handler has finished cleaning up.
  let again;
  for (let i = 0; i < 50; i += 1) {
    script = [say('이번에는 끝까지요.')];
    again = await ask(token, { question: '다시' });
    if (again.status === 200) break;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.equal(again.status, 200);
  const saved = await db.query(`SELECT content FROM messages WHERE user_id = $1 AND role = 'user'`, [user.id]);
  assert.deepEqual(saved.rows.map((r) => r.content), ['다시']);
});

test('a second question while one is being answered is refused', async () => {
  const { token } = await signup();
  script = [() => [...say('쓰는 중'), { type: 'wait' }]];
  const controller = new AbortController();
  const first = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: '첫 질문' }),
    signal: controller.signal,
  });
  await first.body.getReader().read();

  const second = await call('POST', '/chat', { token, body: { question: '둘째 질문' } });
  assert.equal(second.status, 409);
  assert.equal(second.json.error, 'Busy');
  controller.abort();
});

// ── Limits and validation ────────────────────────────────────────────────────

test('questions are validated before anything is spent', async () => {
  const { token } = await signup();
  assert.equal((await call('POST', '/chat', { body: { question: 'x' } })).status, 401);
  assert.equal((await call('POST', '/chat', { token, body: {} })).status, 400);
  assert.equal((await call('POST', '/chat', { token, body: { question: '   ' } })).status, 400);
  assert.equal((await call('POST', '/chat', { token, body: { question: 'x'.repeat(4001) } })).status, 413);
  assert.equal((await call('POST', '/chat', { token, body: { question: 'x', conversationId: 'nope' } })).status, 404);
  assert.equal((await call('POST', '/chat', { token, body: { question: 'x', courseId: 'nope' } })).status, 404);
  assert.equal(seenTurns.length, 0);
});

test('the monthly limit holds, and deleting conversations does not reset it', async () => {
  const { token, user } = await signup();
  script = [say('답이에요.')];
  const { conversation } = (await ask(token, { question: '하나' })).of('done');
  await db.query(`INSERT INTO chat_usage (user_id) SELECT $1 FROM generate_series(1, 49)`, [user.id]);
  assert.equal((await call('DELETE', `/chat/conversations/${conversation.id}`, { token })).status, 200);

  const refused = await call('POST', '/chat', { token, body: { question: '둘' } });
  assert.equal(refused.status, 429);
  assert.equal(refused.json.error, 'MonthlyLimit');
  assert.equal(seenTurns.length, 1);

  await db.query(`UPDATE chat_usage SET created_at = now() - interval '31 days' WHERE user_id = $1`, [user.id]);
  script = [say('다시 돼요.')];
  assert.equal((await ask(token, { question: '셋' })).status, 200);
});

test('a streamed answer is not compressed, even when the client accepts it', async () => {
  const { token } = await signup();
  script = [say('답이에요.')];
  const res = await ask(token, { question: '질문' }, { headers: { 'Accept-Encoding': 'gzip, deflate, br' } });
  assert.equal(res.headers.get('content-encoding'), null);
  assert.ok(res.of('done'));
});

// ── Isolation ────────────────────────────────────────────────────────────────

test('one student\'s conversations are invisible and untouchable to another', async () => {
  const a = await signup();
  const b = await signup();
  script = [say('답이에요.')];
  const { conversation } = (await ask(a.token, { question: 'A의 질문' })).of('done');

  assert.equal((await call('GET', `/chat/conversations/${conversation.id}`, { token: b.token })).status, 404);
  assert.equal((await call('DELETE', `/chat/conversations/${conversation.id}`, { token: b.token })).status, 404);
  assert.equal((await call('POST', '/chat', { token: b.token, body: { question: '끼어들기', conversationId: conversation.id } })).status, 404);
  assert.equal((await call('GET', '/chat/conversations', { token: b.token })).json.conversations.length, 0);
  assert.equal((await call('GET', `/chat/conversations/${conversation.id}`, { token: a.token })).status, 200);
});

test('no tool can reach another student\'s lectures, even given their ids', async () => {
  const a = await signup();
  const b = await signup();
  const { lecture, course } = await addLecture(a.token);

  script = [
    [toolCall('search_lectures', { query: '교착 상태', lecture_id: lecture.id, course_id: course.id, user_id: a.user.id })],
    () => {
      assert.deepEqual(lastToolResult().results, []);
      return [toolCall('get_lecture_notes', { lecture_id: lecture.id, user_id: a.user.id })];
    },
    () => {
      assert.equal(lastToolResult().error, '그 강의를 찾을 수 없어요.');
      return [toolCall('list_lectures', { course_id: course.id, user_id: a.user.id })];
    },
    () => {
      assert.deepEqual(lastToolResult().lectures, []);
      return [toolCall('get_exam_flags', { course_id: course.id, user_id: a.user.id })];
    },
    () => {
      assert.deepEqual(lastToolResult().results, []);
      return say('찾지 못했어요.');
    },
  ];
  const res = await ask(b.token, { question: '교착 상태?' });
  assert.equal(res.of('error'), undefined);
  assert.equal(res.of('done').messages[1].content, '찾지 못했어요.');
  assert.ok(!JSON.stringify(res.events).includes('상호 배제'));
});

test('every tool only reads, and the model is offered no way to change anything', async () => {
  const { token } = await signup();
  script = [say('답이에요.')];
  await ask(token, { question: '질문' });
  assert.deepEqual(
    seenTurns[0].tools.map((t) => t.function.name).sort(),
    ['get_exam_flags', 'get_lecture_notes', 'get_review_status', 'get_semester_status', 'get_transcript_at', 'list_courses', 'list_lectures', 'search_lectures']
  );
  for (const tool of seenTurns[0].tools) {
    assert.ok(!('user_id' in (tool.function.parameters.properties || {})), `${tool.function.name} must not take a student id`);
  }
});

test('an unknown tool, or a broken call, is an error the model can read', async () => {
  const { token } = await signup();
  script = [
    [{ type: 'tool_calls', calls: [{ id: 'c1', name: 'delete_lecture', arguments: '{}' }] }],
    () => {
      assert.equal(lastToolResult().error, '없는 도구예요.');
      return [{ type: 'tool_calls', calls: [{ id: 'c2', name: 'search_lectures', arguments: '{not json' }] }];
    },
    () => {
      assert.equal(lastToolResult().error, '인자를 읽지 못했어요.');
      return [{ type: 'tool_calls', calls: [{ id: 'c3', name: '__proto__', arguments: '{}' }] }];
    },
    () => {
      assert.equal(lastToolResult().error, '없는 도구예요.');
      return say('할 수 없어요.');
    },
  ];
  assert.equal((await ask(token, { question: '강의 지워 줘' })).of('done').messages[1].content, '할 수 없어요.');
});

test('a conversation limited to a course stays limited, whatever the model asks for', async () => {
  const { token } = await signup();
  const os1 = await addLecture(token, '운영체제', '9주차');
  const other = await addLecture(token, '통계학', '3주차', Array.from({ length: 40 }, (_, i) => `[${String(i).padStart(2, '0')}:00] 정규분포와 표본 평균의 관계를 살펴봅니다.`).join('\n'));

  script = [
    [toolCall('search_lectures', { query: '정규분포 표본', course_id: other.course.id })],
    () => {
      assert.deepEqual(lastToolResult().results, []);
      return [toolCall('get_lecture_notes', { lecture_id: other.lecture.id })];
    },
    () => {
      assert.equal(lastToolResult().error, '그 강의를 찾을 수 없어요.');
      return [toolCall('list_lectures', { course_id: other.course.id })];
    },
    () => {
      assert.deepEqual(lastToolResult().lectures.map((l) => l.title), ['9주차']);
      return say('이 과목에는 없어요.');
    },
  ];
  const first = (await ask(token, { question: '정규분포?', courseId: os1.course.id })).of('done');
  assert.equal(first.conversation.courseId, os1.course.id);
  assert.match(seenTurns[0].messages[0].content, /'운영체제' 과목/);

  // The scope stays with the conversation, even if a later request names another course.
  seenTurns = [];
  script = [say('네.')];
  await ask(token, { question: '이어서', conversationId: first.conversation.id, courseId: other.course.id });
  assert.match(seenTurns[0].messages[0].content, /'운영체제' 과목/);

  const stranger = await signup();
  assert.equal((await call('POST', '/chat', { token: stranger.token, body: { question: 'x', courseId: os1.course.id } })).status, 404);
});

// ── Deletion ─────────────────────────────────────────────────────────────────

test('deleting a lecture removes its chunks, and old citations stop showing its text', async () => {
  const { token, user } = await signup();
  const { lecture } = await addLecture(token);
  script = [
    [toolCall('search_lectures', { query: '은행원 알고리즘' })],
    () => say(`회피 방법이에요. [${lastToolResult().results[0].source}]`),
  ];
  const { conversation, messages } = (await ask(token, { question: '은행원 알고리즘?' })).of('done');
  assert.ok(messages[1].citations[0].excerpt);

  assert.equal((await call('DELETE', `/lectures/${lecture.id}`, { token })).status, 200);
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM lecture_chunks WHERE user_id = $1', [user.id])).rows[0].n, 0);

  const reread = (await call('GET', `/chat/conversations/${conversation.id}`, { token })).json.conversation;
  assert.deepEqual(reread.messages[1].citations, [{ label: 'S1', deleted: true }]);
  assert.ok(!JSON.stringify(reread.messages[1].citations).includes('은행원'));
});

test('a failed lecture leaves nothing to search', async () => {
  const { token, user } = await signup();
  const course = (await call('POST', '/courses', { token, body: { name: '철학' } })).json.course;
  const form = new FormData();
  form.append('courseId', course.id);
  form.append('text', '너무 짧은 녹취록.');
  await fetch(`${base}/lectures`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  for (let i = 0; i < 100; i += 1) {
    const status = (await db.query('SELECT status FROM lectures WHERE user_id = $1', [user.id])).rows[0].status;
    if (status === 'failed') break;
    await new Promise((r) => setTimeout(r, 50));
  }
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM lecture_chunks WHERE user_id = $1', [user.id])).rows[0].n, 0);
});

test('deleting the account removes conversations, messages, chunks and usage', async () => {
  const { token, user } = await signup();
  await addLecture(token);
  script = [say('답이에요.')];
  await ask(token, { question: '질문' });

  assert.equal((await call('DELETE', '/auth/account', { token, body: { password: 'correct horse battery' } })).status, 200);
  for (const table of ['conversations', 'messages', 'lecture_chunks', 'chat_usage']) {
    const n = (await db.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE user_id = $1`, [user.id])).rows[0].n;
    assert.equal(n, 0, table);
  }
});

// ── The companion: Juno in the app's main chat ───────────────────────────────

test('told about a deadline in the main chat, Juno saves it and tells the app at once', async () => {
  const { token } = await signup();
  script = [
    [toolCall('save_task', { title: 'Lab report 3', kind: 'assignment', due_at: '2031-03-14T18:00' })],
    say('Lab report 3을 3월 14일 오후 6시로 저장했어요. 하루 전에 알려 드릴게요.'),
  ];
  const res = await ask(token, { question: 'I have lab report 3 due March 14 at 6pm', mode: 'companion' });
  assert.equal(res.status, 200);

  const offered = seenTurns.at(-2).tools.map((tool) => tool.function.name);
  assert.ok(offered.includes('save_task') && offered.includes('search_lectures'), 'the companion has both kinds of tool');

  const action = res.of('action');
  assert.equal(action.type, 'task_saved');
  assert.equal(action.task.title, 'Lab report 3');
  assert.equal(action.task.kind, 'assignment');
  assert.equal(new Date(action.task.dueAt).toISOString(), '2031-03-14T09:00:00.000Z', '18:00 in Korea');
  assert.equal(action.task.remindMinutes, 1440, 'a day before, when there is more than a day to go');
  assert.equal(lastToolResult().saved, true);

  const tasks = await call('GET', '/tasks?state=open', { token });
  assert.deepEqual(tasks.json.tasks.map((task) => task.title), ['Lab report 3']);

  // "What's left?" is answered from the list, and "done" ticks it off.
  script = [[toolCall('list_tasks', {})], (messages) => {
    const id = JSON.parse(messages.at(-1).content).tasks[0].id;
    return [toolCall('complete_task', { task_id: id })];
  }, say('끝낸 걸로 표시했어요.')];
  const done = await ask(token, { question: 'I finished the lab report', mode: 'companion' });
  assert.equal(done.of('action').type, 'task_done');
  assert.equal((await call('GET', '/tasks?state=open', { token })).json.tasks.length, 0);
});

test('a date Juno cannot read is refused, a day without a time means the end of that day, and nothing is saved without a title', async () => {
  const { token } = await signup();
  script = [
    [toolCall('save_task', { title: 'Quiz', due_at: 'next Friday' })],
    [toolCall('save_task', { title: 'Quiz', kind: 'exam', due_at: '2031-03-14' })],
    [toolCall('save_task', { title: '   ' })],
    say('퀴즈를 3월 14일로 저장했어요.'),
  ];
  const res = await ask(token, { question: 'quiz on the 14th of March 2031', mode: 'companion' });
  const saved = res.events.filter((e) => e.event === 'action');
  assert.equal(saved.length, 1, 'only the readable one was saved');
  assert.equal(new Date(saved[0].data.task.dueAt).toISOString(), '2031-03-14T14:59:00.000Z', '23:59 in Korea');
  assert.equal((await call('GET', '/tasks?state=open', { token })).json.tasks.length, 1);
});

test('outside the main chat Juno has no hands: the same call saves nothing', async () => {
  const { token } = await signup();
  script = [[toolCall('save_task', { title: 'Sneaky' })], say('저는 강의 내용만 도와드릴 수 있어요.')];
  const res = await ask(token, { question: 'save this' });
  assert.equal(res.events.some((e) => e.event === 'action'), false);
  assert.equal(seenTurns.at(-2).tools.some((tool) => tool.function.name === 'save_task'), false);
  assert.ok(lastToolResult().error);
  assert.equal((await call('GET', '/tasks?state=open', { token })).json.tasks.length, 0);
});
