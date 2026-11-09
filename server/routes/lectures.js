'use strict';
const express = require('express');
const multer = require('multer');
const os = require('os');
const path = require('path');
const fsp = require('fs/promises');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const { uploadLimit } = require('../middleware/rateLimit');
const { enqueue } = require('../services/lectureJobs');
const { getCourse } = require('../services/courseStore');
const { lectureUsage, createLecture, listLectures, getLecture, deleteLecture } = require('../services/lectureStore');
const { titleForRecording } = require('../services/semesterStore');
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

/**
 * When the class happened, as the in-app recorder reports it, so a recording
 * uploaded late is still filed under the right week. Anything implausible is
 * ignored and the upload time is used.
 */
function recordedAtFrom(value) {
  const parsed = typeof value === 'string' ? Date.parse(value) : NaN;
  const now = Date.now();
  if (!Number.isFinite(parsed) || parsed > now + 5 * 60 * 1000 || now - parsed > 30 * 24 * 60 * 60 * 1000) return null;
  return new Date(parsed);
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

    const course = await getCourse(req.userId, courseId);
    if (!course) {
      await discard();
      return fail(res, 404, 'NoCourse', '과목을 찾을 수 없어요.');
    }

    const usage = await lectureUsage(req.userId);
    if (usage.running >= 2) {
      await discard();
      return fail(res, 409, 'Busy', '지금 처리 중인 강의가 끝나면 올려 주세요.');
    }
    if (usage.month >= MONTHLY_LECTURE_LIMIT) {
      await discard();
      return fail(res, 429, 'MonthlyLimit', `30일 동안 강의 ${MONTHLY_LECTURE_LIMIT}개까지 처리할 수 있어요.`);
    }

    const recordedAt = recordedAtFrom(req.body.recordedAt);
    const title = cleanTitle(req.body.title) || (await titleForRecording(req.userId, courseId, recordedAt || new Date()));
    const lecture = await createLecture(req.userId, {
      courseId,
      courseName: course.name,
      title,
      source: audioPath ? 'audio' : 'text',
      recordedAt,
    });

    enqueue({
      lectureId: lecture.id,
      userId: req.userId,
      courseName: course.name,
      title,
      audioPath,
      text: audioPath ? null : text,
    });

    res.status(202).json({ success: true, lecture });
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
    res.json({ success: true, lectures: await listLectures(req.userId, { courseId: courseId || null }) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/lectures/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    const lecture = await getLecture(req.userId, req.params.id);
    if (!lecture) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    res.json({ success: true, lecture });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/lectures/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    if (!(await deleteLecture(req.userId, req.params.id))) return fail(res, 404, 'NotFound', '강의를 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
