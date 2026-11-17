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

  /**
   * Where the site lives. Links in e-mails and the Google return address are
   * built from this, never from the request's Host header, which a client sets.
   */
  PUBLIC_URL: (process.env.PUBLIC_URL || (isProduction ? 'https://www.preplitai.com' : 'http://localhost:8080')).replace(/\/+$/, ''),

  /** Sign in with Google is offered only when both are set (Google Cloud, OAuth client of type "Web application"). */
  GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  GOOGLE_CLIENT_SECRET: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),

  /** "Forgot password?" is offered only when a Resend key is set; EMAIL_FROM must be on a domain verified in Resend. */
  RESEND_API_KEY: (process.env.RESEND_API_KEY || '').trim(),
  EMAIL_FROM: (process.env.EMAIL_FROM || 'Preplit AI <no-reply@preplitai.com>').trim(),
  /** How long a password-reset link works. */
  RESET_TOKEN_TTL_MS: 60 * 60 * 1000,

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

  TRANSCRIBE_MODEL: process.env.TRANSCRIBE_MODEL || 'google/gemini-2.5-flash',
  // Reads pictures: a screenshot of the student's LMS becomes a list of deadlines.
  VISION_MODEL: process.env.VISION_MODEL || 'google/gemini-2.5-flash',
  NOTES_MODEL: process.env.NOTES_MODEL || 'google/gemini-2.5-flash',
  CHAT_MODEL: process.env.CHAT_MODEL || 'google/gemini-2.5-flash',
  /**
   * How much transcript goes into one notes request. Gemini 2.5 Flash accepts
   * 1M tokens, so a full 90-minute lecture fits in one shot.
   */
  NOTES_PART_CHARS: int(process.env.NOTES_PART_CHARS, 120000),
  /** Tried, in order, when the chosen model fails. */
  FALLBACK_MODELS: (process.env.FALLBACK_MODELS || 'google/gemini-2.5-flash').split(',').map((s) => s.trim()).filter(Boolean),
};
