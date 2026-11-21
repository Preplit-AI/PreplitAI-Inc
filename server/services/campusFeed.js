'use strict';
const db = require('../db/database');
const { callLLM } = require('./llmService');
const { NOTES_MODEL } = require('../config/constants');
const { CAMPUSES, parseBoard, readBoard } = require('./campusBoards');

/**
 * The campus board: what a university has posted on its own public notice
 * boards, gathered in one place, with each title put into English and sorted
 * by what it is (a scholarship, a job, an event, something about visas).
 *
 * Only what the university itself published is shown, with a link back to the
 * page it came from: nothing here is written by the app. A campus has to be
 * set up below before it appears; a student at any other university is told
 * plainly that their campus is not connected yet.
 *
 * The boards are read at most once an hour, a page of 30 each. The board is
 * shown newest first, as the university's boards list it: by article number,
 * which Ajou's site gives out in posting order across all its boards. Notices
 * posted more than six months ago are left out.
 *
 * Ajou's site does not answer requests from Amazon's network, where Vercel
 * runs the API, although it answers almost every other network. So in
 * production the boards are read elsewhere (server/scripts/campusReader.js, on a
 * schedule) and sent to POST /api/campus/ingest; with CAMPUS_INGEST_KEY set the
 * API never reads the boards itself. Without it (development) it reads them
 * directly.
 */

const KINDS = ['scholarship', 'job', 'program', 'event', 'academic', 'visa', 'housing', 'general'];
const STALE_MS = 60 * 60 * 1000;
/** Notices posted longer ago than this are left off the board. */
const MAX_AGE_DAYS = 180;
const BATCH = 12;
/** The campus a student's university belongs to, if it has been set up. */
function campusFor(university) {
  if (!university) return null;
  const key = Object.keys(CAMPUSES).find((k) => CAMPUSES[k].match.test(university));
  return key ? { key, ...CAMPUSES[key] } : null;
}

/** True when the boards are read by the outside reader and sent in, rather than read here. */
const readElsewhere = () => Boolean(process.env.CAMPUS_INGEST_KEY);

const hasHangul = (text) => /[가-힣]/.test(text);

/**
 * English titles and a kind for notices that do not have them yet, in one
 * request. If it fails the notices keep their own titles and are tried again
 * at the next refresh: the board never waits on this.
 */
async function describe(rows) {
  let done = 0;
  for (let from = 0; from < rows.length; from += BATCH) {
    const batch = rows.slice(from, from + BATCH);
    const list = batch.map((row, i) => i + '. ' + row.title + (row.category ? '  (board section: ' + row.category + ')' : '')).join('\n');
    let parsed = null;
    try {
      const text = await callLLM({
        primaryModel: NOTES_MODEL,
        temperature: 0,
        systemPrompt: `You sort notices from a Korean university's notice boards for an international student.
For each numbered notice answer with: "en", the title in plain English (translate Korean faithfully; keep dates, names and amounts; do not add anything, and leave the board section out of it), and "kind", exactly one of: scholarship, job (jobs, internships, part-time work, assistant posts), program (exchange, study abroad, short programs, competitions, clubs to join), event (talks, information sessions, festivals, fairs), academic (registration, credits, exams, grades, graduation, leave), visa (visas, immigration, insurance for foreigners), housing (dormitory, housing), general.
Answer with JSON only, no other text: {"items":[{"i":0,"en":"...","kind":"..."}]}`,
        userPrompt: list,
      });
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      parsed = start >= 0 && end > start ? JSON.parse(text.slice(start, end + 1)) : null;
    } catch (err) {
      console.warn('[campus] a batch of titles was not translated:', err.message);
    }
    if (!parsed || !Array.isArray(parsed.items)) continue;
    for (const entry of parsed.items) {
      const row = batch[entry.i];
      if (!row || typeof entry.en !== 'string' || !entry.en.trim()) continue;
      // A title the university wrote in English is kept as it is; only Korean ones take the translation.
      const english = hasHangul(row.title) ? entry.en.trim().slice(0, 300) : row.title;
      await db.query('UPDATE campus_items SET title_en = $1, kind = $2, described = true WHERE id = $3', [english, KINDS.includes(entry.kind) ? entry.kind : row.kind, row.id]);
      done += 1;
    }
  }
  return done;
}

