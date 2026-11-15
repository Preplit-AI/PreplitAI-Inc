'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { currentJunoMessage } = require('../services/lectureStore');
const { isUuid, fail } = require('../utils/http');

/**
 * What Juno says about a lecture that just finished, one message at a time:
 *
 *   ready    notes are ready, with the card count
 *   unclear  notes are ready, and these minutes were left as [불명확]
 *   failed   nothing could be made, and nothing was saved
 *
 * The wording lives in the client; this route only reports which applies and
 * the measured facts that fill it in. Everything else the bee says about the
 * semester comes from semesterStore's chooseMessage.
 */
const router = express.Router();
router.use(authMiddleware);

// ── GET /api/juno ────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, message: await currentJunoMessage(req.userId) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/juno/:lectureId/dismiss ────────────────────────────────────────
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
