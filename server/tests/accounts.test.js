'use strict';
/**
 * Accounts beyond e-mail and password: Sign in with Google, the forgot/reset
 * password e-mail, and the shared rate-limit counter. Google's token endpoint
 * and Resend's API are stand-ins on this machine; the routes and the database
 * (PGlite) are real.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-accounts-'));
const CLIENT_ID = 'test-client.apps.googleusercontent.com';
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
  PUBLIC_URL: 'http://localhost:8080',
  GOOGLE_CLIENT_ID: CLIENT_ID,
  GOOGLE_CLIENT_SECRET: 'test-google-secret',
  RESEND_API_KEY: 're_test_key',
  EMAIL_FROM: 'Preplit AI <no-reply@preplitai.com>',
});

// ── Stand-ins for Google and Resend ──────────────────────────────────────────
/** What the next token request answers with: ID-token claims, or an HTTP error. */
let google = { claims: null, status: 200, challenge: null };
const sentMail = [];
let stub;

const base64url = (value) => Buffer.from(value).toString('base64url');
const idToken = (claims) => `${base64url(JSON.stringify({ alg: 'RS256' }))}.${base64url(JSON.stringify(claims))}.sig`;

let app;
let db;
let server;
let base;

before(async () => {
  stub = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (d) => { raw += d; });
    req.on('end', () => {
      if (req.url === '/token') {
        const form = new URLSearchParams(raw);
        const pkce = crypto.createHash('sha256').update(form.get('code_verifier') || '').digest('base64url');
        const ok = google.status === 200 && form.get('code') === 'good-code' && pkce === google.challenge
          && form.get('client_secret') === 'test-google-secret' && form.get('client_id') === CLIENT_ID
          && form.get('redirect_uri') === 'http://localhost:8080/api/auth/google/callback';
        res.writeHead(ok ? 200 : 400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(ok ? { id_token: idToken(google.claims), access_token: 'x' } : { error: 'invalid_grant' }));
      }
      if (req.url === '/emails') {
        assert.equal(req.headers.authorization, 'Bearer re_test_key');
        sentMail.push(JSON.parse(raw));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ id: 'mail' }));
      }
      res.writeHead(404).end();
    });
  });
  await new Promise((resolve) => { stub.listen(0, '127.0.0.1', resolve); });
  const stubUrl = `http://127.0.0.1:${stub.address().port}`;
  process.env.GOOGLE_AUTH_URL = `${stubUrl}/auth`;
  process.env.GOOGLE_TOKEN_URL = `${stubUrl}/token`;
  process.env.RESEND_BASE_URL = stubUrl;

  // Required only now, so the stand-ins' addresses are in place when the modules read them.
  app = require('../app');
  db = require('../db/database');
  await db.ready;
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  stub.close();
  await db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

// ── Helpers ──────────────────────────────────────────────────────────────────
async function call(method, url, { token, body, cookie } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + url, { method, headers, body: payload, redirect: 'manual' });
  const json = await res.json().catch(() => null);
  return { status: res.status, json, headers: res.headers, location: res.headers.get('location') };
}

/** The named cookie from a response, as "name=value", or null. */
function cookie(res, name) {
  const line = res.headers.getSetCookie().find((c) => c.startsWith(`${name}=`) && !c.startsWith(`${name}=;`));
  return line ? line.split(';')[0] : null;
}

const claimsFor = (over = {}) => ({
  iss: 'https://accounts.google.com',
  aud: CLIENT_ID,
  exp: Math.floor(Date.now() / 1000) + 300,
  sub: 'google-sub-1',
  email: 'mina@gmail.com',
  email_verified: true,
  name: 'Mina Park',
  ...over,
});

/**
 * One whole Google sign-in: start, "Google" (the stand-in), callback.
 * `claims` may be a function of the nonce the start step sent to Google.
 */
async function googleSignIn({ intent = 'login', claims = {}, state, withTicket = true, query = '' } = {}) {
  const start = await call('GET', `/auth/google/start?intent=${intent}&next=/workspace/build`);
  assert.equal(start.status, 303);
  const toGoogle = new URL(start.location);
  const ticket = cookie(start, 'jb_g');
  const params = toGoogle.searchParams;
  google = {
    status: 200,
    challenge: params.get('code_challenge'),
    claims: claimsFor({ nonce: params.get('nonce'), ...(typeof claims === 'function' ? claims(params) : claims) }),
  };
  const back = `/auth/google/callback?code=good-code&state=${encodeURIComponent(state ?? params.get('state'))}${query}`;
  const res = await call('GET', back, { cookie: withTicket ? ticket : undefined });
  return { start, toGoogle, ticket, res, session: cookie(res, 'jb_rt') };
}

