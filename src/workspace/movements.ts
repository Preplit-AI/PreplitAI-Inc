import { Blocks, CalendarDays, FolderOpen, Layers, NotebookPen, type LucideIcon } from "lucide-react";
import type { Lang } from "@/lib/lang";

/*
 * The four movements of a semester with Preplit AI, in order. Each one is a real
 * screen that works today: nothing here is greyed out or a placeholder. Juno does
 * the work in every one of them; the student records, reads and reviews.
 */

export type MovementKey = "organize" | "learn" | "remember" | "build";

type Words = { name: string; slogan: string; juno: string };

export type Movement = {
  key: MovementKey;
  n: string;
  /** The Korean name, which is also the navigation's own. */
  name: string;
  en: string;
  slogan: string;
  juno: string;
  words: Record<Lang, Words>;
  to: string;
  icon: LucideIcon;
};

const make = (key: MovementKey, n: string, to: string, icon: LucideIcon, ko: Words, en: Words): Movement => ({
  key,
  n,
  name: ko.name,
  en: en.name,
  slogan: ko.slogan,
  juno: ko.juno,
  words: { ko, en },
  to,
  icon,
});

export const MOVEMENTS: Movement[] = [
  make(
    "organize",
    "01",
    "/workspace/organize",
    FolderOpen,
    { name: "정리", slogan: "녹음만 하면, 과목과 주차는 Juno가 맞춰요.", juno: "강의마다 과목과 주차를 찾아 넣어요." },
    { name: "Organize", slogan: "Just record. Juno files every lecture by course and week.", juno: "Files each lecture under its course and week." },
  ),
  make(
    "learn",
    "02",
    "/app/learn",
    NotebookPen,
    { name: "배움", slogan: "받아적지 마. 듣기만 해.", juno: "녹음을 노트와 시험 힌트로 바꿔요." },
    { name: "Learn", slogan: "Don't take notes. Just listen.", juno: "Turns recordings into notes and exam hints." },
  ),
  make(
    "remember",
    "03",
    "/app/remember",
    Layers,
    { name: "기억", slogan: "하루 5분이면 안 잊어요.", juno: "잊을 때쯤 카드를 다시 꺼내요." },
    { name: "Remember", slogan: "Five minutes a day and you won't forget.", juno: "Brings cards back just before you forget." },
  ),
  make(
    "build",
    "04",
    "/workspace/build",
    Blocks,
    { name: "쌓기", slogan: "매주 쌓은 강의가 시험 준비가 돼요.", juno: "한 학기의 강의를 시험 준비로 모아요." },
    { name: "Build", slogan: "Every week you record becomes your exam prep.", juno: "Gathers the semester's lectures into exam prep." },
  ),
];

export const HOME = { to: "/workspace", label: "이번 학기", labelEn: "This semester", icon: CalendarDays };

/** The app's navigation: the semester, then the four movements, and nothing else. */
export const NAV: { to: string; label: string; labelEn: string; icon: LucideIcon; end?: boolean; n?: string }[] = [
  { to: HOME.to, label: HOME.label, labelEn: HOME.labelEn, icon: HOME.icon, end: true },
  ...MOVEMENTS.map((m) => ({ to: m.to, label: m.name, labelEn: m.en, icon: m.icon, n: m.n })),
];

export const movement = (key: MovementKey) => MOVEMENTS.find((m) => m.key === key)!;
