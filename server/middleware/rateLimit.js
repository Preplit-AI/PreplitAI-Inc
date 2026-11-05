'use strict';
/**
 * Rate limits.
 *
 * Sign-in and sign-up are limited per client IP so passwords cannot be guessed
 * at speed. Uploads are limited per account, on top of the monthly lecture
 * limit, because each one spends transcription budget. Behind a proxy, set
 * TRUST_PROXY so req.ip is the client rather than the proxy.
 */
const { RateLimiterMemory } = require('rate-limiter-flexible');

// The test suite signs up many accounts from one address.
const scale = process.env.NODE_ENV === 'test' ? 100 : 1;

const limiters = {
  login: new RateLimiterMemory({ keyPrefix: 'login', points: 10 * scale, duration: 15 * 60 }),
  signup: new RateLimiterMemory({ keyPrefix: 'signup', points: 5 * scale, duration: 60 * 60 }),
  refresh: new RateLimiterMemory({ keyPrefix: 'refresh', points: 60 * scale, duration: 60 }),
  upload: new RateLimiterMemory({ keyPrefix: 'upload', points: 12 * scale, duration: 60 * 60 }),
  review: new RateLimiterMemory({ keyPrefix: 'review', points: 300 * scale, duration: 60 * 60 }),
};

function limit(name, keyOf) {
  const limiter = limiters[name];
  return async (req, res, next) => {
    try {
      await limiter.consume(String(keyOf(req)), 1);
      next();
    } catch (rejection) {
      if (rejection instanceof Error) return next(rejection);
      const retryAfter = Math.max(1, Math.ceil((rejection.msBeforeNext || 60000) / 1000));
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        error: 'TooManyRequests',
        message: `요청이 너무 많아요. ${Math.ceil(retryAfter / 60)}분 뒤에 다시 해 주세요.`,
        retryAfter,
      });
    }
  };
}

const byIp = (req) => req.ip;
const byUser = (req) => req.userId || req.ip;

module.exports = {
  loginLimit: limit('login', byIp),
  signupLimit: limit('signup', byIp),
  refreshLimit: limit('refresh', byIp),
  uploadLimit: limit('upload', byUser),
  reviewLimit: limit('review', byUser),
};
