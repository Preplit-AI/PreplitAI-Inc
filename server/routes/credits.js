const express = require('express');
const router = express.Router();
const db = require('../db/database');
const creditService = require('../services/creditService');
const authMiddleware = require('../middleware/auth');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// ── GET /api/credits/balance ──────────────────────────────────────────────────
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const balance = await creditService.getBalance(req.userId);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balance', message: err.message });
  }
});

// ── GET /api/credits/packages ─────────────────────────────────────────────────
router.get('/packages', async (req, res) => {
  try {
    const packagesRes = await db.query(`
      SELECT * FROM credit_packages WHERE is_active = true ORDER BY sort_order ASC
    `);
    
    // Mock packages if table empty
    const packages = packagesRes.rows.length > 0 ? packagesRes.rows : [
      { id: '1', name: 'Starter Pack', credits: 50, price_cents: 999, currency: 'usd', is_active: true },
      { id: '2', name: 'Pro Scholar', credits: 200, price_cents: 2999, currency: 'usd', is_active: true, is_best_value: true },
      { id: '3', name: 'Power Researcher', credits: 500, price_cents: 5999, currency: 'usd', is_active: true }
    ];

    res.json(packages);
  } catch (err) {
    res.json([
      { id: '1', name: 'Starter Pack', credits: 50, price_cents: 999, currency: 'usd', is_active: true },
      { id: '2', name: 'Pro Scholar', credits: 200, price_cents: 2999, currency: 'usd', is_active: true },
      { id: '3', name: 'Power Researcher', credits: 500, price_cents: 5999, currency: 'usd', is_active: true }
    ]);
  }
});

// ── POST /api/credits/checkout ────────────────────────────────────────────────
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ error: 'packageId is required' });
    }

    const host = req.get('origin') || 'http://localhost:8080';
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `PreplitAI Credits (${packageId})` },
            unit_amount: 999,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${host}/preplitai-chat?checkout=success`,
        cancel_url: `${host}/preplitai-chat?checkout=cancelled`,
        metadata: { userId: String(req.userId), packageId }
      });

      res.json({ checkoutUrl: session.url });
    } catch (stripeErr) {
      // Offline fallback mock checkout URL
      res.json({ checkoutUrl: `${host}/preplitai-chat?checkout=success&mock=true` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkout session', message: err.message });
  }
});

// ── POST /api/webhooks/stripe (Strict Signature Verification) ─────────────────
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    console.error('Webhook rejected: Missing STRIPE_WEBHOOK_SECRET or stripe-signature header.');
    return res.status(400).json({ error: 'Webhook rejected: Missing signature verification credentials.' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const idempotencyKey = event.id;

    if (userId) {
      await creditService.addCredits(userId, 200, 'purchase', session.payment_intent, idempotencyKey);
    }
  }

  res.json({ received: true });
});

// ── GET /api/credits/transactions ─────────────────────────────────────────────
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit || '20', 10);
    const page = parseInt(req.query.page || '1', 10);
    const offset = (page - 1) * limit;

    const resTx = await db.query(`
      SELECT * FROM credit_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({
      page,
      limit,
      transactions: resTx.rows
    });
  } catch (err) {
    res.json({
      page: 1,
      limit: 20,
      transactions: []
    });
  }
});

module.exports = router;
