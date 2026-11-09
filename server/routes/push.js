'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { isEnabled, publicKey, isPushEndpoint, subscribe, unsubscribe } = require('../services/pushService');
const { fail } = require('../utils/http');

const router = express.Router();
router.use(authMiddleware);

const isKey = (value) => typeof value === 'string' && value.length > 0 && value.length <= 512;

// ── GET /api/push/config ─────────────────────────────────────────────────────
router.get('/config', (req, res) => {
  res.json({ success: true, enabled: isEnabled(), publicKey: publicKey() });
});

// ── POST /api/push/subscribe  { endpoint, keys: { p256dh, auth } } ───────────
router.post('/subscribe', async (req, res, next) => {
  try {
    if (!isEnabled()) return fail(res, 503, 'PushOff', '지금은 알림을 켤 수 없어요.');
    const { endpoint, keys } = req.body || {};
    if (!isPushEndpoint(endpoint) || !keys || !isKey(keys.p256dh) || !isKey(keys.auth)) {
      return fail(res, 400, 'InvalidSubscription', '알림을 켜지 못했어요. 다시 해 주세요.');
    }
    await subscribe(req.userId, { endpoint, p256dh: keys.p256dh, auth: keys.auth });
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/push/unsubscribe  { endpoint } ─────────────────────────────────
router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body || {};
    if (typeof endpoint === 'string') await unsubscribe(req.userId, endpoint);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
