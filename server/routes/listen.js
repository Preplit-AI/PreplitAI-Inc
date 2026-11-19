'use strict';
const express = require('express');
const multer = require('multer');
const os = require('os');
const path = require('path');
const fsp = require('fs/promises');
const crypto = require('crypto');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { limit } = require('../middleware/rateLimit');
const { enqueue, failStalledJobs } = require('../services/lectureJobs');
const { transcribeChunk, UNCLEAR, stamp } = require('../services/transcription');
const { getProfile, LANGUAGE_NAMES } = require('../services/profileStore');
const { keepAlive } = require('../utils/keepAlive');
const { getCourse } = require('../services/courseStore');
const { lectureUsage, createLecture } = require('../services/lectureStore');
const { titleForRecording } = require('../services/semesterStore');
const { isUuid, fail, cleanText } = require('../utils/http');
const { MAX_TRANSCRIPT_CHARS, MONTHLY_LECTURE_LIMIT } = require('../config/constants');

/**
 * Lecture Buddy, listening live.
 *
 * The app records the class in short pieces and sends each one here as it is
 * finished. Each piece is transcribed at once and added to the session's
 * transcript, so the student sees the words arrive, and the audio is deleted:
 * no recording is ever stored. When the student stops, the transcript becomes
 * a lecture in the course's workspace through the same notes pipeline as any
 * other lecture.
 *
 *   POST   /api/listen              { courseId }           start
 *   POST   /api/listen/:id/chunk    audio, seq, seconds    one piece, in order
 *   POST   /api/listen/:id/finish   { title? }             stop and save
 *   DELETE /api/listen/:id                                 stop and keep nothing
 */
const router = express.Router();
router.use(authMiddleware);

const MAX_CHUNK_BYTES = 4 * 1024 * 1024; // under a serverless request's limit
const MAX_SESSION_SECONDS = 4 * 60 * 60;
const MIN_WORDS = 40;
const AUDIO_EXTENSIONS = new Set(['.m4a', '.mp3', '.wav', '.webm', '.ogg', '.oga', '.opus', '.aac', '.mp4', '.flac', '.3gp']);
const UPLOAD_DIR = path.join(os.tmpdir(), 'preplit-listen');

const byUser = (req) => req.userId || req.ip;
const startLimit = limit('listenStart', byUser, { points: 20, seconds: 60 * 60 });
// A piece every ten seconds for four hours is 1,440; this leaves room for retries.
const chunkLimit = limit('listenChunk', byUser, { points: 1800, seconds: 4 * 60 * 60 });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => fsp.mkdir(UPLOAD_DIR, { recursive: true }).then(() => cb(null, UPLOAD_DIR), cb),
    // The model reads the format from the extension; the student's own file name never touches the disk.
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname || '').toLowerCase()),
  }),
  limits: { fileSize: MAX_CHUNK_BYTES, files: 1, fields: 4, fieldSize: 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const typeOk = /^(audio|video)\//.test(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (file.fieldname === 'audio' && AUDIO_EXTENSIONS.has(ext) && typeOk) return cb(null, true);
    const err = new Error('Unsupported file type');
    err.code = 'UNSUPPORTED_FILE';
    cb(err);
  },
});

function receiveChunk(req, res, next) {
  upload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 413, 'FileTooLarge', '녹음 조각이 너무 커요.');
    if (err.code === 'UNSUPPORTED_FILE') return fail(res, 415, 'UnsupportedFile', '이 형식의 녹음은 받을 수 없어요.');
    return fail(res, 400, 'BadUpload', '녹음을 받지 못했어요.');
  });
}

const wordsIn = (transcript) => (transcript || '').replace(/\[\d{2}:\d{2}\]|\[불명확\]/g, ' ').split(/\s+/).filter(Boolean).length;

const toSession = (row) => ({
  id: row.id,
  courseId: row.course_id,
  startedAt: row.started_at,
  seconds: Math.round(row.seconds),
  chunks: row.chunk_count,
  words: wordsIn(row.transcript),
});

async function findSession(userId, id) {
  if (!isUuid(id)) return null;
  const found = await db.query('SELECT * FROM listen_sessions WHERE id = $1 AND user_id = $2', [id, userId]);
  return found.rows[0] || null;
}

