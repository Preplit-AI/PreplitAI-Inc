'use strict';
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { chatLimit } = require('../middleware/rateLimit');
const { getCourse } = require('../services/courseStore');
const { getLecture } = require('../services/lectureStore');
const { getProfile } = require('../services/profileStore');
const { runChat } = require('../services/chatAgent');
const {
  listConversations,
  findConversation,
  getConversation,
  recentHistory,
  deleteConversation,
  saveExchange,
  questionsThisMonth,
  recordUsage,
} = require('../services/chatStore');
const { isUuid, fail } = require('../utils/http');
const { MONTHLY_CHAT_LIMIT, MAX_CHAT_MESSAGE_CHARS } = require('../config/constants');

const router = express.Router();
router.use(authMiddleware);

const HEARTBEAT_MS = 15000;
const FAILED_MESSAGE = '답변을 만들지 못했어요. 저장된 건 없습니다.';
const BUSY_MESSAGE = '지금 질문이 많아서 답변을 만들지 못했어요. 1분쯤 뒤에 다시 해 주세요.';

/** One answer at a time per student: a second tab would otherwise spend the budget twice. */
const answering = new Set();

// ── GET /api/chat/conversations ──────────────────────────────────────────────
router.get('/conversations', async (req, res, next) => {
  try {
    res.json({ success: true, conversations: await listConversations(req.userId) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/chat/conversations/:id ──────────────────────────────────────────
router.get('/conversations/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '대화를 찾을 수 없어요.');
    const conversation = await getConversation(req.userId, req.params.id);
    if (!conversation) return fail(res, 404, 'NotFound', '대화를 찾을 수 없어요.');
    res.json({ success: true, conversation });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/chat/conversations/:id ───────────────────────────────────────
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return fail(res, 404, 'NotFound', '대화를 찾을 수 없어요.');
    if (!(await deleteConversation(req.userId, req.params.id))) return fail(res, 404, 'NotFound', '대화를 찾을 수 없어요.');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/chat  { question, conversationId?, courseId?, lectureId?, mode? } ──
// mode "career" is the career and project conversation of the mobile app.
// Answers as a stream of server-sent events: status, delta, reset, then done or
// error. Problems found before the stream opens are ordinary JSON errors. The
// question and answer are saved only when the answer completes.
router.post('/', chatLimit, async (req, res, next) => {
  const { userId } = req;
  let holdsSlot = false;
  try {
    const { conversationId, courseId, lectureId } = req.body || {};
    const question = typeof req.body?.question === 'string' ? req.body.question.replace(/\u0000/g, '').trim() : '';
    if (!question) return fail(res, 400, 'NoQuestion', '질문을 입력해 주세요.');
    if (question.length > MAX_CHAT_MESSAGE_CHARS) {
      return fail(res, 413, 'QuestionTooLong', `질문은 ${MAX_CHAT_MESSAGE_CHARS}자까지 쓸 수 있어요.`);
    }

    let conversation = null;
    let course = null;
    if (conversationId !== undefined && conversationId !== null) {
      if (!isUuid(conversationId)) return fail(res, 404, 'NotFound', '대화를 찾을 수 없어요.');
      conversation = await findConversation(userId, conversationId);
      if (!conversation) return fail(res, 404, 'NotFound', '대화를 찾을 수 없어요.');
      // A conversation keeps the scope it started with.
      if (conversation.course_id) course = { id: conversation.course_id, name: conversation.course_name };
    } else if (courseId !== undefined && courseId !== null) {
      if (!isUuid(courseId)) return fail(res, 404, 'NoCourse', '과목을 찾을 수 없어요.');
      course = await getCourse(userId, courseId);
      if (!course) return fail(res, 404, 'NoCourse', '과목을 찾을 수 없어요.');
    }

    // What the student has open, so "this lecture" means something. Ignored if
    // it is not theirs or sits outside this conversation's course.
    let viewing = null;
    if (isUuid(lectureId)) {
      const lecture = await getLecture(userId, lectureId);
      if (lecture && lecture.status === 'ready' && (!course || lecture.courseId === course.id)) {
        viewing = { id: lecture.id, title: lecture.title, courseName: lecture.courseName };
      }
    }

    if ((await questionsThisMonth(userId)) >= MONTHLY_CHAT_LIMIT) {
      return fail(res, 429, 'MonthlyLimit', `30일 동안 질문 ${MONTHLY_CHAT_LIMIT}개까지 할 수 있어요.`);
    }
    if (answering.has(userId)) return fail(res, 409, 'Busy', '지금 답변 중인 질문이 끝나면 다시 해 주세요.');
    answering.add(userId);
    holdsSlot = true;

    const history = conversation ? await recentHistory(userId, conversation.id) : [];
    // What the student told Juno at onboarding: who they are and the language to explain in.
    const profile = await getProfile(userId);
    const mode = req.body.mode === 'career' ? 'career' : req.body.mode === 'companion' ? 'companion' : null;

    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableFinished) abort.abort();
    });

    res.status(200);
    res.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      // Tells nginx and similar proxies not to hold the stream back.
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

    let finished = null;
    let failed = false;
    try {
      const events = runChat({
        userId,
        courseId: course ? course.id : null,
        courseName: course ? course.name : null,
        viewing,
        profile,
        mode,
        history,
        question,
        signal: abort.signal,
      });
      for await (const event of events) {
        if (abort.signal.aborted) break;
        if (event.type === 'done') finished = event;
        else if (event.type === 'status') send('status', { tool: event.tool });
        else if (event.type === 'delta') send('delta', { text: event.text });
        else if (event.type === 'reset') send('reset', {});
        else if (event.type === 'action') send('action', event.action);
      }
      if (finished && !abort.signal.aborted) {
        const saved = await saveExchange(userId, {
          conversationId: conversation ? conversation.id : null,
          courseId: course ? course.id : null,
          question,
          answer: finished,
        });
        send('done', saved);
      }
    } catch (err) {
      if (!abort.signal.aborted) {
        failed = true;
        console.warn('[chat] answer failed (' + (err.code || 'error') + '):', err.message);
        send('error', { error: 'AnswerFailed', message: err.code === 'LLM_BUSY' ? BUSY_MESSAGE : FAILED_MESSAGE });
      }
    } finally {
      clearInterval(heartbeat);
      // A cancelled answer still spent model time. One the provider failed did not.
      if (!failed) await recordUsage(userId, finished ? finished.tokens : 0).catch((err) => console.error('[chat] could not record usage:', err.message));
      res.end();
    }
  } catch (err) {
    if (res.headersSent) {
      console.error('[chat]', err.stack || err.message);
      res.end();
    } else {
      next(err);
    }
  } finally {
    if (holdsSlot) answering.delete(userId);
  }
});

module.exports = router;
