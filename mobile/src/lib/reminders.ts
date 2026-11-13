import type { Task } from "./types";

/*
 * When a reminder should reach the student. No device, no clock of its own:
 * everything here is worked out from what is passed in, so it can be tested.
 *
 * A task's reminder is due `remindMinutes` before the task is. Quiet hours are
 * the student's own ("no reminders from 22:00 to 8:00") and are kept: a
 * reminder that would land inside them is moved, never sent in the night.
 */

export type Quiet = { from: number; until: number };

/** One notification to deliver: what it says, when, and the screen it opens. */
export type Planned = { id: string; at: Date; title: string; body: string; url: string };

/** iOS keeps at most 64 scheduled notifications for an app; this leaves room for the daily one. */
export const MAX_PLANNED = 50;

/** Whether an hour of the day (0-23) falls in the quiet window, which may run past midnight. */
export function isQuiet(hour: number, quiet: Quiet) {
  if (quiet.from === quiet.until) return false;
  return quiet.from < quiet.until ? hour >= quiet.from && hour < quiet.until : hour >= quiet.from || hour < quiet.until;
}

/** A reminder brought forward out of quiet hours arrives this long before they begin. */
const BEFORE_QUIET_MS = 30 * 60000;

const atHour = (day: Date, hour: number) => {
  const moment = new Date(day);
  moment.setHours(hour, 0, 0, 0);
  return moment;
};

/**
 * The moment to deliver a task's reminder, or null when there is nothing to deliver:
 * the task has no reminder, the moment has already passed (the app shows it on
 * Home instead), or the only moments left are inside quiet hours.
 *
 * Inside quiet hours it waits for them to end, if that is still before the
 * deadline. Otherwise it comes forward to half an hour before they begin.
 */
export function reminderMoment(task: Pick<Task, "dueAt" | "remindMinutes" | "done">, quiet: Quiet, now: Date): Date | null {
  if (task.done || !task.dueAt || task.remindMinutes === null) return null;
  const due = new Date(task.dueAt);
  const wanted = new Date(due.getTime() - task.remindMinutes * 60000);
  if (wanted.getTime() <= now.getTime()) return null;
  if (!isQuiet(wanted.getHours(), quiet)) return wanted;

  const ends = atHour(wanted, quiet.until);
  if (ends.getTime() <= wanted.getTime()) ends.setDate(ends.getDate() + 1);
  if (ends.getTime() < due.getTime()) return ends;

  const begins = atHour(wanted, quiet.from);
  if (begins.getTime() > wanted.getTime()) begins.setDate(begins.getDate() - 1);
  const before = new Date(begins.getTime() - BEFORE_QUIET_MS);
  return before.getTime() > now.getTime() ? before : null;
}

/** The hour for the daily quiz reminder: early evening, or the end of quiet hours if the evening is quiet. */
export function dailyQuizHour(quiet: Quiet) {
  return isQuiet(19, quiet) ? quiet.until : 19;
}

type Words = { today: string; tomorrow: string; inDays: (days: number) => string };

/** "Due tomorrow · 18:00": when the task is due, as seen from the moment the reminder arrives. */
export function dueWords(dueAt: string, seenAt: Date, words: Words) {
  const due = new Date(dueAt);
  const days = Math.round((atHour(due, 0).getTime() - atHour(seenAt, 0).getTime()) / 86400000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(due.getHours())}:${pad(due.getMinutes())}`;
  const day = days <= 0 ? words.today : days === 1 ? words.tomorrow : words.inDays(days);
  // A task with no time of its own is stored as the end of its day.
  return clock === "23:59" ? day : `${day} · ${clock}`;
}

/** Every reminder still to come for these tasks, soonest first, within what a phone will hold. */
export function planReminders(tasks: Task[], quiet: Quiet, now: Date, words: Words, url: string): Planned[] {
  const planned: Planned[] = [];
  for (const task of tasks) {
    const at = reminderMoment(task, quiet, now);
    if (!at || !task.dueAt) continue;
    planned.push({
      id: task.id,
      at,
      title: task.title,
      body: [task.courseName, dueWords(task.dueAt, at, words)].filter(Boolean).join(" · "),
      url,
    });
  }
  return planned.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_PLANNED);
}
