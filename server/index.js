'use strict';
const app = require('./app');
const db = require('./db/database');
const { failInterruptedJobs } = require('./services/lectureJobs');
const { PORT } = require('./config/constants');

db.ready
  .then(failInterruptedJobs)
  .then(() => {
    const server = app.listen(PORT, () => console.log(`Junbee API on http://localhost:${PORT}`));
    // Large audio uploads on a slow campus connection can take a while.
    server.requestTimeout = 15 * 60 * 1000;
  })
  .catch((err) => {
    console.error('FATAL: could not start:', err.message);
    process.exit(1);
  });
