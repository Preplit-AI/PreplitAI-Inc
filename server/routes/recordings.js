'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { limit } = require('../middleware/rateLimit');
const { enqueue, failStalledJobs } = require('../services/lectureJobs');
const { getProfile, LANGUAGE_NAMES } = require('../services/profileStore');
const { keepAlive } = require('../utils/keepAlive');
const { getCourse } = require('../services/courseStore');
const { lectureUsage, createLecture } = require('../services/lectureStore');
const { titleForRecording } = require('../services/semesterStore');
const { isUuid, fail, cleanText } = require('../utils/http');
const { MAX_AUDIO_BYTES, MONTHLY_LECTURE_LIMIT } = require('../config/constants');

/**
 * Lecture Buddy: a class recorded on the phone as one file, uploaded after
 * Stop. Nothing is transcribed while the class is going on, so the whole
 * class costs one transcription job instead of one request every 20 seconds.
 *
 * A serverless request takes about 4.5 MB, so the file arrives in slices of at
 * most 4 MB, in any order and resumable: the app asks which slices arrived and
 * sends the rest. Finish puts them back together for the lecture job, which
 * deletes them once the file is rebuilt.
 *
 *   POST   /api/recordings              { courseId, ext, parts, bytes, seconds?, recordedAt? }
 *   PUT    /api/recordings/:id/parts/:n  raw bytes of slice n (0-based)
 *   GET    /api/recordings/:id           which slices have arrived
 *   POST   /api/recordings/:id/finish    { title? } → the lecture, processing
 *   DELETE /api/recordings/:id
 */

const router = express.Router();
router.use(authMiddleware);

const PART_BYTES = 4 * 1024 * 1024;
const EXTENSIONS = new Set(['.m4a', '.mp4', '.aac', '.webm', '.ogg', '.mp3', '.wav', '.flac']);
const STALE_HOURS = 48;

const byUser = (req) => req.userId;
const startLimit = limit('recordingStart', byUser, { points: 20, seconds: 60 * 60 });
const partLimit = limit('recordingPart', byUser, { points: 600, seconds: 60 * 60 });

