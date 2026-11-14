'use strict';
const express = require('express');
const multer = require('multer');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { limit } = require('../middleware/rateLimit');
const { getProfile } = require('../services/profileStore');
const { isUuid, fail, cleanText } = require('../utils/http');

/**
 * The community: one room per university, where its international students
 * share photos of the campus, questions and the small stuff.
 *
 * A room is the student's own university, taken from their profile. There is
 * no global feed: an empty room for everyone is worse than a small one for
 * people in the same place. A post reported by three students is hidden until
 * someone looks at it; a student can always delete their own.
 *
 *   GET    /api/community                 the room's posts, newest first
 *   POST   /api/community                 body, kind, image?
 *   GET    /api/community/:id             one post with its replies
 *   POST   /api/community/:id/comments    { body }
 *   POST   /api/community/:id/like        like, or take the like back
 *   POST   /api/community/:id/report      { reason? }
 *   DELETE /api/community/:id             the author's own post
 *   GET    /api/community/images/:id      the post's picture (not signed in: an <img> cannot send a token)
 */
const router = express.Router();

const KINDS = ['post', 'question'];
const HIDE_AT_REPORTS = 3;
const byUser = (req) => req.userId || req.ip;
const postLimit = limit('communityPost', byUser, { points: 12, seconds: 60 * 60 });
const commentLimit = limit('communityComment', byUser, { points: 60, seconds: 60 * 60 });

const picture = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1, fields: 4, fieldSize: 8 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.fieldname === 'image' && /^image\/(png|jpeg|webp)$/.test(file.mimetype)),
});

// A picture is addressed by its post's id, which cannot be guessed; anyone in the room could see it anyway.
router.get('/images/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return res.status(404).end();
    const found = await db.query(
      `SELECT i.bytes, i.type FROM community_images i JOIN community_posts p ON p.id = i.post_id WHERE i.post_id = $1 AND p.hidden_at IS NULL`,
      [req.params.id]
    );
    if (!found.rows[0]) return res.status(404).end();
    res.set({ 'Content-Type': found.rows[0].type, 'Cache-Control': 'public, max-age=86400, immutable', 'X-Content-Type-Options': 'nosniff' });
    res.end(Buffer.from(found.rows[0].bytes));
  } catch (err) {
    next(err);
  }
});

router.use(authMiddleware);

/** The room is the university as the student wrote it, with case and spacing evened out. */
const roomOf = (university) => (university || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 120);

async function room(req, res) {
  const profile = await getProfile(req.userId);
  const key = roomOf(profile.university);
  if (!key) {
    fail(res, 409, 'NoUniversity', '프로필에 대학을 먼저 적어 주세요.');
    return null;
  }
  return { key, name: profile.university.trim() };
}

/** First name only: enough to talk to someone, not enough to look them up. */
const firstName = (name) => (name || '').trim().split(/\s+/)[0].slice(0, 24) || 'Student';

const SELECT = `
  SELECT p.id, p.user_id, p.kind, p.body, p.has_image, p.created_at, u.name,
         (SELECT count(*)::int FROM community_likes l WHERE l.post_id = p.id) AS likes,
         (SELECT count(*)::int FROM community_comments c WHERE c.post_id = p.id) AS comments,
         EXISTS (SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked
    FROM community_posts p JOIN users u ON u.id = p.user_id`;

const toPost = (row, userId) => ({
  id: row.id,
  kind: row.kind,
  body: row.body,
  image: row.has_image ? `/api/community/images/${row.id}` : null,
  author: firstName(row.name),
  mine: row.user_id === userId,
  likes: row.likes,
  liked: row.liked,
  comments: row.comments,
  createdAt: row.created_at,
});

async function findPost(userId, roomKey, id) {
  if (!isUuid(id)) return null;
  const found = await db.query(`${SELECT} WHERE p.id = $2 AND p.room = $3 AND p.hidden_at IS NULL`, [userId, id, roomKey]);
  return found.rows[0] || null;
}

router.get('/', async (req, res, next) => {
  try {
    const profile = await getProfile(req.userId);
    const key = roomOf(profile.university);
    if (!key) return res.json({ success: true, room: null, posts: [] });
    const before = typeof req.query.before === 'string' && Number.isFinite(Date.parse(req.query.before)) ? new Date(req.query.before) : null;
    const rows = await db.query(
      `${SELECT} WHERE p.room = $2 AND p.hidden_at IS NULL AND ($3::timestamptz IS NULL OR p.created_at < $3) ORDER BY p.created_at DESC LIMIT 30`,
      [req.userId, key, before]
    );
    const members = await db.query(`SELECT count(*)::int AS n FROM student_profiles WHERE lower(regexp_replace(trim(university), '\\s+', ' ', 'g')) = $1`, [key]);
    res.json({ success: true, room: { name: profile.university.trim(), members: members.rows[0].n }, posts: rows.rows.map((row) => toPost(row, req.userId)) });
  } catch (err) {
    next(err);
  }
});

