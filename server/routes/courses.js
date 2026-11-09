'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { listCourses, countCourses, createCourse, updateCourse, deleteCourse } = require('../services/courseStore');
const { isDate, cleanClassDays } = require('../services/semesterStore');
const { isUuid, fail } = require('../utils/http');

const router = express.Router();
router.use(authMiddleware);

const cleanCourseName = (value) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80) : '';

/** Reads the schedule fields that were sent. An exam date may be cleared with null. @returns the fields, or null if one is invalid. */
function scheduleFrom(body) {
  const out = {};
  if (body.classDays !== undefined) {
    out.classDays = cleanClassDays(body.classDays);
    if (!out.classDays) return null;
  }
  for (const field of ['midtermOn', 'finalOn']) {
    if (body[field] === undefined) continue;
    if (body[field] !== null && !isDate(body[field])) return null;
    out[field] = body[field];
  }
  return out;
}

// ── GET /api/courses ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, courses: await listCourses(req.userId) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/courses ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = cleanCourseName(body.name);
    if (!name) return fail(res, 400, 'InvalidName', '과목 이름을 입력해 주세요.');
    const schedule = scheduleFrom(body);
    if (!schedule) return fail(res, 400, 'InvalidSchedule', '요일이나 날짜를 다시 확인해 주세요.');
    if ((await countCourses(req.userId)) >= 20) return fail(res, 400, 'TooManyCourses', '과목은 20개까지 만들 수 있어요.');
    res.status(201).json({ success: true, course: await createCourse(req.userId, name, schedule) });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/courses/:id ───────────────────────────────────────────────────
// Any of: name, classDays (0 = Sunday to 6 = Saturday), midtermOn, finalOn.
router.patch('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const body = req.body || {};
    const changes = scheduleFrom(body);
    if (!changes) return fail(res, 400, 'InvalidSchedule', '요일이나 날짜를 다시 확인해 주세요.');
    if (body.name !== undefined || !Object.keys(changes).length) {
      changes.name = cleanCourseName(body.name);
      if (!changes.name) return fail(res, 400, 'InvalidName', '과목 이름을 입력해 주세요.');
    }
    const course = await updateCourse(req.userId, req.params.id, changes);
    if (!course) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/courses/:id ──────────────────────────────────────────────────
// Removes the course with its lectures, notes and cards.
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    if (!(await deleteCourse(req.userId, req.params.id))) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
