'use strict';
const db = require('../db/database');

/**
 * Lectures, always scoped to one student. Shared by the HTTP routes and the
 * chat's tools, so both go through the same ownership checks. Failed lectures
 * are never listed or returned: nothing of them was kept.
 */

function toSummary(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    topic: row.topic ?? (row.notes && row.notes.title) ?? null,
    source: row.source,
    status: row.status,
    durationSeconds: row.duration_seconds ?? null,
    cardCount: row.card_count ?? 0,
    createdAt: row.created_at,
    recordedAt: row.recorded_at ?? row.created_at,
    finishedAt: row.finished_at ?? null,
  };
}

/** How much this student is using right now, for the upload limits. */
async function lectureUsage(userId) {
  const result = await db.query(
    `SELECT COUNT(*) FILTER (WHERE status <> 'failed' AND created_at > now() - interval '30 days')::int AS month,
            COUNT(*) FILTER (WHERE status = 'processing')::int AS running
       FROM lectures WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

async function createLecture(userId, { courseId, courseName, title, source, recordedAt = null }) {
  const created = await db.query(
    `INSERT INTO lectures (user_id, course_id, title, source, recorded_at) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, course_id, title, source, status, created_at, recorded_at`,
    [userId, courseId, title, source, recordedAt]
  );
  return toSummary({ ...created.rows[0], course_name: courseName });
}

async function listLectures(userId, { courseId = null } = {}) {
  const result = await db.query(
    `SELECT l.id, l.course_id, c.name AS course_name, l.title, l.notes->>'title' AS topic, l.source, l.status,
            l.duration_seconds, l.card_count, l.created_at, l.recorded_at, l.finished_at
       FROM lectures l JOIN courses c ON c.id = l.course_id
      WHERE l.user_id = $1 AND l.status <> 'failed' AND ($2::uuid IS NULL OR l.course_id = $2::uuid)
      ORDER BY COALESCE(l.recorded_at, l.created_at) DESC
      LIMIT 200`,
    [userId, courseId]
  );
  return result.rows.map(toSummary);
}

/** @returns notes, transcript and cards, or null if this student has no such lecture. */
async function getLecture(userId, id) {
  const result = await db.query(
    `SELECT l.*, c.name AS course_name
       FROM lectures l JOIN courses c ON c.id = l.course_id
      WHERE l.id = $1 AND l.user_id = $2 AND l.status <> 'failed'`,
    [id, userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  const cards = await db.query(
    'SELECT id, front, back FROM cards WHERE lecture_id = $1 AND user_id = $2 ORDER BY position',
    [row.id, userId]
  );
  return {
    ...toSummary(row),
    notes: row.notes,
    transcript: row.transcript,
    unclearRanges: row.unclear_ranges || [],
    cards: cards.rows,
    messageDismissed: row.message_dismissed,
  };
}

/** @returns whether a lecture was removed. */
async function deleteLecture(userId, id) {
  const result = await db.query('DELETE FROM lectures WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
}

/**
 * Which of Junbee's three lecture messages applies right now, with the measured
 * facts that fill it in, or null. The wording lives in the client.
 */
async function currentJunbeeMessage(userId) {
  const result = await db.query(
    `SELECT id, title, source, status, card_count, unclear_ranges
       FROM lectures
      WHERE user_id = $1 AND message_dismissed = false AND status IN ('ready', 'failed')
      ORDER BY finished_at DESC NULLS LAST
      LIMIT 1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  const unclearRanges = row.unclear_ranges || [];
  const kind = row.status === 'failed' ? 'failed' : unclearRanges.length ? 'unclear' : 'ready';
  return {
    lectureId: row.id,
    kind,
    lectureTitle: row.title,
    source: row.source,
    cardCount: row.status === 'ready' ? row.card_count : 0,
    unclearRanges: kind === 'unclear' ? unclearRanges : [],
  };
}

module.exports = { lectureUsage, createLecture, listLectures, getLecture, deleteLecture, currentJunbeeMessage };
