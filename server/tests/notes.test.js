'use strict';
/**
 * Writing notes for a whole lecture. A 50-minute class does not fit in one
 * request on a lower-tier provider plan, so long lectures go part by part. The
 * model is scripted here; what is under test is the splitting and joining.
 */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-the-check-0123456789';
process.env.NOTES_PART_CHARS = '1000';

let calls = [];
let reply = null;

const llmPath = require.resolve('../services/llmService');
require.cache[llmPath] = {
  id: llmPath,
  filename: llmPath,
  loaded: true,
  exports: {
    getClient() {
      throw new Error('tests do not call the provider');
    },
    streamTurn() {
      throw new Error('tests do not call the provider');
    },
    async callLLM(args) {
      calls.push(args);
      return reply(args, calls.length);
    },
  },
};

const { buildNotes, splitTranscript, pickEvenly } = require('../services/lectureService');

beforeEach(() => {
  calls = [];
});

const part = (n, extra = {}) => JSON.stringify({
  title: '',
  summary: '',
  sections: [{ heading: `소제목 ${n}`, points: [`내용 ${n}`] }],
  flagged: [],
  cards: [{ front: `질문 ${n}`, back: `답 ${n}` }],
  ...extra,
});

const lines = (count) => Array.from({ length: count }, (_, i) => `[${String(i).padStart(2, '0')}:00] 문장 ${i} 교착 상태는 프로세스가 자원을 기다리는 상태입니다.`).join('\n');
const isSummary = (args) => args.userPrompt.includes('소제목과 내용:');

test('a transcript is cut between lines, and nothing is lost', () => {
  const transcript = lines(200);
  const parts = splitTranscript(transcript, 1000);
  assert.ok(parts.length > 1);
  assert.ok(parts.every((p) => p.length <= 1000));
  assert.equal(parts.join('\n'), transcript);
  assert.ok(parts.every((p) => p.startsWith('[')));
});

test('one enormous pasted line is still cut, without losing text', () => {
  const sentence = '교착 상태는 프로세스가 자원을 기다리는 상태입니다. ';
  const transcript = sentence.repeat(300).trim();
  const parts = splitTranscript(transcript, 1000);
  assert.ok(parts.length > 1);
  assert.ok(parts.every((p) => p.length <= 1000));
  assert.equal(parts.join(' ').replace(/\s+/g, ''), transcript.replace(/\s+/g, ''));
});

test('text with no sentence ends at all is still cut', () => {
  const parts = splitTranscript('가'.repeat(3500), 1000);
  assert.deepEqual(parts.map((p) => p.length), [1000, 1000, 1000, 500]);
});

test('a short lecture takes one request', async () => {
  reply = () => part(1, { title: '교착 상태', summary: '요약이에요.' });
  const notes = await buildNotes({ transcript: lines(5), courseName: '운영체제', title: '9주차' });
  assert.equal(calls.length, 1);
  assert.equal(notes.title, '교착 상태');
  assert.equal(calls[0].patient, true);
});

test('a long lecture goes part by part, in order, and comes back whole', async () => {
  reply = (args, n) => {
    if (isSummary(args)) return JSON.stringify({ title: '교착 상태 전체', summary: '전체 요약이에요.' });
    return part(n, { flagged: n === 2 ? [{ quote: '시험에 나옵니다.', at: '05:00', note: '조건' }] : [] });
  };
  const notes = await buildNotes({ transcript: lines(100), courseName: '운영체제', title: '9주차' });

  const parts = calls.filter((c) => !isSummary(c));
  assert.ok(parts.length > 1);
  assert.ok(parts.every((c) => c.jsonMode && c.patient));
  assert.ok(parts[0].userPrompt.includes(`${parts.length}부분 중 1번째`));
  assert.ok(parts[1].userPrompt.includes(`${parts.length}부분 중 2번째`));
  assert.ok(isSummary(calls[calls.length - 1]));

  assert.equal(notes.title, '교착 상태 전체');
  assert.equal(notes.summary, '전체 요약이에요.');
  assert.deepEqual(notes.sections.map((s) => s.heading), parts.map((_, i) => `소제목 ${i + 1}`));
  assert.deepEqual(notes.flagged, [{ quote: '시험에 나옵니다.', at: '05:00', note: '조건' }]);
  assert.ok(notes.cards.length <= 10);
});

test('every part of a real transcript reaches the model, and each request stays small', async () => {
  reply = (args, n) => (isSummary(args) ? '{"title":"t","summary":"s"}' : part(n));
  const transcript = lines(100);
  await buildNotes({ transcript, courseName: '운영체제', title: '' });
  const sent = calls.filter((c) => !isSummary(c)).map((c) => c.userPrompt);
  for (const line of transcript.split('\n')) {
    assert.ok(sent.some((prompt) => prompt.includes(line)), line);
  }
  assert.ok(sent.every((prompt) => prompt.length < 2000));
});

test('if one part fails the whole lecture fails, so no note is saved with a hole in it', async () => {
  reply = (args, n) => {
    if (n === 2) {
      const err = new Error('model unavailable');
      err.code = 'LLM_UNAVAILABLE';
      throw err;
    }
    return part(n);
  };
  await assert.rejects(buildNotes({ transcript: lines(100), courseName: '운영체제', title: '' }), { code: 'LLM_UNAVAILABLE' });
  assert.equal(calls.length, 2);
});

test('one malformed reply is asked for again; two fail the lecture', async () => {
  let bad = 1;
  reply = (args, n) => {
    if (isSummary(args)) return '{"title":"t","summary":"s"}';
    if (bad > 0) {
      bad -= 1;
      return 'not json at all';
    }
    return part(n);
  };
  assert.ok((await buildNotes({ transcript: lines(100), courseName: '운영체제', title: '' })).sections.length > 0);

  calls = [];
  reply = () => 'never json';
  await assert.rejects(buildNotes({ transcript: lines(100), courseName: '운영체제', title: '' }), { code: 'NOTES_INVALID' });
  assert.equal(calls.length, 2);
});

test('a stretch with nothing to note is fine, as long as the lecture has something', async () => {
  reply = (args, n) => {
    if (isSummary(args)) return '{"title":"t","summary":"s"}';
    return n === 1 ? JSON.stringify({ sections: [], flagged: [], cards: [] }) : part(n);
  };
  assert.ok((await buildNotes({ transcript: lines(100), courseName: '운영체제', title: '' })).sections.length > 0);

  reply = () => JSON.stringify({ sections: [], flagged: [], cards: [] });
  await assert.rejects(buildNotes({ transcript: lines(100), courseName: '운영체제', title: '' }), { code: 'NOTES_INVALID' });
});

test('losing the title and summary does not lose the notes', async () => {
  reply = (args, n) => {
    if (isSummary(args)) throw new Error('model unavailable');
    return part(n);
  };
  const notes = await buildNotes({ transcript: lines(100), courseName: '운영체제', title: '' });
  assert.equal(notes.title, '');
  assert.equal(notes.summary, '');
  assert.ok(notes.sections.length > 1);
});

test('cards are taken from across the lecture, not just the start', () => {
  const items = Array.from({ length: 30 }, (_, i) => i);
  const picked = pickEvenly(items, 10);
  assert.equal(picked.length, 10);
  assert.equal(picked[0], 0);
  assert.ok(picked[9] >= 27);
  assert.deepEqual(pickEvenly([1, 2, 3], 10), [1, 2, 3]);
});
