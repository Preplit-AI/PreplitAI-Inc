'use strict';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');
const { withRetry } = require('./retry');

/**
 * One database for the whole API.
 *
 * Production: PostgreSQL from DATABASE_URL. If it cannot be reached the process
 * exits; there is no fallback that could quietly lose students' notes.
 *
 * Development: PostgreSQL when it answers. Otherwise PGlite, a real Postgres
 * build that runs in-process and persists to server/.data/pglite, so a laptop
 * without Postgres still gets a working app whose data survives a restart.
 * The old hand-written in-memory SQL emulator is gone: it lost everything on
 * restart and only understood the exact queries it had been written for.
 */

const isProduction = process.env.NODE_ENV === 'production';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // rotated_at: replaced by a newer token (normal use). revoked_at: ended by
  // logout, a password change or theft detection, and never accepted again.
  `ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS rotated_at TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS refresh_tokens_hash_idx ON refresh_tokens (token_hash)`,

  // google_sub: the Google account signed in with (its stable "sub" id), if any.
  // email_verified_at: when the student proved the address is theirs, by Google
  // or by a reset link. Until then a password set at sign-up is not trusted to
  // outrank a Google sign-in for the same address (see routes/auth.js).
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_idx ON users (google_sub)`,

  // A password-reset link: only its hash is kept, it works once, for an hour.
  `CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // Rate-limit counters, kept here rather than in memory so every serverless
  // instance counts against the same limit (middleware/rateLimit.js).
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(320) PRIMARY KEY,
    hits INTEGER NOT NULL,
    reset_at TIMESTAMPTZ NOT NULL
  )`,

  // A course the student takes. The old "spaces" table is left untouched for
  // anyone with data in it; see migrations/2026-11-03-drop-legacy.sql.
  `CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS courses_user_idx ON courses (user_id)`,

  // One recorded lecture. A failed lecture keeps no transcript, notes or cards;
  // the row exists only so Juno can say that nothing was saved.
  `CREATE TABLE IF NOT EXISTS lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    source VARCHAR(8) NOT NULL CHECK (source IN ('audio', 'text')),
    status VARCHAR(12) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
    duration_seconds INT,
    transcript TEXT,
    notes JSONB,
    unclear_ranges JSONB NOT NULL DEFAULT '[]'::jsonb,
    card_count INT NOT NULL DEFAULT 0,
    failure_reason VARCHAR(40),
    message_dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS lectures_user_idx ON lectures (user_id, created_at DESC)`,

  // A review card, scheduled by FSRS. `due` is duplicated out of `fsrs` so the
  // daily queue is an index scan.
  `CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 0,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    fsrs JSONB NOT NULL,
    due TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS cards_user_due_idx ON cards (user_id, due)`,

  `CREATE TABLE IF NOT EXISTS review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 4),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS review_logs_user_idx ON review_logs (user_id, reviewed_at DESC)`,

  // A searchable piece of a lecture: its transcript, or a part of its notes.
  // These are what Juno cites in the workspace, and they go with the lecture.
  `CREATE TABLE IF NOT EXISTS lecture_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    kind VARCHAR(12) NOT NULL CHECK (kind IN ('transcript', 'summary', 'section', 'flagged')),
    position INT NOT NULL,
    content TEXT NOT NULL,
    start_seconds INT,
    UNIQUE (lecture_id, kind, position)
  )`,
  `CREATE INDEX IF NOT EXISTS lecture_chunks_user_idx ON lecture_chunks (user_id, lecture_id)`,

  // A workspace conversation. It may be limited to one course; if that course
  // is deleted the conversation stays and covers everything.
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS conversations_user_idx ON conversations (user_id, updated_at DESC)`,

  // A question and its answer are written together, so `seq` orders them where
  // the transaction's single timestamp cannot. Citations hold only chunk ids:
  // a deleted lecture's text does not live on inside them.
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq BIGINT GENERATED ALWAYS AS IDENTITY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    citations JSONB NOT NULL DEFAULT '[]'::jsonb,
    grounding VARCHAR(10) CHECK (grounding IN ('cited', 'account', 'general')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, seq)`,

  // One row per question. Separate from messages so that deleting a
  // conversation does not hand back the month's allowance.
  `CREATE TABLE IF NOT EXISTS chat_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tokens INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS chat_usage_user_idx ON chat_usage (user_id, created_at DESC)`,

  // The semester the bee follows. The dates come from the student and are never
  // guessed. The latest one is the current one.
  `CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(40) NOT NULL,
    starts_on DATE NOT NULL,
    weeks SMALLINT NOT NULL DEFAULT 16 CHECK (weeks BETWEEN 8 AND 24),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS semesters_user_idx ON semesters (user_id, starts_on DESC)`,

  // When a course meets and when its exams are, as the student entered them.
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_days JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS midterm_on DATE`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS final_on DATE`,

  // When the class happened, which is what files a lecture under its week.
  `ALTER TABLE lectures ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ`,

  // Phone notifications. A browser's push subscription, and a record of what was
  // sent, so that a reminder reaches a student only once.
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions (user_id)`,
  `CREATE TABLE IF NOT EXISTS notification_log (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(160) NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)
  )`,

  // ── The mobile app (2026-11) ────────────────────────────────────────────────
  // The Student Intelligence Profile: what the student told Juno at onboarding,
  // one row per student, edited by them at any time. Nothing here is guessed.
  // Three languages are kept apart on purpose: the app's (ui_language), the one
  // Juno explains in (explain_language) and each course's own (courses.language).
  `CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    country VARCHAR(2),
    university VARCHAR(120),
    campus VARCHAR(80),
    department VARCHAR(120),
    degree_level VARCHAR(16),
    stage VARCHAR(16),
    academic_year SMALLINT,
    expected_graduation VARCHAR(7),
    timezone VARCHAR(64),
    ui_language VARCHAR(8),
    explain_language VARCHAR(8),
    languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    korean_level VARCHAR(16),
    academic_goal VARCHAR(300),
    career_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_role VARCHAR(120),
    skills_wanted JSONB NOT NULL DEFAULT '[]'::jsonb,
    daily_quiz BOOLEAN NOT NULL DEFAULT true,
    quiet_from SMALLINT NOT NULL DEFAULT 22,
    quiet_until SMALLINT NOT NULL DEFAULT 8,
    onboarding_step SMALLINT NOT NULL DEFAULT 0,
    onboarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // What a timetable needs beyond the weekday, as the student entered it.
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS code VARCHAR(24)`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor VARCHAR(80)`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS credits SMALLINT`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS location VARCHAR(80)`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS starts_at VARCHAR(5)`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS ends_at VARCHAR(5)`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(8)`,

  // A lecture made from an uploaded document (slides, a PDF) rather than speech.
  `ALTER TABLE lectures ADD COLUMN IF NOT EXISTS material VARCHAR(12)`,

  // Something the student has to do. It may belong to a course; if the course
  // is deleted the task stays. remind_minutes is how long before due_at to remind.
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(160) NOT NULL,
    notes VARCHAR(1000),
    kind VARCHAR(12) NOT NULL DEFAULT 'task' CHECK (kind IN ('task', 'assignment', 'exam', 'study')),
    due_at TIMESTAMPTZ,
    priority SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
    remind_minutes INT,
    done_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS tasks_user_idx ON tasks (user_id, done_at, due_at)`,

  // A project the student is building, with its milestones. The skills listed
  // on it count as "developing" while it is active and "demonstrated" once it
  // is done: a skill is never claimed without the work behind it.
  `CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(120) NOT NULL,
    summary VARCHAR(800),
    status VARCHAR(8) NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'active', 'done')),
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    link VARCHAR(300),
    outcome VARCHAR(800),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS projects_user_idx ON projects (user_id, created_at DESC)`,

  // A class being listened to live. Its transcript grows a piece at a time; the
  // audio itself is never stored. The row is deleted when the class is saved as
  // a lecture or discarded.
  `CREATE TABLE IF NOT EXISTS listen_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL DEFAULT '',
    seconds REAL NOT NULL DEFAULT 0,
    chunk_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_chunk_at TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS listen_sessions_user_idx ON listen_sessions (user_id)`,

  // A notice from a university's own public board, with its title in English
  // and what kind of thing it is. `described` says the model has had its turn.
  `CREATE TABLE IF NOT EXISTS campus_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus VARCHAR(24) NOT NULL,
    source VARCHAR(32) NOT NULL,
    article VARCHAR(24) NOT NULL,
    title TEXT NOT NULL,
    title_en TEXT,
    kind VARCHAR(16) NOT NULL DEFAULT 'general',
    intl BOOLEAN NOT NULL DEFAULT false,
    described BOOLEAN NOT NULL DEFAULT false,
    category VARCHAR(60),
    url TEXT NOT NULL,
    posted_on DATE,
    pinned BOOLEAN NOT NULL DEFAULT false,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source, article)
  )`,
  `CREATE INDEX IF NOT EXISTS campus_items_idx ON campus_items (campus, posted_on DESC)`,
  `CREATE TABLE IF NOT EXISTS campus_fetches (
    campus VARCHAR(24) PRIMARY KEY,
    fetched_at TIMESTAMPTZ NOT NULL
  )`,

  // The community: one room per university. A post may carry one picture, kept
  // beside it so a list of posts never loads the bytes.
  `CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room VARCHAR(120) NOT NULL,
    kind VARCHAR(12) NOT NULL DEFAULT 'post' CHECK (kind IN ('post', 'question')),
    body VARCHAR(1500) NOT NULL DEFAULT '',
    has_image BOOLEAN NOT NULL DEFAULT false,
    hidden_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS community_posts_room_idx ON community_posts (room, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS community_images (
    post_id UUID PRIMARY KEY REFERENCES community_posts(id) ON DELETE CASCADE,
    bytes BYTEA NOT NULL,
    type VARCHAR(20) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body VARCHAR(800) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS community_comments_post_idx ON community_comments (post_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS community_reports (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    done_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS project_milestones_project_idx ON project_milestones (project_id, position)`,
];

let driver = null; // { kind, query(text, params), transaction(fn), close() }

function pgDriver(pool) {
  return {
    kind: 'postgres',
    query: (text, params) => pool.query(text, params),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn({ query: (t, p) => client.query(t, p) });
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

function pgliteDriver(db) {
  const wrap = (r) => ({ rows: r.rows, rowCount: r.affectedRows ?? r.rows.length });
  return {
    kind: 'pglite',
    query: async (text, params = []) => wrap(await db.query(text, params)),
    transaction: (fn) => db.transaction((tx) => fn({ query: async (t, p = []) => wrap(await tx.query(t, p)) })),
    close: () => db.close(),
  };
}

/**
 * A database on this machine or on a private container network (a host with
 * no dot in it, such as `db` in docker-compose.yml) is reached without TLS;
 * anything else, such as Neon, with it. PGSSL=disable or =require overrides.
 */
function wantsSsl(url) {
  if (process.env.PGSSL === 'disable') return false;
  if (process.env.PGSSL === 'require') return true;
  let host = '';
  try { host = new URL(url).hostname; } catch { return true; }
  return !(host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]' || (host && !host.includes('.')));
}

async function connectPostgres() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: !wantsSsl(process.env.DATABASE_URL)
      ? false
      : { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' },
    max: 10,
  });
  pool.on('error', (err) => console.error('[db] idle client error:', err.message));
  try {
    // Production retries a reset connection or a database still waking up
    // (db/retry.js); development falls back to PGlite at once instead.
    await withRetry(() => pool.query('SELECT 1'), {
      delays: isProduction ? [250, 750, 1500] : [],
      onRetry: (err, n, ms) => console.warn(`[db] connection attempt ${n} failed (${err.code || err.message}); retrying in ${ms} ms`),
    });
  } catch (err) {
    pool.end().catch(() => {});
    throw err;
  }
  return pgDriver(pool);
}

async function connectPglite() {
  const { PGlite } = require('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR || path.resolve(__dirname, '../.data/pglite');
  require('fs').mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir);
  return pgliteDriver(db);
}

async function connect() {
  if (process.env.DATABASE_URL && process.env.DB_DRIVER !== 'pglite') {
    try {
      driver = await connectPostgres();
    } catch (err) {
      if (isProduction) {
        console.error('FATAL: cannot reach DATABASE_URL:', err.code || err.message);
        process.exit(1);
      }
      console.warn('');
      console.warn('[db] PostgreSQL at DATABASE_URL is not reachable (' + (err.code || err.message) + ').');
      console.warn('[db] Using the local PGlite database in server/.data/pglite instead (development only).');
      console.warn('');
    }
  } else if (isProduction) {
    console.error('FATAL: DATABASE_URL must be set in production.');
    process.exit(1);
  }
  if (!driver) driver = await connectPglite();

  for (const statement of SCHEMA) await driver.query(statement);
  console.log('[db] ready (' + driver.kind + ')');
  return driver;
}

const ready = connect();
ready.catch((err) => {
  console.error('FATAL: database initialisation failed:', err.message);
  process.exit(1);
});

module.exports = {
  ready,
  query: async (text, params = []) => (await ready).query(text, params),
  transaction: async (fn) => (await ready).transaction(fn),
  close: async () => (await ready).close(),
};
