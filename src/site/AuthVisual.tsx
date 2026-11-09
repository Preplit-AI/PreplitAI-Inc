import { JunoMessage } from "@/brand/JunoMessage";
import { Tally } from "@/brand/Tally";
import { cn } from "@/lib/cn";
import type { Lang } from "@/lib/lang";

const words = {
  ko: {
    title: "오늘의 복습",
    course: "운영체제 · 9주차",
    q: "교착 상태가 생기는 네 가지 조건은?",
    a: "상호 배제, 점유 대기, 비선점, 순환 대기.",
    ratings: ["다시", "어려움", "알맞음", "쉬움"],
    juno: "9주차 노트 정리했어요. 카드 8장.",
    tally: "오늘 카드 8장 중 4장 복습함",
  },
  en: {
    title: "Today's review",
    course: "Operating Systems · Week 9",
    q: "What are the four conditions for deadlock?",
    a: "Mutual exclusion, hold and wait, no preemption, circular wait.",
    ratings: ["Again", "Hard", "Good", "Easy"],
    juno: "Week 9 notes are ready. 8 cards.",
    tally: "4 of today's 8 cards reviewed",
  },
} as const;

/** The product beside the form: what signing in leads to. Decorative, so hidden from screen readers. */
export function AuthVisual({ lang, className }: { lang: Lang; className?: string }) {
  const t = words[lang];
  return (
    <div className={cn("glass glass-blush flex-col justify-center gap-4 rounded-panel p-8 xl:p-14", className)} aria-hidden="true">
      <div className="window p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-medium">{t.title}</p>
          <p className="text-sm tabular-nums text-slate">4 / 8</p>
        </div>
        <Tally total={8} filled={4} label={t.tally} className="mt-4" />
        <p className="mt-6 text-sm text-slate">{t.course}</p>
        <p className="display mt-2 text-[1.5rem] leading-snug">{t.q}</p>
        <p className="mt-4 border-t border-dashed border-rule-strong pt-4 leading-relaxed text-ink">{t.a}</p>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {t.ratings.map((r, i) => (
            <span
              key={r}
              className={cn(
                "flex min-h-[44px] items-center justify-center rounded-full border text-sm font-medium",
                i === 2 ? "border-ink bg-ink text-white" : "border-rule-strong text-ink",
              )}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
      <JunoMessage text={t.juno} />
    </div>
  );
}