// ── POST /api/listen ─────────────────────────────────────────────────────────
router.post('/', startLimit, async (req, res, next) => {
  try {
    const { courseId } = req.body || {};
    if (!isUuid(courseId)) return fail(res, 400, 'NoCourse', '과목을 골라 주세요.');
    const course = await getCourse(req.userId, courseId);
    if (!course) return fail(res, 404, 'NoCourse', '과목을 찾을 수 없어요.');

    const usage = await lectureUsage(req.userId);
    if (usage.month >= MONTHLY_LECTURE_LIMIT) return fail(res, 429, 'MonthlyLimit', `30일 동안 강의 ${MONTHLY_LECTURE_LIMIT}개까지 처리할 수 있어요.`);

    // One class at a time: whatever was left open before is dropped, with its words.
    await db.query('DELETE FROM listen_sessions WHERE user_id = $1', [req.userId]);
    const created = await db.query('INSERT INTO listen_sessions (user_id, course_id) VALUES ($1, $2) RETURNING *', [req.userId, courseId]);
    res.status(201).json({ success: true, session: toSession(created.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/listen/:id/chunk ───────────────────────────────────────────────
router.post('/:id/chunk', chunkLimit, receiveChunk, async (req, res, next) => {
  const file = req.file ? req.file.path : null;
  const discard = () => (file ? fsp.rm(file, { force: true }).catch(() => {}) : Promise.resolve());
  try {
    const session = await findSession(req.userId, req.params.id);
    if (!session) { await discard(); return fail(res, 404, 'NotFound', '녹음 세션을 찾을 수 없어요.'); }
    if (!file) return fail(res, 400, 'NoInput', '녹음을 받지 못했어요.');

    const seq = Number.parseInt(req.body.seq, 10);
    if (!Number.isInteger(seq) || seq < 0) { await discard(); return fail(res, 400, 'BadSeq', '순서가 올바르지 않아요.'); }
    // Sent twice (a retry after a lost answer): it is already in the transcript.
    if (seq < session.chunk_count) { await discard(); return res.json({ success: true, duplicate: true, lines: [], session: toSession(session) }); }
    if (seq > session.chunk_count) { await discard(); return fail(res, 409, 'OutOfOrder', '녹음 조각이 순서대로 오지 않았어요.'); }
    if (session.seconds >= MAX_SESSION_SECONDS) { await discard(); return fail(res, 413, 'TooLong', '한 번에 4시간까지 들을 수 있어요.'); }

    const claimed = Number.parseFloat(req.body.seconds);
    const fallbackSeconds = Number.isFinite(claimed) && claimed > 0 && claimed <= 120 ? claimed : 0;
    const course = await getCourse(req.userId, session.course_id);
    // The end of what was just said helps the model carry names and terms across pieces.
    const tail = (session.transcript || '').replace(/\[\d{2}:\d{2}\]/g, '').replace(/\s+/g, ' ').trim().slice(-140);
    const prompt = [course ? course.name : '', tail].filter(Boolean).join('. ');

    let lines;
    let seconds;
    let heard = true;
    try {
      ({ lines, seconds } = await transcribeChunk(file, { prompt, language: course ? course.language : null, offsetSeconds: session.seconds, fallbackSeconds }));
    } catch (err) {
      // This piece could not be transcribed. The class goes on: the gap is marked, not guessed.
      console.warn('[listen] chunk ' + seq + ' of ' + session.id + ' failed:', err.message);
      heard = false;
      seconds = fallbackSeconds;
      lines = ['[' + stamp(session.seconds) + '] ' + UNCLEAR];
    } finally {
      await discard();
    }

    const addition = lines.join('\n');
    const transcript = [session.transcript, addition].filter(Boolean).join('\n').slice(0, MAX_TRANSCRIPT_CHARS);
    const updated = await db.query(
      `UPDATE listen_sessions SET transcript = $1, seconds = seconds + $2, chunk_count = chunk_count + 1, last_chunk_at = now()
        WHERE id = $3 AND user_id = $4 AND chunk_count = $5 RETURNING *`,
      [transcript, seconds, session.id, req.userId, session.chunk_count]
    );
    // Stopped or discarded while this piece was being transcribed.
    if (!updated.rowCount) return fail(res, 409, 'Closed', '이미 끝난 녹음이에요.');
    res.json({ success: true, heard, lines, session: toSession(updated.rows[0]) });
  } catch (err) {
    await discard();
    next(err);
  }
});

// ── POST /api/listen/:id/finish ──────────────────────────────────────────────
router.post('/:id/finish', async (req, res, next) => {
  try {
    const session = await findSession(req.userId, req.params.id);
    if (!session) return fail(res, 404, 'NotFound', '녹음 세션을 찾을 수 없어요.');
    const course = await getCourse(req.userId, session.course_id);

    // Too little was said to make notes from: nothing is kept, and the student is told so.
    if (!course || wordsIn(session.transcript) < MIN_WORDS) {
      await db.query('DELETE FROM listen_sessions WHERE id = $1', [session.id]);
      return fail(res, 422, 'TooShort', '노트를 만들기에는 들은 내용이 너무 적어요. 저장된 건 없어요.');
    }

    await failStalledJobs(req.userId);
    const usage = await lectureUsage(req.userId);
    if (usage.running >= 2) return fail(res, 409, 'Busy', '지금 처리 중인 강의가 끝나면 다시 눌러 주세요.');

    const startedAt = new Date(session.started_at);
    const title = cleanText(req.body && req.body.title, 120) || (await titleForRecording(req.userId, session.course_id, startedAt));
    const lecture = await createLecture(req.userId, {
      courseId: session.course_id,
      courseName: course.name,
      title,
      source: 'audio',
      material: 'live',
      recordedAt: startedAt,
    });
    await db.query('DELETE FROM listen_sessions WHERE id = $1', [session.id]);

    const profile = await getProfile(req.userId);
    const language = profile.explainLanguage ? LANGUAGE_NAMES[profile.explainLanguage] : null;
    keepAlive(enqueue({
      language,
      lectureId: lecture.id,
      userId: req.userId,
      courseName: course.name,
      title,
      audioPath: null,
      text: session.transcript,
      durationSeconds: Math.round(session.seconds),
    }));
    res.status(202).json({ success: true, lecture });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/listen/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    if (isUuid(req.params.id)) await db.query('DELETE FROM listen_sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
