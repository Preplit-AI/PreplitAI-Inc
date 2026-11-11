'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const db = require('../db/database');
const google = require('../services/google');
const mail = require('../services/mail');
const { authMiddleware } = require('../middleware/auth');
const {
  loginLimit, loginEmailLimit, signupLimit, refreshLimit, googleLimit, forgotLimit, forgotEmailLimit, resetLimit,
} = require('../middleware/rateLimit');
const {
  JWT_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_MS, PILOT_INVITE_CODE, PUBLIC_URL, RESET_TOKEN_TTL_MS, isProduction,
} = require('../config/constants');

const router = express.Router();

const REFRESH_COOKIE = 'jb_rt';
// Carries one Google sign-in from /google/start to /google/callback.
const GOOGLE_COOKIE = 'jb_g';
const GOOGLE_PATH = '/api/auth/google';
const BCRYPT_ROUNDS = 12;
// Compared against when an e-mail has no account, so a missing account takes as
// long to reject as a wrong password and the timing does not reveal which.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', BCRYPT_ROUNDS);
// Two tabs can refresh at the same moment and both present the same token. A
// replay inside this window is treated as that race, not as theft.
const ROTATION_GRACE_MS = 20 * 1000;

// Every query that feeds publicUser selects these, so the user object is the same everywhere.
const USER = 'id, email, name, password_hash, google_sub, email_verified_at, created_at';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const fail = (res, status, error, message) => res.status(status).json({ success: false, error, message });

const publicUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  createdAt: row.created_at,
  hasPassword: Boolean(row.password_hash),
  google: Boolean(row.google_sub),
});

function cleanName(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 40);
}

function cleanEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && validator.isEmail(email) ? email : null;
}

function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return '비밀번호는 8자 이상이어야 해요.';
  // bcrypt ignores everything after 72 bytes; refuse rather than silently truncate.
  if (Buffer.byteLength(password, 'utf8') > 72) return '비밀번호가 너무 길어요.';
  return null;
}

const sameText = (a, b) => typeof a === 'string' && typeof b === 'string'
  && crypto.timingSafeEqual(Buffer.from(sha256(a)), Buffer.from(sha256(b)));

function inviteMatches(code) {
  if (!PILOT_INVITE_CODE) return true;
  if (typeof code !== 'string') return false;
  return sameText(code.trim(), PILOT_INVITE_CODE);
}

