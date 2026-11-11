'use strict';
/**
 * Retries the first connection to the database.
 *
 * On Vercel every fresh instance connects anew, and now and then that first
 * connection is reset, or meets a Neon compute that is still waking up. Those
 * pass within a second or two, so they get a few short retries before the
 * server gives up. A wrong address, password or database name never fixes
 * itself, so it fails at once.
 */

// Node's network errors, and Postgres's connection-level SQLSTATEs:
// 57P01 admin shutdown, 57P03 cannot connect now, 08xxx connection exceptions.
const TRANSIENT = new Set([
  'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN',
  '57P01', '57P03', '08000', '08001', '08003', '08004', '08006',
]);

function isTransient(err) {
  if (!err) return false;
  if (TRANSIENT.has(err.code)) return true;
  // pg reports a socket closed during the handshake without a code.
  return !err.code && /terminated unexpectedly|timeout/i.test(err.message || '');
}

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * Runs `attempt`, and after a transient failure waits each of `delays` in turn
 * and runs it again. Throws the last error once the delays run out, or at once
 * for an error that is not transient.
 */
async function withRetry(attempt, { delays = [], onRetry = () => {}, sleep = wait } = {}) {
  for (let i = 0; ; i += 1) {
    try {
      return await attempt();
    } catch (err) {
      if (i >= delays.length || !isTransient(err)) throw err;
      onRetry(err, i + 1, delays[i]);
      await sleep(delays[i]);
    }
  }
}

module.exports = { withRetry, isTransient };
