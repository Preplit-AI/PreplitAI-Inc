'use strict';
const db = require('../db/database');
const { getCourse } = require('./courseStore');
const { isUuid, cleanText } = require('../utils/http');

/**
 * What Juno can do for a student in the app's main chat, beyond looking things
 * up in their lectures: write down a deadline they mention, say what is still
 * open, and tick something off. Each thing saved is also reported to the app
 * as an action, so the list on Home and the phone's reminders follow at once.
 */

const KINDS = ['task', 'assignment', 'exam', 'study'];
const MAX_OPEN = 300;
const KOREA_OFFSET = '+09:00';
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * The date of a weekday the student named, in Korea: the first one after
 * today, or the one a week later when they said "next week". Models get this
 * arithmetic wrong ("next Friday" became a Sunday), so the server does it.
 * The time of day comes from what the model wrote, else the end of the day.
 */
function weekdayDate(weekday, followingWeek, modelValue, now = Date.now()) {
  const target = WEEKDAY_NAMES.indexOf(weekday);
  if (target < 0) return null;
  const today = new Date(now + 9 * 3600000);
  let ahead = (target - today.getUTCDay() + 7) % 7 || 7;
  if (followingWeek) ahead += 7;
  const day = new Date(today.getTime() + ahead * 86400000).toISOString().slice(0, 10);
  const time = typeof modelValue === 'string' && /[T ](\d{2}:\d{2})/.exec(modelValue);
  return parseDue(time ? `${day}T${time[1]}` : day);
}

const COMPANION_TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'save_task',
      description: '학생이 말한 과제, 시험, 마감, 해야 할 일을 저장한다. 학생이 날짜를 말했을 때만 due_at을 넣는다.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '무엇을 해야 하는지. 학생이 쓴 말에 가깝게, 짧게.' },
          kind: { type: 'string', enum: KINDS, description: 'assignment: 과제, exam: 시험이나 퀴즈, study: 공부할 것, task: 그 밖의 할 일.' },
          due_at: { type: 'string', description: '마감. 한국 시간으로 YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm. 학생이 말하지 않았으면 넣지 않는다. 학생이 요일로 말했으면 weekday도 넣는다 (날짜는 서버가 그 요일로 맞춘다).' },
          weekday: { type: 'string', enum: WEEKDAY_NAMES, description: '학생이 요일로 말했을 때 그 요일 ("Friday", "금요일" → Friday). 그렇지 않으면 넣지 않는다.' },
          following_week: { type: 'boolean', description: '학생이 "다음 주 금요일", "Friday next week"처럼 다음 주를 분명히 말했을 때만 true. "next Friday", "this Friday", "금요일"은 false.' },
          course_id: { type: 'string', description: '어느 과목의 일인지 분명할 때. list_courses가 준 id.' },
          remind_minutes: { type: 'integer', description: '마감 몇 분 전에 알릴지. 학생이 정했을 때만 넣는다.' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_tasks',
      description: '학생의 아직 끝나지 않은 할 일과 마감을 가까운 순으로 가져온다.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'complete_task',
      description: '학생이 끝냈다고 말한 할 일을 완료로 표시한다. list_tasks가 준 id를 쓴다.',
      parameters: { type: 'object', properties: { task_id: { type: 'string' } }, required: ['task_id'] },
    },
  },
];

/** A date the model wrote, read as Korea time. A date without a time means the end of that day. */
function parseDue(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const moment = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(text);
  const iso = day ? `${text}T23:59:00${KOREA_OFFSET}` : moment ? `${moment[1]}-${moment[2]}-${moment[3]}T${moment[4]}:${moment[5]}:00${KOREA_OFFSET}` : null;
  const at = iso ? Date.parse(iso) : NaN;
  if (!Number.isFinite(at) || Math.abs(at - Date.now()) > 10 * 365 * 86400000) return null;
  return new Date(at);
}

const inKorea = (date) => new Date(date.getTime() + 9 * 3600000).toISOString().slice(0, 16).replace('T', ' ');

/** With more than a day and a half to go the reminder comes the day before; otherwise two hours before. */
const defaultReminder = (due) => (due.getTime() - Date.now() > 36 * 3600000 ? 24 * 60 : 120);

const toTask = (row, courseName) => ({
  id: row.id,
  courseId: row.course_id,
  courseName: courseName || null,
  title: row.title,
  notes: row.notes || null,
  kind: row.kind,
  dueAt: row.due_at,
  priority: row.priority,
  remindMinutes: row.remind_minutes,
  done: Boolean(row.done_at),
});

