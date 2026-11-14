'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { getCourse } = require('../services/courseStore');
const { isUuid, fail, cleanText } = require('../utils/http');
const multer = require('multer');
const { limit } = require('../middleware/rateLimit');
const { listCourses } = require('../services/courseStore');
const { readDeadlines } = require('../services/deadlineReader');

/**
 * Tasks and deadlines, always scoped to one student. A task may belong to a
 * course. Nothing here is created on the student's behalf: every task is one
 * they added or confirmed.
 */
const router = express.Router();
router.use(authMiddleware);

const KINDS = ['task', 'assignment', 'exam', 'study'];

// ── POST /api/tasks/from-image ───────────────────────────────────────────────
// A screenshot of the student's LMS (or a photo of a syllabus) in; the deadlines
// that can be seen in it out. Nothing is saved: the app shows the list and the
// student chooses which to keep. The picture is read in memory and not stored.
const picture = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 2 },
  fileFilter: (req, file, cb) => cb(null, file.fieldname === 'image' && /^image\/(png|jpeg|webp)$/.test(file.mimetype)),
});
const scanLimit = limit('scan', (req) => req.userId || req.ip, { points: 20, seconds: 60 * 60 });

router.post('/from-image', scanLimit, (req, res, next) => {
  picture.single('image')(req, res, (err) => {
    if (err) return fail(res, err.code === 'LIMIT_FILE_SIZE' ? 413 : 400, err.code === 'LIMIT_FILE_SIZE' ? 'FileTooLarge' : 'BadUpload', '사진을 받지 못했어요. 4MB 이하의 사진을 올려 주세요.');
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 415, 'UnsupportedFile', 'PNG, JPG, WebP 사진만 읽을 수 있어요.');
    const courses = await listCourses(req.userId);
    let items;
    try {
      items = await readDeadlines(req.file.buffer, req.file.mimetype, { courses });
    } catch (err) {
      console.warn('[tasks] picture not read:', err.message);
      return fail(res, err.code === 'LLM_NOT_CONFIGURED' ? 503 : 422, 'UnreadableImage', '이 사진에서 마감을 읽지 못했어요.');
    }
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});
const MAX_OPEN = 300;

const COLUMNS = `t.id, t.course_id, c.name AS course_name, t.title, t.notes, t.kind, t.due_at, t.priority,
  t.remind_minutes, t.done_at, t.created_at`;

const toTask = (row) => ({
  id: row.id,
  courseId: row.course_id,
  courseName: row.course_name || null,
  title: row.title,
  notes: row.notes || null,
  kind: row.kind,
  dueAt: row.due_at,
  priority: row.priority,
  remindMinutes: row.remind_minutes,
  done: Boolean(row.done_at),
  doneAt: row.done_at,
  createdAt: row.created_at,
});

/** Reads the fields that were sent. @returns { fields } or { invalid: name }. */
async function read(userId, body, { creating }) {
  const fields = {};
  if (creating || body.title !== undefined) {
    fields.title = cleanText(body.title, 160);
    if (!fields.title) return { invalid: 'title' };
  }
  if (body.notes !== undefined) fields.notes = cleanText(body.notes, 1000) || null;
  if (body.kind !== undefined) {
    if (!KINDS.includes(body.kind)) return { invalid: 'kind' };
    fields.kind = body.kind;
  }
  if (body.dueAt !== undefined) {
    if (body.dueAt === null) fields.due_at = null;
    else {
      const at = typeof body.dueAt === 'string' ? Date.parse(body.dueAt) : NaN;
      // Within ten years either way: a typo in the year is caught, a real deadline is not.
      if (!Number.isFinite(at) || Math.abs(at - Date.now()) > 10 * 365 * 86400000) return { invalid: 'dueAt' };
      fields.due_at = new Date(at);
    }
  }
  if (body.priority !== undefined) {
    if (![1, 2, 3].includes(body.priority)) return { invalid: 'priority' };
    fields.priority = body.priority;
  }
  if (body.remindMinutes !== undefined) {
    const m = body.remindMinutes;
    if (m !== null && !(Number.isInteger(m) && m >= 0 && m <= 14 * 24 * 60)) return { invalid: 'remindMinutes' };
    fields.remind_minutes = m;
  }
  if (body.courseId !== undefined) {
    if (body.courseId === null) fields.course_id = null;
    else {
      if (!isUuid(body.courseId) || !(await getCourse(userId, body.courseId))) return { invalid: 'courseId' };
      fields.course_id = body.courseId;
    }
  }
  if (body.done !== undefined) {
    if (typeof body.done !== 'boolean') return { invalid: 'done' };
    fields.done_at = body.done ? new Date() : null;
  }
  return { fields };
}

const one = async (userId, id) => {
  const result = await db.query(
    `SELECT ${COLUMNS} FROM tasks t LEFT JOIN courses c ON c.id = t.course_id WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] ? toTask(result.rows[0]) : null;
};

// ── GET /api/tasks?state=open|done|all&courseId= ─────────────────────────────
// Open tasks come soonest first, then by priority; done ones newest first.
router.get('/', async (req, res, next) => {
  try {
    const state = ['open', 'done', 'all'].includes(req.query.state) ? req.query.state : 'open';
    const { courseId } = req.query;
    if (courseId !== undefined && !isUuid(courseId)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const result = await db.query(
      `SELECT ${COLUMNS}
         FROM tasks t LEFT JOIN courses c ON c.id = t.course_id
        WHERE t.user_id = $1
          AND ($2::text = 'all' OR ($2::text = 'open' AND t.done_at IS NULL) OR ($2::text = 'done' AND t.done_at IS NOT NULL))
          AND ($3::uuid IS NULL OR t.course_id = $3::uuid)
        ORDER BY (t.done_at IS NOT NULL), t.done_at DESC NULLS LAST, t.due_at ASC NULLS LAST, t.priority, t.created_at
        LIMIT 500`,
      [req.userId, state, courseId || null]
    );
    res.json({ success: true, tasks: result.rows.map(toTask) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/tasks  { title, courseId?, notes?, kind?, dueAt?, priority?, remindMinutes? } ──
router.post('/', async (req, res, next) => {
  try {
    const { fields, invalid } = await read(req.userId, req.body || {}, { creating: true });
    if (invalid) return fail(res, 400, 'InvalidField', '입력한 내용을 다시 확인해 주세요.', { field: invalid });
    const open = await db.query('SELECT COUNT(*)::int AS n FROM tasks WHERE user_id = $1 AND done_at IS NULL', [req.userId]);
    if (open.rows[0].n >= MAX_OPEN) return fail(res, 400, 'TooManyTasks', `할 일은 ${MAX_OPEN}개까지 둘 수 있어요.`);
    const columns = Object.keys(fields);
    const created = await db.query(
      `INSERT INTO tasks (user_id, ${columns.join(', ')}) VALUES ($1, ${columns.map((_, i) => `$${i + 2}`).join(', ')}) RETURNING id`,
      [req.userId, ...columns.map((c) => fields[c])]
    );
    res.status(201).json({ success: true, task: await one(req.userId, created.rows[0].id) });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
// Any of the fields above, and `done: true | false`.
router.patch('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '할 일을 찾을 수 없어요.');
    const { fields, invalid } = await read(req.userId, req.body || {}, { creating: false });
    if (invalid) return fail(res, 400, 'InvalidField', '입력한 내용을 다시 확인해 주세요.', { field: invalid });
    const columns = Object.keys(fields);
    if (columns.length) {
      const updated = await db.query(
        `UPDATE tasks SET ${columns.map((c, i) => `${c} = $${i + 3}`).join(', ')} WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.userId, ...columns.map((c) => fields[c])]
      );
      if (!updated.rowCount) return fail(res, 404, 'NotFound', '할 일을 찾을 수 없어요.');
    }
    const task = await one(req.userId, req.params.id);
    if (!task) return fail(res, 404, 'NotFound', '할 일을 찾을 수 없어요.');
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '할 일을 찾을 수 없어요.');
    const removed = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!removed.rowCount) return fail(res, 404, 'NotFound', '할 일을 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
