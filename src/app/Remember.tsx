import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { JunoAvatar } from "@/brand/Juno";
import { Tally } from "@/brand/Tally";
import { ApiError, request } from "@/lib/api";
import { useCopy } from "@/lib/lang";
import type { ReviewCard } from "@/lib/types";
import { PageHead } from "@/workspace/kit";
import { movement } from "@/workspace/movements";
import { NoteFlow } from "./parts";
import { keys, useReviewToday } from "./queries";
import { AppTitle, ErrorLine, LoadingLine } from "./ui";

/*
 * 03 Remember: today's review. Every number on this screen is counted by the
 * server: cards due now and cards already reviewed today. The tally is drawn
 * from exactly those two, and there is no score, percentage or day count.
 */

const COPY = {
  ko: {
    title: "기억",
    heading: (n: number) => `오늘의 ${n}장`,
    loadError: "오늘의 카드를 불러오지 못했어요. 새로고침해 주세요.",
    ratings: ["다시", "어려움", "알맞음", "쉬움"],
    allDone: (n: number) => `오늘 카드 ${n}장을 모두 봤어요.`,
    toBuild: "쌓기에서 시험 준비 보기",
    noneTitle: "오늘 복습할 카드가 없어요.",
    noneText: "강의를 올리면 노트에서 카드가 만들어지고, 잊을 때쯤 여기에 다시 나와요.",
    toLearn: "배움으로",
    tally: (n: number, d: number) => `오늘 카드 ${n}장 중 ${d}장 복습함`,
    left: (n: number) => `남은 카드 ${n}장`,
    how: "카드마다 답을 떠올린 뒤 확인하고, 얼마나 쉬웠는지 고르세요.",
    start: "복습 시작",
    howEasy: "얼마나 쉬웠나요?",
    keys: "키보드 1~4로도 고를 수 있어요.",
    show: "답 보기",
    saveFailed: "저장하지 못했어요. 다시 눌러 주세요.",
  },
  en: {
    title: "Remember",
    heading: (n: number) => `Today's ${n} card${n === 1 ? "" : "s"}`,
    loadError: "Couldn't load today's cards. Please refresh.",
    ratings: ["Again", "Hard", "Good", "Easy"],
    allDone: (n: number) => `You've seen all ${n} of today's cards.`,
    toBuild: "See exam prep in Build",
    noneTitle: "No cards to review today.",
    noneText: "Record a lecture and its note becomes cards, which come back here just before you'd forget them.",
    toLearn: "Go to Learn",
    tally: (n: number, d: number) => `${d} of today's ${n} cards reviewed`,
    left: (n: number) => `${n} card${n === 1 ? "" : "s"} left`,
    how: "Recall the answer for each card, check it, then choose how easy it was.",
    start: "Start review",
    howEasy: "How easy was it?",
    keys: "You can also press 1–4.",
    show: "Show answer",
    saveFailed: "Couldn't save. Please press it again.",
  },
};

const RATING_KEYS = ["1", "2", "3", "4"] as const;

/** A session works from a snapshot, so a background refetch cannot count a card twice. */
type Session = { queue: ReviewCard[]; index: number; revealed: boolean; reviewed: number; baseDone: number };

