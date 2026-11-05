'use strict';
const express = require('express');
const multer = require('multer');
const os = require('os');
const path = require('path');
const fsp = require('fs/promises');
const crypto = require('crypto');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { uploadLimit } = require('../middleware/rateLimit');
const { enqueue } = require('../services/lectureJobs');
const { isUuid, fail } = require('../utils/http');
const { MAX_AUDIO_BYTES, MAX_TRANSCRIPT_CHARS, MONTHLY_LECTURE_LIMIT } = require('../config/constants');

const router = express.Router();
router.use(authMiddleware);

// ── Upload handling ──────────────────────────────────────────────────────────
// Audio lands in the OS temp directory under a random name (the original file
// name never touches the disk) and is deleted as soon as it is transcribed.
const UPLOAD_DIR = path.join(os.tmpdir(), 'junbee-uploads');
const AUDIO_EXTENSIONS = new Set(['.m4a', '.mp3', '.wav', '.webm', '.ogg', '.oga', '.opus', '.aac', '.mp4', '.flac', '.amr', '.3gp']);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => fsp.mkdir(UPLOAD_DIR, { recursive: true }).then(() => cb(null, UPLOAD_DIR), cb),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex')),
  }),
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1, fields: 6, fieldSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const typeOk = /^(audio|video)\//.test(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (AUDIO_EXTENSIONS.has(ext) && typeOk) return cb(null, true);
    const err = new Error('Unsupported file type');
    err.code = 'UNSUPPORTED_FILE';
    cb(err);
  },
});

function receiveUpload(req, res, next) {
  upload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return fail(res, 413, 'FileTooLarge', `파일이 너무 커요. ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)}MB까지 올릴 수 있어요.`);
    }
    if (err.code === 'UNSUPPORTED_FILE') {
      return fail(res, 415, 'UnsupportedFile', '녹음 파일만 올릴 수 있어요. (m4a, mp3, wav 등)');
    }
    return fail(res, 400, 'BadUpload', '파일을 받지 못했어요. 다시 올려 주세요.');
  });
}

const cleanTitle = (value) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 120) : '';

function defaultTitle(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 강의`;
}

// ── POST /api/lectures ───────────────────────────────────────────────────────
// multipart/form-data: courseId, title?, and either `audio` (file) or `text`.
// Answers 202 at once; processing continues in the background.
router.post('/', uploadLimit, receiveUpload, async (req, res, next) => {
  const audioPath = req.file ? req.file.path : null;
  const discard = () => (audioPath ? fsp.rm(audioPath, { force: true }).catch(() => {}) : null);
  try {
    if (process.env.VERCEL) {
      await discard();
      return fail(res, 501, 'NotSupportedHere', '이 서버에서는 강의를 처리할 수 없어요.');
    }

    const { courseId } = req.body || {};
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!isUuid(courseId)) {
      await discard();
      return fail(res, 400, 'NoCourse', '과목을 골라 주세요.');
    }
    if (!audioPath && !text) return fail(res, 400, 'NoInput', '녹음 파일을 올리거나 녹취록을 붙여 넣어 주세요.');
    if (audioPath && text) {
      await discard();
      return fail(res, 400, 'TwoInputs', '녹음 파일과 녹취록 중 하나만 보내 주세요.');
    }
    if (text.length > MAX_TRANSCRIPT_CHARS) return fail(res, 413, 'TextTooLong', '녹취록이 너무 길어요.');

    const course = await db.query('SELECT id, name FROM courses WHERE id = $1 AND user_id = $2', [courseId, req.userId]);
    if (!course.rows[0]) {
      await discard();
      return fail(res, 404, 'NoCourse', '과목을 찾을 수 없어요.');
    }

    const usage = await db.query(
      `SELECT COUNT(*) FILTER (WHERE status <> 'failed' AND created_at > now() - interval '30 days')::int AS month,
              COUNT(*) FILTER (WHERE status = 'processing')::int AS running
         FROM lectures WHERE user_id = $1`,
      [req.userId]
    );
    if (usage.rows[0].running >= 2) {
      await discard();
      return fail(res, 409, 'Busy', '지금 처리 중인 강의가 끝나면 올려 주세요.');
    }
    if (usage.rows[0].month >= MONTHLY_LECTURE_LIMIT) {
      await discard();
      return fail(res, 429, 'MonthlyLimit', `30일 동안 강의 ${MONTHLY_LECTURE_LIMIT}개까지 처리할 수 있어요.`);
    }

    const title = cleanTitle(req.body.title) || defaultTitle();
    const created = await db.query(
      `INSERT INTO lectures (user_id, course_id, title, source) VALUES ($1, $2, $3, $4)
       RETURNING id, course_id, title, source, status, created_at`,
      [req.userId, courseId, title, audioPath ? 'audio' : 'text']
    );
    const lecture = created.rows[0];

    enqueue({
      lectureId: lecture.id,
      userId: req.userId,
      courseName: course.rows[0].name,
      title,
      audioPath,
      text: audioPath ? null : text,
    });

    res.status(202).json({ success: true, lecture: toSummary({ ...lecture, course_name: course.rows[0].name }) });
  } catch (err) {
    await discard();
    next(err);
  }
});

// ── GET /api/lectures?courseId= ──────────────────────────────────────────────
// Failed lectures are not listed: nothing of them was kept.
router.get('/', async (req, res, next) => {
  try {
    const { courseId } = req.query;
    if (courseId !== undefined && !isUuid(courseId)) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const result = await db.query(
      `SELECT l.id, l.course_id, c.name AS course_name, l.title, l.notes->>'title' AS topic, l.source, l.status,
              l.duration_seconds, l.card_count, l.created_at, l.finished_at
         FROM lectures l JOIN courses c ON c.id = l.course_id
        WHERE l.user_id = $1 AND l.status <> 'failed' AND ($2::uuid IS NULL OR l.course_id = $2::uuid)
        ORDER BY l.created_at DESC
        LIMIT 200`,
      [req.userId, courseId || null]
    );
    res.json({ success: true, lectures: result.rows.map(toSummary) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/lectures/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    const result = await db.query(
      `SELECT l.*, c.name AS course_name
         FROM lectures l JOIN courses c ON c.id = l.course_id
        WHERE l.id = $1 AND l.user_id = $2 AND l.status <> 'failed'`,
      [req.params.id, req.userId]
    );
    const row = result.rows[0];
    if (!row) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    const cards = await db.query(
      'SELECT id, front, back FROM cards WHERE lecture_id = $1 AND user_id = $2 ORDER BY position',
      [row.id, req.userId]
    );
    res.json({
      success: true,
      lecture: {
        ...toSummary(row),
        notes: row.notes,
        transcript: row.transcript,
        unclearRanges: row.unclear_ranges || [],
        cards: cards.rows,
        messageDismissed: row.message_dismissed,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/lectures/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    const result = await db.query('DELETE FROM lectures WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rowCount) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

function toSummary(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    topic: row.topic ?? (row.notes && row.notes.title) ?? null,
    source: row.source,
    status: row.status,
    durationSeconds: row.duration_seconds ?? null,
    cardCount: row.card_count ?? 0,
    createdAt: row.created_at,
    finishedAt: row.finished_at ?? null,
  };
}

module.exports = router;
