'use strict';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Route ids are checked before they reach SQL, so a malformed id is a 404, not a 500. */
const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

const fail = (res, status, error, message, extra = {}) =>
  res.status(status).json({ success: false, error, message, ...extra });

module.exports = { isUuid, fail };
