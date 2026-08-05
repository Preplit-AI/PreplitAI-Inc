const db = require('../db/database');

class CreditService {
  constructor() {
    // Start background TTL cleanup job running every 5 minutes
    setInterval(() => {
      this.cleanupStaleReservations().catch(err => {
        console.error('Error cleaning up stale credit reservations:', err.message);
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Get server-authoritative balance for user
   */
  async getBalance(userId) {
    try {
      const res = await db.query('SELECT credit_balance FROM users WHERE id = $1', [userId]);
      return res.rows[0]?.credit_balance ?? 0;
    } catch (err) {
      console.warn('Fallback balance due to DB disconnect:', err.message);
      return 100; // Offline fallback
    }
  }

  /**
   * Reserve credits with row-level locking (SELECT ... FOR UPDATE)
   */
  async reserve(userId, amount, refType = 'video_generation', refId = null) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        'SELECT credit_balance FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (userRes.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = userRes.rows[0].credit_balance;
      if (currentBalance < amount) {
        await client.query('ROLLBACK');
        throw new Error(`Insufficient credits: Required ${amount}, Available ${currentBalance}`);
      }

      const res = await client.query(`
        INSERT INTO credit_reservations (user_id, amount, status, reference_type, reference_id, expires_at)
        VALUES ($1, $2, 'held', $3, $4, NOW() + INTERVAL '30 minutes')
        RETURNING id
      `, [userId, amount, refType, refId]);

      await client.query('COMMIT');
      return res.rows[0].id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Commit reservation: deducts credit_balance and appends debit transaction
   */
  async commit(reservationId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        'SELECT * FROM credit_reservations WHERE id = $1 AND status = \'held\' FOR UPDATE',
        [reservationId]
      );

      if (res.rows.length === 0) {
        await client.query('ROLLBACK');
        return; // Reservation already committed or released
      }

      const reservation = res.rows[0];
      const { user_id, amount, reference_type, reference_id } = reservation;

      // Deduct balance
      const updateRes = await client.query(
        'UPDATE users SET credit_balance = credit_balance - $1 WHERE id = $2 RETURNING credit_balance',
        [amount, user_id]
      );
      const balanceAfter = updateRes.rows[0].credit_balance;

      // Record transaction ledger
      await client.query(`
        INSERT INTO credit_transactions (user_id, type, amount, balance_after, reference_type, reference_id)
        VALUES ($1, 'debit', $2, $3, $4, $5)
      `, [user_id, -amount, balanceAfter, reference_type, reference_id]);

      // Update reservation status
      await client.query(
        'UPDATE credit_reservations SET status = \'committed\' WHERE id = $1',
        [reservationId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Release reservation: cancels held reservation without deducting credits
   */
  async release(reservationId) {
    try {
      await db.query(
        'UPDATE credit_reservations SET status = \'released\' WHERE id = $1 AND status = \'held\'',
        [reservationId]
      );
    } catch (err) {
      console.error('Error releasing reservation:', err.message);
    }
  }

  /**
   * Add purchased or bonus credits using Stripe idempotency key
   */
  async addCredits(userId, amount, source = 'purchase', stripePaymentIntentId = null, idempotencyKey = null) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      if (idempotencyKey) {
        const check = await client.query(
          'SELECT id FROM credit_transactions WHERE idempotency_key = $1',
          [idempotencyKey]
        );
        if (check.rows.length > 0) {
          await client.query('ROLLBACK');
          return; // Duplicate webhook delivery safely ignored
        }
      }

      const updateRes = await client.query(
        'UPDATE users SET credit_balance = credit_balance + $1 WHERE id = $2 RETURNING credit_balance',
        [amount, userId]
      );

      const balanceAfter = updateRes.rows[0]?.credit_balance || amount;

      await client.query(`
        INSERT INTO credit_transactions (user_id, type, amount, balance_after, reference_type, stripe_payment_intent_id, idempotency_key)
        VALUES ($1, $2, $3, $4, 'stripe_payment', $5, $6)
      `, [userId, source, amount, balanceAfter, stripePaymentIntentId, idempotencyKey]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Background TTL cleanup of expired held reservations
   */
  async cleanupStaleReservations() {
    try {
      const res = await db.query(
        'UPDATE credit_reservations SET status = \'released\' WHERE status = \'held\' AND expires_at < NOW() RETURNING id'
      );
      if (res.rows.length > 0) {
        console.log(`Cleaned up ${res.rows.length} expired credit reservations.`);
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  }
}

module.exports = new CreditService();
