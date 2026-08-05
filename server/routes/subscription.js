'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const FeatureGateway = require('../services/FeatureGateway');

// ── 1. GET Current Subscription & Usage ────────────────────────
router.get('/me', async (req, res) => {
  try {
    const userId = req.userId || null;
    const authDetails = await FeatureGateway.authorize(userId, 'ai.chat');

    res.json({
      planId: authDetails.planId,
      planName: authDetails.planId === 'max' ? 'Max Plan' : authDetails.planId === 'pro' ? 'Pro Plan' : 'Free Plan',
      usagePercentage: authDetails.usagePercentage,
      unitsConsumed: authDetails.unitsConsumed,
      totalAllowedUnits: authDetails.totalAllowedUnits,
      renewsAt: authDetails.renewsAt,
      status: 'active',
      capabilities: [
        { id: 'ai.chat', name: 'Grounded Chat', enabled: true },
        { id: 'ai.quiz', name: 'Quiz Generator', enabled: true },
        { id: 'ai.flashcards', name: 'Flashcards', enabled: true },
        { id: 'ai.summary', name: 'Summarizer', enabled: true },
        { id: 'ai.podcast', name: 'Podcast Generator', enabled: true },
        { id: 'ai.expected_exam', name: 'Predicted Exam', enabled: authDetails.planId !== 'free' },
        { id: 'ai.video', name: 'Video Lectures', enabled: authDetails.planId === 'max' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription status', message: err.message });
  }
});

// ── 2. POST Subscription Checkout ──────────────────────────────
router.post('/checkout', async (req, res) => {
  try {
    const { planId = 'pro', interval = 'monthly' } = req.body;
    
    // Fallback simulation URL if Stripe keys not present in env
    res.json({
      checkoutUrl: `https://checkout.stripe.com/pay/cs_test_preplit_${planId}_${interval}`,
      message: `Redirecting to Stripe checkout for ${planId} plan (${interval})`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subscription checkout', message: err.message });
  }
});

// ── 3. POST Customer Portal ───────────────────────────────────
router.post('/portal', async (req, res) => {
  try {
    res.json({
      portalUrl: 'https://billing.stripe.com/p/session/test_preplit_portal'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer portal session', message: err.message });
  }
});

module.exports = router;
