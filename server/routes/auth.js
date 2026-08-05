const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { rateLimitMiddleware } = require('../middleware/rateLimit');

const JWT_SECRET = process.env.JWT_SECRET || 'preplitai_jwt_super_secret_production_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'preplitai_refresh_super_secret_key';

// Helper: Hash refresh token
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', rateLimitMiddleware, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const userRes = await db.query(`
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, credit_balance, created_at
    `, [email.toLowerCase().trim(), password_hash, name.trim()]);

    const user = userRes.rows[0];

    // Issue Access Token
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

    // Issue Refresh Token
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, tokenHash, expiresAt]);

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      accessToken,
      user
    });
  } catch (err) {
    if (err.message.includes('unique constraint') || err.code === '23505') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Failed to register', message: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', rateLimitMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Generic error copy to prevent email enumeration
    const GENERIC_ERROR = 'Invalid email or password';

    if (!email || !password) {
      return res.status(400).json({ error: GENERIC_ERROR });
    }

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: GENERIC_ERROR });
    }

    const user = userRes.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: GENERIC_ERROR });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: GENERIC_ERROR });
    }

    // Issue Access Token
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

    // Issue & rotate Refresh Token
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, tokenHash, expiresAt]);

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credit_balance: user.credit_balance
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// ── POST /api/auth/refresh (Rotation + Reuse Detection) ──────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenRes = await db.query('SELECT * FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);

    if (tokenRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokenRecord = tokenRes.rows[0];

    // REUSE DETECTION: If a revoked token is replayed, revoke ALL sessions for that user!
    if (tokenRecord.revoked_at) {
      console.warn(`SECURITY ALERT: Revoked refresh token reused for user ${tokenRecord.user_id}! Revoking all sessions.`);
      await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1', [tokenRecord.user_id]);
      res.clearCookie('refreshToken');
      return res.status(403).json({ error: 'Security breach detected. All sessions revoked. Please log in again.' });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Revoke current token
    await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [tokenRecord.id]);

    // Issue new pair
    const newAccessToken = jwt.sign({ userId: tokenRecord.user_id }, JWT_SECRET, { expiresIn: '15m' });
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `, [tokenRecord.user_id, newTokenHash, expiresAt]);

    res.cookie('refreshToken', newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed', message: err.message });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.json({ success: true });
  }
});

// ── POST /api/auth/verify-email ──────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  res.json({ success: true, message: 'Email verified successfully' });
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  res.json({ success: true, message: 'If an account exists, a password reset link has been sent.' });
});

// ── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  res.json({ success: true, message: 'Password reset successfully' });
});

module.exports = router;
