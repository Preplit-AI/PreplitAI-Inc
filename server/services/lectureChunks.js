'use strict';
const db = require('../db/database');

/**
 * Lectures cut into pieces Juno can search and cite.
 *
 * Search works on Korean without a Korean tokenizer or a database extension.
 * Korean attaches particles to words (상태, 상태를, 상태의), so whole-word
 * matching misses most of what a student means. Instead each word is compared
 * as overlapping pairs of characters, which is the standard approach for
 * unsegmented text, and Latin terms such as "deadlock" are compared whole.
 * pg_trgm was avoided because how it treats Hangul depends on the database's
 * locale; this behaves the same on PGlite and on any PostgreSQL.
 *
 * Rarer terms count for more. A chunk must cover a good share of the question's
 * weight, so that a topic the lectures never mention returns nothing rather
 * than a weak match: "nothing found" is what lets Juno say so honestly.
 */

const TARGET_CHARS = 800;
const OVERLAP_MAX_CHARS = 200;
const MAX_CHUNK_CHARS = 2000;
/** A chunk must cover this share of the query's weight to count as an answer to it. */
const MIN_COVERAGE = 0.55;
/** A word counts as present when this share of its character pairs is. */
const MIN_WORD_SHARE = 0.6;

const STAMP = /\[(\d{2,3}):(\d{2})\]/;
const HANGUL = /[가-힣]/;