// ── Google ───────────────────────────────────────────────────────────────────
test('the sign-in pages are told Google and password reset are on', async () => {
  const res = await call('GET', '/auth/config');
  assert.deepEqual(res.json, { success: true, inviteRequired: false, google: true, passwordReset: true });
});

test('Google start sends the browser to Google with PKCE, a state and a nonce, and keeps them in a Lax cookie', async () => {
  const { toGoogle, start } = await googleSignIn({ intent: 'signup' });
  const p = toGoogle.searchParams;
  assert.equal(p.get('client_id'), CLIENT_ID);
  assert.equal(p.get('redirect_uri'), 'http://localhost:8080/api/auth/google/callback');
  assert.equal(p.get('code_challenge_method'), 'S256');
  assert.equal(p.get('scope'), 'openid email profile');
  assert.ok(p.get('state').length >= 32 && p.get('nonce').length >= 32);
  const line = start.headers.getSetCookie().find((c) => c.startsWith('jb_g='));
  assert.match(line, /HttpOnly/i);
  assert.match(line, /SameSite=Lax/i);
  assert.match(line, /Path=\/api\/auth\/google/i);
});

test('signing up with Google makes an account without a password and lands where it was asked to', async () => {
  const { res, session } = await googleSignIn({ intent: 'signup' });
  assert.equal(res.status, 303);
  assert.equal(res.location, '/workspace/build');
  assert.ok(session, 'a session cookie');
  const refreshed = await call('POST', '/auth/refresh', { cookie: session });
  assert.equal(refreshed.status, 200);
  assert.equal(refreshed.json.user.email, 'mina@gmail.com');
  assert.equal(refreshed.json.user.name, 'Mina Park');
  assert.equal(refreshed.json.user.google, true);
  assert.equal(refreshed.json.user.hasPassword, false);

  // Signing in again finds the same account.
  const again = await googleSignIn({ intent: 'login' });
  const second = await call('POST', '/auth/refresh', { cookie: again.session });
  assert.equal(second.json.user.id, refreshed.json.user.id);
});

test('logging in with an unknown Google account goes to sign-up, where the consent box is, and makes nothing', async () => {
  const { res, session } = await googleSignIn({ intent: 'login', claims: { sub: 'google-sub-new', email: 'new@gmail.com' } });
  assert.equal(res.location, '/signup?error=GoogleNoAccount');
  assert.equal(session, null);
  const rows = await db.query("SELECT 1 FROM users WHERE email = 'new@gmail.com'");
  assert.equal(rows.rows.length, 0);
});

test('a forged state, a missing ticket, a cancelled sign-in or a bad ID token signs no one in', async () => {
  const cases = [
    [{ state: 'not-the-state' }, '/login?error=GoogleFailed'],
    [{ withTicket: false }, '/login?error=GoogleFailed'],
    [{ query: '&error=access_denied' }, '/login?error=GoogleCancelled'],
    [{ claims: { nonce: 'another-nonce' } }, '/login?error=GoogleFailed'],
    [{ claims: { aud: 'someone-else.apps.googleusercontent.com' } }, '/login?error=GoogleFailed'],
    [{ claims: { iss: 'https://evil.example' } }, '/login?error=GoogleFailed'],
    [{ claims: { exp: Math.floor(Date.now() / 1000) - 10 } }, '/login?error=GoogleFailed'],
    [{ claims: { email_verified: false } }, '/login?error=GoogleEmailUnverified'],
  ];
  for (const [options, expected] of cases) {
    const { res, session } = await googleSignIn(options);
    assert.equal(res.location, expected, JSON.stringify(options));
    assert.equal(session, null, JSON.stringify(options));
  }
});

test('Google joins a password account with the same address, and ends a password nobody had proved', async () => {
  const signup = await call('POST', '/auth/signup', { body: { email: 'joon@gmail.com', password: 'set by whoever typed it', name: 'Joon' } });
  assert.equal(signup.status, 201);
  const oldSession = cookie(signup, 'jb_rt');

  const { res, session } = await googleSignIn({ claims: { sub: 'google-sub-joon', email: 'joon@gmail.com' } });
  assert.equal(res.location, '/workspace/build');
  const me = await call('POST', '/auth/refresh', { cookie: session });
  assert.equal(me.json.user.id, signup.json.user.id);
  assert.equal(me.json.user.google, true);
  assert.equal(me.json.user.hasPassword, false);

  assert.equal((await call('POST', '/auth/login', { body: { email: 'joon@gmail.com', password: 'set by whoever typed it' } })).status, 401);
  assert.equal((await call('POST', '/auth/refresh', { cookie: oldSession })).status, 401);
});