const describing = new Set();

/** Puts the next few dozen untranslated titles into English. Notices for international students go first. */
async function describeWaiting(key) {
  if (describing.has(key)) return 0;
  describing.add(key);
  try {
    const waiting = await db.query(
      `SELECT id, title, category, kind FROM campus_items WHERE campus = $1 AND described = false
        ORDER BY intl DESC, article::bigint DESC LIMIT 48`,
      [key]
    );
    return await describe(waiting.rows);
  } finally {
    describing.delete(key);
  }
}

/** Keeps what was read from each board. `results` is one { board, items } or { board, error } per board. */
async function storeBoards(key, results) {
  let read = 0;
  let kept = 0;
  for (const { board, items, error } of results) {
    if (error) { console.warn('[campus] ' + board.id + ': ' + error); continue; }
    read += 1;
    for (const item of items) {
      await db.query(
        // A posting date, once known, is kept when a later read has none (a notice past the
        // newest few whose own page is read); a date that was never known is dropped.
        `INSERT INTO campus_items (campus, source, article, title, title_en, kind, intl, category, url, posted_on, pinned, posted_known)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $10::date IS NOT NULL)
         ON CONFLICT (source, article) DO UPDATE SET title = EXCLUDED.title, pinned = EXCLUDED.pinned,
           posted_on = CASE WHEN EXCLUDED.posted_known THEN EXCLUDED.posted_on WHEN campus_items.posted_known THEN campus_items.posted_on END,
           posted_known = EXCLUDED.posted_known OR campus_items.posted_known`,
        [key, board.id, item.article, item.title, hasHangul(item.title) ? null : item.title, board.kind, board.intl, item.category, item.url, item.postedOn, item.pinned]
      );
      kept += 1;
    }
  }
  // The time shown as "updated" is the last time a board was actually read.
  if (read) await stampRead(key);
  return { read, kept };
}

const stampRead = (key) => db.query(
  `INSERT INTO campus_fetches (campus, fetched_at) VALUES ($1, now()) ON CONFLICT (campus) DO UPDATE SET fetched_at = now()`,
  [key]
);

const refreshing = new Map();

/** Reads every board of a campus once, here, and keeps what is new. A board that fails leaves the others unaffected. */
function refreshCampus(key) {
  if (refreshing.has(key)) return refreshing.get(key);
  const campus = CAMPUSES[key];
  const work = (async () => {
    // Stamped before reading, so a site that is down is not asked again on every visit.
    await stampRead(key);
    const settled = await Promise.allSettled(campus.boards.map(readBoard));
    const results = settled.map((r, i) => (r.status === 'fulfilled' ? { board: campus.boards[i], items: r.value } : { board: campus.boards[i], error: r.reason.message }));
    const { read } = await storeBoards(key, results);
    if (!read) throw new Error('no board of ' + key + ' could be read');
    await describeWaiting(key);
  })().finally(() => refreshing.delete(key));
  refreshing.set(key, work);
  return work;
}

const MAX_ITEMS = 200;
const text = (value, max) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null);

/**
 * What the outside reader sends: { campus, boards: [{ id, items } or { id, error }] }.
 * Only boards of that campus are taken, and only notices whose link goes to
 * that board's own page, so the reader cannot put anything else on the board.
 * Returns null when the campus is unknown.
 */
