'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { loginLimit, signupLimit, refreshLimit } = require('../middleware/rateLimit');
const {
  JWT_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_MS, PILOT_INVITE_CODE, isProduction,
} = require('../config/constants');

const router = express.Router();

const REFRESH_COOKIE = 'jb_rt';
const BCRYPT_ROUNDS = 12;
// Compared against when an e-mail has no account, so a missing account takes as
// long to reject as a wrong password and the timing does not reveal which.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', BCRYPT_ROUNDS);
// Two tabs can refresh at the same moment and both present the same token. A
// replay inside this window is treated as that race, not as theft.
const ROTATION_GRACE_MS = 20 * 1000;

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const fail = (res, status, error, message) => res.status(status).json({ success: false, error, message });

const publicUser = (row) => ({ id: row.id, email: row.email, name: row.name, createdAt: row.created_at });

function cleanName(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 40);
}

function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return '비밀번호는 8자 이상이어야 해요.';
  // bcrypt ignores everything after 72 bytes; refuse rather than silently truncate.
  if (Buffer.byteLength(password, 'utf8') > 72) return '비밀번호가 너무 길어요.';
  return null;
}

function inviteMatches(code) {
  if (!PILOT_INVITE_CODE) return true;
  if (typeof code !== 'string') return false;
  return crypto.timingSafeEqual(Buffer.from(sha256(code.trim())), Buffer.from(sha256(PILOT_INVITE_CODE)));
}

function setRefreshCookie(res, raw) {
  res.cookie(REFRESH_COOKIE, raw, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/api/auth' });
}

function readRefreshCookie(req) {
  const header = req.headers.cookie || '';
  const match = header.match(new RegExp('(?:^|;\\s*)' + REFRESH_COOKIE + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Issues a new access token and a new rotated refresh token for the user. */
async function startSession(res, user, q = db) {
  const raw = crypto.randomBytes(32).toString('hex');
  await q.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, sha256(raw), new Date(Date.now() + REFRESH_TOKEN_TTL_MS)]
  );
  setRefreshCookie(res, raw);
  const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, { algorithm: 'HS256', expiresIn: ACCESS_TOKEN_TTL });
  return { success: true, accessToken, user: publicUser(user) };
}

// ── GET /api/auth/config ─────────────────────────────────────────────────────
// Tells the sign-up form whether to ask for an invite code. Never the code itself.
router.get('/config', (req, res) => {
  res.json({ success: true, inviteRequired: Boolean(PILOT_INVITE_CODE) });
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', signupLimit, async (req, res, next) => {
  try {
    const { email, password, name, inviteCode } = req.body || {};
    if (typeof email !== 'string' || !validator.isEmail(email.trim()) || email.length > 254) {
      return fail(res, 400, 'InvalidEmail', '이메일 주소를 확인해 주세요.');
    }
    const pwProblem = passwordProblem(password);
    if (pwProblem) return fail(res, 400, 'WeakPassword', pwProblem);
    const displayName = cleanName(name);
    if (!displayName) return fail(res, 400, 'InvalidName', '이름을 입력해 주세요.');
    if (!inviteMatches(inviteCode)) return fail(res, 403, 'InvalidInvite', '초대 코드가 맞지 않아요.');

    const cleanEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let user;
    try {
      const created = await db.query(
        `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
         RETURNING id, email, name, created_at`,
        [cleanEmail, hash, displayName]
      );
      user = created.rows[0];
    } catch (err) {
      if (err.code === '23505') return fail(res, 409, 'EmailTaken', '이미 가입된 이메일이에요. 로그인해 주세요.');
      throw err;
    }

    res.status(201).json(await startSession(res, user));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', loginLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(res, 400, 'InvalidCredentials', '이메일 또는 비밀번호가 맞지 않아요.');
    }
    const result = await db.query(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, (user && user.password_hash) || DUMMY_HASH);
    if (!user || !user.password_hash || !ok) {
      return fail(res, 401, 'InvalidCredentials', '이메일 또는 비밀번호가 맞지 않아요.');
    }
    res.json(await startSession(res, user));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────
// Rotates the refresh cookie and returns a fresh access token. A token that was
// already rotated and is presented again outside the grace window means it was
// copied, so every session for that account is ended.
router.post('/refresh', refreshLimit, async (req, res, next) => {
  try {
    const raw = readRefreshCookie(req);
    // No cookie is not an error, just a visitor who is signed out.
    if (!raw) return res.status(204).end();

    const found = await db.query(
      `SELECT t.id, t.user_id, t.expires_at, t.revoked_at, t.rotated_at, u.email, u.name, u.created_at
         FROM refresh_tokens t JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = $1`,
      [sha256(raw)]
    );
    const token = found.rows[0];
    if (!token || token.revoked_at || new Date(token.expires_at).getTime() < Date.now()) {
      clearRefreshCookie(res);
      return fail(res, 401, 'NoSession', '다시 로그인해 주세요.');
    }

    if (token.rotated_at && Date.now() - new Date(token.rotated_at).getTime() > ROTATION_GRACE_MS) {
      await db.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [token.user_id]);
      clearRefreshCookie(res);
      console.warn('[auth] reused refresh token; all sessions ended for user', token.user_id);
      return fail(res, 401, 'SessionRevoked', '보안을 위해 모든 기기에서 로그아웃했어요. 다시 로그인해 주세요.');
    }

    const user = { id: token.user_id, email: token.email, name: token.name, created_at: token.created_at };
    const session = await db.transaction(async (tx) => {
      if (!token.rotated_at) {
        await tx.query('UPDATE refresh_tokens SET rotated_at = now() WHERE id = $1', [token.id]);
      }
      return startSession(res, user, tx);
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', async (req, res, next) => {
  try {
    const raw = readRefreshCookie(req);
    if (raw) await db.query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL', [sha256(raw)]);
    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const name = cleanName(req.body && req.body.name);
    if (!name) return fail(res, 400, 'InvalidName', '이름을 입력해 주세요.');
    const result = await db.query(
      'UPDATE users SET name = $1, updated_at = now() WHERE id = $2 RETURNING id, email, name, created_at',
      [name, req.userId]
    );
    res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/auth/password ───────────────────────────────────────────────────
// Ends every other session; this browser gets a new one.
router.put('/password', authMiddleware, loginLimit, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const pwProblem = passwordProblem(newPassword);
    if (pwProblem) return fail(res, 400, 'WeakPassword', pwProblem);

    const result = await db.query('SELECT id, email, name, password_hash, created_at FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.password_hash || DUMMY_HASH))) {
      return fail(res, 400, 'WrongPassword', '지금 비밀번호가 맞지 않아요.');
    }

    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const session = await db.transaction(async (tx) => {
      await tx.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [hash, req.userId]);
      await tx.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [req.userId]);
      return startSession(res, user, tx);
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/auth/account ─────────────────────────────────────────────────
// Deletes the account and, by cascade, every course, lecture, note, card and
// review it owns. Requires the password so a borrowed unlocked laptop cannot.
router.delete('/account', authMiddleware, loginLimit, async (req, res, next) => {
  try {
    const { password } = req.body || {};
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    const hash = result.rows[0] && result.rows[0].password_hash;
    if (typeof password !== 'string' || !(await bcrypt.compare(password, hash || DUMMY_HASH))) {
      return fail(res, 400, 'WrongPassword', '비밀번호가 맞지 않아요.');
    }
    await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
