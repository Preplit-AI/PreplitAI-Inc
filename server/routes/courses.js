'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { isUuid, fail } = require('../utils/http');

const router = express.Router();
router.use(authMiddleware);

const cleanCourseName = (value) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80) : '';

// ── GET /api/courses ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.created_at,
              COUNT(l.id) FILTER (WHERE l.status = 'ready')::int AS lecture_count
         FROM courses c
         LEFT JOIN lectures l ON l.course_id = c.id
        WHERE c.user_id = $1
        GROUP BY c.id
        ORDER BY c.created_at ASC`,
      [req.userId]
    );
    res.json({ success: true, courses: result.rows.map(toCourse) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/courses ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const name = cleanCourseName(req.body && req.body.name);
    if (!name) return fail(res, 400, 'InvalidName', '과목 이름을 입력해 주세요.');
    const count = await db.query('SELECT COUNT(*)::int AS n FROM courses WHERE user_id = $1', [req.userId]);
    if (count.rows[0].n >= 20) return fail(res, 400, 'TooManyCourses', '과목은 20개까지 만들 수 있어요.');
    const result = await db.query(
      'INSERT INTO courses (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
      [req.userId, name]
    );
    res.status(201).json({ success: true, course: toCourse({ ...result.rows[0], lecture_count: 0 }) });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/courses/:id ───────────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const name = cleanCourseName(req.body && req.body.name);
    if (!name) return fail(res, 400, 'InvalidName', '과목 이름을 입력해 주세요.');
    const result = await db.query(
      'UPDATE courses SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, created_at',
      [name, req.params.id, req.userId]
    );
    if (!result.rows[0]) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    res.json({ success: true, course: toCourse({ ...result.rows[0], lecture_count: null }) });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/courses/:id ──────────────────────────────────────────────────
// Removes the course with its lectures, notes and cards.
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const result = await db.query('DELETE FROM courses WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rowCount) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

function toCourse(row) {
  return { id: row.id, name: row.name, lectureCount: row.lecture_count, createdAt: row.created_at };
}

module.exports = router;
