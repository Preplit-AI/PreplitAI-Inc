export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Course = {
  id: string;
  name: string;
  lectureCount: number | null;
  createdAt: string;
  /** 0 = Sunday to 6 = Saturday, as the student entered them. */
  classDays: number[];
  midtermOn: string | null;
  finalOn: string | null;
};

export type LectureStatus = "processing" | "ready" | "failed";

export type LectureSummary = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  /** The note's own title, once notes exist. */
  topic: string | null;
  source: "audio" | "text";
  status: LectureStatus;
  durationSeconds: number | null;
  cardCount: number;
  createdAt: string;
  /** When the class happened, which is what files a lecture under its week. */
  recordedAt: string;
  finishedAt: string | null;
};

export type Notes = {
  title: string;
  summary: string;
  sections: { heading: string; points: string[] }[];
  flagged: { quote: string; at: string; note: string }[];
  cards: { front: string; back: string }[];
};

export type TimeRange = { start: number; end: number };

export type LectureDetail = LectureSummary & {
  notes: Notes | null;
  transcript: string | null;
  unclearRanges: TimeRange[];
  cards: { id: string; front: string; back: string }[];
  messageDismissed: boolean;
};

/** Juno says exactly one of these three things about a lecture. There is no fourth kind. */
export type LectureMessage =
  | { kind: "ready"; lectureId: string; lectureTitle: string; source: "audio" | "text"; cardCount: number; unclearRanges: [] }
  | { kind: "unclear"; lectureId: string; lectureTitle: string; source: "audio" | "text"; cardCount: number; unclearRanges: TimeRange[] }
  | { kind: "failed"; lectureId: string; lectureTitle: string; source: "audio" | "text"; cardCount: 0; unclearRanges: [] };

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  lectureId: string;
  lectureTitle: string;
  courseId: string;
  courseName: string;
};

export type ReviewToday = { done: number; cards: ReviewCard[] };

/** Where a sentence in an answer came from. `deleted` means the lecture has since been removed. */
export type Citation =
  | { label: string; deleted: true }
  | {
      label: string;
      deleted?: false;
      lectureId: string;
      lectureTitle: string;
      courseName: string;
      kind: "transcript" | "summary" | "section" | "flagged";
      at: string | null;
      excerpt: string;
    };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  /** cited: from the lectures. account: about the student's own courses or cards. general: neither. */
  grounding: "cited" | "account" | "general" | null;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  courseId: string | null;
  updatedAt: string;
};

export type Conversation = ConversationSummary & { messages: ChatMessage[] };

export type ChatEvent =
  | { event: "status"; data: { tool: string } }
  | { event: "delta"; data: { text: string } }
  | { event: "reset"; data: Record<string, never> }
  | { event: "done"; data: { conversation: ConversationSummary; messages: ChatMessage[] } }
  | { event: "error"; data: { error: string; message: string } };


export type ExamKind = "midterm" | "final";

export type Semester = { id: string; name: string; startsOn: string; weeks: number; currentWeek: number };

export type CellLecture = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  topic: string | null;
  status: LectureStatus;
  cardCount: number;
  flaggedCount: number;
  on: string;
  recordedAt: string;
  week?: number | null;
};

/** One week of the semester. Every state is counted from what the student did. */
export type WeekCell = {
  week: number;
  state: "done" | "processing" | "gap" | "past" | "now" | "future";
  exam: ExamKind | null;
  lectures: CellLecture[];
  /** Courses with no recording in a week they should have one. */
  missing: string[];
};

export type NextExam = { kind: ExamKind; on: string; days: number };

export type CourseSummary = Course & {
  cells: WeekCell[];
  nextExam: NextExam | null;
  flaggedCount: number;
  dueCards: number;
  totalCards: number;
  hardCards: number;
  gaps: number[];
  lastLecture: CellLecture | null;
  classToday: boolean;
  recordedToday: boolean;
};

export type ExamFact = {
  courseId: string;
  courseName: string;
  exam: ExamKind;
  on: string;
  days: number;
  flagged: number;
  hard: number;
  gaps: number[];
};

/** The one thing Juno says about the semester. The server picks which and counts the facts; the wording is in junoLine.ts. */
export type SemesterMessage =
  | { kind: "first-course" }
  | { kind: "setup" }
  | { kind: "lecture"; message: LectureMessage }
  | { kind: "processing"; lectureId: string; courseName: string; title: string }
  | { kind: "class-today"; courseId: string; courseName: string }
  | ({ kind: "exam-soon" } & ExamFact)
  | { kind: "cards-due"; count: number }
  | { kind: "cards-finished"; count: number }
  | { kind: "semester-over"; lectures: number; cards: number }
  | { kind: "quiet" };

export type SemesterOverview = {
  today: string;
  semester: Semester | null;
  cells: WeekCell[];
  courses: CourseSummary[];
  classToday: { courseId: string; courseName: string; recordedToday: boolean }[];
  exams: ExamFact[];
  review: { due: number; done: number };
  latestNote: CellLecture | null;
  processing: boolean;
  message: SemesterMessage;
};

export type CourseSpaceData = {
  today: string;
  semester: Semester | null;
  course: CourseSummary;
  flagged: { note: string; quote: string; at: string; lectureId: string; lectureTitle: string }[];
  lectures: CellLecture[];
};