/** Longest first, so 에서 is removed whole rather than leaving 에. */
const PARTICLES = ['에서는', '으로는', '에게서', '에서', '으로', '에게', '까지', '부터', '처럼', '보다', '이나', '이라고', '라고', '하고', '은', '는', '이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '만', '랑'];
const QUESTION_WORDS = new Set(['어떻게', '무엇', '무엇인가', '뭐야', '뭐예요', '뭔가', '뭐지', '왜', '설명', '설명해', '설명해줘', '알려', '알려줘', '말해줘', '대해', '대해서', '대한', '관해', '관한', '있어', '있나요', '해줘', '주세요']);

function secondsFromAt(at) {
  const match = typeof at === 'string' ? at.match(/^(\d{1,3}):(\d{2})$/) : null;
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function formatAt(seconds) {
  if (seconds === null || seconds === undefined) return null;
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/** A pasted transcript can be one enormous line; break it at sentence ends, or by force. */
function splitLongLine(line) {
  if (line.length <= TARGET_CHARS) return [line];
  const pieces = [];
  let current = '';
  for (const sentence of line.match(/[^.!?。\n]+[.!?。]*\s*/g) || [line]) {
    if (current && current.length + sentence.length > TARGET_CHARS) {
      pieces.push(current.trim());
      current = '';
    }
    current += sentence;
    while (current.length > TARGET_CHARS * 1.5) {
      pieces.push(current.slice(0, TARGET_CHARS).trim());
      current = current.slice(TARGET_CHARS);
    }
  }
  if (current.trim()) pieces.push(current.trim());
  return pieces;
}

/** Each chunk repeats the previous one's last short line, so a thought split across the boundary can still be found. */
function transcriptChunks(transcript) {
  const lines = (transcript || '').split('\n').map((l) => l.trim()).filter(Boolean).flatMap(splitLongLine);
  const chunks = [];
  let current = [];
  let size = 0;
  for (const line of lines) {
    if (current.length && size + line.length > TARGET_CHARS) {
      chunks.push(current.join('\n'));
      const last = current[current.length - 1];
      current = last.length <= OVERLAP_MAX_CHARS ? [last] : [];
      size = current.join('').length;
    }
    current.push(line);
    size += line.length;
  }
  if (current.length) chunks.push(current.join('\n'));
  return chunks.map((content, position) => {
    const stamp = content.match(STAMP);
    return {
      kind: 'transcript',
      position,
      content,
      startSeconds: stamp ? Number(stamp[1]) * 60 + Number(stamp[2]) : null,
    };
  });
}

function noteChunks(notes) {
  if (!notes) return [];
  const chunks = [];
  const summary = [notes.title, notes.summary].filter(Boolean).join('\n');
  if (summary) chunks.push({ kind: 'summary', position: 0, content: summary, startSeconds: null });
  (notes.sections || []).forEach((section, position) => {
    const content = [section.heading, ...(section.points || []).map((p) => `- ${p}`)].join('\n');
    chunks.push({ kind: 'section', position, content: content.slice(0, MAX_CHUNK_CHARS), startSeconds: null });
  });
  (notes.flagged || []).forEach((item, position) => {
    const content = [item.note, item.quote ? `“${item.quote}”` : ''].filter(Boolean).join('\n');
    chunks.push({ kind: 'flagged', position, content: content.slice(0, MAX_CHUNK_CHARS), startSeconds: secondsFromAt(item.at) });
  });
  return chunks;
}

function buildChunks({ transcript, notes }) {
  return [...noteChunks(notes), ...transcriptChunks(transcript)];
}

/** Takes the caller's transaction, so a lecture and its chunks are saved together or not at all. */
async function saveChunks(tx, { userId, lectureId, transcript, notes }) {
  for (const chunk of buildChunks({ transcript, notes })) {
    await tx.query(
      `INSERT INTO lecture_chunks (user_id, lecture_id, kind, position, content, start_seconds)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (lecture_id, kind, position) DO NOTHING`,
      [userId, lectureId, chunk.kind, chunk.position, chunk.content, chunk.startSeconds]
    );
  }
}

/** Lectures finished before chunks existed are cut up the first time their owner searches. */
async function ensureChunks(userId) {
  const missing = await db.query(
    `SELECT l.id, l.transcript, l.notes
       FROM lectures l
      WHERE l.user_id = $1 AND l.status = 'ready'
        AND NOT EXISTS (SELECT 1 FROM lecture_chunks ch WHERE ch.lecture_id = l.id)
      LIMIT 50`,
    [userId]
  );
  for (const lecture of missing.rows) {
    await db.transaction((tx) => saveChunks(tx, {
      userId,
      lectureId: lecture.id,
      transcript: lecture.transcript,
      notes: lecture.notes,
    }));
  }
}

function stripParticle(word) {
  for (const particle of PARTICLES) {
    if (word.endsWith(particle) && word.length - particle.length >= 2) return word.slice(0, -particle.length);
  }
  return word;
}

/**
 * The words of a query, each as the terms to look for: character pairs for
 * Korean, the whole word for everything else. Words stay grouped because a
 * compound written without its space (교착상태) has a pair spanning the join
 * (착상) that no lecture contains, and that must not count against the word.
 */
function queryWords(query) {
  const words = String(query || '').toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+/gu) || [];
  const groups = new Map();
  for (const word of words) {
    if (QUESTION_WORDS.has(word)) continue;
    let terms = [];
    if (HANGUL.test(word)) {
      const stem = stripParticle(word);
      for (let i = 0; i + 2 <= stem.length; i += 1) terms.push(stem.slice(i, i + 2));
    } else if (word.length >= 2) {
      terms = [word];
    }
    if (terms.length) groups.set(terms.join('|'), terms);
  }
  return [...groups.values()].slice(0, 12);
}

const CHUNK_COLUMNS = `ch.id, ch.kind, ch.content, ch.start_seconds, l.id AS lecture_id, l.title AS lecture_title, c.name AS course_name`;
const CHUNK_JOINS = `lecture_chunks ch
  JOIN lectures l ON l.id = ch.lecture_id
  JOIN courses c ON c.id = l.course_id`;

/**
 * @returns the best chunks for this query, best first; empty when nothing
 * covers enough of it. Always scoped to the student, and to a course or a
 * single lecture when given.
 */
async function searchChunks(userId, { query, courseId = null, lectureId = null, limit = 6 }) {
  const words = queryWords(query);
  if (!words.length) return [];
  const terms = [...new Set(words.flat())];
  await ensureChunks(userId);

  const matched = await db.query(
    `WITH scope AS (
       SELECT ch.id, lower(ch.content) AS body
         FROM lecture_chunks ch JOIN lectures l ON l.id = ch.lecture_id
        WHERE ch.user_id = $1 AND l.status = 'ready'
          AND ($2::uuid IS NULL OR l.course_id = $2::uuid)
          AND ($3::uuid IS NULL OR l.id = $3::uuid)
     )
     SELECT s.id, array_agg(t.term) AS terms, (SELECT COUNT(*)::int FROM scope) AS total
       FROM scope s CROSS JOIN unnest($4::text[]) AS t(term)
      WHERE position(t.term IN s.body) > 0
      GROUP BY s.id`,
    [userId, courseId, lectureId, terms]
  );
  if (!matched.rows.length) return [];

  const total = matched.rows[0].total;
  const frequency = new Map();
  for (const row of matched.rows) {
    for (const term of row.terms) frequency.set(term, (frequency.get(term) || 0) + 1);
  }
  const termWeight = (term) => Math.log(1 + total / ((frequency.get(term) || 0) + 0.5));
  // Students and models write "deadlock" where a Korean lecture said 교착 상태 or
  // 데드락. A Latin word no chunk contains says nothing about the rest of the
  // question, so it must not sink it. On its own it still finds nothing.
  const hasKoreanWord = words.some((word) => HANGUL.test(word.join('')) && word.some((term) => frequency.has(term)));
  const counted = words.filter((word) => HANGUL.test(word.join('')) || frequency.has(word[0]) || !hasKoreanWord);
  const wordWeights = counted.map((word) => word.reduce((sum, term) => sum + termWeight(term), 0) / word.length);
  const possible = wordWeights.reduce((sum, weight) => sum + weight, 0);

  const scoreOf = (found) => {
    const present = new Set(found);
    let score = 0;
    counted.forEach((word, index) => {
      const share = word.filter((term) => present.has(term)).length / word.length;
      if (share >= MIN_WORD_SHARE) score += wordWeights[index] * share;
    });
    return score / possible;
  };

  const ranked = matched.rows
    .map((row) => ({ id: row.id, score: scoreOf(row.terms) }))
    .filter((row) => row.score >= MIN_COVERAGE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  if (!ranked.length) return [];

  const rows = await db.query(
    `SELECT ${CHUNK_COLUMNS} FROM ${CHUNK_JOINS} WHERE ch.user_id = $1 AND ch.id = ANY($2::uuid[])`,
    [userId, ranked.map((r) => r.id)]
  );
  const byId = new Map(rows.rows.map((row) => [row.id, row]));
  return ranked.map((r) => byId.get(r.id)).filter(Boolean);
}

/** The notes of one lecture, in reading order. */
async function noteChunksFor(userId, lectureId) {
  await ensureChunks(userId);
  const result = await db.query(
    `SELECT ${CHUNK_COLUMNS} FROM ${CHUNK_JOINS}
      WHERE ch.user_id = $1 AND l.id = $2 AND l.status = 'ready' AND ch.kind <> 'transcript'
      ORDER BY CASE ch.kind WHEN 'summary' THEN 0 WHEN 'flagged' THEN 1 ELSE 2 END, ch.position`,
    [userId, lectureId]
  );
  return result.rows;
}

/** Everything a lecturer flagged for the exam, newest lecture first. */
async function flaggedChunks(userId, { courseId = null, limit = 30 } = {}) {
  await ensureChunks(userId);
  const result = await db.query(
    `SELECT ${CHUNK_COLUMNS} FROM ${CHUNK_JOINS}
      WHERE ch.user_id = $1 AND ch.kind = 'flagged' AND l.status = 'ready'
        AND ($2::uuid IS NULL OR l.course_id = $2::uuid)
      ORDER BY l.created_at DESC, ch.position
      LIMIT $3`,
    [userId, courseId, limit]
  );
  return result.rows;
}

/** The part of a lecture's transcript being spoken at a given second. */
async function chunkAt(userId, lectureId, seconds) {
  await ensureChunks(userId);
  const result = await db.query(
    `SELECT ${CHUNK_COLUMNS} FROM ${CHUNK_JOINS}
      WHERE ch.user_id = $1 AND l.id = $2 AND l.status = 'ready' AND ch.kind = 'transcript'
        AND ch.start_seconds IS NOT NULL AND ch.start_seconds <= $3
      ORDER BY ch.start_seconds DESC, ch.position DESC
      LIMIT 1`,
    [userId, lectureId, seconds]
  );
  return result.rows[0] || null;
}

/** Looks chunks up by id for showing citations. A chunk that is gone was deleted with its lecture. */
async function chunksById(userId, ids) {
  if (!ids.length) return new Map();
  const result = await db.query(
    `SELECT ${CHUNK_COLUMNS} FROM ${CHUNK_JOINS} WHERE ch.user_id = $1 AND ch.id = ANY($2::uuid[])`,
    [userId, ids]
  );
  return new Map(result.rows.map((row) => [row.id, row]));
}

module.exports = {
  buildChunks,
  saveChunks,
  ensureChunks,
  queryWords,
  searchChunks,
  noteChunksFor,
  flaggedChunks,
  chunkAt,
  chunksById,
  formatAt,
};
