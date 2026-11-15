'use strict';
const { listCourses } = require('./courseStore');
const { listLectures, getLecture } = require('./lectureStore');
const { reviewToday } = require('./reviewStore');
const { searchChunks, noteChunksFor, flaggedChunks, chunkAt, formatAt } = require('./lectureChunks');
const { semesterOverview } = require('./semesterStore');
const { isUuid } = require('../utils/http');
const { COMPANION_HANDLERS } = require('./companionTools');

/**
 * What Juno can do in the workspace. This is how features connect to the bot:
 * each tool is a thin wrapper over the same service the HTTP routes use.
 *
 * Three limits are enforced here rather than asked of the model:
 *
 * - No tool takes a student id. It comes from the signed-in session, so nothing
 *   in a question or a transcript can point a tool at someone else's data.
 * - Every tool only reads. Whatever a transcript might try to instruct, there
 *   is nothing here that can delete, change or rate anything.
 * - A conversation limited to one course stays limited, whatever the model asks.
 */

const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'search_lectures',
      description: '학생이 올린 강의의 녹취록과 노트에서 관련 부분을 찾는다. 강의 내용에 관한 질문에는 답하기 전에 반드시 호출한다. 결과가 없으면 다른 표현으로 한 번 더 호출한다.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '찾을 주제어. 문장이 아니라 강의에서 쓰였을 단어로. 예: "교착 상태 조건". "시험", "교수님" 같은 말은 넣지 않는다.' },
          lecture_id: { type: 'string', description: '특정 강의에서만 찾을 때. list_lectures가 준 id.' },
          course_id: { type: 'string', description: '특정 과목에서만 찾을 때. list_courses가 준 id.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_exam_flags',
      description: '교수가 시험에 나온다고 말한 부분을 모아서 가져온다. "시험에 뭐 나와?" 같은 질문에 쓴다.',
      parameters: {
        type: 'object',
        properties: { course_id: { type: 'string', description: '특정 과목으로 좁힐 때. list_courses가 준 id.' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lecture_notes',
      description: '강의 하나의 요약과 노트 전체를 가져온다. 강의를 요약하거나 정리해 달라는 질문에 쓴다.',
      parameters: {
        type: 'object',
        properties: { lecture_id: { type: 'string', description: 'list_lectures가 준 id.' } },
        required: ['lecture_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_transcript_at',
      description: '강의의 특정 시간에 교수가 한 말을 녹취록에서 가져온다. "12분쯤에 뭐라고 했어?" 같은 질문에 쓴다.',
      parameters: {
        type: 'object',
        properties: {
          lecture_id: { type: 'string', description: 'list_lectures가 준 id.' },
          time: { type: 'string', description: '녹음 시작부터의 시간. mm:ss 형식. 예: "12:40".' },
        },
        required: ['lecture_id', 'time'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_courses',
      description: '학생의 과목 목록을 가져온다.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_lectures',
      description: '학생이 올린 강의 목록을 최신순으로 가져온다. "9주차"처럼 강의를 가리키는 말을 id로 바꿀 때도 쓴다.',
      parameters: {
        type: 'object',
        properties: { course_id: { type: 'string', description: '특정 과목으로 좁힐 때. list_courses가 준 id.' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_review_status',
      description: '오늘 복습할 카드가 몇 장 남았고 몇 장 끝냈는지 가져온다.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_semester_status',
      description: '이번 학기가 몇 주차인지, 과목별 시험까지 며칠 남았는지, 시험 힌트와 어려운 카드가 몇 개인지, 녹음이 빠진 주가 언제인지 가져온다.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

/** Tools whose results are lecture content, which an answer should cite. */
const KNOWLEDGE_TOOLS = new Set(['search_lectures', 'get_exam_flags', 'get_lecture_notes', 'get_transcript_at']);

/**
 * Two failed searches are enough to say a topic is not in the lectures. Every
 * further attempt costs a full model call and never changes the answer.
 */
const MAX_EMPTY_SEARCHES = 2;

/** Sent with lecture text, because a reminder right beside it holds better than one in the system prompt. */
const REMINDER = 'text에 있는 내용만 쓰고 아무것도 덧붙이지 않는다. 모든 문장을 해요체(~해요, ~이에요)로 끝낸다. text가 합니다체여도 답은 해요체로 바꿔 쓴다. 출처는 [S1]처럼 표시한다.';

const KIND_LABELS = { transcript: '녹취록', summary: '노트 요약', section: '노트', flagged: '시험 언급' };
const MAX_RESULT_CHARS = 12000;

/** Numbers each cited piece once per answer: S1, S2, and so on. */
function createSources() {
  const labels = new Map();
  return {
    add(chunkId) {
      if (!labels.has(chunkId)) labels.set(chunkId, `S${labels.size + 1}`);
      return labels.get(chunkId);
    },
    chunkIdFor(label) {
      for (const [chunkId, known] of labels) if (known === label) return chunkId;
      return null;
    },
  };
}

function present(rows, sources) {
  const results = [];
  let size = 0;
  for (const row of rows) {
    if (size + row.content.length > MAX_RESULT_CHARS) break;
    size += row.content.length;
    results.push({
      source: sources.add(row.id),
      course: row.course_name,
      lecture: row.lecture_title,
      kind: KIND_LABELS[row.kind],
      at: formatAt(row.start_seconds),
      text: row.content,
    });
  }
  return results;
}

const optionalId = (value) => (isUuid(value) ? value : null);

const HANDLERS = {
  async search_lectures(args, context) {
    const { userId, courseId, sources } = context;
    const query = typeof args.query === 'string' ? args.query.slice(0, 300) : '';
    if (!query.trim()) return { error: '찾을 단어가 없어요.' };
    const rows = await searchChunks(userId, {
      query,
      courseId: courseId || optionalId(args.course_id),
      lectureId: optionalId(args.lecture_id),
    });
    if (!rows.length) {
      context.emptySearches = (context.emptySearches || 0) + 1;
      return {
        results: [],
        note: context.emptySearches >= MAX_EMPTY_SEARCHES
          ? '다른 표현으로도 찾지 못했어요. 올린 강의에 없는 내용이에요. 더 찾지 말고 답하세요.'
          : '이 말로는 찾지 못했어요. 다른 표현이나 영어, 한국어로 한 번 더 찾아보세요.',
      };
    }
    return { results: present(rows, sources) };
  },

  async get_transcript_at(args, { userId, courseId, sources }) {
    const match = typeof args.time === 'string' ? args.time.match(/^(\d{1,3}):(\d{2})/) : null;
    if (!match) return { error: '시간은 mm:ss 형식으로 주세요.' };
    if (!isUuid(args.lecture_id)) return { error: '그 강의를 찾을 수 없어요.' };
    const lecture = await getLecture(userId, args.lecture_id);
    if (!lecture || lecture.status !== 'ready' || (courseId && lecture.courseId !== courseId)) return { error: '그 강의를 찾을 수 없어요.' };
    const row = await chunkAt(userId, lecture.id, Number(match[1]) * 60 + Number(match[2]));
    if (!row) return { results: [], note: '이 강의에는 시간이 표시된 녹취록이 없어요.' };
    return { results: present([row], sources) };
  },

  async get_exam_flags(args, { userId, courseId, sources }) {
    const rows = await flaggedChunks(userId, { courseId: courseId || optionalId(args.course_id) });
    if (!rows.length) return { results: [], note: '교수가 시험을 언급한 부분을 찾지 못했어요.' };
    return {
      results: present(rows, sources),
      note: '학생이 특정 내용이 시험에 나오는지 물었는데 그 내용이 이 목록에 없으면, 먼저 "교수님이 그 부분이 시험에 나온다고 말한 곳은 없어요."라고 답한 뒤에 목록을 알려 준다.',
    };
  },

  async get_lecture_notes(args, { userId, courseId, sources }) {
    const notFound = { error: '그 강의를 찾을 수 없어요.' };
    if (!isUuid(args.lecture_id)) return notFound;
    const lecture = await getLecture(userId, args.lecture_id);
    if (!lecture || lecture.status !== 'ready') return notFound;
    if (courseId && lecture.courseId !== courseId) return notFound;
    return {
      lecture: lecture.title,
      course: lecture.courseName,
      unclear_minutes: lecture.unclearRanges.map((r) => `${Math.floor(r.start / 60)}~${Math.ceil(r.end / 60)}`),
      results: present(await noteChunksFor(userId, lecture.id), sources),
    };
  },

  async list_courses(args, { userId, courseId }) {
    const courses = await listCourses(userId);
    return {
      courses: courses
        .filter((c) => !courseId || c.id === courseId)
        .map((c) => ({ id: c.id, name: c.name, lectures: c.lectureCount })),
    };
  },

  async list_lectures(args, { userId, courseId }) {
    const lectures = await listLectures(userId, { courseId: courseId || optionalId(args.course_id) });
    return {
      lectures: lectures.slice(0, 50).map((l) => ({
        id: l.id,
        title: l.title,
        topic: l.topic,
        course: l.courseName,
        status: l.status === 'ready' ? '완료' : '처리 중',
        date: new Date(l.createdAt).toISOString().slice(0, 10),
      })),
    };
  },

  async get_review_status(args, { userId }) {
    const today = await reviewToday(userId);
    return { due_now: today.cards.length, done_today: today.done };
  },

  async get_semester_status(args, { userId, courseId }) {
    const overview = await semesterOverview(userId);
    const courses = overview.courses
      .filter((c) => !courseId || c.id === courseId)
      .map((c) => ({
        name: c.name,
        next_exam: c.nextExam ? { exam: c.nextExam.kind === 'midterm' ? '중간고사' : '기말고사', date: c.nextExam.on, days_left: c.nextExam.days } : null,
        lectures: c.lectureCount,
        exam_hints: c.flaggedCount,
        hard_cards: c.hardCards,
        weeks_without_recording: c.gaps,
      }));
    if (!overview.semester) return { note: '학기 시작일이 아직 없어요.', courses };
    return {
      semester: overview.semester.name,
      current_week: overview.semester.currentWeek,
      total_weeks: overview.semester.weeks,
      courses,
    };
  },
};

/**
 * Runs one tool call and returns the text for the model. A bad call from the
 * model becomes an error it can read and correct. A failure in our own code
 * throws and fails the answer, so the model never answers around missing data.
 */
async function runTool(call, context) {
  const own = (set) => (Object.prototype.hasOwnProperty.call(set, call.name) ? set[call.name] : null);
  // The companion's tools exist only in the app's main chat.
  const handler = own(HANDLERS) || (context.companion ? own(COMPANION_HANDLERS) : null);
  if (!handler) return JSON.stringify({ error: '없는 도구예요.' });
  let args;
  try {
    args = call.arguments ? JSON.parse(call.arguments) : {};
  } catch {
    return JSON.stringify({ error: '인자를 읽지 못했어요.' });
  }
  if (!args || typeof args !== 'object' || Array.isArray(args)) args = {};
  const result = await handler(args, context);
  return JSON.stringify(result.results && result.results.length ? { ...result, reminder: REMINDER } : result);
}

module.exports = { TOOL_DEFS, KNOWLEDGE_TOOLS, MAX_EMPTY_SEARCHES, createSources, runTool };
