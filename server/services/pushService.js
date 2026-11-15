'use strict';
const webpush = require('web-push');
const db = require('../db/database');

/**
 * Phone notifications, sent through each browser's own push service.
 *
 * Without VAPID keys in the environment the feature is simply off. A reminder
 * with a `key` goes out once per student, ever, so a restart cannot repeat it.
 * Delivery failures never reach the caller: a missed reminder must not break a
 * lecture. A subscription the push service says is gone is removed.
 */

const MAX_SUBSCRIPTIONS_PER_USER = 10;

/**
 * The server posts to whatever endpoint a browser registers, so only the real
 * browser push services are accepted. Otherwise a student could point the
 * server at an internal address.
 */
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/];

function isPushEndpoint(value) {
  if (typeof value !== 'string' || value.length > 2000) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && PUSH_HOSTS.some((host) => host.test(url.hostname));
  } catch {
    return false;
  }
}

function vapid() {
  const { VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey } = process.env;
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject: process.env.VAPID_SUBJECT || 'mailto:info@preplitai.com' };
}

const isEnabled = () => Boolean(vapid());
const publicKey = () => (vapid() ? vapid().publicKey : null);

let send = (subscription, body, options) => webpush.sendNotification(subscription, body, options);
/** For tests, so nothing leaves the machine. */
const setSender = (fn) => {
  send = fn;
};

async function subscribe(userId, { endpoint, p256dh, auth }) {
  await db.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
    [userId, endpoint, p256dh, auth]
  );
  await db.query(
    `DELETE FROM push_subscriptions WHERE user_id = $1 AND id NOT IN (
       SELECT id FROM push_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2
     )`,
    [userId, MAX_SUBSCRIPTIONS_PER_USER]
  );
}

async function unsubscribe(userId, endpoint) {
  await db.query('DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2', [userId, endpoint]);
}

async function subscribersList() {
  const result = await db.query('SELECT DISTINCT user_id FROM push_subscriptions');
  return result.rows.map((row) => row.user_id);
}

/**
 * @param payload { body, url }
 * @param key once-only marker; omit for something that can only happen once anyway
 * @returns whether anything was sent
 */
async function sendToUser(userId, payload, key) {
  const details = vapid();
  if (!details) return false;
  try {
    const subscriptions = await db.query('SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1', [userId]);
    if (!subscriptions.rows.length) return false;
    if (key) {
      const logged = await db.query(
        'INSERT INTO notification_log (user_id, key) VALUES ($1, $2) ON CONFLICT (user_id, key) DO NOTHING',
        [userId, key]
      );
      if (!logged.rowCount) return false;
    }
    const body = JSON.stringify({ title: 'Juno', body: payload.body, url: payload.url });
    await Promise.all(
      subscriptions.rows.map(async (row) => {
        try {
          await send(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            body,
            { vapidDetails: details, TTL: 6 * 60 * 60 }
          );
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.query('DELETE FROM push_subscriptions WHERE id = $1', [row.id]);
          } else {
            console.warn('[push] could not deliver:', err.statusCode || err.message);
          }
        }
      })
    );
    return true;
  } catch (err) {
    console.warn('[push] failed:', err.message);
    return false;
  }
}

module.exports = { isEnabled, publicKey, isPushEndpoint, setSender, subscribe, unsubscribe, subscribersList, sendToUser };
