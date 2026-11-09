'use strict';
const db = require('../db/database');
const { chunksById, formatAt } = require('./lectureChunks');

/** Workspace conversations, always scoped to one student. */

const HISTORY_MESSAGES = 12;

function toConversation(row) {
  return { id: row.id, title: row.title, courseId: row.course_id, updatedAt: row.updated_at };
}

function toCitation({ label, chunkId }, chunks) {
  const chunk = chunks.get(chunkId);
  if (!chunk) return { label, deleted: true };
  return {
    label,
    lectureId: chunk.lecture_id,
    lectureTitle: chunk.lecture_title,
    courseName: chunk.course_name,
    kind: chunk.kind,
    at: formatAt(chunk.start_seconds),
    excerpt: chunk.content,
  };
}

/** Citations are stored as ids and read fresh, so a deleted lecture's text is not shown again. */
async function toMessages(userId, rows) {
  const ids = [...new Set(rows.flatMap((row) => (row.citations || []).map((c) => c.chunkId)))];
  const chunks = await chunksById(userId, ids);
  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    citations: (row.citations || []).map((c) => toCitation(c, chunks)),
    grounding: row.grounding,
    createdAt: row.created_at,
  }));
}

async function listConversations(userId) {
  const result = await db.query(
    `SELECT id, title, course_id, updated_at FROM conversations
      WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 100`,
    [userId]
  );
  return result.rows.map(toConversation);
}

/** @returns the conversation's own row, or null if this student has no such conversation. */
async function findConversation(userId, id) {
  const result = await db.query(
    `SELECT co.id, co.title, co.course_id, co.updated_at, c.name AS course_name
       FROM conversations co LEFT JOIN courses c ON c.id = co.course_id
      WHERE co.id = $1 AND co.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function getConversation(userId, id) {
  const row = await findConversation(userId, id);
  if (!row) return null;
  const messages = await db.query(
    `SELECT id, role, content, citations, grounding, created_at FROM messages
      WHERE conversation_id = $1 AND user_id = $2 ORDER BY seq`,
    [id, userId]
  );
  return { ...toConversation(row), messages: await toMessages(userId, messages.rows) };
}

/** The most recent messages, oldest first, for the model's context. */
async function recentHistory(userId, conversationId) {
  const result = await db.query(
    `SELECT role, content FROM messages
      WHERE conversation_id = $1 AND user_id = $2 ORDER BY seq DESC LIMIT $3`,
    [conversationId, userId, HISTORY_MESSAGES]
  );
  return result.rows.reverse();
}

/** @returns whether a conversation was removed. */
async function deleteConversation(userId, id) {
  const result = await db.query('DELETE FROM conversations WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
}

const titleFrom = (question) => {
  const line = question.replace(/\s+/g, ' ').trim();
  return line.length > 40 ? `${line.slice(0, 40)}…` : line;
};

/**
 * Saves a question and its answer together, only once the answer is complete.
 * A failure or a cancelled answer therefore leaves nothing behind, not even an
 * unanswered question.
 */
async function saveExchange(userId, { conversationId, courseId, question, answer }) {
  const saved = await db.transaction(async (tx) => {
    let id = conversationId;
    if (id) {
      await tx.query('UPDATE conversations SET updated_at = now() WHERE id = $1 AND user_id = $2', [id, userId]);
    } else {
      const created = await tx.query(
        'INSERT INTO conversations (user_id, course_id, title) VALUES ($1, $2, $3) RETURNING id',
        [userId, courseId, titleFrom(question)]
      );
      id = created.rows[0].id;
    }
    const asked = await tx.query(
      `INSERT INTO messages (conversation_id, user_id, role, content) VALUES ($1, $2, 'user', $3)
       RETURNING id, role, content, citations, grounding, created_at`,
      [id, userId, question]
    );
    const answered = await tx.query(
      `INSERT INTO messages (conversation_id, user_id, role, content, citations, grounding)
       VALUES ($1, $2, 'assistant', $3, $4, $5)
       RETURNING id, role, content, citations, grounding, created_at`,
      [id, userId, answer.content, JSON.stringify(answer.citations), answer.grounding]
    );
    return { id, rows: [asked.rows[0], answered.rows[0]] };
  });
  const conversation = await findConversation(userId, saved.id);
  return { conversation: toConversation(conversation), messages: await toMessages(userId, saved.rows) };
}

async function questionsThisMonth(userId) {
  const result = await db.query(
    `SELECT COUNT(*)::int AS n FROM chat_usage WHERE user_id = $1 AND created_at > now() - interval '30 days'`,
    [userId]
  );
  return result.rows[0].n;
}

async function recordUsage(userId, tokens) {
  await db.query('INSERT INTO chat_usage (user_id, tokens) VALUES ($1, $2)', [userId, tokens]);
}

module.exports = {
  listConversations,
  findConversation,
  getConversation,
  recentHistory,
  deleteConversation,
  saveExchange,
  questionsThisMonth,
  recordUsage,
};
