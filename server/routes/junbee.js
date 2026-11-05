'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { isUuid, fail } = require('../utils/http');

/**
 * Junbee, the bot. It says one of exactly three things, only after a lecture
 * finishes processing, one message at a time:
 *
 *   ready    notes are ready, with the card count
 *   unclear  notes are ready, and these minutes were left as [불명확]
 *   failed   nothing could be made, and nothing was saved
 *
 * The wording lives in the client; this route only reports which of the three
 * applies and the measured facts that fill it in. There is no other trigger,
 * so there is no fourth message.
 */
const router = express.Router();
router.use(authMiddleware);

// ── GET /api/junbee ──────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, source, status, card_count, unclear_ranges
         FROM lectures
        WHERE user_id = $1 AND message_dismissed = false AND status IN ('ready', 'failed')
        ORDER BY finished_at DESC NULLS LAST
        LIMIT 1`,
      [req.userId]
    );
    const row = result.rows[0];
    if (!row) return res.json({ success: true, message: null });

    const unclearRanges = row.unclear_ranges || [];
    const kind = row.status === 'failed' ? 'failed' : unclearRanges.length ? 'unclear' : 'ready';
    res.json({
      success: true,
      message: {
        lectureId: row.id,
        kind,
        lectureTitle: row.title,
        source: row.source,
        cardCount: row.status === 'ready' ? row.card_count : 0,
        unclearRanges: kind === 'unclear' ? unclearRanges : [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/junbee/:lectureId/dismiss ──────────────────────────────────────
// A dismissed message never comes back. Dismissing a failure also removes the
// empty lecture row, since nothing of that lecture was kept.
router.post('/:lectureId/dismiss', async (req, res, next) => {
  try {
    if (!isUuid(req.params.lectureId)) return fail(res, 404, 'NotFound', '메시지를 찾을 수 없어요.');
    await db.query(
      `DELETE FROM lectures WHERE id = $1 AND user_id = $2 AND status = 'failed'`,
      [req.params.lectureId, req.userId]
    );
    await db.query(
      'UPDATE lectures SET message_dismissed = true WHERE id = $1 AND user_id = $2',
      [req.params.lectureId, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
