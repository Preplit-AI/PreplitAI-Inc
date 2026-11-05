import type { TimeRange } from "./types";

const dateFormat = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });

/** "11월 3일" */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** "50분", "1시간 5분". Rounds to whole minutes; under a minute is "1분 미만". */
export function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "1분 미만";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

/** "12~14분", or "12분" when the range sits inside one minute. */
export function formatMinuteRange({ start, end }: TimeRange) {
  const a = Math.floor(start / 60);
  const b = Math.max(a, Math.ceil(end / 60));
  return a === b ? `${a}분` : `${a}~${b}분`;
}

/** "12~14분", "12~14분, 31~33분", or with more than three ranges "12~14분, 31~33분, 40분 외 2곳". */
export function formatRanges(ranges: TimeRange[]) {
  const shown = ranges.slice(0, 3).map(formatMinuteRange).join(", ");
  return ranges.length > 3 ? `${shown} 외 ${ranges.length - 3}곳` : shown;
}

/** Start of the viewer's local day, sent so "today" follows their clock. */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
