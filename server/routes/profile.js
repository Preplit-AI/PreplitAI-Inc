'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getProfile, saveProfile, LANGUAGE_NAMES } = require('../services/profileStore');
const { fail } = require('../utils/http');

/**
 * The Student Intelligence Profile. Onboarding saves it a step at a time, so a
 * student who leaves halfway comes back to where they were.
 */
const router = express.Router();
router.use(authMiddleware);

// ── GET /api/profile ─────────────────────────────────────────────────────────
// Also lists the languages Juno can be asked to explain in.
router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, profile: await getProfile(req.userId), languages: LANGUAGE_NAMES });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/profile ───────────────────────────────────────────────────────
// Any of the profile's fields; `onboarded: true` marks onboarding finished.
router.patch('/', async (req, res, next) => {
  try {
    const saved = await saveProfile(req.userId, req.body || {});
    if (saved.invalid) return fail(res, 400, 'InvalidField', '입력한 내용을 다시 확인해 주세요.', { field: saved.invalid });
    res.json({ success: true, profile: saved.profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