async function ingestCampus(body) {
  const key = body && typeof body.campus === 'string' ? body.campus : '';
  const campus = Object.prototype.hasOwnProperty.call(CAMPUSES, key) ? CAMPUSES[key] : null;
  if (!campus || !Array.isArray(body.boards)) return null;
  const results = [];
  let dropped = 0;
  for (const sent of body.boards.slice(0, campus.boards.length)) {
    const board = campus.boards.find((b) => sent && b.id === sent.id);
    if (!board || results.some((r) => r.board === board)) continue;
    if (!Array.isArray(sent.items)) {
      results.push({ board, error: text(sent.error, 300) || 'not read' });
      continue;
    }
    const items = [];
    for (const raw of sent.items.slice(0, MAX_ITEMS)) {
      const article = raw && typeof raw.article === 'string' && /^\d{1,15}$/.test(raw.article) ? raw.article : null;
      const title = text(raw && raw.title, 500);
      const ok = article && title && raw.url === board.url + '?mode=view&articleNo=' + article;
      if (!ok) { dropped += 1; continue; }
      items.push({
        article,
        title,
        url: raw.url,
        category: text(raw.category, 100),
        postedOn: typeof raw.postedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.postedOn) ? raw.postedOn : null,
        pinned: raw.pinned === true,
      });
    }
    results.push({ board, items });
  }
  const { read, kept } = await storeBoards(key, results);
  return { campus: key, boards: read, notices: kept, dropped, translate: read ? describeWaiting(key) : null };
}

const toItem = (row, boards) => ({
  id: row.id,
  title: row.title_en || row.title,
  original: row.title_en && row.title_en !== row.title ? row.title : null,
  kind: row.kind,
  forInternational: row.intl || row.kind === 'visa',
  source: (boards.find((b) => b.id === row.source) || {}).label || null,
  category: row.category,
  url: row.url,
  postedOn: row.posted_known && row.posted_on ? new Date(row.posted_on).toISOString().slice(0, 10) : null,
  pinned: row.pinned,
});

/**
 * The board for one campus. The first time it is asked for, the caller waits
 * for the boards to be read; after that what is stored is answered at once and
 * a refresh, if one is due, is returned for the caller to keep alive.
 */
async function campusBoard(key) {
  const campus = CAMPUSES[key];
  const fetched = await db.query('SELECT fetched_at FROM campus_fetches WHERE campus = $1', [key]);
  const last = fetched.rows[0] ? new Date(fetched.rows[0].fetched_at).getTime() : 0;
  let background = null;
  let failed = false;
  if (readElsewhere()) {
    // Nothing is read here; until the reader has sent this campus once, there is nothing to show.
    failed = !last;
  } else if (!last) {
    try { await refreshCampus(key); } catch (err) { failed = true; console.warn('[campus] first read failed:', err.message); await db.query('DELETE FROM campus_fetches WHERE campus = $1', [key]); }
  } else if (Date.now() - last > STALE_MS) {
    background = refreshCampus(key).catch((err) => console.warn('[campus] refresh failed:', err.message));
  }
  // Newest first by article number. A notice without a known date is placed by its number:
  // anything numbered below the oldest notice posted in the last six months is older than that.
  const rows = await db.query(
    `WITH recent AS (
       SELECT MIN(article::bigint) AS first FROM campus_items
        WHERE campus = $1 AND posted_known AND posted_on >= current_date - $2::int
     )
     SELECT campus_items.* FROM campus_items, recent
      WHERE campus = $1 AND (recent.first IS NULL OR article::bigint >= recent.first)
      ORDER BY article::bigint DESC LIMIT 120`,
    [key, MAX_AGE_DAYS]
  );
  // Some titles are still in Korean: the next batch is translated behind this answer.
  if (!background && rows.rows.some((row) => !row.described)) {
    background = describeWaiting(key).catch((err) => console.warn('[campus] titles not translated:', err.message));
  }
  const again = await db.query('SELECT fetched_at FROM campus_fetches WHERE campus = $1', [key]);
  return {
    board: {
      campus: { key, name: campus.name, city: campus.city, links: campus.links, sources: campus.boards.map((b) => ({ label: b.label, url: b.url })) },
      items: rows.rows.map((row) => toItem(row, campus.boards)),
      fetchedAt: again.rows[0] ? again.rows[0].fetched_at : null,
      failed,
      translating: rows.rows.filter((row) => !row.described).length,
    },
    background,
  };
}

module.exports = { CAMPUSES, campusFor, parseBoard, campusBoard, refreshCampus, ingestCampus };
