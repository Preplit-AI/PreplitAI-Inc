'use strict';
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const db = require('../db/database');

/**
 * Verifies the short-lived bearer token and that the account still exists,
 * then sets req.userId and req.user. Every protected route sits behind this;
 * ownership of courses, lectures and cards is then checked per query.
 */
const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: '로그인이 필요해요.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      error: expired ? 'TokenExpired' : 'Unauthorized',
      message: '다시 로그인해 주세요.',
    });
  }

  try {
    const result = await db.query('SELECT id, email, name FROM users WHERE id = $1', [payload.sub]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: '계정을 찾을 수 없어요.' });
    }
    req.user = result.rows[0];
    req.userId = req.user.id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authMiddleware };