test('an account made with Google confirms deletion with its address, and cannot change a password it does not have', async () => {
  const { session } = await googleSignIn({ intent: 'signup', claims: { sub: 'google-sub-leave', email: 'leave@gmail.com' } });
  const { json } = await call('POST', '/auth/refresh', { cookie: session });
  const token = json.accessToken;
  assert.equal((await call('PUT', '/auth/password', { token, body: { currentPassword: '', newPassword: 'a brand new one' } })).json.error, 'NoPassword');
  assert.equal((await call('DELETE', '/auth/account', { token, body: { confirmEmail: 'other@gmail.com' } })).status, 400);
  assert.equal((await call('DELETE', '/auth/account', { token, body: { confirmEmail: ' Leave@Gmail.com ' } })).status, 200);
});

// ── Password reset ───────────────────────────────────────────────────────────
const resetToken = (message) => message.text.match(/#token=([a-f0-9]{64})/)[1];

test('forgot password answers the same for any address, and e-mails a link only to an account', async () => {
  sentMail.length = 0;
  const unknown = await call('POST', '/auth/password/forgot', { body: { email: 'nobody@example.com' } });
  assert.equal(unknown.status, 200);
  assert.equal(sentMail.length, 0);

  await call('POST', '/auth/signup', { body: { email: 'reset@example.com', password: 'the old password', name: 'Reset' } });
  const known = await call('POST', '/auth/password/forgot', { body: { email: ' Reset@Example.com', lang: 'ko' } });
  assert.deepEqual(known.json, unknown.json);
  assert.equal(sentMail.length, 1);
  const [message] = sentMail;
  assert.deepEqual(message.to, ['reset@example.com']);
  assert.equal(message.from, 'Preplit AI <no-reply@preplitai.com>');
  assert.equal(message.subject, 'Preplit AI 비밀번호 재설정');
  assert.match(message.text, /http:\/\/localhost:8080\/reset-password#token=[a-f0-9]{64}/);
  assert.match(message.html, /reset-password#token=/);
});

test('a reset link sets the password once, ends the other sessions and signs this browser in', async () => {
  sentMail.length = 0;
  const signup = await call('POST', '/auth/signup', { body: { email: 'once@example.com', password: 'the old password', name: 'Once' } });
  const oldSession = cookie(signup, 'jb_rt');
  await call('POST', '/auth/password/forgot', { body: { email: 'once@example.com' } });
  const token = resetToken(sentMail[0]);

  assert.equal((await call('POST', '/auth/password/reset', { body: { token, password: 'short' } })).json.error, 'WeakPassword');
  const reset = await call('POST', '/auth/password/reset', { body: { token, password: 'the new password' } });
  assert.equal(reset.status, 200);
  assert.ok(reset.json.accessToken);
  assert.ok(cookie(reset, 'jb_rt'));

  assert.equal((await call('POST', '/auth/login', { body: { email: 'once@example.com', password: 'the old password' } })).status, 401);
  assert.equal((await call('POST', '/auth/login', { body: { email: 'once@example.com', password: 'the new password' } })).status, 200);
  assert.equal((await call('POST', '/auth/refresh', { cookie: oldSession })).status, 401);
  assert.equal((await call('POST', '/auth/password/reset', { body: { token, password: 'a third password' } })).json.error, 'InvalidResetToken');
});

test('an expired reset link is refused, and a reset gives a Google account a password', async () => {
  sentMail.length = 0;
  await call('POST', '/auth/password/forgot', { body: { email: 'mina@gmail.com' } });
  const late = resetToken(sentMail[0]);
  await db.query("UPDATE password_resets SET expires_at = now() - interval '1 minute' WHERE used_at IS NULL");
  assert.equal((await call('POST', '/auth/password/reset', { body: { token: late, password: 'a password at last' } })).json.error, 'InvalidResetToken');

  await call('POST', '/auth/password/forgot', { body: { email: 'mina@gmail.com' } });
  const reset = await call('POST', '/auth/password/reset', { body: { token: resetToken(sentMail[1]), password: 'a password at last' } });
  assert.equal(reset.json.user.hasPassword, true);
  assert.equal(reset.json.user.google, true);
  assert.equal((await call('POST', '/auth/login', { body: { email: 'mina@gmail.com', password: 'a password at last' } })).status, 200);
});

// ── Rate limits ──────────────────────────────────────────────────────────────
test('the rate-limit counter is shared through the database and says how long to wait', async () => {
  const { hit } = require('../middleware/rateLimit');
  assert.equal((await hit('probe:shared', 2, 60)).over, false);
  assert.equal((await hit('probe:shared', 2, 60)).over, false);
  const third = await hit('probe:shared', 2, 60);
  assert.equal(third.over, true);
  assert.ok(third.retryAfter > 0 && third.retryAfter <= 60);

  // A window that has ended starts again from one.
  await db.query("UPDATE rate_limits SET reset_at = now() - interval '1 second' WHERE key = 'probe:shared'");
  assert.equal((await hit('probe:shared', 2, 60)).over, false);
});
