'use strict';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');

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
  // the row exists only so Junbee can say that nothing was saved.
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

async function connectPostgres() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === 'disable' || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
      ? false
      : { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' },
    max: 10,
  });
  pool.on('error', (err) => console.error('[db] idle client error:', err.message));
  await pool.query('SELECT 1');
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