export default function Remember() {
  const client = useQueryClient();
  const t = useCopy(COPY);
  const today = useReviewToday();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Opened from a course: only that course's cards. Every other number stays the whole day's.
  const [params] = useSearchParams();
  const courseId = params.get("course");
  const cards = useMemo(() => (today.data?.cards ?? []).filter((c) => !courseId || c.courseId === courseId), [today.data?.cards, courseId]);
  const due = cards.length;
  const total = session ? session.baseDone + session.queue.length : (today.data?.done ?? 0) + due;
  const done = session ? session.baseDone + session.reviewed : today.data?.done ?? 0;
  const card = session ? session.queue[session.index] : undefined;
  const finished = session !== null && !card;

  const reveal = useCallback(() => setSession((s) => (s ? { ...s, revealed: true } : s)), []);

  const rate = useCallback(
    async (rating: number) => {
      if (!session || !card || saving) return;
      setSaving(true);
      setError(null);
      try {
        await request(`/review/cards/${card.id}`, { method: "POST", body: { rating } });
      } catch (err) {
        // Already reviewed elsewhere: move on, it is done.
        if (!(err instanceof ApiError && err.code === "AlreadyReviewed")) {
          setError(err instanceof ApiError ? err.message : t.saveFailed);
          setSaving(false);
          return;
        }
      }
      setSaving(false);
      setSession((s) => (s ? { ...s, index: s.index + 1, revealed: false, reviewed: s.reviewed + 1 } : s));
    },
    [session, card, saving, t.saveFailed],
  );

  // Space or Enter shows the answer; 1 to 4 rate it.
  useEffect(() => {
    if (!session || !card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, button")) return;
      if (!session.revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        reveal();
      } else if (session.revealed) {
        const i = RATING_KEYS.indexOf(e.key as (typeof RATING_KEYS)[number]);
        if (i >= 0) rate(i + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, card, reveal, rate]);

  // When the session ends, take today's counts from the server again.
  useEffect(() => {
    if (finished) client.invalidateQueries({ queryKey: keys.review });
  }, [finished, client]);

  if (today.isLoading) return <LoadingLine />;
  if (today.error) return <p className="py-10 text-sm">{t.loadError}</p>;

  const allDone = (
    <div className="flex items-start gap-3">
      <JunoAvatar size={36} mood="happy" />
      <div>
        <p className="text-xs font-semibold">Juno</p>
        <p className="mt-0.5 text-base font-medium">{t.allDone(total)}</p>
        <Link to="/workspace/build" className="btn-text mt-1">{t.toBuild}</Link>
      </div>
    </div>
  );

  return (
    <div>
      <AppTitle>{t.title}</AppTitle>
      <PageHead movement={movement("remember")} title={total ? t.heading(total) : undefined} />

      {total === 0 ? (
        <div className="window mt-5 max-w-[44rem] px-5 py-6">
          <p className="text-base font-semibold">{t.noneTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate">{t.noneText}</p>
          <NoteFlow className="mt-5 max-w-sm" />
          <Link to="/app/learn" className="btn-ink mt-5">{t.toLearn}</Link>
        </div>
      ) : (
        <div className="mt-5 max-w-[44rem]">
          <div className="flex items-center gap-3">
            <Tally total={total} filled={done} label={t.tally(total, Math.min(done, total))} className="min-w-0 flex-1" />
            <span className="shrink-0 text-xs tabular-nums text-slate">{Math.min(done, total)} / {total}</span>
          </div>

          <div className="window mt-4 min-h-[18rem] px-5 py-6 sm:px-7">
            {!session ? (
              due ? (
                <>
                  <p className="text-base font-semibold">{t.left(due)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{t.how}</p>
                  <button type="button" onClick={() => setSession({ queue: cards, index: 0, revealed: false, reviewed: 0, baseDone: today.data!.done })} className="btn-ink mt-5 px-6">
                    {t.start}
                  </button>
                </>
              ) : (
                allDone
              )
            ) : card ? (
              <div aria-live="polite">
                <p className="text-xs text-slate">
                  <Link to={`/workspace/courses/${card.courseId}`} className="hover:text-ink hover:underline hover:underline-offset-4">{card.courseName}</Link>{" "}
                  <span aria-hidden="true">/</span>{" "}
                  <Link to={`/app/learn/${card.lectureId}`} className="hover:text-ink hover:underline hover:underline-offset-4">{card.lectureTitle}</Link>
                </p>
                <p className="display mt-3 text-2xl leading-snug">{card.front}</p>

                {session.revealed ? (
                  <>
                    <p className="mt-4 border-t border-dashed border-rule-strong pt-4 text-base leading-relaxed text-ink/85">{card.back}</p>
                    <div className="mt-6 grid grid-cols-4 gap-2" role="group" aria-label={t.howEasy}>
                      {t.ratings.map((label, i) => (
                        <button key={label} type="button" disabled={saving} onClick={() => rate(i + 1)} className="btn-quiet px-1 text-xs" aria-keyshortcuts={RATING_KEYS[i]}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 hidden text-2xs text-slate sm:block">{t.keys}</p>
                  </>
                ) : (
                  <button type="button" onClick={reveal} className="btn-ink mt-6 w-full sm:w-auto sm:px-8" aria-keyshortcuts="Space">{t.show}</button>
                )}
                <div className="mt-3"><ErrorLine>{error}</ErrorLine></div>
              </div>
            ) : (
              allDone
            )}
          </div>
        </div>
      )}
    </div>
  );
}
