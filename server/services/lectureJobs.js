'use strict';
const fsp = require('fs/promises');
const db = require('../db/database');
const { transcribeFile } = require('./transcription');
const { buildNotes } = require('./lectureService');
const { newCard } = require('./scheduler');
const { saveChunks } = require('./lectureChunks');
const { notifyLectureFinished } = require('./reminders');
const { PROCESSING_CONCURRENCY } = require('../config/constants');

/**
 * Turns an uploaded lecture into notes and cards, in the background, a few at
 * a time.
 *
 * Success writes the transcript, notes and cards in one transaction. Failure
 * writes none of them: the lecture row is marked failed with only a reason
 * code, which is what lets Junbee truthfully say that nothing was saved. The
 * uploaded audio is deleted either way.
 */

let running = 0;
const waiting = [];

function enqueue(job) {
  waiting.push(job);
  pump();
}

function pump() {
  while (running < PROCESSING_CONCURRENCY && waiting.length) {
    const job = waiting.shift();
    running += 1;
    processLecture(job)
      .catch((err) => console.error('[lecture] unexpected job error:', err))
      .finally(() => {
        running -= 1;
        pump();
      });
  }
}

const MIN_WORDS = 40;

async function processLecture({ lectureId, userId, courseName, title, audioPath, text }) {
  let failureReason = 'processing_failed';
  try {
    let transcript;
    let durationSeconds = null;
    let unclearRanges = [];

    if (audioPath) {
      failureReason = 'transcription_failed';
      const result = await transcribeFile(audioPath, { prompt: courseName });
      transcript = result.transcript;
      durationSeconds = result.durationSeconds;
      unclearRanges = result.unclearRanges;
      if (result.speechSegments === 0) failureReason = 'no_speech';
    } else {
      transcript = text;
    }

    const words = (transcript || '').replace(/\[\d{2}:\d{2}\]|\[불명확\]/g, ' ').split(/\s+/).filter(Boolean).length;
    if (words < MIN_WORDS) {
      const err = new Error('Too little speech to make notes from (' + words + ' words)');
      err.code = failureReason === 'no_speech' ? 'NO_SPEECH' : 'TOO_SHORT';
      failureReason = failureReason === 'no_speech' ? 'no_speech' : 'too_short';
      throw err;
    }

    failureReason = 'notes_failed';
    const notes = await buildNotes({ transcript, courseName, title });

    const now = new Date();
    await db.transaction(async (tx) => {
      const updated = await tx.query(
        `UPDATE lectures
            SET status = 'ready', transcript = $1, notes = $2, duration_seconds = $3,
                unclear_ranges = $4, card_count = $5, finished_at = now(), message_dismissed = false
          WHERE id = $6 AND user_id = $7 AND status = 'processing'`,
        [transcript, JSON.stringify(notes), durationSeconds, JSON.stringify(unclearRanges), notes.cards.length, lectureId, userId]
      );
      // The lecture was deleted while it was being processed: keep nothing.
      if (!updated.rowCount) return;

      for (let i = 0; i < notes.cards.length; i += 1) {
        const state = newCard(now);
        await tx.query(
          `INSERT INTO cards (user_id, lecture_id, position, front, back, fsrs, due)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, lectureId, i, notes.cards[i].front, notes.cards[i].back, JSON.stringify(state), state.due]
        );
      }
      await saveChunks(tx, { userId, lectureId, transcript, notes });
      await supersedeMessages(tx, userId, lectureId);
    });
    await notifyLectureFinished({ userId, lectureId, title, status: 'ready', cardCount: notes.cards.length });
  } catch (err) {
    console.warn('[lecture] ' + lectureId + ' failed (' + failureReason + '):', err.message);
    await db.transaction(async (tx) => {
      const updated = await tx.query(
        `UPDATE lectures
            SET status = 'failed', failure_reason = $1, transcript = NULL, notes = NULL,
                card_count = 0, finished_at = now(), message_dismissed = false
          WHERE id = $2 AND status = 'processing'`,
        [failureReason, lectureId]
      );
      if (updated.rowCount) await supersedeMessages(tx, userId, lectureId);
    }).catch((dbErr) => console.error('[lecture] could not record failure:', dbErr.message));
    await notifyLectureFinished({ userId, lectureId, title, status: 'failed', cardCount: 0 });
  } finally {
    if (audioPath) await fsp.rm(audioPath, { force: true }).catch(() => {});
  }
}

/**
 * Junbee shows one message at a time and never brings an old one back, so a
 * new message retires every earlier one.
 */
function supersedeMessages(tx, userId, lectureId) {
  return tx.query(
    'UPDATE lectures SET message_dismissed = true WHERE user_id = $1 AND id <> $2 AND message_dismissed = false',
    [userId, lectureId]
  );
}

/**
 * A restart loses in-flight jobs. Their lectures are marked failed so the
 * student is told, instead of watching "처리 중" forever.
 */
async function failInterruptedJobs() {
  const result = await db.query(
    `UPDATE lectures SET status = 'failed', failure_reason = 'interrupted', finished_at = now()
      WHERE status = 'processing'`
  );
  if (result.rowCount) console.warn('[lecture] marked ' + result.rowCount + ' interrupted lecture(s) as failed');
}

module.exports = { enqueue, failInterruptedJobs };
