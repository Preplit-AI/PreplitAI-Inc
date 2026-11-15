'use strict';
const crypto = require('crypto');
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getProfile } = require('../services/profileStore');
const { campusFor, campusBoard, ingestCampus } = require('../services/campusFeed');
const { keepAlive } = require('../utils/keepAlive');

/**
 * GET /api/campus: the notice board of the student's own campus, if that
 * campus has been set up. Which campus it is comes from the profile; the
 * student never says it again.
 */
const router = express.Router();

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest();

/**
 * POST /api/campus/ingest: the notices read by the campus reader
 * (server/scripts/campusReader.js), which runs on a server the universities
 * answer. It is open only when CAMPUS_INGEST_KEY is set, and only to a caller
 * holding that key.
 */
router.post('/ingest', async (req, res, next) => {
  const key = process.env.CAMPUS_INGEST_KEY;
  if (!key) return res.status(404).json({ success: false, error: 'NotFound' });
  const sent = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!crypto.timingSafeEqual(sha256(sent), sha256(key))) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const result = await ingestCampus(req.body);
    if (!result) return res.status(400).json({ success: false, error: 'UnknownCampus' });
    const { translate, ...summary } = result;
    if (translate) keepAlive(translate);
    res.json({ success: true, ...summary });
  } catch (err) {
    next(err);
  }
});

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
