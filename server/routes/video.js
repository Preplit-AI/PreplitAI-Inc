const express = require('express');
const router = express.Router();
const queueService = require('../services/queue');
const creditService = require('../services/creditService');
const authMiddleware = require('../middleware/auth');
const { rateLimitMiddleware } = require('../middleware/rateLimit');

// ── POST /api/video/generate ──────────────────────────────────────────────────
router.post('/generate', authMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { script, options } = req.body;

    if (!script) {
      return res.status(400).json({ error: 'Script is required' });
    }

    const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
    const requiredCredits = Math.max(5, Math.ceil(wordCount / 50));
    const userId = req.userId || 1;

    // Reserve credits using row-level locking
    let reservationId;
    try {
      reservationId = await creditService.reserve(userId, requiredCredits, 'video_generation');
    } catch (reserveError) {
      const currentBalance = await creditService.getBalance(userId);
      return res.status(402).json({
        error: 'Insufficient credits',
        required: requiredCredits,
        current: currentBalance,
        message: reserveError.message
      });
    }

    // Enqueue job with reservationId
    const jobId = await queueService.addJob('generate_video', {
      script,
      options,
      userId,
      reservationId,
      creditsReserved: requiredCredits
    });

    // Commit reservation upon queue acceptance
    await creditService.commit(reservationId);

    const balanceAfter = await creditService.getBalance(userId);

    res.json({
      success: true,
      message: 'Video generation queued successfully',
      jobId,
      creditsDeducted: requiredCredits,
      balanceAfter
    });
  } catch (error) {
    console.error('Error queuing video generation:', error);
    res.status(500).json({ error: 'Failed to start video generation', message: error.message });
  }
});

// ── GET /api/video/status/:jobId ──────────────────────────────────────────────
router.get('/status/:jobId', authMiddleware, async (req, res) => {
  const { jobId } = req.params;
  const initialJob = await queueService.getJob(jobId);

  if (!initialJob) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({
    status: initialJob.status,
    videoUrl: initialJob.result?.videoUrl || null,
    error: initialJob.error
  });

  if (initialJob.status === 'completed' || initialJob.status === 'failed') {
    res.end();
    return;
  }

  const onJobUpdate = (update) => {
    if (update.jobId === jobId) {
      sendEvent({
        status: update.status,
        videoUrl: update.result?.videoUrl || null,
        error: update.error
      });

      if (update.status === 'completed' || update.status === 'failed') {
        cleanup();
        res.end();
      }
    }
  };

  queueService.on('job_updated', onJobUpdate);

  const cleanup = () => {
    queueService.removeListener('job_updated', onJobUpdate);
  };
  req.on('close', cleanup);
});

module.exports = router;
