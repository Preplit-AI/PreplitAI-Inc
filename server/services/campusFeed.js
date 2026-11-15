'use strict';
const db = require('../db/database');
const { callLLM } = require('./llmService');
const { NOTES_MODEL, PUBLIC_URL } = require('../config/constants');
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
 * The boards are read at most once every three hours, a page each.
 */

const KINDS = ['scholarship', 'job', 'program', 'event', 'academic', 'visa', 'housing', 'general'];
const STALE_MS = 3 * 60 * 60 * 1000;
const BATCH = 12;
/** The campus a student's university belongs to, if it has been set up. */
function campusFor(university) {
  if (!university) return null;
  const key = Object.keys(CAMPUSES).find((k) => CAMPUSES[k].match.test(university));
  return key ? { key, ...CAMPUSES[key] } : null;
}

/**
 * Korean university sites often refuse visitors from abroad, and the API runs
 * in Washington. On Vercel the boards are read through a small function that
 * runs in Seoul (api/campus-board.js); anywhere else they are read directly.
 */
async function fetchBoard(board) {
  if (!process.env.VERCEL || process.env.CAMPUS_DIRECT === '1') return readBoard(board);
  const base = process.env.CAMPUS_RELAY_URL || PUBLIC_URL;
  let res;
  try {
    res = await fetch(`${base}/api/campus-board?board=${encodeURIComponent(board.id)}`, { signal: AbortSignal.timeout(30000) });
  } catch (err) {
    throw new Error(board.id + ' relay could not be reached: ' + err.message);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || !Array.isArray(body.items)) throw new Error(board.id + ' relay: ' + ((body && body.error) || res.status));
  return body.items;
}

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
        ORDER BY intl DESC, posted_on DESC NULLS LAST LIMIT 48`,
      [key]
    );
    return await describe(waiting.rows);
  } finally {
    describing.delete(key);
  }
}

const refreshing = new Map();

/** Reads every board of a campus once and keeps what is new. A board that fails leaves the others unaffected. */
function refreshCampus(key) {
  if (refreshing.has(key)) return refreshing.get(key);
  const campus = CAMPUSES[key];
  const work = (async () => {
    await db.query(
      `INSERT INTO campus_fetches (campus, fetched_at) VALUES ($1, now()) ON CONFLICT (campus) DO UPDATE SET fetched_at = now()`,
      [key]
    );
    const results = await Promise.allSettled(campus.boards.map(fetchBoard));
    let read = 0;
    for (let i = 0; i < results.length; i += 1) {
      const result = results[i];
      const board = campus.boards[i];
      if (result.status !== 'fulfilled') { console.warn('[campus] ' + result.reason.message); continue; }
      read += 1;
      for (const item of result.value) {
        await db.query(
          `INSERT INTO campus_items (campus, source, article, title, title_en, kind, intl, category, url, posted_on, pinned)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (source, article) DO UPDATE SET title = EXCLUDED.title, pinned = EXCLUDED.pinned, posted_on = COALESCE(EXCLUDED.posted_on, campus_items.posted_on)`,
          [key, item.source, item.article, item.title, hasHangul(item.title) ? null : item.title, board.kind, board.intl, item.category, item.url, item.postedOn, item.pinned]
        );
      }
    }
    if (!read) throw new Error('no board of ' + key + ' could be read');
    await describeWaiting(key);
  })().finally(() => refreshing.delete(key));
  refreshing.set(key, work);
  return work;
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
  postedOn: row.posted_on ? new Date(row.posted_on).toISOString().slice(0, 10) : null,
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
  if (!last) {
    try { await refreshCampus(key); } catch (err) { failed = true; console.warn('[campus] first read failed:', err.message); await db.query('DELETE FROM campus_fetches WHERE campus = $1', [key]); }
  } else if (Date.now() - last > STALE_MS) {
    background = refreshCampus(key).catch((err) => console.warn('[campus] refresh failed:', err.message));
  }
  const rows = await db.query(
    `SELECT * FROM campus_items WHERE campus = $1 ORDER BY posted_on DESC NULLS LAST, first_seen DESC LIMIT 120`,
    [key]
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

module.exports = { CAMPUSES, campusFor, parseBoard, campusBoard, refreshCampus };