const COMPANION_HANDLERS = {
  async save_task(args, context) {
    const title = cleanText(args.title, 160);
    if (!title) return { error: '무엇을 저장할지 없어요.' };
    const kind = KINDS.includes(args.kind) ? args.kind : 'task';
    let due = null;
    if (WEEKDAY_NAMES.includes(args.weekday)) {
      due = weekdayDate(args.weekday, args.following_week === true, args.due_at);
    } else if (args.due_at !== undefined && args.due_at !== null && args.due_at !== '') {
      due = parseDue(args.due_at);
      if (!due) return { error: '날짜를 읽지 못했어요. YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm으로 다시 보내 주세요.' };
    }
    const course = isUuid(args.course_id) ? await getCourse(context.userId, args.course_id) : null;
    const asked = Number.isInteger(args.remind_minutes) && args.remind_minutes >= 0 && args.remind_minutes <= 14 * 24 * 60 ? args.remind_minutes : null;
    const remind = due ? (asked ?? defaultReminder(due)) : null;

    const open = await db.query('SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND done_at IS NULL', [context.userId]);
    if (open.rows[0].n >= MAX_OPEN) return { error: '할 일이 너무 많아서 더 저장할 수 없어요.' };

    const saved = await db.query(
      `INSERT INTO tasks (user_id, course_id, title, kind, due_at, remind_minutes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [context.userId, course ? course.id : null, title, kind, due, remind]
    );
    const task = toTask(saved.rows[0], course ? course.name : null);
    context.actions.push({ type: 'task_saved', task });
    return {
      saved: true,
      title,
      course: course ? course.name : null,
      due_at: due ? `${inKorea(due)} ${WEEKDAY_NAMES[new Date(due.getTime() + 9 * 3600000).getUTCDay()]} (한국 시간)` : null,
      reminder: remind === null ? '마감이 없어서 알림은 없어요.' : `마감 ${remind >= 60 ? Math.round(remind / 60) + '시간' : remind + '분'} 전에 알려요.`,
    };
  },

  async list_tasks(args, context) {
    const rows = await db.query(
      `SELECT t.id, t.title, t.kind, t.due_at, c.name AS course FROM tasks t LEFT JOIN courses c ON c.id = t.course_id
        WHERE t.user_id = $1 AND t.done_at IS NULL ORDER BY t.due_at ASC NULLS LAST, t.created_at DESC LIMIT 30`,
      [context.userId]
    );
    return { tasks: rows.rows.map((r) => ({ id: r.id, title: r.title, kind: r.kind, course: r.course, due_at: r.due_at ? inKorea(new Date(r.due_at)) + ' (한국 시간)' : null })) };
  },

  async complete_task(args, context) {
    if (!isUuid(args.task_id)) return { error: 'list_tasks가 준 id를 보내 주세요.' };
    const done = await db.query('UPDATE tasks SET done_at = now() WHERE id = $1 AND user_id = $2 AND done_at IS NULL RETURNING *', [args.task_id, context.userId]);
    if (!done.rowCount) return { error: '그런 할 일이 없거나 이미 끝났어요.' };
    context.actions.push({ type: 'task_done', task: toTask(done.rows[0], null) });
    return { done: true, title: done.rows[0].title };
  },
};

const COMPANION_MODE = `

이 대화는 앱 한가운데에 있는 학생의 도우미 대화다. 이 대화에서만 아래 규칙이 추가되고, "강의 내용만 말한다"는 규칙보다 앞선다.
- 학생이 과제, 시험, 마감, 해야 할 일, 기억해 달라는 것을 말하면 되묻지 말고 바로 save_task로 저장한다. 오늘 날짜를 기준으로 "금요일", "내일", "다음 주 화요일" 같은 말을 실제 날짜로 바꾼다. 날짜와 요일은 위의 2주 날짜 목록에서 그대로 골라 쓰고 직접 계산하지 않는다: "this Thursday", "next Thursday", "Thursday", "목요일"은 오늘 이후 처음 오는 목요일이고, "다음 주 목요일", "Thursday next week"는 그 다음 주의 목요일이다. 요일로 말한 마감은 save_task에 weekday (다음 주를 분명히 말했으면 following_week도)를 넣는다. 저장 뒤에는 도구가 돌려준 due_at 날짜를 그대로 말한다. 날짜가 여러 뜻으로 읽히면 저장하기 전에 한 번만 묻는다. 날짜를 지어내지 않는다: 학생이 말하지 않았으면 due_at 없이 저장한다.
- 어느 과목의 일인지 분명하면 list_courses로 id를 찾아 course_id에 넣는다.
- 저장한 뒤에는 무엇을 언제로 저장했고 언제 알려 줄지 한두 문장으로만 말한다. 도구가 저장했다고 답하지 않았으면 저장했다고 말하지 않는다.
- "뭐가 남았어?", "이번 주 마감이 뭐야?" 같은 질문에는 list_tasks로 확인하고 답한다. 학생이 끝냈다고 하면 complete_task로 완료 처리한다.
- 강의 내용에 대한 질문은 원래 규칙대로 도구로 찾고 출처를 단다.
- 한국 생활, 학교 행정, 수강 신청 같은 질문에는 일반적인 정보라고 밝히고 짧게 답한다. 비자, 법, 장학금 자격처럼 틀리면 손해가 큰 것은 단정하지 않고, 학교 국제처나 출입국·외국인청처럼 결정하는 기관에서 확인하라고 말한다. 모르면 모른다고 말한다.`;

module.exports = { COMPANION_TOOL_DEFS, COMPANION_HANDLERS, COMPANION_MODE, parseDue, weekdayDate };
