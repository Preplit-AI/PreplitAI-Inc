'use strict';
const db = require('../db/database');
const { listCourses, getCourse } = require('./courseStore');
const { currentJunbeeMessage } = require('./lectureStore');
const { reviewToday } = require('./reviewStore');

/**
 * The semester as the bee sees it: which week it is, what has been recorded,
 * what is coming, and the one thing worth saying right now.
 *
 * Everything here is counted from what the student did or told us. Dates are
 * never guessed: with no exam date there is no countdown. A week before a
 * student's first recording is simply not theirs yet, so joining mid-semester
 * shows no wall of missed weeks. A gap is a week since then with nothing in it.
 *
 * Days are Korean days, where the pilot runs.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_MS = 9 * 60 * 60 * 1000;
/** How close an exam has to be before the bee starts talking about it. */
const EXAM_SOON_DAYS = 14;

const kstDate = (date = new Date()) => new Date(date.getTime() + KST_MS).toISOString().slice(0, 10);
const toUtc = (iso) => Date.parse(`${iso}T00:00:00Z`);
const daysBetween = (from, to) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
const addDays = (iso, days) => new Date(toUtc(iso) + days * DAY_MS).toISOString().slice(0, 10);
const dayOfWeek = (iso) => new Date(toUtc(iso)).getUTCDay();
const mondayOf = (iso) => addDays(iso, -((dayOfWeek(iso) + 6) % 7));

/** Weeks run Monday to Sunday, and week 1 is the one the semester starts in. */
const weekOf = (startsOn, iso) => Math.floor(daysBetween(mondayOf(startsOn), iso) / 7) + 1;

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = toUtc(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

/** @returns sorted unique days 0 (Sunday) to 6 (Saturday), or null if anything else was sent. */
function cleanClassDays(value) {
  if (!Array.isArray(value) || value.length > 7) return null;
  if (!value.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)) return null;
  return [...new Set(value)].sort((a, b) => a - b);
}

function semesterName(startsOn) {
  const [year, month] = startsOn.split('-').map(Number);
  return `${year}년 ${month >= 2 && month <= 7 ? 1 : 2}학기`;
}

function toSemester(row, today) {
  return { id: row.id, name: row.name, startsOn: row.starts_on, weeks: row.weeks, currentWeek: weekOf(row.starts_on, today) };
}

