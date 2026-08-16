require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const uploadRoutes = require('../server/routes/upload');
const lectureRoutes = require('../server/routes/lecture');
const videoRoutes = require('../server/routes/video');
const authRoutes = require('../server/routes/auth');
const creditsRoutes = require('../server/routes/credits');
const paymentsRoutes = require('../server/routes/payments');
const gksRoutes = require('../server/routes/gks');
const subscriptionRoutes = require('../server/routes/subscription');
const spacesRoutes = require('../server/routes/spaces');
const studyCompanionRoutes = require('../server/routes/studyCompanion');
require('../server/db/database'); // Initialize database

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:3000,http://localhost:5173,https://preplitai.com,https://www.preplitai.com')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(ao => origin.startsWith(ao) || origin.endsWith('.vercel.app'))) return callback(null, true);
    callback(null, true); // Permissive fallback for serverless preview deployments
  },
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PreplitAI Serverless API is running' });
});

app.use((err, req, res, next) => {
  console.error('[SERVERLESS ERROR]', err.stack || err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: isProd ? 'An unexpected error occurred.' : err.message 
  });
});

module.exports = app;
