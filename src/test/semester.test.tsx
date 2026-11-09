import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { SemesterMessage, WeekCell } from "@/lib/types";
import { junoLine } from "@/workspace/junoLine";
import { SemesterTrack } from "@/workspace/SemesterTrack";
import { formatElapsed } from "@/workspace/recorder/RecorderUI";

/*
 * The semester screen's rules. Juno says more than three things here, so each
 * one is held to what the three always were: facts, no praise, no guilt.
 */

const lecture: SemesterMessage = {
  kind: "lecture",
  message: { kind: "ready", lectureId: "l", lectureTitle: "9주차", source: "audio", cardCount: 8, unclearRanges: [] },
};
const exam: SemesterMessage = { kind: "exam-soon", courseId: "c", courseName: "운영체제", exam: "midterm", on: "2026-11-19", days: 13, flagged: 6, hard: 9, gaps: [3] };

const MESSAGES: SemesterMessage[] = [
  { kind: "first-course" },
  { kind: "setup" },
  lecture,
  { kind: "processing", lectureId: "l", courseName: "운영체제", title: "9주차" },
  { kind: "class-today", courseId: "c", courseName: "운영체제" },
  exam,
  { kind: "cards-due", count: 12 },
  { kind: "cards-finished", count: 12 },
  { kind: "semester-over", lectures: 14, cards: 96 },
  { kind: "quiet" },
];

describe("what Juno says about the semester", () => {
  it("says what was counted", () => {
    expect(junoLine(exam)).toEqual({
      say: "운영체제 중간고사까지 13일 남았어요.",
      sub: "시험에 나온다고 한 부분 6개, 어려운 카드 9장, 3주차 녹음 없음.",
    });
    expect(junoLine({ kind: "cards-due", count: 12 }).say).toBe("오늘 카드 12장이에요.");
    expect(junoLine({ kind: "semester-over", lectures: 14, cards: 96 }).say).toBe("이번 학기 강의 14개, 카드 96장이에요.");
  });

  it("leaves out facts there are none of, rather than saying zero", () => {
    expect(junoLine({ ...exam, flagged: 0, hard: 0, gaps: [] } as SemesterMessage).sub).toBeUndefined();
    expect(junoLine({ ...exam, hard: 0, gaps: [] } as SemesterMessage).sub).toBe("시험에 나온다고 한 부분 6개.");
  });

  it("says when the exam is today instead of counting zero days", () => {
    expect(junoLine({ ...exam, days: 0 } as SemesterMessage).say).toBe("운영체제 중간고사는 오늘이에요.");
  });

  it("uses the three lecture messages word for word", () => {
    expect(junoLine(lecture).say).toBe("9주차 노트 정리했어요. 카드 8장.");
  });

  it("never praises, never scolds, never counts days in a row", () => {
    const banned = new RegExp(["[!！]|잘했|축하|대단|훌륭|화이팅|파이팅|왜 안|놓쳤|", "st", "reak|연속"].join(""), "i");
    for (const message of MESSAGES) {
      const { say, sub } = junoLine(message);
      expect(`${say} ${sub ?? ""}`, message.kind).not.toMatch(banned);
    }
  });
});

describe("what Juno says, in English", () => {
  it("says the same counted facts", () => {
    expect(junoLine(exam, "en")).toEqual({
      say: "13 days to the 운영체제 midterm.",
      sub: "6 parts flagged for the exam, 9 hard cards, no recording in week 3.",
    });
    expect(junoLine({ kind: "cards-due", count: 12 }, "en").say).toBe("12 cards for today.");
  });

  it("never praises, never scolds, never counts days in a row", () => {
    const banned = new RegExp(["[!]|great job|well done|congrat|awesome|you missed|", "st", "reak|in a row"].join(""), "i");
    for (const message of MESSAGES) {
      const { say, sub } = junoLine(message, "en");
      expect(`${say} ${sub ?? ""}`, message.kind).not.toMatch(banned);
    }
  });
});

const cell = (week: number, state: WeekCell["state"], exam: WeekCell["exam"] = null): WeekCell => ({ week, state, exam, lectures: [], missing: [] });

describe("the semester track", () => {
  const cells = [cell(1, "past"), cell(2, "done"), cell(3, "gap"), cell(4, "now"), cell(5, "future", "midterm"), cell(6, "future"), cell(7, "future"), cell(8, "future")];

  it("draws one cell per week, and says what each one is to a screen reader", () => {
    const { container } = render(<MemoryRouter><SemesterTrack cells={cells} currentWeek={4} onSelect={() => {}} /></MemoryRouter>);
    expect(container.querySelectorAll("[data-week]")).toHaveLength(8);
    expect(screen.getByRole("button", { name: "2주차, 녹음 있음" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3주차, 녹음 없음" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4주차, 이번 주" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5주차, 중간고사, 다가오는 주" })).toBeInTheDocument();
  });

  it("fills only weeks with a real recording", () => {
    const { container } = render(<MemoryRouter><SemesterTrack cells={cells} currentWeek={4} /></MemoryRouter>);
    expect(container.querySelectorAll("[data-filled]")).toHaveLength(1);
  });

  it("marks an exam by its week, and never invents one", () => {
    render(<MemoryRouter><SemesterTrack cells={cells} currentWeek={4} /></MemoryRouter>);
    expect(screen.getAllByText("중간")).toHaveLength(1);
    expect(screen.queryByText("기말")).toBeNull();
  });

  it("puts Juno on this week", () => {
    const { container } = render(<MemoryRouter><SemesterTrack cells={cells} currentWeek={4} /></MemoryRouter>);
    expect(container.querySelector('[data-week="4"] [data-juno]')).not.toBeNull();
    expect(container.querySelectorAll("[data-week] [data-juno]")).toHaveLength(1);
  });
});

describe("the recording timer", () => {
  it("reads as minutes, and as hours once a class runs that long", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(65_000)).toBe("01:05");
    expect(formatElapsed(3_725_000)).toBe("1:02:05");
  });
});
