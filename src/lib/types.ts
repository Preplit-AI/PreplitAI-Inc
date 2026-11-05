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

/** Junbee says exactly one of these three things. There is no fourth kind. */
export type JunbeeMessageData =
  | { kind: "ready"; lectureId: string; lectureTitle: string; source: "audio" | "text"; cardCount: number; unclearRanges: [] }
  | { kind: "unclear"; lectureId: string; lectureTitle: string; source: "audio" | "text"; cardCount: number; unclearRanges: TimeRange[] }
  | { kind: "failed"; lectureId: string; lectureTitle: string; source: "audio" | "text"; cardCount: 0; unclearRanges: [] };

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  lectureId: string;
  lectureTitle: string;
  courseName: string;
};

export type ReviewToday = { done: number; cards: ReviewCard[] };
