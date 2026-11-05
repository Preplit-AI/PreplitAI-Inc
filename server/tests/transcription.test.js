'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { classify, mergeRanges } = require('../services/transcription');
const { validate } = require('../services/lectureService');

test('non-speech and Whisper\'s stock hallucinations are dropped, not transcribed', () => {
  assert.equal(classify({ text: '시청해 주셔서 감사합니다.', avg_logprob: -0.2, no_speech_prob: 0.1, compression_ratio: 1 }), 'silence');
  assert.equal(classify({ text: '음', avg_logprob: -0.3, no_speech_prob: 0.9, compression_ratio: 1 }), 'silence');
});

test('low-confidence speech is marked unclear rather than guessed', () => {
  assert.equal(classify({ text: '교착 상태의 조건은', avg_logprob: -1.4, no_speech_prob: 0.1, compression_ratio: 1.2 }), 'unclear');
  assert.equal(classify({ text: '네 네 네 네 네 네 네', avg_logprob: -0.3, no_speech_prob: 0.1, compression_ratio: 3.1 }), 'unclear');
  assert.equal(classify({ text: '교착 상태의 조건은 네 가지입니다.', avg_logprob: -0.25, no_speech_prob: 0.05, compression_ratio: 1.3 }), 'speech');
});

test('unclear stretches close together are reported as one range', () => {
  assert.deepEqual(mergeRanges([{ start: 720, end: 730 }, { start: 745, end: 800 }, { start: 2000, end: 2010 }]),
    [{ start: 720, end: 800 }, { start: 2000, end: 2010 }]);
});

test('notes without content are rejected, never patched', () => {
  assert.throws(() => validate({ sections: [] }), { code: 'NOTES_INVALID' });
  assert.throws(() => validate({ sections: [{ heading: '제목', points: [] }] }), { code: 'NOTES_INVALID' });
});

test('notes are trimmed to at most ten cards and drop half-empty ones', () => {
  const cards = Array.from({ length: 14 }, (_, i) => ({ front: 'Q' + i, back: 'A' + i }));
  cards.push({ front: '', back: 'orphan' });
  const out = validate({ sections: [{ heading: 'h', points: ['p'] }], cards });
  assert.equal(out.cards.length, 10);
  assert.ok(out.cards.every((c) => c.front && c.back));
});