router.post('/', postLimit, (req, res, next) => {
  picture.single('image')(req, res, (err) => {
    if (err) return fail(res, err.code === 'LIMIT_FILE_SIZE' ? 413 : 400, err.code === 'LIMIT_FILE_SIZE' ? 'FileTooLarge' : 'BadUpload', '사진은 3MB까지 올릴 수 있어요.');
    next();
  });
}, async (req, res, next) => {
  try {
    const where = await room(req, res);
    if (!where) return;
    const body = cleanText(req.body.body, 1500);
    if (!body && !req.file) return fail(res, 400, 'NoInput', '글이나 사진을 넣어 주세요.');
    const kind = KINDS.includes(req.body.kind) ? req.body.kind : 'post';
    const created = await db.transaction(async (tx) => {
      const post = await tx.query(
        `INSERT INTO community_posts (user_id, room, kind, body, has_image) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [req.userId, where.key, kind, body || '', Boolean(req.file)]
      );
      if (req.file) await tx.query('INSERT INTO community_images (post_id, bytes, type) VALUES ($1, $2, $3)', [post.rows[0].id, req.file.buffer, req.file.mimetype]);
      return post.rows[0].id;
    });
    res.status(201).json({ success: true, post: toPost(await findPost(req.userId, where.key, created), req.userId) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const where = await room(req, res);
    if (!where) return;
    const post = await findPost(req.userId, where.key, req.params.id);
    if (!post) return fail(res, 404, 'NotFound', '글을 찾을 수 없어요.');
    const comments = await db.query(
      `SELECT c.id, c.user_id, c.body, c.created_at, u.name FROM community_comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 ORDER BY c.created_at ASC LIMIT 200`,
      [post.id]
    );
    res.json({
      success: true,
      post: toPost(post, req.userId),
      comments: comments.rows.map((c) => ({ id: c.id, body: c.body, author: firstName(c.name), mine: c.user_id === req.userId, createdAt: c.created_at })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', commentLimit, async (req, res, next) => {
  try {
    const where = await room(req, res);
    if (!where) return;
    const post = await findPost(req.userId, where.key, req.params.id);
    if (!post) return fail(res, 404, 'NotFound', '글을 찾을 수 없어요.');
    const body = cleanText(req.body && req.body.body, 800);
    if (!body) return fail(res, 400, 'NoInput', '댓글을 적어 주세요.');
    const made = await db.query('INSERT INTO community_comments (post_id, user_id, body) VALUES ($1, $2, $3) RETURNING id, created_at', [post.id, req.userId, body]);
    res.status(201).json({ success: true, comment: { id: made.rows[0].id, body, author: null, mine: true, createdAt: made.rows[0].created_at } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/like', async (req, res, next) => {
  try {
    const where = await room(req, res);
    if (!where) return;
    const post = await findPost(req.userId, where.key, req.params.id);
    if (!post) return fail(res, 404, 'NotFound', '글을 찾을 수 없어요.');
    const removed = await db.query('DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2', [post.id, req.userId]);
    if (!removed.rowCount) await db.query('INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [post.id, req.userId]);
    const count = await db.query('SELECT count(*)::int AS n FROM community_likes WHERE post_id = $1', [post.id]);
    res.json({ success: true, liked: !removed.rowCount, likes: count.rows[0].n });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/report', async (req, res, next) => {
  try {
    const where = await room(req, res);
    if (!where) return;
    const post = await findPost(req.userId, where.key, req.params.id);
    if (!post) return fail(res, 404, 'NotFound', '글을 찾을 수 없어요.');
    await db.query('INSERT INTO community_reports (post_id, user_id, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [post.id, req.userId, cleanText(req.body && req.body.reason, 200) || null]);
    const count = await db.query('SELECT count(*)::int AS n FROM community_reports WHERE post_id = $1', [post.id]);
    if (count.rows[0].n >= HIDE_AT_REPORTS) await db.query('UPDATE community_posts SET hidden_at = now() WHERE id = $1 AND hidden_at IS NULL', [post.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '글을 찾을 수 없어요.');
    const gone = await db.query('DELETE FROM community_posts WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!gone.rowCount) return fail(res, 404, 'NotFound', '글을 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
