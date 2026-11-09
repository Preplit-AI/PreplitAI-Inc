'use strict';
const { semesterOverview } = require('./semesterStore');
const { isEnabled, subscribersList, sendToUser } = require('./pushService');

/**
 * What the bee sends to a student's phone, checked every few minutes.
 *
 * The rules are the same as on the screen: counted facts only, no praise and no
 * guilt, and no message for not studying. Nothing goes out at night. At most one
 * reminder per student per check, and each one only once.
 */

const CHECK_EVERY_MS = 5 * 60 * 1000;
const QUIET_BEFORE_HOUR = 8;
const QUIET_FROM_HOUR = 22;
const EXAM_REMINDER_DAYS = [14, 7, 3, 1];
const EXAM_LABELS = { midterm: '중간고사', final: '기말고사' };

const kstHour = (date) => new Date(date.getTime() + 9 * 60 * 60 * 1000).getUTCHours();

/** The reminders due at this hour, most time-critical first. Pure, so the rules can be tested directly. */
function remindersFor(overview, hour) {
  if (hour < QUIET_BEFORE_HOUR || hour >= QUIET_FROM_HOUR) return [];
  const reminders = [];

  const classes = overview.classToday.filter((c) => !c.recordedToday);
  if (classes.length) {
    reminders.push({
      key: `class:${overview.today}`,
      body: `오늘 ${classes.map((c) => c.courseName).join(', ')} 수업이 있어요. 수업이 시작되면 녹음을 눌러 주세요.`,
      url: '/workspace',
    });
  }

  if (hour >= 9) {
    for (const exam of overview.exams) {
      if (!EXAM_REMINDER_DAYS.includes(exam.days)) continue;
      const hints = exam.flagged ? ` 시험에 나온다고 한 부분 ${exam.flagged}개가 모여 있어요.` : '';
      reminders.push({
        key: `exam:${exam.courseId}:${exam.exam}:${exam.days}`,
        body: `${exam.courseName} ${EXAM_LABELS[exam.exam]}까지 ${exam.days}일 남았어요.${hints}`,
        url: `/workspace/courses/${exam.courseId}`,
      });
    }
  }

  if (hour >= 20 && overview.review.due > 0) {
    reminders.push({ key: `cards:${overview.today}`, body: `오늘 카드 ${overview.review.due}장이에요.`, url: '/app/remember' });
  }
  return reminders;
}

async function runReminders(now = new Date()) {
  const hour = kstHour(now);
  if (hour < QUIET_BEFORE_HOUR || hour >= QUIET_FROM_HOUR) return 0;
  let sent = 0;
  for (const userId of await subscribersList()) {
    try {
      const overview = await semesterOverview(userId);
      for (const reminder of remindersFor(overview, hour)) {
        if (await sendToUser(userId, { body: reminder.body, url: reminder.url }, reminder.key)) {
          sent += 1;
          break;
        }
      }
    } catch (err) {
      console.warn('[reminders] skipped a student:', err.message);
    }
  }
  return sent;
}

/** Tells a student their notes are ready the moment they are, even with the app closed. */
async function notifyLectureFinished({ userId, lectureId, title, status, cardCount }) {
  const ready = status === 'ready';
  await sendToUser(userId, {
    body: ready ? `${title} 노트 정리했어요. 카드 ${cardCount}장.` : `‘${title}’ 녹음은 노트로 만들지 못했어요. 기기에 녹음이 남아 있으면 다시 만들 수 있어요.`,
    url: ready ? `/app/learn/${lectureId}` : '/workspace',
  });
}

function startReminders() {
  if (!isEnabled()) {
    console.log('[reminders] off: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to send phone notifications.');
    return null;
  }
  const timer = setInterval(() => {
    runReminders().catch((err) => console.warn('[reminders] check failed:', err.message));
  }, CHECK_EVERY_MS);
  timer.unref();
  return timer;
}

module.exports = { remindersFor, runReminders, notifyLectureFinished, startReminders };
