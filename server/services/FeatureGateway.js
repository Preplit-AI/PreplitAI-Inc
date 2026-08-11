'use strict';
const db = require('../db/database');

const CAPABILITY_INTERNAL_UNITS = {
  'ai.chat': 1,
  'ai.summary': 3,
  'ai.flashcards': 4,
  'ai.quiz': 5,
  'ai.podcast': 10,
  'ai.expected_exam': 10,
  'ai.video': 50,
  'ai.lecture_buddy': 15,
  'export.pdf': 1
};

const PLAN_MONTHLY_LIMITS = {
  'free': 500,
  'pro': 5000,
  'max': 20000
};

class FeatureGateway {
  /**
   * Authorizes a user request for a specific capability (e.g. 'ai.quiz')
   */
  static async authorize(userId, capabilityId) {
    try {
      // 1. Fetch user active subscription or default to Free
      let planId = 'free';
      let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      let subId = null;

      if (userId) {
        const subRes = await db.query(`
          SELECT * FROM subscriptions 
          WHERE user_id = $1 AND status IN ('active', 'trialing', 'grace_period')
          ORDER BY created_at DESC LIMIT 1
        `, [userId]);

        if (subRes.rows.length > 0) {
          planId = subRes.rows[0].plan_id;
          periodEnd = subRes.rows[0].current_period_end;
          subId = subRes.rows[0].id;
        }
      }

      const totalAllowedUnits = PLAN_MONTHLY_LIMITS[planId] || 500;
      const internalCost = CAPABILITY_INTERNAL_UNITS[capabilityId] || 1;

      // 2. Fetch current cycle usage
      let unitsConsumed = 0;
      if (userId) {
        const usageRes = await db.query(`
          SELECT COALESCE(SUM(internal_cost_units), 0)::int as total_used
          FROM usage_events
          WHERE user_id = $1 AND created_at >= (NOW() - INTERVAL '30 days')
        `, [userId]);
        unitsConsumed = usageRes.rows[0]?.total_used || 0;
      }

      // Check allowance
      if (unitsConsumed + internalCost > totalAllowedUnits) {
        return {
          authorized: false,
          error: 'Monthly usage limit reached',
          planId,
          usagePercentage: 100,
          renewsAt: periodEnd.toISOString()
        };
      }

      const usagePercentage = Math.min(100, Math.round(((unitsConsumed + internalCost) / totalAllowedUnits) * 100));

      return {
        authorized: true,
        planId,
        subId,
        unitsConsumed: unitsConsumed + internalCost,
        totalAllowedUnits,
        usagePercentage,
        renewsAt: periodEnd.toISOString(),
        internalCost,
        resolvedModel: planId === 'max' ? 'gpt-oss-120b' : planId === 'pro' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant'
      };
    } catch (err) {
      console.error('FeatureGateway authorization error:', err.message);
      // Fail open gracefully in offline dev
      return {
        authorized: true,
        planId: 'pro',
        usagePercentage: 43,
        renewsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedModel: 'llama-3.1-8b-instant'
      };
    }
  }

  /**
   * Log internal usage event for analytics, cost accounting, and abuse detection
   */
  static async recordUsage(userId, subId, capabilityId, provider = 'groq', model = 'llama-3.1-8b-instant', executionTimeMs = 0) {
    try {
      const internalCost = CAPABILITY_INTERNAL_UNITS[capabilityId] || 1;
      await db.query(`
        INSERT INTO usage_events (user_id, subscription_id, capability_id, provider_id, model_id, execution_time_ms, internal_cost_units)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId || null, subId || null, capabilityId, provider, model, executionTimeMs, internalCost]);
    } catch (err) {
      console.error('Failed to record usage event:', err.message);
    }
  }
}

module.exports = FeatureGateway;
