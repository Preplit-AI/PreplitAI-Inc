'use strict';
/**
 * Reads every board of one campus and sends the notices to the API
 * (POST /api/campus/ingest). Shared by the campus reader's two homes: the
 * Cloudflare Worker (campus-reader/worker) and the command-line script
 * (server/scripts/campusReader.js). Uses only fetch, so it runs in both.
 */
const { CAMPUSES, readBoard } = require('./campusBoards');

const DEFAULT_TARGET = 'https://www.preplitai.com/api/campus/ingest';

/** Returns { boards, notices } as the API counted them. Throws when nothing could be read or the API refused. */
async function sendCampus(campusKey, { target = DEFAULT_TARGET, key, log = console.log } = {}) {
  if (!key) throw new Error('CAMPUS_INGEST_KEY is not set');
  const campus = CAMPUSES[campusKey];
  const boards = [];
  for (const board of campus.boards) {
    // One board at a time, so the university's site never gets more than one request from us at once.
    try {
      boards.push({ id: board.id, items: await readBoard(board) });
    } catch (err) {
      boards.push({ id: board.id, error: err.message });
    }
  }
  for (const b of boards) log(`  ${b.items ? 'read' : 'FAILED'} ${b.id}: ${b.items ? `${b.items.length} notices` : b.error}`);
  const res = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ campus: campusKey, boards }),
    signal: AbortSignal.timeout(60000),
  });
  const answer = await res.json().catch(() => null);
  if (!res.ok || !answer || !answer.success) throw new Error(`the API answered ${res.status} ${answer ? answer.error || '' : ''}`.trim());
  log(`  sent: ${answer.notices} notices from ${answer.boards} boards${answer.dropped ? `, ${answer.dropped} refused` : ''}`);
  if (!boards.some((b) => b.items)) throw new Error(`no board of ${campusKey} could be read`);
  return { boards: answer.boards, notices: answer.notices };
}

/** Every connected campus in turn. Returns true when all of them were read and accepted. */
async function sendAll(options = {}) {
  const log = options.log || console.log;
  let ok = true;
  for (const campusKey of Object.keys(CAMPUSES)) {
    log(`${new Date().toISOString()} ${CAMPUSES[campusKey].name}`);
    try {
      await sendCampus(campusKey, options);
    } catch (err) {
      ok = false;
      log(`  not sent: ${err.message}`);
    }
  }
  return ok;
}

module.exports = { sendCampus, sendAll, DEFAULT_TARGET };
