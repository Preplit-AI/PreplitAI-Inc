'use strict';
/**
 * Sign in with Google: OpenID Connect's authorization-code flow, done on the
 * server with PKCE, a state value and a nonce.
 *
 * The browser goes to Google and comes back to /api/auth/google/callback with a
 * one-time code; the server trades it, with the client secret, for an ID token
 * straight from Google's token endpoint. The page never loads a Google script,
 * so the Content-Security-Policy stays script-src 'self'.
 *
 * Because the ID token arrives over TLS directly from Google's token endpoint,
 * in answer to our own authenticated request, OpenID Connect lets the client
 * rely on TLS for its origin instead of checking the token's signature (Core
 * 1.0, section 3.1.3.7). Its claims are still checked: issuer, audience,
 * expiry and nonce.
 */
const crypto = require('crypto');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PUBLIC_URL } = require('../config/constants');

const testing = process.env.NODE_ENV === 'test';
// Only the test suite may point these at a stand-in for Google.
const AUTH_URL = (testing && process.env.GOOGLE_AUTH_URL) || 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = (testing && process.env.GOOGLE_TOKEN_URL) || 'https://oauth2.googleapis.com/token';
const ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);

const base64url = (buffer) => buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function configured() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

function redirectUri() {
  return `${PUBLIC_URL}/api/auth/google/callback`;
}

/** The secrets one sign-in carries from the start to the callback. */
function newFlow() {
  const verifier = base64url(crypto.randomBytes(32));
  return {
    state: base64url(crypto.randomBytes(24)),
    nonce: base64url(crypto.randomBytes(24)),
    verifier,
    challenge: base64url(crypto.createHash('sha256').update(verifier).digest()),
  };
}

function authUrl({ state, nonce, challenge }) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return `${AUTH_URL}?${params}`;
}

function claimsOf(idToken) {
  const parts = typeof idToken === 'string' ? idToken.split('.') : [];
  if (parts.length !== 3) throw new Error('no ID token in the answer');
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
}

/**
 * Trades the code for the student's Google profile. Throws when Google refuses
 * or when the ID token is not for this app, this sign-in, or still valid.
 */
async function profileFor(code, verifier, nonce) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) throw new Error(`Google's token endpoint answered ${res.status}${body && body.error ? ` (${body.error})` : ''}`);

  const claims = claimsOf(body.id_token);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!ISSUERS.has(claims.iss)) throw new Error('ID token from another issuer');
  if (!audience.includes(GOOGLE_CLIENT_ID)) throw new Error('ID token for another app');
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) throw new Error('ID token expired');
  if (claims.nonce !== nonce) throw new Error('ID token for another sign-in');
  if (typeof claims.sub !== 'string' || !claims.sub || typeof claims.email !== 'string') throw new Error('ID token without an account');

  return {
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
    name: typeof claims.name === 'string' ? claims.name : '',
  };
}

module.exports = { configured, redirectUri, newFlow, authUrl, profileFor };
