'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const db = require('./db/database');
const { isProduction } = require('./config/constants');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const reviewRoutes = require('./routes/review');
const junbeeRoutes = require('./routes/junbee');

/**
 * The Junbee API. Shared by the long-running server (index.js) and the Vercel
 * function (api/index.js), so both get the same CORS policy and headers.
 */
const app = express();
app.disable('x-powered-by');

// Behind a reverse proxy, set TRUST_PROXY (e.g. "1") so rate limits key on the
// real client address instead of the proxy's.
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isFinite(hops) ? hops : process.env.TRUST_PROXY);
}

// ── CORS ─────────────────────────────────────────────────────────────────────
// The web app is served from the same origin as /api, so most requests never
// need CORS. Other origins must be listed exactly in ALLOWED_ORIGINS; there is
// no wildcard (anyone can deploy a *.vercel.app site).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const devOrigin = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (!isProduction && devOrigin.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));

// ── Security headers ─────────────────────────────────────────────────────────
// The API only ever returns JSON, so it can deny everything a page would need.
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cache-Control', 'no-store');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(compression());
app.use(express.json({ limit: '1mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/junbee', junbeeRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'NotFound', message: '없는 주소예요.' });
});

// ── Errors ───────────────────────────────────────────────────────────────────
// Details go to the server log, never to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'BadRequest', message: '요청을 읽지 못했어요.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'TooLarge', message: '요청이 너무 커요.' });
  }
  console.error('[server error]', req.method, req.path, err.stack || err.message);
  res.status(500).json({ success: false, error: 'ServerError', message: '서버에서 문제가 생겼어요. 잠시 뒤에 다시 해 주세요.' });
});

module.exports = app;
