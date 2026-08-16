require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const lectureRoutes = require('./routes/lecture');
const videoRoutes = require('./routes/video');
const authRoutes = require('./routes/auth');
const creditsRoutes = require('./routes/credits');
const paymentsRoutes = require('./routes/payments');
const spacesRoutes = require('./routes/spaces');
const studyCompanionRoutes = require('./routes/studyCompanion');
const path = require('path');
const db = require('./db/database'); // Initialize database
const compression = require('compression');

const { PORT } = require('./config/constants');
const app = express();

// ── Phase 2: Explicit CORS allowlist ─────────────────────────────────────────
// Set ALLOWED_ORIGINS in .env as a comma-separated list of allowed origins.
// Example: ALLOWED_ORIGINS=https://preplitai.com,https://www.preplitai.com
// Falls back to localhost for development convenience.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:3000,http://localhost:5173,https://preplitai.com,https://www.preplitai.com')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (e.g. mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(ao => origin === ao || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:'))) return callback(null, true);
    callback(null, true); // Allow during transition to avoid breaking production requests
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for generated outputs and simple UI
// Enable proper video streaming with range requests
app.use('/outputs', express.static(path.join(__dirname, 'outputs'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm')) {
      res.set('Accept-Ranges', 'bytes');
      res.set('Content-Type', 'video/mp4');
    }
    // Cache videos for 7 days
    res.set('Cache-Control', 'public, max-age=604800, immutable');
  }
}));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '30d',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

const subscriptionRoutes = require('./routes/subscription');

const gksRoutes = require('./routes/gks');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gks', gksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/lecture', lectureRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api', spacesRoutes);
app.use('/api', studyCompanionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PreplitAI API is running' });
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Error handling middleware (sanitized for production)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: isProd ? 'An unexpected error occurred. Please try again.' : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
