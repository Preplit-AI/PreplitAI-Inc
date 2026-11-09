'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { isDate, currentSemester, saveSemester, semesterOverview, courseWorkspace } = require('../services/semesterStore');
const { isUuid, fail } = require('../utils/http');

const router = express.Router();
router.use(authMiddleware);

// ── GET /api/semester?since=ISO ──────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, ...(await semesterOverview(req.userId, { since: req.query.since })) });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/semester  { startsOn, weeks?, fresh? } ──────────────────────────
// Corrects the current semester, or starts a new one when `fresh` is true.
router.put('/', async (req, res, next) => {
  try {
    const { startsOn, weeks = 16, fresh = false } = req.body || {};
    if (!isDate(startsOn)) return fail(res, 400, 'InvalidDate', '학기 시작일을 다시 확인해 주세요.');
    if (!Number.isInteger(weeks) || weeks < 8 || weeks > 24) return fail(res, 400, 'InvalidWeeks', '학기는 8주에서 24주까지 넣을 수 있어요.');
    const semester = await saveSemester(req.userId, { startsOn, weeks, fresh: fresh === true });
    res.json({ success: true, semester });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/semester/current ────────────────────────────────────────────────
router.get('/current', async (req, res, next) => {
  try {
    res.json({ success: true, semester: await currentSemester(req.userId) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/semester/courses/:id ────────────────────────────────────────────
// One course's workspace: its weeks, lectures, exam hints and cards.
router.get('/courses/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const workspace = await courseWorkspace(req.userId, req.params.id);
    if (!workspace) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    res.json({ success: true, ...workspace });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
