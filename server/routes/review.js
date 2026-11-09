'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { reviewLimit } = require('../middleware/rateLimit');
const { reviewToday, rateCard } = require('../services/reviewStore');
const { isUuid, fail } = require('../utils/http');

const router = express.Router();
router.use(authMiddleware);

// ── GET /api/review/today?since=ISO ──────────────────────────────────────────
router.get('/today', async (req, res, next) => {
  try {
    const today = await reviewToday(req.userId, req.query.since);
    res.json({ success: true, ...today });
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

    const result = await rateCard(req.userId, req.params.id, rating);
    if (result.status === 404) return fail(res, 404, 'NotFound', '카드를 찾을 수 없어요.');
    if (result.status === 409) return fail(res, 409, 'AlreadyReviewed', '이미 복습한 카드예요.');
    res.json({ success: true, due: result.due });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
