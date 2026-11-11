'use strict';
/**
 * E-mail, through Resend's HTTP API (https://resend.com/docs/api-reference).
 *
 * Only the password-reset link is sent. Without RESEND_API_KEY the API says so
 * (/api/auth/config) and the sign-in page hides "Forgot password?".
 */
const { RESEND_API_KEY, EMAIL_FROM } = require('../config/constants');

// Only the test suite may point this at a stand-in for Resend.
const BASE = (process.env.NODE_ENV === 'test' && process.env.RESEND_BASE_URL) || 'https://api.resend.com';

function configured() {
  return Boolean(RESEND_API_KEY);
}

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const RESET = {
  en: {
    subject: 'Reset your Preplit AI password',
    lead: (email) => `Someone asked to reset the password for the Preplit AI account ${email}.`,
    action: 'Choose a new password',
    expiry: 'The link works once, for one hour.',
    ignore: "If it wasn't you, ignore this e-mail; your password stays as it is.",
  },
  ko: {
    subject: 'Preplit AI 비밀번호 재설정',
    lead: (email) => `Preplit AI 계정 ${email}의 비밀번호를 다시 정하겠다는 요청이 있었어요.`,
    action: '새 비밀번호 정하기',
    expiry: '이 링크는 한 시간 동안 한 번만 쓸 수 있어요.',
    ignore: '직접 요청한 게 아니라면 이 메일은 무시해 주세요. 비밀번호는 그대로예요.',
  },
};

function resetEmail(lang, email, link) {
  const t = RESET[lang] || RESET.en;
  const text = `${t.lead(email)}\n\n${t.action}: ${link}\n\n${t.expiry}\n${t.ignore}\n\nPreplit AI`;
  const html = `<!doctype html><html lang="${lang === 'ko' ? 'ko' : 'en'}"><body style="margin:0;padding:32px 16px;background:#f4f1ea;font-family:-apple-system,'Segoe UI',Roboto,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#0a0a0a">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
<p style="margin:0 0 24px;font-size:15px;font-weight:700">Preplit AI</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6">${escape(t.lead(email))}</p>
<p style="margin:0 0 24px"><a href="${escape(link)}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:999px">${escape(t.action)}</a></p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4a4a4a">${escape(t.expiry)}</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#4a4a4a">${escape(t.ignore)}</p>
</div></body></html>`;
  return { subject: t.subject, text, html };
}

async function send({ to, subject, text, html }) {
  const res = await fetch(`${BASE}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, text, html }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(`Resend answered ${res.status}${body && body.message ? `: ${body.message}` : ''}`);
  }
}

module.exports = { configured, resetEmail, send };
