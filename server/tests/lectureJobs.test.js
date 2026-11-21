'use strict';
/**
 * Start-up clean-up of lectures left processing. Another server may share the
 * database (Vercel and Coolify during a move, or the old container during a
 * redeploy), so only lectures past the 15-minute limit are failed at start-up;
 * a younger one may still be running elsewhere.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-lecturejobs-'));
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
});

const db = require('../db/database');
const { failInterruptedJobs } = require('../services/lectureJobs');

before(() => db.ready);

after(async () => {
  await db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

test('start-up fails only lectures processing for more than 15 minutes', async () => {
  const user = (await db.query("INSERT INTO users (email) VALUES ('jobs@example.com') RETURNING id")).rows[0].id;
  const course = (await db.query("INSERT INTO courses (user_id, name) VALUES ($1, 'Operating Systems') RETURNING id", [user])).rows[0].id;
  const lecture = async (title, minutesAgo, status = 'processing') =>
    (await db.query(
      `INSERT INTO lectures (user_id, course_id, title, source, status, created_at)
         VALUES ($1, $2, $3, 'audio', $4, now() - make_interval(mins => $5)) RETURNING id`,
      [user, course, title, status, minutesAgo]
    )).rows[0].id;

  const old = await lecture('Week 1', 20);
  const running = await lecture('Week 2', 2);
  const done = await lecture('Week 3', 60, 'ready');

  await failInterruptedJobs();

  const state = async (id) => (await db.query('SELECT status, failure_reason FROM lectures WHERE id = $1', [id])).rows[0];
  assert.deepEqual(await state(old), { status: 'failed', failure_reason: 'interrupted' });
  assert.deepEqual(await state(running), { status: 'processing', failure_reason: null });
  assert.deepEqual(await state(done), { status: 'ready', failure_reason: null });
});
