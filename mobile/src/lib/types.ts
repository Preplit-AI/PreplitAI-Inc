/* The shapes the API returns (server/routes and server/services). */

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  hasPassword?: boolean;
  google?: boolean;
};

export type DegreeLevel = "language" | "exchange" | "bachelor" | "master" | "doctorate" | "other";
export type Stage = "preparing" | "new" | "continuing" | "graduating";
export type KoreanLevel = "none" | "beginner" | "intermediate" | "advanced" | "fluent";
export type UiLanguage = "en" | "ko";

/** The Student Intelligence Profile: only what the student entered. null means "not said". */
export type Profile = {
  country: string | null;
  university: string | null;
  campus: string | null;
  department: string | null;
  degreeLevel: DegreeLevel | null;
  stage: Stage | null;
  academicYear: number | null;
  expectedGraduation: string | null;
  timezone: string | null;
  uiLanguage: UiLanguage | null;
  explainLanguage: string | null;
  languages: string[];
  koreanLevel: KoreanLevel | null;
  academicGoal: string | null;
  careerInterests: string[];
  targetRole: string | null;
  skillsWanted: string[];
  dailyQuiz: boolean;
  quietFrom: number;
  quietUntil: number;
  onboardingStep: number;
  onboarded: boolean;
};

export type Course = {
  id: string;
  name: string;
  lectureCount: number | null;
  createdAt: string;
  /** 0 = Sunday to 6 = Saturday. */
  classDays: number[];
  midtermOn: string | null;
  finalOn: string | null;
  code: string | null;
  instructor: string | null;
  credits: number | null;
  location: string | null;
  /** "HH:MM", in the student's local time. */
  startsAt: string | null;
  endsAt: string | null;
  /** The language the course is taught in. */
  language: string | null;
};

export type Semester = { id: string; name: string; startsOn: string; weeks: number; currentWeek: number };

export type CourseSummary = Course & {
  nextExam: { kind: "midterm" | "final"; on: string; days: number } | null;
  dueCards: number;
  totalCards: number;
  hardCards: number;
  classToday: boolean;
};

export type LectureSummary = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  topic: string | null;
  source: "audio" | "text";
  material: "pdf" | "text" | null;
  status: "processing" | "ready" | "failed";
  cardCount: number;
  createdAt: string;
  recordedAt: string;
};

export type Notes = {
  title: string;
  summary: string;
  sections: { heading: string; points: string[] }[];
  flagged: { quote: string; at: string; note: string }[];
  /** The lecture's own terms, with an English equivalent and a one-line meaning. Older notes have none. */
  terms?: { term: string; english: string; meaning: string }[];
};

export type Card = { id: string; front: string; back: string };
export type Lecture = LectureSummary & { notes: Notes | null; transcript: string | null; cards: Card[] };

export type ReviewCard = Card & { lectureId: string; lectureTitle: string; courseId: string; courseName: string };

/** What Juno has to say on the home screen; the wording is the app's (lib/i18n). */
export type JunoMessage =
  | { kind: "first-course" | "setup" | "quiet" }
  | { kind: "processing"; title: string; courseName: string }
  | { kind: "lecture"; message: { lectureId: string; kind: "ready" | "unclear" | "failed"; lectureTitle: string; cardCount: number } }
  | { kind: "class-today"; courseId: string; courseName: string }
  | { kind: "semester-over"; lectures: number; cards: number }
  | { kind: "exam-soon"; courseName: string; exam: "midterm" | "final"; days: number }
  | { kind: "cards-due" | "cards-finished"; count: number };

export type Overview = {
  today: string;
  semester: Semester | null;
  courses: CourseSummary[];
  classToday: { courseId: string; courseName: string }[];
  exams: { courseId: string; courseName: string; exam: "midterm" | "final"; on: string; days: number }[];
  review: { due: number; done: number };
  latestNote: { id: string; courseName: string; title: string; topic: string | null } | null;
  processing: boolean;
  message: JunoMessage;
};

export type TaskKind = "task" | "assignment" | "exam" | "study";
export type Task = {
  id: string;
  courseId: string | null;
  courseName: string | null;
  title: string;
  notes: string | null;
  kind: TaskKind;
  dueAt: string | null;
  priority: 1 | 2 | 3;
  remindMinutes: number | null;
  done: boolean;
};

export type Milestone = { id: string; title: string; done: boolean };
export type ProjectStatus = "idea" | "active" | "done";
export type Project = {
  id: string;
  courseId: string | null;
  courseName: string | null;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  skills: string[];
  link: string | null;
  outcome: string | null;
  milestones: Milestone[];
};
/** A skill is shown with the evidence for it, never as a bare claim. */
export type Skill = { name: string; evidence: "demonstrated" | "developing" | "wanted"; projects: { id: string; title: string }[] };

export type Citation =
  | { label: string; deleted: true }
  | { label: string; deleted?: false; lectureId: string; lectureTitle: string; courseName: string; kind: string; at: string | null; excerpt: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  /** cited: from the lectures. account: about the student's own courses. general: neither. */
  grounding: "cited" | "account" | "general" | null;
};

export type ChatEvent =
  | { type: "status"; tool: string }
  | { type: "delta"; text: string }
  | { type: "reset" }
  | { type: "done"; conversation: { id: string }; messages: ChatMessage[] }
  | { type: "error"; code: string; message: string };
