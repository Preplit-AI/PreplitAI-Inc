'use strict';
const express = require('express');
const multer = require('multer');
const os = require('os');
const path = require('path');
const fsp = require('fs/promises');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const { uploadLimit } = require('../middleware/rateLimit');
const { enqueue, failStalledJobs } = require('../services/lectureJobs');
const { textFromDocument, DOCUMENT_EXTENSIONS } = require('../services/documents');
const { getProfile, LANGUAGE_NAMES } = require('../services/profileStore');
const { keepAlive } = require('../utils/keepAlive');
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
const UPLOAD_DIR = path.join(os.tmpdir(), 'preplit-uploads');
const AUDIO_EXTENSIONS = new Set(['.m4a', '.mp3', '.wav', '.webm', '.ogg', '.oga', '.opus', '.aac', '.mp4', '.flac', '.amr', '.3gp']);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => fsp.mkdir(UPLOAD_DIR, { recursive: true }).then(() => cb(null, UPLOAD_DIR), cb),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex')),
  }),
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1, fields: 6, fieldSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (file.fieldname === 'document') {
      // Slides, a PDF or a text file: read for its text, never stored.
      const docOk = /^(application\/pdf|text\/)/.test(file.mimetype) || file.mimetype === 'application/octet-stream';
      if (DOCUMENT_EXTENSIONS.has(ext) && docOk) return cb(null, true);
    }
    const typeOk = /^(audio|video)\//.test(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (file.fieldname === 'audio' && AUDIO_EXTENSIONS.has(ext) && typeOk) return cb(null, true);
    const err = new Error('Unsupported file type');
    err.code = 'UNSUPPORTED_FILE';
    cb(err);
  },
});

function receiveUpload(req, res, next) {
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'document', maxCount: 1 }])(req, res, (err) => {
    if (!err) {
      const files = req.files || {};
      req.file = (files.audio && files.audio[0]) || null;
      req.document = (files.document && files.document[0]) || null;
      return next();
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return fail(res, 413, 'FileTooLarge', `파일이 너무 커요. ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)}MB까지 올릴 수 있어요.`);
    }
    if (err.code === 'UNSUPPORTED_FILE') {
      return fail(res, 415, 'UnsupportedFile', '녹음 파일(m4a, mp3, wav 등)이나 문서(PDF, txt)만 올릴 수 있어요.');
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
// multipart/form-data: courseId, title?, and one of `audio` (a recording),
// `document` (a PDF or text file, read for its text) or `text`.
// Answers 202 at once; processing continues in the background.
router.post('/', uploadLimit, receiveUpload, async (req, res, next) => {
  const audioPath = req.file ? req.file.path : null;
  const documentFile = req.document || null;
  const discard = () =>
    Promise.all([audioPath, documentFile && documentFile.path].filter(Boolean).map((p) => fsp.rm(p, { force: true }).catch(() => {})));
  try {
    // Transcribing a recording needs ffmpeg and more time and upload size than a
    // serverless function has. Text and documents are processed here; recordings
    // need the long-running server (server/index.js).
    if (process.env.VERCEL && audioPath) {
      await discard();
      return fail(res, 501, 'AudioNeedsWorker', '이 서버에서는 녹음 파일을 처리할 수 없어요. 문서나 텍스트는 올릴 수 있어요.');
    }

    const { courseId } = req.body || {};
    let text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    let material = null;
    if (documentFile) {
      if (audioPath || text) {
        await discard();
        return fail(res, 400, 'TwoInputs', '파일 하나만 보내 주세요.');
      }
      try {
        ({ text, material } = await textFromDocument(documentFile.path, documentFile.originalname));
      } catch (err) {
        await discard();
        console.warn('[lecture] document not readable:', err.message);
        return fail(res, 422, 'UnreadableDocument', '이 파일에서 글자를 읽지 못했어요.');
      }
      await discard();
      // A scanned PDF has pictures of text, not text.
      if (text.split(/\s+/).filter(Boolean).length < 40) {
        return fail(res, 422, 'NoTextInDocument', '이 파일에는 읽을 수 있는 글자가 거의 없어요. 스캔한 PDF는 아직 읽지 못해요.');
      }
      text = text.slice(0, MAX_TRANSCRIPT_CHARS);
    }
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

    await failStalledJobs(req.userId);
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
      material,
      recordedAt,
    });

    // Notes are written in the language the student asked Juno to explain in.
    const profile = await getProfile(req.userId);
    const language = profile.explainLanguage ? LANGUAGE_NAMES[profile.explainLanguage] : null;

    // On a serverless host the function is kept alive until the notes are saved.
    keepAlive(enqueue({
      language,
      lectureId: lecture.id,
      userId: req.userId,
      courseName: course.name,
      title,
      audioPath,
      text: audioPath ? null : text,
    }));

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
    await failStalledJobs(req.userId);
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
