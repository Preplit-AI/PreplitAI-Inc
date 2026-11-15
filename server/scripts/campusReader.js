#!/usr/bin/env node
'use strict';
/**
 * The campus reader, run by hand or by a scheduler on a server: reads every
 * connected university's notice boards and sends the notices to the API.
 * In production it runs as a Cloudflare Worker instead (campus-reader/worker);
 * this is the same code for a computer or a rented server.
 *
 *   CAMPUS_INGEST_KEY=... node server/scripts/campusReader.js
 *
 * CAMPUS_INGEST_URL defaults to https://www.preplitai.com/api/campus/ingest.
 * Needs Node 22 and no npm install. Exits with 1 when a campus could not be
 * read or the API refused it.
 */
const { sendAll } = require('../services/campusSend');

async function main() {
  if (!process.env.CAMPUS_INGEST_KEY) {
    console.error('CAMPUS_INGEST_KEY is not set.');
    process.exit(2);
  }
  const ok = await sendAll({ key: process.env.CAMPUS_INGEST_KEY, target: process.env.CAMPUS_INGEST_URL || undefined });
  process.exit(ok ? 0 : 1);
}

main();
