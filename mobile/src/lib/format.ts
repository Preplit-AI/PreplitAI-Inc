import type { Course, Task } from "./types";

/* Dates and times, on the student's own clock. */

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-11-20" for a date on the local calendar. */
export const isoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const isDateText = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && isoDate(date) === value;
};

export const isTimeText = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

/** Typing digits fills in the dashes: 20261120 → 2026-11-20. */
export function maskDate(text: string) {
  const d = text.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join("-");
}

/** Typing digits fills in the colon: 1030 → 10:30. */
export function maskTime(text: string) {
  const d = text.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole days from today to the given moment: 0 today, 1 tomorrow, negative when past. */
export function daysFromToday(iso: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const day = new Date(iso);
  day.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - start.getTime()) / 86400000);
}

export function shortDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-GB", { month: "short", day: "numeric", weekday: "short" });
}

export function clockTime(iso: string) {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "Mon, Wed · 10:30–12:00" */
export function courseTimes(course: Pick<Course, "classDays" | "startsAt" | "endsAt">, dayNames: string[]) {
  const days = [...course.classDays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => dayNames[d]).join(", ");
  const time = course.startsAt ? `${course.startsAt}${course.endsAt ? `–${course.endsAt}` : ""}` : "";
  return [days, time].filter(Boolean).join(" · ");
}

/** "Fall 2026" / "2026년 2학기": the term a start date belongs to, where a year has a spring and a fall term. */
export function termName(startsOn: string, locale: string) {
  const [year, month] = startsOn.split("-").map(Number);
  const spring = month >= 2 && month <= 7;
  if (locale === "ko") return `${year}년 ${spring ? 1 : 2}학기`;
  return `${spring ? "Spring" : "Fall"} ${year}`;
}

/** A task's reminder is "on" from its remind time until it is done. */
export function reminderIsOn(task: Pick<Task, "dueAt" | "remindMinutes" | "done">) {
  if (task.done || !task.dueAt || task.remindMinutes === null) return false;
  return Date.now() >= new Date(task.dueAt).getTime() - task.remindMinutes * 60000;
}

/** "1.8 KB", "2.4 MB": a file's size in the unit that reads best. */
export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Joins a date and an optional time on the local clock into an ISO moment. No time means the end of that day. */
export function toMoment(date: string, time: string) {
  return new Date(`${date}T${isTimeText(time) ? time : "23:59"}:00`).toISOString();
}
