'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { reviewLimit } = require('../middleware/rateLimit');
const { review } = require('../services/scheduler');
const { isUuid, fail } = require('../utils/http');
const { DAILY_REVIEW_LIMIT } = require('../config/constants');

const router = express.Router();
router.use(authMiddleware);

/**
 * The start of the student's day, sent by the browser as an ISO timestamp so
 * "today" follows their clock. Anything implausible falls back to midnight in
 * Seoul, where the pilot runs.
 */
function startOfDay(since) {
  const now = Date.now();
  const parsed = since ? Date.parse(since) : NaN;
  if (Number.isFinite(parsed) && parsed <= now && now - parsed <= 36 * 60 * 60 * 1000) return new Date(parsed);
  const kst = new Date(now + 9 * 60 * 60 * 1000);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - 9 * 60 * 60 * 1000);
}

// ── GET /api/review/today?since=ISO ──────────────────────────────────────────
// Every number here is counted, not estimated: `done` is cards reviewed today
// and now scheduled for a later day; `cards` is what is due now, up to the
// daily limit. The comb is drawn from exactly these two.
router.get('/today', async (req, res, next) => {
  try {
    const since = startOfDay(req.query.since);
    const done = await db.query(
      `SELECT COUNT(DISTINCT r.card_id)::int AS n
         FROM review_logs r JOIN cards c ON c.id = r.card_id
        WHERE r.user_id = $1 AND r.reviewed_at >= $2 AND c.due > now()`,
      [req.userId, since]
    );
    const doneToday = done.rows[0].n;
    const room = Math.max(DAILY_REVIEW_LIMIT - doneToday, 0);

    const due = await db.query(
      `SELECT c.id, c.front, c.back, l.id AS lecture_id, l.title AS lecture_title, co.name AS course_name
         FROM cards c
         JOIN lectures l ON l.id = c.lecture_id
         JOIN courses co ON co.id = l.course_id
        WHERE c.user_id = $1 AND c.due <= now() AND l.status = 'ready'
        ORDER BY ((c.fsrs->>'state')::int = 0), c.due, c.position
        LIMIT $2`,
      [req.userId, room]
    );

    res.json({
      success: true,
      done: doneToday,
      cards: due.rows.map((r) => ({
        id: r.id,
        front: r.front,
        back: r.back,
        lectureId: r.lecture_id,
        lectureTitle: r.lecture_title,
        courseName: r.course_name,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/review/cards/:id  { rating: 1..4 } ─────────────────────────────
router.post('/cards/:id', reviewLimit, async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '카드를 찾을 수 없어요.');
    const rating = Number(req.body && req.body.rating);
    if (![1, 2, 3, 4].includes(rating)) return fail(res, 400, 'InvalidRating', '평가를 골라 주세요.');

    const result = await db.transaction(async (tx) => {
      const found = await tx.query(
        'SELECT id, fsrs, due FROM cards WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [req.params.id, req.userId]
      );
      const card = found.rows[0];
      if (!card) return { status: 404 };
      // Already reviewed (a double tap, or a second tab): do not schedule twice.
      if (new Date(card.due).getTime() > Date.now() + 60 * 1000) return { status: 409 };

      const next = review(card.fsrs, rating);
      await tx.query('UPDATE cards SET fsrs = $1, due = $2 WHERE id = $3', [JSON.stringify(next.fsrs), next.due, card.id]);
      await tx.query('INSERT INTO review_logs (user_id, card_id, rating) VALUES ($1, $2, $3)', [req.userId, card.id, rating]);
      return { status: 200, due: next.due };
    });

    if (result.status === 404) return fail(res, 404, 'NotFound', '카드를 찾을 수 없어요.');
    if (result.status === 409) return fail(res, 409, 'AlreadyReviewed', '이미 복습한 카드예요.');
    res.json({ success: true, due: result.due });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
