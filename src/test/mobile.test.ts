import { findUniversities, usualSemesterStart } from "../../mobile/src/lib/data";
import { courseTimes, daysFromToday, fileSize, isDateText, isTimeText, maskDate, maskTime, reminderIsOn, termName, toMoment } from "../../mobile/src/lib/format";
import { buildQuiz } from "../../mobile/src/lib/quiz";
import type { ReviewCard } from "../../mobile/src/lib/types";

/*
 * The mobile app's own logic (mobile/src/lib), the parts with rules worth
 * holding to: how a quiz is made from cards, how dates and times are typed and
 * read, and what onboarding suggests. The screens are tested in a browser
 * against the real API (mobile/README.md, "Testing").
 */

const card = (n: number, courseId = "c1", back = `answer ${n}`): ReviewCard => ({
  id: `card-${n}`, front: `question ${n}`, back, lectureId: "l1", lectureTitle: "Week 9", courseId, courseName: courseId,
});

/** The same "random" numbers every run. */
function seeded() {
  let state = 7;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

describe("the quick quiz", () => {
  it("offers four choices, exactly one right, every wrong one a real answer to another question", () => {
    const cards = [1, 2, 3, 4, 5, 6].map((n) => card(n));
    const quiz = buildQuiz(cards, seeded());
    expect(quiz).toHaveLength(6);
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options![q.answer]).toBe(q.card.back);
      for (const option of q.options!) expect(cards.map((c) => c.back)).toContain(option);
    }
  });

  it("turns over a card instead when there are not three other answers to choose between", () => {
    const quiz = buildQuiz([card(1), card(2), card(3)], seeded());
    expect(quiz.every((q) => q.options === null)).toBe(true);
    // Two cards with the same answer do not count as two choices.
    const twins = buildQuiz([card(1), card(2), card(3), card(4, "c1", "answer 3")], seeded());
    expect(twins[0].options).toBeNull();
  });

  it("takes wrong answers from the same course first, and asks at most eight questions", () => {
    const cards = [card(1, "os"), card(2, "os"), card(3, "os"), card(4, "os"), ...[5, 6, 7, 8, 9, 10].map((n) => card(n, "db"))];
    const quiz = buildQuiz(cards, seeded());
    expect(quiz).toHaveLength(8);
    const first = quiz[0];
    const wrong = first.options!.filter((o) => o !== first.card.back);
    expect(wrong.sort()).toEqual(["answer 2", "answer 3", "answer 4"]);
  });
});

describe("dates and times as the student types them", () => {
  it("fills in the dashes and the colon", () => {
    expect(maskDate("20261120")).toBe("2026-11-20");
    expect(maskDate("2026-11")).toBe("2026-11");
    expect(maskDate("2026112099")).toBe("2026-11-20");
    expect(maskTime("1030")).toBe("10:30");
    expect(maskTime("9")).toBe("9");
  });

  it("accepts only real dates and times", () => {
    expect(isDateText("2026-11-20")).toBe(true);
    expect(isDateText("2026-02-30")).toBe(false);
    expect(isDateText("2026-11-2")).toBe(false);
    expect(isTimeText("23:59")).toBe(true);
    expect(isTimeText("24:00")).toBe(false);
  });

  it("reads a course's week in order from Monday, and a task with no time as the end of its day", () => {
    expect(courseTimes({ classDays: [3, 1], startsAt: "10:30", endsAt: "12:00" }, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])).toBe("Mon, Wed · 10:30–12:00");
    expect(courseTimes({ classDays: [], startsAt: null, endsAt: null }, [])).toBe("");
    const end = new Date(toMoment("2026-11-20", ""));
    expect([end.getHours(), end.getMinutes()]).toEqual([23, 59]);
    expect(daysFromToday(new Date().toISOString())).toBe(0);
  });

  it("names the term and the size of a file", () => {
    expect(termName("2026-09-01", "en")).toBe("Fall 2026");
    expect(termName("2026-03-02", "en")).toBe("Spring 2026");
    expect(termName("2026-09-01", "ko")).toBe("2026년 2학기");
    expect(fileSize(1826)).toBe("1.8 KB");
    expect(fileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });

  it("turns a reminder on from its time until the task is done", () => {
    const soon = new Date(Date.now() + 30 * 60000).toISOString();
    expect(reminderIsOn({ dueAt: soon, remindMinutes: 60, done: false })).toBe(true);
    expect(reminderIsOn({ dueAt: soon, remindMinutes: 10, done: false })).toBe(false);
    expect(reminderIsOn({ dueAt: soon, remindMinutes: 60, done: true })).toBe(false);
    expect(reminderIsOn({ dueAt: soon, remindMinutes: null, done: false })).toBe(false);
  });
});

describe("what onboarding suggests", () => {
  it("finds a university by its English or Korean name, and only in the country chosen", () => {
    expect(findUniversities("KR", "hany").map((u) => u.name)).toEqual(["Hanyang University"]);
    expect(findUniversities("KR", "연세").map((u) => u.name)).toEqual(["Yonsei University"]);
    expect(findUniversities("KR", "h")).toEqual([]);
    expect(findUniversities("JP", "hany")).toEqual([]);
    expect(findUniversities(null, "hany")).toEqual([]);
  });

  it("suggests Korea's usual first day of classes, and nothing for a country it does not know", () => {
    expect(usualSemesterStart("KR", new Date("2026-11-13"))).toEqual({ date: "2026-09-01", term: "fall" });
    expect(usualSemesterStart("KR", new Date("2026-04-10"))).toEqual({ date: "2026-03-02", term: "spring" });
    expect(usualSemesterStart("KR", new Date("2026-01-20"))).toEqual({ date: "2026-03-02", term: "spring" });
    expect(usualSemesterStart("JP")).toBeNull();
    expect(usualSemesterStart(null)).toBeNull();
  });
});