async function currentSemester(userId, today = kstDate()) {
  const result = await db.query(
    `SELECT id, name, to_char(starts_on, 'YYYY-MM-DD') AS starts_on, weeks
       FROM semesters WHERE user_id = $1 ORDER BY starts_on DESC, created_at DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? toSemester(result.rows[0], today) : null;
}

/** Corrects the current semester, or starts a new one when `fresh` or there is none yet. */
async function saveSemester(userId, { startsOn, weeks = 16, fresh = false }) {
  const existing = fresh ? null : await currentSemester(userId);
  const name = semesterName(startsOn);
  if (existing) {
    await db.query('UPDATE semesters SET name = $1, starts_on = $2::date, weeks = $3 WHERE id = $4 AND user_id = $5', [name, startsOn, weeks, existing.id, userId]);
  } else {
    await db.query('INSERT INTO semesters (user_id, name, starts_on, weeks) VALUES ($1, $2, $3::date, $4)', [userId, name, startsOn, weeks]);
  }
  return currentSemester(userId);
}

/** The title a lecture gets when nobody typed one: its week, or a date before a semester is set. */
async function titleForRecording(userId, courseId, recordedAt) {
  const date = kstDate(recordedAt);
  const semester = await currentSemester(userId);
  const week = semester ? weekOf(semester.startsOn, date) : 0;
  if (!semester || week < 1 || week > semester.weeks) {
    const [, month, day] = date.split('-').map(Number);
    return `${month}월 ${day}일 강의`;
  }
  const monday = mondayOf(semester.startsOn);
  const from = new Date(toUtc(addDays(monday, (week - 1) * 7)) - KST_MS);
  const to = new Date(from.getTime() + 7 * DAY_MS);
  const others = await db.query(
    `SELECT COUNT(*)::int AS n FROM lectures
      WHERE user_id = $1 AND course_id = $2 AND status <> 'failed'
        AND COALESCE(recorded_at, created_at) >= $3 AND COALESCE(recorded_at, created_at) < $4`,
    [userId, courseId, from, to]
  );
  return others.rows[0].n ? `${week}주차 ${others.rows[0].n + 1}` : `${week}주차`;
}

async function lecturesOf(userId) {
  const result = await db.query(
    `SELECT l.id, l.course_id, c.name AS course_name, l.title, l.notes->>'title' AS topic, l.status, l.card_count,
            COALESCE(l.recorded_at, l.created_at) AS happened_at,
            COALESCE(jsonb_array_length(l.notes->'flagged'), 0)::int AS flagged_count
       FROM lectures l JOIN courses c ON c.id = l.course_id
      WHERE l.user_id = $1 AND l.status <> 'failed'
      ORDER BY happened_at`,
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    topic: row.topic,
    status: row.status,
    cardCount: row.card_count,
    flaggedCount: row.flagged_count,
    on: kstDate(new Date(row.happened_at)),
    recordedAt: row.happened_at,
  }));
}

async function cardCounts(userId) {
  const due = await db.query(
    `SELECT l.course_id, COUNT(*) FILTER (WHERE c.due <= now())::int AS due, COUNT(*)::int AS total
       FROM cards c JOIN lectures l ON l.id = c.lecture_id
      WHERE c.user_id = $1 AND l.status = 'ready'
      GROUP BY l.course_id`,
    [userId]
  );
  // A hard card is one the student last rated 다시 or 어려움.
  const hard = await db.query(
    `SELECT l.course_id, COUNT(*)::int AS n
       FROM cards c
       JOIN lectures l ON l.id = c.lecture_id
       JOIN LATERAL (SELECT r.rating FROM review_logs r WHERE r.card_id = c.id ORDER BY r.reviewed_at DESC LIMIT 1) last ON true
      WHERE c.user_id = $1 AND last.rating <= 2
      GROUP BY l.course_id`,
    [userId]
  );
  const counts = new Map();
  const entry = (id) => {
    if (!counts.has(id)) counts.set(id, { due: 0, total: 0, hard: 0 });
    return counts.get(id);
  };
  for (const row of due.rows) Object.assign(entry(row.course_id), { due: row.due, total: row.total });
  for (const row of hard.rows) entry(row.course_id).hard = row.n;
  return counts;
}

function nextExam(course, today) {
  const exams = [
    { kind: 'midterm', on: course.midtermOn },
    { kind: 'final', on: course.finalOn },
  ].filter((exam) => exam.on && exam.on >= today);
  exams.sort((a, b) => (a.on < b.on ? -1 : 1));
  return exams[0] ? { ...exams[0], days: daysBetween(today, exams[0].on) } : null;
}

/** One course's weeks, each with its lectures and what state it is in. */
function courseCells(course, lectures, semester) {
  const weekly = new Map();
  for (const lecture of lectures) {
    const week = weekOf(semester.startsOn, lecture.on);
    if (week < 1 || week > semester.weeks) continue;
    if (!weekly.has(week)) weekly.set(week, []);
    weekly.get(week).push({ ...lecture, week });
  }
  const firstWeek = weekly.size ? Math.min(...weekly.keys()) : null;
  const examIn = (week) => {
    if (course.midtermOn && weekOf(semester.startsOn, course.midtermOn) === week) return 'midterm';
    if (course.finalOn && weekOf(semester.startsOn, course.finalOn) === week) return 'final';
    return null;
  };
  const cells = [];
  for (let week = 1; week <= semester.weeks; week += 1) {
    const inWeek = weekly.get(week) || [];
    const exam = examIn(week);
    let state = 'future';
    if (inWeek.some((l) => l.status === 'ready')) state = 'done';
    else if (inWeek.length) state = 'processing';
    else if (week === semester.currentWeek) state = 'now';
    else if (week < semester.currentWeek) state = firstWeek !== null && week > firstWeek && !exam ? 'gap' : 'past';
    cells.push({ week, state, exam, lectures: inWeek, missing: state === 'gap' ? [course.name] : [] });
  }
  return cells;
}

/** The semester as a whole: a week is filled if anything was recorded in it. */
function mergeCells(perCourse, semester) {
  const cells = [];
  for (let week = 1; week <= semester.weeks; week += 1) {
    const here = perCourse.map((cells_) => cells_[week - 1]);
    const lectures = here.flatMap((cell) => cell.lectures);
    const missing = here.flatMap((cell) => cell.missing);
    let state = week === semester.currentWeek ? 'now' : week < semester.currentWeek ? 'past' : 'future';
    if (lectures.some((l) => l.status === 'ready')) state = 'done';
    else if (lectures.length) state = 'processing';
    else if (missing.length) state = 'gap';
    cells.push({ week, state, exam: (here.find((cell) => cell.exam) || {}).exam || null, lectures, missing });
  }
  return cells;
}

/**
 * Decides the one thing the bee says. Most urgent first: what just happened to
 * a lecture, then a class that can only be recorded today, then an exam, then
 * today's cards. The wording lives in the client; this only picks which applies
 * and supplies the counted facts.
 */
function chooseMessage(facts) {
  if (!facts.hasCourses) return { kind: 'first-course' };
  if (facts.processing) return { kind: 'processing', lectureId: facts.processing.id, courseName: facts.processing.courseName, title: facts.processing.title };
  if (facts.junbee) return { kind: 'lecture', message: facts.junbee };
  if (!facts.semester) return { kind: 'setup' };

  const unrecorded = facts.classToday.find((c) => !c.recordedToday);
  if (unrecorded) return { kind: 'class-today', courseId: unrecorded.courseId, courseName: unrecorded.courseName };

  if (facts.semester.currentWeek > facts.semester.weeks) {
    return { kind: 'semester-over', lectures: facts.totals.lectures, cards: facts.totals.cards };
  }
  const exam = facts.exams.filter((e) => e.days <= EXAM_SOON_DAYS).sort((a, b) => a.days - b.days)[0];
  if (exam) return { kind: 'exam-soon', ...exam };
  if (facts.review.due > 0) return { kind: 'cards-due', count: facts.review.due };
  if (facts.review.done > 0) return { kind: 'cards-finished', count: facts.review.done };
  return { kind: 'quiet' };
}

async function semesterOverview(userId, { since, today = kstDate() } = {}) {
  const [semester, courses, lectures, counts, junbee, review] = await Promise.all([
    currentSemester(userId, today),
    listCourses(userId),
    lecturesOf(userId),
    cardCounts(userId),
    currentJunbeeMessage(userId),
    reviewToday(userId, since),
  ]);

  const summaries = courses.map((course) => {
    const own = lectures.filter((l) => l.courseId === course.id);
    const cells = semester ? courseCells(course, own, semester) : [];
    const card = counts.get(course.id) || { due: 0, total: 0, hard: 0 };
    const ready = own.filter((l) => l.status === 'ready');
    return {
      ...course,
      cells,
      nextExam: nextExam(course, today),
      flaggedCount: own.reduce((sum, l) => sum + l.flaggedCount, 0),
      dueCards: card.due,
      totalCards: card.total,
      hardCards: card.hard,
      gaps: cells.filter((cell) => cell.state === 'gap').map((cell) => cell.week),
      lastLecture: ready.length ? ready[ready.length - 1] : null,
      classToday: course.classDays.includes(dayOfWeek(today)),
      recordedToday: own.some((l) => l.on === today),
    };
  });

  const processing = lectures.filter((l) => l.status === 'processing').pop() || null;
  const readyLectures = lectures.filter((l) => l.status === 'ready');
  const exams = summaries
    .filter((c) => c.nextExam)
    .map((c) => ({
      courseId: c.id,
      courseName: c.name,
      exam: c.nextExam.kind,
      on: c.nextExam.on,
      days: c.nextExam.days,
      flagged: c.flaggedCount,
      hard: c.hardCards,
      gaps: c.gaps,
    }));
  const classToday = summaries
    .filter((c) => c.classToday)
    .map((c) => ({ courseId: c.id, courseName: c.name, recordedToday: c.recordedToday }));
  const reviewCounts = { due: review.cards.length, done: review.done };
  const totals = {
    lectures: readyLectures.length,
    cards: summaries.reduce((sum, c) => sum + c.totalCards, 0),
  };

  return {
    today,
    semester,
    cells: semester ? mergeCells(summaries.map((c) => c.cells), semester) : [],
    courses: summaries,
    classToday,
    exams: exams.sort((a, b) => a.days - b.days),
    review: reviewCounts,
    latestNote: readyLectures.length ? readyLectures[readyLectures.length - 1] : null,
    processing: Boolean(processing),
    message: chooseMessage({
      hasCourses: courses.length > 0,
      junbee,
      processing,
      semester,
      classToday,
      exams,
      review: reviewCounts,
      totals,
    }),
  };
}

/** Everything about one course in one place. @returns null if this student has no such course. */
async function courseWorkspace(userId, courseId, { today = kstDate() } = {}) {
  const course = await getCourse(userId, courseId);
  if (!course) return null;
  const overview = await semesterOverview(userId, { today });
  const summary = overview.courses.find((c) => c.id === courseId);

  const rows = await db.query(
    `SELECT l.id, l.title, l.notes->'flagged' AS flagged, COALESCE(l.recorded_at, l.created_at) AS happened_at
       FROM lectures l
      WHERE l.user_id = $1 AND l.course_id = $2 AND l.status = 'ready'
        AND COALESCE(jsonb_array_length(l.notes->'flagged'), 0) > 0
      ORDER BY happened_at DESC`,
    [userId, courseId]
  );
  const flagged = rows.rows.flatMap((row) =>
    row.flagged.map((item) => ({
      note: item.note,
      quote: item.quote,
      at: item.at,
      lectureId: row.id,
      lectureTitle: row.title,
    }))
  );

  const lectures = await lecturesOf(userId);
  return {
    today,
    semester: overview.semester,
    course: summary,
    flagged,
    lectures: lectures
      .filter((l) => l.courseId === courseId)
      .map((l) => ({ ...l, week: overview.semester ? weekOf(overview.semester.startsOn, l.on) : null }))
      .reverse(),
  };
}

module.exports = {
  kstDate,
  weekOf,
  addDays,
  isDate,
  cleanClassDays,
  semesterName,
  currentSemester,
  saveSemester,
  titleForRecording,
  chooseMessage,
  semesterOverview,
  courseWorkspace,
};
