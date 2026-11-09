import type { CSSProperties } from "react";
import { JunoAvatar } from "@/brand/Juno";
import { cn } from "@/lib/cn";
import { useLang, type Lang } from "@/lib/lang";
import type { WeekCell } from "@/lib/types";

/*
 * The semester as a row of weeks, with Juno on this one.
 *
 * One cell is one week. A filled cell is a week with a real recording in it:
 * work actually done, never an estimate. A dashed cell is a week with nothing in
 * it since the student began. Exam weeks carry their name.
 */

const LABELS: Record<Lang, Record<WeekCell["state"], string>> = {
  ko: { done: "녹음 있음", processing: "노트 만드는 중", gap: "녹음 없음", past: "지난주", now: "이번 주", future: "다가오는 주" },
  en: { done: "recorded", processing: "note being made", gap: "no recording", past: "past week", now: "this week", future: "coming up" },
};

export const STATE_LABELS = LABELS.ko;
export const stateLabel = (state: WeekCell["state"], lang: Lang = "ko") => LABELS[lang][state];

const SHORT: Record<Lang, { midterm: string; final: string }> = { ko: { midterm: "중간", final: "기말" }, en: { midterm: "Mid", final: "Final" } };
export const examShort = (exam: WeekCell["exam"], lang: Lang = "ko") => (exam ? SHORT[lang][exam] : null);

export function weekLabel(cell: WeekCell, currentWeek: number, lang: Lang = "ko") {
  const filled = cell.state === "done";
  const isNow = cell.week === currentWeek;
  const state = isNow && !filled ? LABELS[lang].now : LABELS[lang][cell.state];
  if (lang === "en") {
    const exam = cell.exam ? `, ${cell.exam === "midterm" ? "midterm" : "final"}` : "";
    const lectures = cell.lectures.length ? `, ${cell.lectures.length} lecture${cell.lectures.length === 1 ? "" : "s"}` : "";
    return `Week ${cell.week}${exam}, ${state}${lectures}`;
  }
  const exam = cell.exam ? `, ${cell.exam === "midterm" ? "중간고사" : "기말고사"}` : "";
  const lectures = cell.lectures.length ? `, 강의 ${cell.lectures.length}개` : "";
  return `${cell.week}주차${exam}, ${state}${lectures}`;
}

type Props = {
  cells: WeekCell[];
  currentWeek: number;
  selected?: number | null;
  onSelect?: (week: number) => void;
  /** "night" on a dark band. */
  tone?: "light" | "night";
  legend?: boolean;
  className?: string;
};

export function SemesterTrack({ cells, currentWeek, selected, onSelect, tone = "light", legend = false, className }: Props) {
  const { lang } = useLang();
  const night = tone === "night";
  const style = { "--cols": cells.length, "--half": Math.ceil(cells.length / 2) } as CSSProperties;

  return (
    <div className={cn("cq", className)}>
      <ol aria-label={lang === "en" ? `This semester, week ${currentWeek} of ${cells.length}` : `이번 학기 ${cells.length}주 중 ${currentWeek}주차`} style={style} className="track pt-2.5">
        {cells.map((cell) => {
          const filled = cell.state === "done";
          const isNow = cell.week === currentWeek;
          const examOpen = Boolean(cell.exam) && !filled;
          const isSelected = selected === cell.week;
          const body = (
            <>
              <span className="text-xs font-medium tabular-nums leading-none">{examOpen ? examShort(cell.exam, lang) : cell.week}</span>
              {cell.lectures.length ? (
                <span className="mt-1 flex gap-0.5" aria-hidden="true">
                  {cell.lectures.slice(0, 3).map((l) => (
                    <span key={l.id} className={cn("h-1 w-1 rounded-full", filled ? (night ? "bg-ink/70" : "bg-white/80") : "bg-current")} />
                  ))}
                </span>
              ) : null}
              {isNow ? (
                <span className="absolute -right-1.5 -top-2.5 rounded-full">
                  <JunoAvatar size={20} tone={night ? "night" : "light"} />
                </span>
              ) : null}
            </>
          );
          const look = cn(
            "relative flex h-10 w-full flex-col items-center justify-center rounded-lg border transition-[background-color,border-color,box-shadow,transform] duration-200",
            filled && (night ? "border-white bg-white text-ink" : "border-ink bg-ink text-white"),
            cell.state === "processing" && "border-gold-deep bg-gold-tint text-ink",
            !filled && cell.state !== "processing" && examOpen && "border-gold bg-gold/70 text-ink",
            !filled && cell.state !== "processing" && !examOpen && cell.state === "gap" && "border-dashed border-honey bg-transparent text-honey",
            !filled && cell.state !== "processing" && !examOpen && cell.state !== "gap" && (night ? "border-night-line bg-night-2 text-night-muted" : "border-rule bg-white text-slate"),
            isNow && !filled && (night ? "border-white text-white" : "border-ink text-ink"),
            isNow && "shadow-[0_0_0_3px_rgb(248_208_0/0.45)]",
            isSelected && (night ? "ring-2 ring-white ring-offset-2 ring-offset-night" : "ring-2 ring-ink ring-offset-2"),
          );
          const data = { "data-week": cell.week, "data-state": cell.state, "data-filled": filled ? "" : undefined };
          return (
            <li key={cell.week} className="min-w-0">
              {onSelect ? (
                <button type="button" {...data} aria-label={weekLabel(cell, currentWeek, lang)} aria-pressed={isSelected} onClick={() => onSelect(cell.week)} className={cn(look, "hover:-translate-y-0.5")}>
                  {body}
                </button>
              ) : (
                <div {...data} role="img" aria-label={weekLabel(cell, currentWeek, lang)} className={look}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {legend ? <TrackLegend night={night} /> : null}
    </div>
  );
}

const LEGEND: Record<Lang, string[]> = {
  ko: ["녹음 있음", "노트 만드는 중", "녹음 없음", "시험 주", "이번 주"],
  en: ["Recorded", "Note being made", "No recording", "Exam week", "This week"],
};

export function TrackLegend({ night = false, className }: { night?: boolean; className?: string }) {
  const { lang } = useLang();
  const words = LEGEND[lang];
  const item = "flex items-center gap-1.5";
  return (
    <ul className={cn("mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs", night ? "text-night-muted" : "text-slate", className)} aria-label={lang === "en" ? "Key" : "표시"}>
      <li className={item}><span className={cn("h-3 w-3 rounded", night ? "bg-white" : "bg-ink")} />{words[0]}</li>
      <li className={item}><span className="h-3 w-3 rounded border border-gold-deep bg-gold-tint" />{words[1]}</li>
      <li className={item}><span className={cn("h-3 w-3 rounded border border-dashed", night ? "border-gold" : "border-honey")} />{words[2]}</li>
      <li className={item}><span className={cn("h-3 w-3 rounded", night ? "bg-gold" : "bg-gold/70")} />{words[3]}</li>
      <li className={item}><JunoAvatar size={14} tone={night ? "night" : "light"} />{words[4]}</li>
    </ul>
  );
}
