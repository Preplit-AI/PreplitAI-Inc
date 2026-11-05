'use strict';
// Vercel serverless entry. Same app, same CORS policy and headers, as the
// long-running server. Lecture processing needs a long-running process and
// large uploads, so on Vercel the upload route answers 501; run server/index.js
// on a VM or container for the pilot.
module.exports = require('../server/app');
