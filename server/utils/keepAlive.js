'use strict';

/**
 * Lets work that outlives its response finish on a serverless host.
 *
 * On Vercel a function may be frozen as soon as it has answered. Handing the
 * promise to the platform's `waitUntil` keeps this instance running until the
 * promise settles (this is what the @vercel/functions package does). On the
 * long-running server there is nothing to do: the process simply stays up.
 */
function keepAlive(promise) {
  const guarded = Promise.resolve(promise).catch((err) => console.error('[keepAlive]', err && err.message));
  const context = globalThis[Symbol.for('@vercel/request-context')];
  const waitUntil = context && typeof context.get === 'function' && context.get() && context.get().waitUntil;
  if (typeof waitUntil === 'function') waitUntil(guarded);
  return guarded;
}

module.exports = { keepAlive };
