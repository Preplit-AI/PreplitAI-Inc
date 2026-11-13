import { MAX_PLANNED, dailyQuizHour, dueWords, isQuiet, planReminders, reminderMoment } from "../../mobile/src/lib/reminders";
import type { Task } from "../../mobile/src/lib/types";

/*
 * When the mobile app's reminders reach the student (mobile/src/lib/reminders.ts).
 * The rule that matters most: quiet hours are kept. A reminder is moved out of
 * them, or not sent, but never delivered in the night.
 */

const NIGHT = { from: 22, until: 8 };
/** A moment on the local clock, so the tests read the same in any time zone. */
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute, 0, 0);
const task = (due: Date | null, remindMinutes: number | null, extra: Partial<Task> = {}): Task => ({
  id: "t1", courseId: null, courseName: null, title: "Deadlock homework", notes: null, kind: "assignment",
  dueAt: due ? due.toISOString() : null, priority: 2, remindMinutes, done: false, ...extra,
});
const words = { today: "Due today", tomorrow: "Due tomorrow", inDays: (n: number) => `Due in ${n} days` };

describe("quiet hours", () => {
  it("cover a window that runs past midnight, and one that does not", () => {
    expect([21, 22, 23, 0, 7, 8].map((h) => isQuiet(h, NIGHT))).toEqual([false, true, true, true, true, false]);
    expect([12, 13, 14, 15].map((h) => isQuiet(h, { from: 13, until: 15 }))).toEqual([false, true, true, false]);
    expect(isQuiet(3, { from: 0, until: 0 })).toBe(false);
  });
});

describe("the moment a reminder arrives", () => {
  it("is the reminder's own time when that is in the day", () => {
    expect(reminderMoment(task(at(20, 18), 60), NIGHT, at(19, 12))).toEqual(at(20, 17));
    expect(reminderMoment(task(at(20, 18), 1440), NIGHT, at(18, 12))).toEqual(at(19, 18));
  });

  it("is nothing for a task without a reminder, a finished task, or a moment already gone", () => {
    expect(reminderMoment(task(at(20, 18), null), NIGHT, at(19, 12))).toBeNull();
    expect(reminderMoment(task(null, 60), NIGHT, at(19, 12))).toBeNull();
    expect(reminderMoment(task(at(20, 18), 60, { done: true }), NIGHT, at(19, 12))).toBeNull();
    expect(reminderMoment(task(at(20, 18), 60), NIGHT, at(20, 17, 30))).toBeNull();
  });

  it("waits for quiet hours to end when the deadline is still ahead", () => {
    // Due 14:00, reminded 12 hours before: 02:00 becomes 08:00 the same morning.
    expect(reminderMoment(task(at(20, 14), 720), NIGHT, at(19, 12))).toEqual(at(20, 8));
    // Due 09:00 on the 21st, reminded 10 hours before: 23:00 on the 20th becomes 08:00 on the 21st.
    expect(reminderMoment(task(at(21, 9), 600), NIGHT, at(19, 12))).toEqual(at(21, 8));
  });

  it("comes forward to half an hour before quiet hours when waiting would be too late", () => {
    // Due 07:30, reminded an hour before: 06:30 is quiet and 08:00 is after the deadline, so 21:30 the evening before.
    expect(reminderMoment(task(at(20, 7, 30), 60), NIGHT, at(19, 12))).toEqual(at(19, 21, 30));
    // Due 23:30, reminded an hour before: 22:30 is quiet, so 21:30 that evening.
    expect(reminderMoment(task(at(20, 23, 30), 60), NIGHT, at(20, 12))).toEqual(at(20, 21, 30));
  });

  it("is never inside quiet hours, even when that means no notification", () => {
    // Added at 23:00 for a 07:30 deadline: every moment left is in the night.
    expect(reminderMoment(task(at(20, 7, 30), 60), NIGHT, at(19, 23))).toBeNull();
    for (let hour = 0; hour < 24; hour += 1) {
      for (const remind of [60, 180, 720, 1440, 4320]) {
        const moment = reminderMoment(task(at(20, hour, 30), remind), NIGHT, at(15, 12));
        if (moment) expect(isQuiet(moment.getHours(), NIGHT), `due ${hour}:30, ${remind} min before → ${moment}`).toBe(false);
      }
    }
  });
});

describe("what a reminder says", () => {
  it("tells when the task is due as seen from when the reminder arrives", () => {
    const due = at(20, 18).toISOString();
    expect(dueWords(due, at(20, 17), words)).toBe("Due today · 18:00");
    expect(dueWords(due, at(19, 18), words)).toBe("Due tomorrow · 18:00");
    expect(dueWords(due, at(17, 18), words)).toBe("Due in 3 days · 18:00");
    // No time of its own: stored as the end of the day, shown without a clock.
    expect(dueWords(at(20, 23, 59).toISOString(), at(19, 9), words)).toBe("Due tomorrow");
  });

  it("plans every reminder still to come, soonest first, with its course", () => {
    const tasks = [
      task(at(22, 18), 60, { id: "later", title: "Essay" }),
      task(at(20, 18), 1440, { id: "sooner", title: "Homework", courseName: "Operating Systems" }),
      task(at(20, 18), null, { id: "none" }),
      task(at(18, 9), 60, { id: "past" }),
    ];
    const planned = planReminders(tasks, NIGHT, at(18, 12), words, "/tasks");
    expect(planned.map((p) => p.id)).toEqual(["sooner", "later"]);
    expect(planned[0]).toEqual({ id: "sooner", at: at(19, 18), title: "Homework", body: "Operating Systems · Due tomorrow · 18:00", url: "/tasks" });
    expect(planned[1].body).toBe("Due today · 18:00");
  });

  it("plans no more than a phone will hold", () => {
    const many = Array.from({ length: 80 }, (_, i) => task(at(20, 18), 60 + i, { id: `t${i}` }));
    expect(planReminders(many, NIGHT, at(19, 9), words, "/tasks")).toHaveLength(MAX_PLANNED);
  });
});

describe("the daily quiz reminder", () => {
  it("comes in the early evening, or when quiet hours end if the evening is quiet", () => {
    expect(dailyQuizHour(NIGHT)).toBe(19);
    expect(dailyQuizHour({ from: 18, until: 9 })).toBe(9);
    expect(dailyQuizHour({ from: 0, until: 0 })).toBe(19);
  });
});