async function findUpload(userId, id) {
  if (!isUuid(id)) return null;
  const result = await db.query('SELECT * FROM recording_uploads WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rows[0] || null;
}

async function received(uploadId) {
  const result = await db.query('SELECT part, length(bytes)::int AS size FROM recording_parts WHERE upload_id = $1 ORDER BY part', [uploadId]);
  return result.rows;
}

const toUpload = (row, parts) => ({ id: row.id, courseId: row.course_id, parts: row.parts, bytes: row.bytes, received: parts.map((p) => p.part) });

router.post('/', startLimit, async (req, res, next) => {
  try {
    const { courseId, ext, parts, bytes, seconds, recordedAt } = req.body || {};
    if (!isUuid(courseId)) return fail(res, 400, 'InvalidCourse', '과목을 다시 골라 주세요.');
    const course = await getCourse(req.userId, courseId);
    if (!course) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');
    const kind = typeof ext === 'string' ? ext.toLowerCase() : '';
    if (!EXTENSIONS.has(kind)) return fail(res, 400, 'UnsupportedFile', '이 녹음 형식은 아직 받을 수 없어요.');
    const total = Number(bytes);
    const count = Number(parts);
    if (!Number.isInteger(total) || total <= 0 || total > MAX_AUDIO_BYTES) return fail(res, 413, 'TooLarge', '녹음이 너무 커요.');
    if (!Number.isInteger(count) || count < 1 || count > 100 || count !== Math.ceil(total / PART_BYTES)) {
      return fail(res, 400, 'BadParts', `녹음을 ${PART_BYTES / 1024 / 1024}MB씩 나눠서 보내 주세요.`);
    }
    const usage = await lectureUsage(req.userId);
    if (usage.month >= MONTHLY_LECTURE_LIMIT) return fail(res, 429, 'MonthlyLimit', `30일 동안 강의 ${MONTHLY_LECTURE_LIMIT}개까지 처리할 수 있어요.`);

    // Uploads nobody finished are not kept.
    await db.query(`DELETE FROM recording_uploads WHERE user_id = $1 AND created_at < now() - interval '${STALE_HOURS} hours'`, [req.userId]);
    const at = typeof recordedAt === 'string' && !Number.isNaN(Date.parse(recordedAt)) ? new Date(recordedAt) : null;
    const secs = Number.isFinite(Number(seconds)) && Number(seconds) > 0 ? Math.round(Number(seconds)) : null;
    const created = await db.query(
      `INSERT INTO recording_uploads (user_id, course_id, ext, parts, bytes, seconds, recorded_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, courseId, kind, count, total, secs, at]
    );
    res.status(201).json({ success: true, upload: toUpload(created.rows[0], []), partBytes: PART_BYTES });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/parts/:n', partLimit, express.raw({ type: () => true, limit: PART_BYTES + 1024 }), async (req, res, next) => {
  try {
    const upload = await findUpload(req.userId, req.params.id);
    if (!upload) return fail(res, 404, 'NotFound', '업로드를 찾을 수 없어요.');
    const n = Number.parseInt(req.params.n, 10);
    if (!Number.isInteger(n) || n < 0 || n >= upload.parts) return fail(res, 400, 'BadPart', '조각 번호가 올바르지 않아요.');
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    // Every slice but the last is exactly PART_BYTES; the last is what remains.
    const expected = n < upload.parts - 1 ? PART_BYTES : upload.bytes - PART_BYTES * (upload.parts - 1);
    if (body.length !== expected) return fail(res, 400, 'BadSize', '조각 크기가 맞지 않아요. 다시 보내 주세요.');
    await db.query(
      `INSERT INTO recording_parts (upload_id, part, bytes) VALUES ($1, $2, $3) ON CONFLICT (upload_id, part) DO UPDATE SET bytes = EXCLUDED.bytes`,
      [upload.id, n, body]
    );
    res.json({ success: true, part: n });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const upload = await findUpload(req.userId, req.params.id);
    if (!upload) return fail(res, 404, 'NotFound', '업로드를 찾을 수 없어요.');
    res.json({ success: true, upload: toUpload(upload, await received(upload.id)) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/finish', async (req, res, next) => {
  try {
    const upload = await findUpload(req.userId, req.params.id);
    if (!upload) return fail(res, 404, 'NotFound', '업로드를 찾을 수 없어요.');
    const parts = await received(upload.id);
    const missing = [];
    for (let n = 0; n < upload.parts; n += 1) if (!parts.some((p) => p.part === n)) missing.push(n);
    if (missing.length) return res.status(409).json({ success: false, error: 'MissingParts', message: '녹음이 아직 다 올라가지 않았어요.', missing });
    const course = await getCourse(req.userId, upload.course_id);
    if (!course) return fail(res, 404, 'NotFound', '과목을 찾을 수 없어요.');

    await failStalledJobs(req.userId);
    const usage = await lectureUsage(req.userId);
    if (usage.running >= 2) return fail(res, 409, 'Busy', '지금 처리 중인 강의가 끝나면 다시 눌러 주세요.');

    const recordedAt = upload.recorded_at ? new Date(upload.recorded_at) : new Date(upload.created_at);
    const title = cleanText(req.body && req.body.title, 120) || (await titleForRecording(req.userId, upload.course_id, recordedAt));
    const lecture = await createLecture(req.userId, {
      courseId: upload.course_id, courseName: course.name, title, source: 'audio', material: 'live', recordedAt,
    });
    const profile = await getProfile(req.userId);
    const language = profile.explainLanguage ? LANGUAGE_NAMES[profile.explainLanguage] : null;
    // On a serverless host the function is kept alive until the notes are saved.
    keepAlive(enqueue({
      language,
      lectureId: lecture.id,
      userId: req.userId,
      courseName: course.name,
      courseLanguage: course.language || null,
      title,
      uploadId: upload.id,
      durationSeconds: upload.seconds,
    }));
    res.status(202).json({ success: true, lecture });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const upload = await findUpload(req.userId, req.params.id);
    if (!upload) return fail(res, 404, 'NotFound', '업로드를 찾을 수 없어요.');
    await db.query('DELETE FROM recording_uploads WHERE id = $1', [upload.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
