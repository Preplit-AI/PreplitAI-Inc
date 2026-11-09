import type { Lang } from "./lang";
import type { TimeRange } from "./types";

const dateFormats: Record<Lang, Intl.DateTimeFormat> = {
  ko: new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }),
  en: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }),
};

/** "11월 3일" / "Nov 3" */
export function formatDate(iso: string, lang: Lang = "ko") {
  return dateFormats[lang].format(new Date(iso));
}

/** "50분", "1시간 5분" / "50 min", "1 h 5 min". Rounds to whole minutes. */
export function formatDuration(seconds: number, lang: Lang = "ko") {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return lang === "en" ? "under 1 min" : "1분 미만";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (lang === "en") {
    if (!h) return `${m} min`;
    return m ? `${h} h ${m} min` : `${h} h`;
  }
  if (!h) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

/** "12~14분" / "12–14 min", or one minute when the range sits inside it. */
export function formatMinuteRange({ start, end }: TimeRange, lang: Lang = "ko") {
  const a = Math.floor(start / 60);
  const b = Math.max(a, Math.ceil(end / 60));
  if (lang === "en") return a === b ? `${a} min` : `${a}–${b} min`;
  return a === b ? `${a}분` : `${a}~${b}분`;
}

/** Up to three ranges, then how many more: "12~14분, 31~33분, 40분 외 2곳". */
export function formatRanges(ranges: TimeRange[], lang: Lang = "ko") {
  const shown = ranges
    .slice(0, 3)
    .map((r) => formatMinuteRange(r, lang))
    .join(", ");
  if (ranges.length <= 3) return shown;
  return lang === "en" ? `${shown} and ${ranges.length - 3} more` : `${shown} 외 ${ranges.length - 3}곳`;
}

/** Start of the viewer's local day, sent so "today" follows their clock. */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
