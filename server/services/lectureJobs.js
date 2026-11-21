'use strict';
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const db = require('../db/database');
const { transcribeFile } = require('./transcription');
const { buildNotes, translateTranscript } = require('./lectureService');
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
 * code, which is what lets Juno truthfully say that nothing was saved. The
 * uploaded audio is deleted either way.
 */

let running = 0;
const waiting = [];

/** @returns a promise that settles when this lecture has been processed (or has failed and been recorded). */
function enqueue(job) {
  return new Promise((resolve) => {
    waiting.push({ ...job, settled: resolve });
    pump();
  });
}

function pump() {
  while (running < PROCESSING_CONCURRENCY && waiting.length) {
    const job = waiting.shift();
    running += 1;
    processLecture(job)
      .catch((err) => console.error('[lecture] unexpected job error:', err))
      .finally(() => {
        running -= 1;
        job.settled();
        pump();
      });
  }
}

const MIN_WORDS = 40;

async function processLecture({ lectureId, userId, courseName, courseLanguage = null, title, audioPath, uploadId = null, text, language = null, durationSeconds: knownSeconds = null }) {
  let failureReason = 'processing_failed';
  try {
    let transcript;
    let durationSeconds = null;
    let unclearRanges = [];
    let english = null;

    if (uploadId) {
      failureReason = 'upload_failed';
      audioPath = await rebuildRecording(uploadId);
    }

    if (audioPath) {
      failureReason = 'transcription_failed';
      const result = await transcribeFile(audioPath, { prompt: courseName, language: courseLanguage, translate: true });
      transcript = result.transcript;
      durationSeconds = result.durationSeconds || knownSeconds;
      unclearRanges = result.unclearRanges;
      english = result.english;
      if (result.speechSegments === 0) failureReason = 'no_speech';
    } else {
      transcript = text;
      // A class that was listened to live: its length is known though there is no file.
      durationSeconds = knownSeconds;
    }

    const words = (transcript || '').replace(/\[\d{2}:\d{2}\]|\[불명확\]/g, ' ').split(/\s+/).filter(Boolean).length;
    if (words < MIN_WORDS) {
      const err = new Error('Too little speech to make notes from (' + words + ' words)');
      err.code = failureReason === 'no_speech' ? 'NO_SPEECH' : 'TOO_SHORT';
      failureReason = failureReason === 'no_speech' ? 'no_speech' : 'too_short';
      throw err;
    }

    failureReason = 'notes_failed';
    const notes = await buildNotes({ transcript, courseName, title, language });
    // A recording's notes end with the whole class in English.
    if (audioPath) notes.englishTranscript = english || (await translateTranscript(transcript));

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
 * Puts an uploaded recording's slices back together as one file, one slice in
 * memory at a time, then deletes the slices: the file on disk is all that is
 * left, and it is deleted when the lecture is done.
 */
async function rebuildRecording(uploadId) {
  const upload = (await db.query('SELECT ext, parts FROM recording_uploads WHERE id = $1', [uploadId])).rows[0];
  if (!upload) throw new Error('Recording upload ' + uploadId + ' is gone');
  const filePath = path.join(os.tmpdir(), 'preplit-recording-' + crypto.randomBytes(8).toString('hex') + upload.ext);
  const out = fs.createWriteStream(filePath);
  const done = new Promise((resolve, reject) => { out.on('finish', resolve); out.on('error', reject); });
  try {
    for (let n = 0; n < upload.parts; n += 1) {
      const row = (await db.query('SELECT bytes FROM recording_parts WHERE upload_id = $1 AND part = $2', [uploadId, n])).rows[0];
      if (!row) throw new Error('Recording upload ' + uploadId + ' is missing slice ' + n);
      if (!out.write(Buffer.from(row.bytes))) await new Promise((resolve) => out.once('drain', resolve));
    }
    out.end();
    await done;
  } catch (err) {
    out.destroy();
    await fsp.rm(filePath, { force: true }).catch(() => {});
    throw err;
  }
  await db.query('DELETE FROM recording_uploads WHERE id = $1', [uploadId]);
  return filePath;
}

/**
 * Juno shows one message at a time and never brings an old one back, so a
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
/**
 * On a serverless host there is no restart to notice: a lecture whose function
 * was cut off would say "processing" for ever. One still processing after
 * fifteen minutes is recorded as failed the next time its student looks.
 */
async function failStalledJobs(userId) {
  await db.query(
    `UPDATE lectures SET status = 'failed', failure_reason = 'interrupted', finished_at = now(), message_dismissed = false
      WHERE user_id = $1 AND status = 'processing' AND created_at < now() - interval '15 minutes'`,
    [userId]
  );
}

// At start-up. Only lectures past the 15-minute limit: a younger one may still be
// running on another instance sharing the database (Vercel and Coolify during a
// move, or the old container during a redeploy). One this server was running
// when it stopped is failed by failStalledJobs once it passes the limit.
async function failInterruptedJobs() {
  const result = await db.query(
    `UPDATE lectures SET status = 'failed', failure_reason = 'interrupted', finished_at = now()
      WHERE status = 'processing' AND created_at < now() - interval '15 minutes'`
  );
  if (result.rowCount) console.warn('[lecture] marked ' + result.rowCount + ' interrupted lecture(s) as failed');
}

module.exports = { enqueue, failInterruptedJobs, failStalledJobs, rebuildRecording };
