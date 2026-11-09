'use strict';
/**
 * Server-wide configuration.
 * Secrets come only from the environment. Production refuses to boot without
 * them rather than running on a guessable default.
 */
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

// ── JWT secret ───────────────────────────────────────────────────────────────
// Development without a secret gets a random one per process. Access tokens then
// stop working on restart, which is harmless: sessions are restored from the
// refresh cookie, which does not depend on this secret.
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (isProduction) {
    console.error('FATAL: JWT_SECRET must be set to a random value of at least 32 characters.');
    process.exit(1);
  }
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('[config] JWT_SECRET missing or short; using a random per-process secret (development only).');
}

const int = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  isProduction,
  JWT_SECRET,
  PORT: int(process.env.PORT, 5000),

  /** Short-lived; the client keeps it in memory only. */
  ACCESS_TOKEN_TTL: '15m',
  /** Long-lived, httpOnly cookie, rotated on every use. */
  REFRESH_TOKEN_TTL_MS: 30 * 24 * 60 * 60 * 1000,

  /** If set, sign-up requires this code. Use it to keep the pilot to its cohort. */
  PILOT_INVITE_CODE: (process.env.PILOT_INVITE_CODE || '').trim(),

  /** Lectures one student may process per rolling 30 days. Protects the transcription budget. */
  MONTHLY_LECTURE_LIMIT: int(process.env.MONTHLY_LECTURE_LIMIT, 40),
  /** Lectures processed at the same time across the whole server. */
  PROCESSING_CONCURRENCY: int(process.env.PROCESSING_CONCURRENCY, 2),

  MAX_AUDIO_BYTES: int(process.env.MAX_AUDIO_MB, 200) * 1024 * 1024,
  MAX_TRANSCRIPT_CHARS: 200000,

  /** Cards offered in one day's review, so a session stays short. */
  DAILY_REVIEW_LIMIT: int(process.env.DAILY_REVIEW_LIMIT, 20),

  /** Questions one student may ask per rolling 30 days. Protects the model budget. */
  MONTHLY_CHAT_LIMIT: int(process.env.MONTHLY_CHAT_LIMIT, 600),
  MAX_CHAT_MESSAGE_CHARS: 4000,

  TRANSCRIBE_MODEL: process.env.TRANSCRIBE_MODEL || 'whisper-large-v3-turbo',
  NOTES_MODEL: process.env.NOTES_MODEL || 'openai/gpt-oss-120b',
  CHAT_MODEL: process.env.CHAT_MODEL || 'openai/gpt-oss-120b',
  /** How much transcript goes into one notes request. About 4,500 tokens, which leaves room for the answer on an 8,000-a-minute plan. */
  NOTES_PART_CHARS: int(process.env.NOTES_PART_CHARS, 8000),
  /** Tried, in order, when the chosen model fails. */
  FALLBACK_MODELS: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
};
