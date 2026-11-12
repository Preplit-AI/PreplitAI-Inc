'use strict';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Route ids are checked before they reach SQL, so a malformed id is a 404, not a 500. */
const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

const fail = (res, status, error, message, extra = {}) =>
  res.status(status).json({ success: false, error, message, ...extra });

/** One line of text a student typed: control characters out, trimmed, cut to `max`. Not a string gives ''. */
const cleanText = (value, max) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max) : '';

/** A short list of short strings (skills, interests): cleaned, de-duplicated, at most `maxItems`. Not an array gives null. */
function cleanList(value, { maxItems = 12, maxChars = 40 } = {}) {
  if (!Array.isArray(value)) return null;
  const seen = new Set();
  const out = [];
  for (const item of value) {
    const text = cleanText(item, maxChars);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

module.exports = { isUuid, fail, cleanText, cleanList };
