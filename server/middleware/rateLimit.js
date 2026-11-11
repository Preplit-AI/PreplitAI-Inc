'use strict';
/**
 * Rate limits.
 *
 * Sign-in, sign-up and password resets are limited per client IP, and per
 * e-mail address, so passwords cannot be guessed at speed. Uploads, review and
 * chat are limited per account, because each one spends model budget.
 *
 * The counters live in the database (table rate_limits), not in memory: on
 * Vercel every serverless instance has its own memory, so an in-memory limit
 * restarts at zero on each new instance. Behind a proxy, req.ip must be the
 * client (app.js sets "trust proxy" on Vercel, or from TRUST_PROXY).
 */
const db = require('../db/database');

// The test suite signs up many accounts from one address.
const scale = process.env.NODE_ENV === 'test' ? 100 : 1;

const RULES = {
  login: { points: 10, seconds: 15 * 60 },
  loginEmail: { points: 20, seconds: 60 * 60 },
  signup: { points: 5, seconds: 60 * 60 },
  refresh: { points: 60, seconds: 60 },
  google: { points: 30, seconds: 15 * 60 },
  forgot: { points: 5, seconds: 60 * 60 },
  forgotEmail: { points: 3, seconds: 60 * 60 },
  reset: { points: 10, seconds: 15 * 60 },
  upload: { points: 12, seconds: 60 * 60 },
  review: { points: 300, seconds: 60 * 60 },
  chat: { points: 60, seconds: 60 * 60 },
};

/**
 * Counts one hit for `key` in a fixed window and says whether it is over the
 * limit. One statement, so two instances counting at once cannot both slip in.
 */
async function hit(key, points, seconds) {
  const { rows } = await db.query(
    `INSERT INTO rate_limits (key, hits, reset_at) VALUES ($1, 1, now() + $2::int * interval '1 second')
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.hits + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at <= now() THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
     RETURNING hits, reset_at`,
    [key, seconds]
  );
  // Now and then, clear windows that ended long ago so the table stays small.
  if (Math.random() < 0.01) {
    db.query("DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day'").catch(() => {});
  }
  const { hits, reset_at: resetAt } = rows[0];
  const retryAfter = Math.max(1, Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000));
  return { over: hits > points, retryAfter };
}

function tooMany(res, retryAfter) {
  res.set('Retry-After', String(retryAfter));
  res.status(429).json({
    success: false,
    error: 'TooManyRequests',
    message: `요청이 너무 많아요. ${Math.ceil(retryAfter / 60)}분 뒤에 다시 해 주세요.`,
    retryAfter,
  });
}

/**
 * Middleware for one rule. `keyOf` names who is counted; a request it returns
 * nothing for (say, no e-mail in the body) is not counted.
 */
function limit(name, keyOf, rule = RULES[name]) {
  const points = rule.points * scale;
  return async (req, res, next) => {
    try {
      const who = keyOf(req);
      if (!who) return next();
      const { over, retryAfter } = await hit(`${name}:${who}`, points, rule.seconds);
      if (over) return tooMany(res, retryAfter);
      next();
    } catch (err) {
      next(err);
    }
  };
}

const byIp = (req) => req.ip;
const byUser = (req) => req.userId || req.ip;
const byEmail = (req) => {
  const email = req.body && req.body.email;
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase().slice(0, 254) : null;
};

module.exports = {
  limit,
  hit,
  loginLimit: limit('login', byIp),
  loginEmailLimit: limit('loginEmail', byEmail),
  signupLimit: limit('signup', byIp),
  refreshLimit: limit('refresh', byIp),
  googleLimit: limit('google', byIp),
  forgotLimit: limit('forgot', byIp),
  forgotEmailLimit: limit('forgotEmail', byEmail),
  resetLimit: limit('reset', byIp),
  uploadLimit: limit('upload', byUser),
  reviewLimit: limit('review', byUser),
  chatLimit: limit('chat', byUser),
};
