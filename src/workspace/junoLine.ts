import { junoText } from "@/brand/JunoMessage";
import type { Lang } from "@/lib/lang";
import type { ExamFact, ExamKind, SemesterMessage } from "@/lib/types";

/*
 * What Juno says about the semester. The server decides which message applies
 * and counts the facts; the words are here, in Korean and English.
 *
 * The same rules as the three lecture messages: facts and counts, no praise,
 * no guilt, no exclamation marks, nothing about days in a row. It says when
 * something is missing without saying the student should have done better.
 */

const EXAMS: Record<Lang, Record<ExamKind, string>> = {
  ko: { midterm: "중간고사", final: "기말고사" },
  en: { midterm: "Midterm", final: "Final" },
};

/** The Korean names, kept for code that only speaks Korean. */
export const EXAM_LABELS = EXAMS.ko;

export const examLabel = (kind: ExamKind, lang: Lang = "ko") => EXAMS[lang][kind];

export type JunoLine = { say: string; sub?: string };

const joinFacts = (facts: (string | null)[]) => facts.filter(Boolean).join(", ");

const DAY_NAMES: Record<Lang, string[]> = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** "매주 월, 수" / "Mon, Wed", in week order from Monday. */
export function classDaysLine(days: number[], lang: Lang = "ko") {
  if (!days.length) return null;
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = order.filter((d) => days.includes(d)).map((d) => DAY_NAMES[lang][d]).join(", ");
  return lang === "en" ? `Every ${names}` : `매주 ${names}`;
}

/** "D-13", or "오늘" / "Today" on the day. */
export const dayCount = (days: number, lang: Lang = "ko") => (days === 0 ? (lang === "en" ? "Today" : "오늘") : `D-${days}`);

/** The facts about one coming exam, counted by the server. */
export function examFacts(exam: Pick<ExamFact, "flagged" | "hard" | "gaps">, lang: Lang = "ko") {
  if (lang === "en") {
    return joinFacts([
      exam.flagged ? `${exam.flagged} part${exam.flagged === 1 ? "" : "s"} flagged for the exam` : null,
      exam.hard ? `${exam.hard} hard card${exam.hard === 1 ? "" : "s"}` : null,
      exam.gaps.length ? `no recording in week ${exam.gaps.join(", ")}` : null,
    ]);
  }
  return joinFacts([
    exam.flagged ? `시험에 나온다고 한 부분 ${exam.flagged}개` : null,
    exam.hard ? `어려운 카드 ${exam.hard}장` : null,
    exam.gaps.length ? `${exam.gaps.join(", ")}주차 녹음 없음` : null,
  ]);
}

export function junoLine(message: SemesterMessage, lang: Lang = "ko"): JunoLine {
  if (lang === "en") {
    switch (message.kind) {
      case "first-course":
        return { say: "Which classes are you taking?", sub: "Add a course and I'll follow the semester with you." };
      case "setup":
        return { say: "When did this semester start?", sub: "With the start date I can line the weeks up." };
      case "lecture":
        return { say: junoText(message.message, "en") };
      case "processing":
        return { say: `Turning ‘${message.title}’ into a note.`, sub: `It goes under ${message.courseName}. It keeps going if you close the window.` };
      case "class-today":
        return { say: `You have ${message.courseName} today.`, sub: "Press record when class starts. The note writes itself." };
      case "exam-soon": {
        const label = examLabel(message.exam, "en");
        const facts = examFacts(message, "en");
        return {
          say: message.days === 0 ? `The ${message.courseName} ${label.toLowerCase()} is today.` : `${message.days} days to the ${message.courseName} ${label.toLowerCase()}.`,
          sub: facts ? `${facts.charAt(0).toUpperCase()}${facts.slice(1)}.` : undefined,
        };
      }
      case "cards-due":
        return { say: `${message.count} cards for today.` };
      case "cards-finished":
        return { say: `You've seen all ${message.count} of today's cards.` };
      case "semester-over":
        return { say: `This semester: ${message.lectures} lectures, ${message.cards} cards.`, sub: "Your notes and cards stay where they are." };
      case "quiet":
        return { say: "Nothing to do today.", sub: "Press record when class starts." };
    }
  }
  switch (message.kind) {
    case "first-course":
      return { say: "어떤 수업을 들어요?", sub: "과목을 추가하면 이번 학기를 같이 따라갈게요." };
    case "setup":
      return { say: "이번 학기는 언제 시작했어요?", sub: "시작일을 알면 주차를 맞춰 둘게요." };
    case "lecture":
      return { say: junoText(message.message) };
    case "processing":
      return { say: `‘${message.title}’ 녹음을 노트로 만드는 중이에요.`, sub: `${message.courseName}에 정리해 둘게요. 창을 닫아도 계속돼요.` };
    case "class-today":
      return { say: `오늘 ${message.courseName} 수업이 있어요.`, sub: "수업이 시작되면 녹음을 눌러 주세요. 노트는 알아서 정리돼요." };
    case "exam-soon": {
      const label = EXAM_LABELS[message.exam];
      const facts = examFacts(message);
      return {
        say: message.days === 0 ? `${message.courseName} ${label}는 오늘이에요.` : `${message.courseName} ${label}까지 ${message.days}일 남았어요.`,
        sub: facts ? `${facts}.` : undefined,
      };
    }
    case "cards-due":
      return { say: `오늘 카드 ${message.count}장이에요.` };
    case "cards-finished":
      return { say: `오늘 카드 ${message.count}장을 모두 봤어요.` };
    case "semester-over":
      return { say: `이번 학기 강의 ${message.lectures}개, 카드 ${message.cards}장이에요.`, sub: "노트와 카드는 그대로 남아 있어요." };
    case "quiet":
      return { say: "오늘은 할 일이 없어요.", sub: "수업이 시작되면 녹음을 눌러 주세요." };
  }
}