/** Only in-app paths, so a crafted next= cannot send anyone to another site. Same rule as src/pages/Auth.tsx. */
function safeNext(value) {
  return typeof value === 'string' && /^\/(app|workspace)(\/[\w\-/]*)?$/.test(value) ? value : '/workspace';
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

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
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
// What the sign-in pages offer: an invite-code field, Google, "Forgot password?".
// Never the invite code itself.
router.get('/config', (req, res) => {
  res.json({
    success: true,
    inviteRequired: Boolean(PILOT_INVITE_CODE),
    google: google.configured(),
    passwordReset: mail.configured(),
  });
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', signupLimit, async (req, res, next) => {
  try {
    const { email, password, name, inviteCode } = req.body || {};
    const address = cleanEmail(email);
    if (!address) return fail(res, 400, 'InvalidEmail', '이메일 주소를 확인해 주세요.');
    const pwProblem = passwordProblem(password);
    if (pwProblem) return fail(res, 400, 'WeakPassword', pwProblem);
    const displayName = cleanName(name);
    if (!displayName) return fail(res, 400, 'InvalidName', '이름을 입력해 주세요.');
    if (!inviteMatches(inviteCode)) return fail(res, 403, 'InvalidInvite', '초대 코드가 맞지 않아요.');

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let user;
    try {
      const created = await db.query(
        `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING ${USER}`,
        [address, hash, displayName]
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
// Limited per address and per account, so neither one client nor many clients
// together can guess one student's password at speed.
router.post('/login', loginLimit, loginEmailLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(res, 400, 'InvalidCredentials', '이메일 또는 비밀번호가 맞지 않아요.');
    }
    const result = await db.query(`SELECT ${USER} FROM users WHERE email = $1`, [email.trim().toLowerCase()]);
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, (user && user.password_hash) || DUMMY_HASH);
    // An account made with Google has no password; it gets the same answer, so
    // this form does not say which addresses have accounts.
    if (!user || !user.password_hash || !ok) {
      return fail(res, 401, 'InvalidCredentials', '이메일 또는 비밀번호가 맞지 않아요.');
    }
    res.json(await startSession(res, user));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/google/start ───────────────────────────────────────────────
// ?intent=signup comes from the sign-up page, after the student ticked the
// consent box; only then may a new account be made. ?next= is where to land.
router.get('/google/start', googleLimit, (req, res) => {
  if (!google.configured()) return res.redirect(303, '/login?error=GoogleUnavailable');
  const intent = req.query.intent === 'signup' ? 'signup' : 'login';
  const flow = google.newFlow();
  const ticket = jwt.sign(
    { state: flow.state, nonce: flow.nonce, verifier: flow.verifier, intent, next: safeNext(req.query.next) },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '10m', audience: 'google-sign-in' }
  );
  // Lax, not Strict: the browser must send it on the way back from Google,
  // which is a top-level navigation from another site.
  res.cookie(GOOGLE_COOKIE, ticket, {
    httpOnly: true, secure: isProduction, sameSite: 'lax', path: GOOGLE_PATH, maxAge: 10 * 60 * 1000,
  });
  res.redirect(303, google.authUrl(flow));
});

/**
 * The account for a Google profile: the one already linked to it, or the one
 * with its e-mail address (linked now), or, from the sign-up page, a new one.
 */
async function accountForGoogle(profile, intent) {
  const linked = await db.query(`SELECT ${USER} FROM users WHERE google_sub = $1`, [profile.sub]);
  if (linked.rows[0]) return { user: linked.rows[0] };

  const sameEmail = (await db.query(`SELECT ${USER} FROM users WHERE email = $1`, [profile.email])).rows[0];
  if (sameEmail) {
    if (sameEmail.google_sub) return { error: 'GoogleOtherAccount' };
    // Sign-up does not prove the address, so a password set there may belong to
    // someone who typed another person's e-mail before they arrived. Google has
    // now proved the address: unless a reset link proved it earlier too, that
    // password and every session made with it end here.
    const trusted = Boolean(sameEmail.email_verified_at);
    const user = await db.transaction(async (tx) => {
      if (!trusted) {
        await tx.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [sameEmail.id]);
      }
      const updated = await tx.query(
        `UPDATE users SET google_sub = $1, email_verified_at = COALESCE(email_verified_at, now()),
                password_hash = CASE WHEN $2::boolean THEN password_hash ELSE NULL END, updated_at = now()
          WHERE id = $3 RETURNING ${USER}`,
        [profile.sub, trusted, sameEmail.id]
      );
      return updated.rows[0];
    });
    return { user };
  }

  if (intent !== 'signup') return { error: 'GoogleNoAccount', page: '/signup' };
  if (PILOT_INVITE_CODE) return { error: 'GoogleInviteRequired', page: '/signup' };

  const name = cleanName(profile.name) || cleanName(profile.email.split('@')[0]);
  try {
    const created = await db.query(
      `INSERT INTO users (email, name, google_sub, email_verified_at) VALUES ($1, $2, $3, now()) RETURNING ${USER}`,
      [profile.email, name, profile.sub]
    );
    return { user: created.rows[0] };
  } catch (err) {
    if (err.code !== '23505') throw err;
    // A second tab finished the same sign-in a moment earlier.
    const again = await db.query(`SELECT ${USER} FROM users WHERE google_sub = $1`, [profile.sub]);
    return again.rows[0] ? { user: again.rows[0] } : { error: 'GoogleFailed' };
  }
}

// ── GET /api/auth/google/callback ────────────────────────────────────────────
// Google sends the browser back here. Every outcome is a redirect: to the app
// when signed in, or back to the page it came from with ?error=<code>.
router.get('/google/callback', googleLimit, async (req, res, next) => {
  const ticket = readCookie(req, GOOGLE_COOKIE);
  res.clearCookie(GOOGLE_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: GOOGLE_PATH });
  const back = (page, code) => res.redirect(303, `${page}?error=${code}`);

  let flow;
  try {
    flow = jwt.verify(ticket || '', JWT_SECRET, { algorithms: ['HS256'], audience: 'google-sign-in' });
  } catch {
    return back('/login', 'GoogleFailed');
  }
  const from = flow.intent === 'signup' ? '/signup' : '/login';
  if (req.query.error) return back(from, req.query.error === 'access_denied' ? 'GoogleCancelled' : 'GoogleFailed');
  if (!sameText(req.query.state, flow.state) || typeof req.query.code !== 'string') return back(from, 'GoogleFailed');

  try {
    let profile;
    try {
      profile = await google.profileFor(req.query.code, flow.verifier, flow.nonce);
    } catch (err) {
      console.warn('[auth] Google sign-in refused:', err.message);
      return back(from, 'GoogleFailed');
    }
    if (!profile.emailVerified) return back(from, 'GoogleEmailUnverified');

    const outcome = await accountForGoogle(profile, flow.intent);
    if (outcome.error) return back(outcome.page || from, outcome.error);

    // The refresh cookie is the session; the app trades it for an access token on load.
    await startSession(res, outcome.user);
    res.redirect(303, flow.next);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/password/forgot ───────────────────────────────────────────
// E-mails a link that sets a new password. The answer is the same whether or
// not the address has an account.
router.post('/password/forgot', forgotLimit, forgotEmailLimit, async (req, res, next) => {
  try {
    if (!mail.configured()) return fail(res, 503, 'ResetUnavailable', '지금은 비밀번호를 다시 정할 수 없어요.');
    const address = cleanEmail(req.body && req.body.email);
    if (!address) return fail(res, 400, 'InvalidEmail', '이메일 주소를 확인해 주세요.');
    const lang = req.body.lang === 'ko' ? 'ko' : 'en';

    const user = (await db.query('SELECT id, email FROM users WHERE email = $1', [address])).rows[0];
    if (user) {
      const raw = crypto.randomBytes(32).toString('hex');
      await db.query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, sha256(raw), new Date(Date.now() + RESET_TOKEN_TTL_MS)]
      );
      // In the fragment, so the token never reaches a server log or a Referer header.
      const link = `${PUBLIC_URL}/reset-password#token=${raw}`;
      try {
        await mail.send({ to: user.email, ...mail.resetEmail(lang, user.email, link) });
      } catch (err) {
        console.error('[auth] reset e-mail not sent:', err.message);
      }
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/password/reset ────────────────────────────────────────────
// Uses the link once: sets the password, ends every other session, signs this
// browser in, and counts the address as proved.
router.post('/password/reset', resetLimit, async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      return fail(res, 400, 'InvalidResetToken', '링크가 만료되었거나 이미 쓰였어요.');
    }
    const pwProblem = passwordProblem(password);
    if (pwProblem) return fail(res, 400, 'WeakPassword', pwProblem);
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const session = await db.transaction(async (tx) => {
      const claimed = await tx.query(
        'UPDATE password_resets SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING user_id',
        [sha256(token)]
      );
      const row = claimed.rows[0];
      if (!row) return null;
      await tx.query('UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [row.user_id]);
      await tx.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [row.user_id]);
      const updated = await tx.query(
        `UPDATE users SET password_hash = $1, email_verified_at = COALESCE(email_verified_at, now()), updated_at = now()
          WHERE id = $2 RETURNING ${USER}`,
        [hash, row.user_id]
      );
      return startSession(res, updated.rows[0], tx);
    });
    if (!session) return fail(res, 400, 'InvalidResetToken', '링크가 만료되었거나 이미 쓰였어요.');
    res.json(session);
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
    const raw = readCookie(req, REFRESH_COOKIE);
    // No cookie is not an error, just a visitor who is signed out.
    if (!raw) return res.status(204).end();

    const found = await db.query(
      `SELECT t.id AS token_id, t.expires_at, t.revoked_at, t.rotated_at,
              u.id, u.email, u.name, u.password_hash, u.google_sub, u.email_verified_at, u.created_at
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
      await db.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [token.id]);
      clearRefreshCookie(res);
      console.warn('[auth] reused refresh token; all sessions ended for user', token.id);
      return fail(res, 401, 'SessionRevoked', '보안을 위해 모든 기기에서 로그아웃했어요. 다시 로그인해 주세요.');
    }

    const session = await db.transaction(async (tx) => {
      if (!token.rotated_at) {
        await tx.query('UPDATE refresh_tokens SET rotated_at = now() WHERE id = $1', [token.token_id]);
      }
      return startSession(res, token, tx);
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', async (req, res, next) => {
  try {
    const raw = readCookie(req, REFRESH_COOKIE);
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
    const result = await db.query(`SELECT ${USER} FROM users WHERE id = $1`, [req.userId]);
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
      `UPDATE users SET name = $1, updated_at = now() WHERE id = $2 RETURNING ${USER}`,
      [name, req.userId]
    );
    res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/auth/password ───────────────────────────────────────────────────
// Ends every other session; this browser gets a new one. An account made with
// Google has no password to confirm: it sets one through a reset link, which
// proves the address, rather than with a session token alone.
router.put('/password', authMiddleware, loginLimit, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const pwProblem = passwordProblem(newPassword);
    if (pwProblem) return fail(res, 400, 'WeakPassword', pwProblem);

    const result = await db.query(`SELECT ${USER} FROM users WHERE id = $1`, [req.userId]);
    const user = result.rows[0];
    if (!user.password_hash) return fail(res, 400, 'NoPassword', '이 계정은 Google로 로그인해요. 비밀번호 찾기로 비밀번호를 만들 수 있어요.');
    if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return fail(res, 400, 'WrongPassword', '지금 비밀번호가 맞지 않아요.');
    }

    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const session = await db.transaction(async (tx) => {
      const updated = await tx.query(
        `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING ${USER}`,
        [hash, req.userId]
      );
      await tx.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [req.userId]);
      return startSession(res, updated.rows[0], tx);
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/auth/account ─────────────────────────────────────────────────
// Deletes the account and, by cascade, every course, lecture, note, card and
// review it owns. Requires the password (or, for an account without one, the
// e-mail address typed out) so a borrowed unlocked laptop cannot do it by accident.
router.delete('/account', authMiddleware, loginLimit, async (req, res, next) => {
  try {
    const { password, confirmEmail } = req.body || {};
    const user = (await db.query('SELECT email, password_hash FROM users WHERE id = $1', [req.userId])).rows[0];
    if (user.password_hash) {
      if (typeof password !== 'string' || !(await bcrypt.compare(password, user.password_hash))) {
        return fail(res, 400, 'WrongPassword', '비밀번호가 맞지 않아요.');
      }
    } else if (typeof confirmEmail !== 'string' || confirmEmail.trim().toLowerCase() !== user.email) {
      return fail(res, 400, 'WrongConfirmation', '이메일 주소가 맞지 않아요.');
    }
    await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
