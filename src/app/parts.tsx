import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FileAudio, FileText, Layers, NotebookPen, type LucideIcon } from "lucide-react";
import { Tally } from "@/brand/Tally";
import { cn } from "@/lib/cn";
import { formatDuration, formatMinuteRange } from "@/lib/format";
import { useCopy, useLang } from "@/lib/lang";
import type { TimeRange } from "@/lib/types";
import { useReviewToday } from "./queries";

/*
 * The app's own drawn pieces. Each is drawn from real data or says no number at
 * all: the flow claims no stage or progress, the timeline places only what the
 * lecture's notes recorded, and the tally counts only what the server counted.
 */

const FLOW_ICONS: LucideIcon[] = [FileAudio, FileText, NotebookPen, Layers];
const FLOW = {
  ko: { labels: ["녹음", "녹취록", "노트", "카드"], alt: "녹음이 녹취록, 노트, 카드가 돼요" },
  en: { labels: ["Recording", "Transcript", "Note", "Cards"], alt: "A recording becomes a transcript, a note and cards" },
};

/** How a recording becomes a note. While `live`, a light runs along the lines; it never says how far along it is. */
export function NoteFlow({ live = false, className }: { live?: boolean; className?: string }) {
  const t = useCopy(FLOW);
  return (
    <div className={cn("flex items-start", className)} role="img" aria-label={t.alt}>
      {t.labels.map((label, i) => {
        const Icon = FLOW_ICONS[i];
        return (
          <Fragment key={label}>
            {i > 0 ? <span className={cn("flow-line mt-[17px] h-px min-w-3 flex-1", live && "flow-line--live")} aria-hidden="true" /> : null}
            <span className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-rule bg-white">
                <Icon className="h-4 w-4 text-ink" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="text-xs leading-none text-ink">{label}</span>
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

/** "31:05" or "1:02:10" as seconds; anything else as null, so it is simply not placed. */
function secondsFrom(at: string): number | null {
  const parts = at.trim().split(":").map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some((n) => !Number.isFinite(n))) return null;
  return parts.reduce((total, n) => total * 60 + n, 0);
}

/** The lecture from end to end: where the exam was mentioned, and what could not be heard. */
export function LectureTimeline({
  duration,
  flagged,
  unclear,
}: {
  duration: number | null;
  flagged: { at: string; note: string; quote: string }[];
  unclear: TimeRange[];
}) {
  const { lang } = useLang();
  if (!duration) return null;
  const at = (seconds: number) => Math.min(1, Math.max(0, seconds / duration)) * 100;
  const hints = flagged
    .map((f) => ({ ...f, seconds: secondsFrom(f.at) }))
    .filter((f): f is typeof f & { seconds: number } => f.seconds !== null && f.seconds <= duration);
  if (!hints.length && !unclear.length) return null;

  const step = duration > 5400 ? 1800 : duration > 2700 ? 600 : duration > 600 ? 300 : 60;
  const ticks: number[] = [];
  for (let t = 0; t <= duration; t += step) ticks.push(t);
  const minute = (60 / duration) * 100;
  const en = lang === "en";
  const length = formatDuration(duration, lang);
  const ranges = unclear.map((r) => formatMinuteRange(r, lang)).join(", ");

  return (
    <figure
      className="window m-0 px-4 pb-3 pt-3.5"
      aria-label={en ? `Lecture ${length}: ${hints.length} exam hints, ${unclear.length} unclear stretches` : `강의 ${length}: 시험 힌트 ${hints.length}곳, 잘 안 들린 구간 ${unclear.length}곳`}
    >
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink">
        <span className="font-medium">{en ? `Lecture ${length}` : `강의 ${length}`}</span>
        {hints.length ? (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-1 rounded-full bg-gold-deep" aria-hidden="true" />
            {en ? `${hints.length} exam hint${hints.length === 1 ? "" : "s"}` : `시험 힌트 ${hints.length}곳`}
          </span>
        ) : null}
        {unclear.length ? (
          <span className="flex items-center gap-1.5">
            <span className="hatch h-3 w-4 rounded-sm" aria-hidden="true" />
            {en ? `[unclear] ${ranges}` : `[불명확] ${ranges}`}
          </span>
        ) : null}
      </figcaption>

      <div
        className="relative mt-3 h-9 overflow-hidden rounded-lg bg-bone"
        style={{ backgroundImage: `repeating-linear-gradient(90deg, rgb(10 10 10 / 0.08) 0 1px, transparent 1px ${minute}%)` }}
      >
        {unclear.map((r) => (
          <span
            key={r.start}
            className="hatch absolute inset-y-0 bg-paper"
            style={{ left: `${at(r.start)}%`, width: `${Math.max(0.6, at(r.end) - at(r.start))}%` }}
            title={formatMinuteRange(r, lang)}
          />
        ))}
        {hints.map((h, i) => (
          <span key={i} className="absolute inset-y-0 w-1 -translate-x-1/2 rounded-full bg-gold-deep" style={{ left: `${at(h.seconds)}%` }} title={`${h.at} ${h.note || h.quote}`} />
        ))}
      </div>

      <div className="relative mt-1 h-4 text-2xs tabular-nums text-slate" aria-hidden="true">
        {ticks.map((t, i) => (
          <span key={t} className={cn("absolute whitespace-nowrap", i > 0 && "-translate-x-1/2", at(t) > 97 && "-translate-x-full")} style={{ left: `${at(t)}%` }}>
            {Math.round(t / 60)}
            {en ? " min" : "분"}
          </span>
        ))}
      </div>
    </figure>
  );
}

const TODAY = {
  ko: { title: "오늘의 복습", start: "복습 시작", all: (n: number) => `오늘 카드 ${n}장을 모두 봤어요.`, none: "오늘 복습할 카드가 없어요.", label: (n: number, d: number) => `오늘 카드 ${n}장 중 ${d}장 복습함` },
  en: { title: "Today's review", start: "Start review", all: (n: number) => `You've seen all ${n} of today's cards.`, none: "No cards to review today.", label: (n: number, d: number) => `${d} of today's ${n} cards reviewed` },
};

/** Today's review at a glance. Both numbers come from the server. */
export function TodayCard({ className }: { className?: string }) {
  const today = useReviewToday();
  const t = useCopy(TODAY);
  if (today.isLoading || today.error || !today.data) return null;
  const due = today.data.cards.length;
  const done = today.data.done;
  const total = due + done;

  return (
    <section className={cn("window p-4", className)} aria-labelledby="today-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="today-title" className="text-sm font-semibold">{t.title}</h2>
        {total ? <span className="text-xs tabular-nums text-slate">{done} / {total}</span> : null}
      </div>
      {total ? (
        <>
          <Tally total={total} filled={done} label={t.label(total, Math.min(done, total))} className="mt-3" />
          {due ? (
            <Link to="/app/remember" className="btn-ink mt-4 w-full">{t.start}</Link>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-ink">{t.all(total)}</p>
          )}
        </>
      ) : (
        <p className="mt-1.5 text-sm leading-relaxed text-slate">{t.none}</p>
      )}
    </section>
  );
}

/* The landing page's card colours, one per course, the same one every time. */
const TONES = [
  { mark: "bg-sky text-ink", dot: "bg-[#7FA3D6]" },
  { mark: "bg-blush text-ink", dot: "bg-[#D99A92]" },
  { mark: "bg-sage text-ink", dot: "bg-[#86B38C]" },
  { mark: "bg-peach text-ink", dot: "bg-[#E7A86E]" },
  { mark: "bg-gold-tint text-ink", dot: "bg-gold-deep" },
];

export const courseTone = (id: string) => TONES[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length];

/** A course's first letter on its colour. */
export function CourseMark({ name, id, size = "md" }: { name: string; id: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center font-semibold",
        size === "sm" ? "h-6 w-6 rounded-md text-2xs" : size === "lg" ? "h-10 w-10 rounded-xl text-base" : "h-8 w-8 rounded-lg text-xs",
        courseTone(id).mark,
      )}
      aria-hidden="true"
    >
      {name.trim().charAt(0)}
    </span>
  );
}

/** A course's colour as a dot, for lists. */
export function CourseDot({ id, className }: { id: string; className?: string }) {
  return <span className={cn("h-2 w-2 shrink-0 rounded-full", courseTone(id).dot, className)} aria-hidden="true" />;
}
