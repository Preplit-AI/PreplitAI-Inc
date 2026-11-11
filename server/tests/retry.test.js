'use strict';
/**
 * The first database connection: a reset or a waking database is retried a
 * few times, a wrong address or password fails at once.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { withRetry, isTransient } = require('../db/retry');

const fail = (code, message = code) => Object.assign(new Error(message), { code });

function attempts(...outcomes) {
  const calls = { n: 0 };
  const attempt = async () => {
    const outcome = outcomes[calls.n++];
    if (outcome instanceof Error) throw outcome;
    return outcome;
  };
  return { attempt, calls };
}

test('a reset connection is retried, and the next attempt that works is returned', async () => {
  const { attempt, calls } = attempts(fail('ECONNRESET'), fail('57P03'), 'connected');
  const slept = [];
  const result = await withRetry(attempt, { delays: [250, 750, 1500], sleep: async (ms) => { slept.push(ms); } });
  assert.equal(result, 'connected');
  assert.equal(calls.n, 3);
  assert.deepEqual(slept, [250, 750]);
});

test('it gives up with the last error once the delays run out', async () => {
  const { attempt, calls } = attempts(fail('ECONNRESET'), fail('ECONNRESET'), fail('ETIMEDOUT'));
  await assert.rejects(withRetry(attempt, { delays: [1, 1], sleep: async () => {} }), { code: 'ETIMEDOUT' });
  assert.equal(calls.n, 3);
});

test('a wrong address, password or database fails at once', async () => {
  for (const code of ['ERR_INVALID_URL', '28P01', '3D000', 'ENOTFOUND']) {
    const { attempt, calls } = attempts(fail(code), 'connected');
    await assert.rejects(withRetry(attempt, { delays: [1, 1, 1], sleep: async () => {} }), { code });
    assert.equal(calls.n, 1, code);
  }
});

test('with no delays (development) the first failure is final', async () => {
  const { attempt, calls } = attempts(fail('ECONNREFUSED'), 'connected');
  await assert.rejects(withRetry(attempt), { code: 'ECONNREFUSED' });
  assert.equal(calls.n, 1);
});

test('a socket closed during the handshake counts as transient', () => {
  assert.equal(isTransient(new Error('Connection terminated unexpectedly')), true);
  assert.equal(isTransient(new Error('password authentication failed for user "x"')), false);
  assert.equal(isTransient(undefined), false);
});
