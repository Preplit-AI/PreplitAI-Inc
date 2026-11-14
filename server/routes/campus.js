'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getProfile } = require('../services/profileStore');
const { campusFor, campusBoard } = require('../services/campusFeed');
const { keepAlive } = require('../utils/keepAlive');

/**
 * GET /api/campus: the notice board of the student's own campus, if that
 * campus has been set up. Which campus it is comes from the profile; the
 * student never says it again.
 */
const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const profile = await getProfile(req.userId);
    const campus = campusFor(profile.university);
    if (!campus) return res.json({ success: true, connected: false, university: profile.university || null });
    const { board, background } = await campusBoard(campus.key);
    if (background) keepAlive(background);
    res.json({ success: true, connected: true, university: profile.university, ...board });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
