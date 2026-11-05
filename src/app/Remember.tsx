import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Comb } from "@/brand/Comb";
import { ApiError, request } from "@/lib/api";
import type { ReviewCard } from "@/lib/types";
import { keys, useReviewToday } from "./queries";
import { AppTitle, ErrorLine, LoadingLine } from "./ui";

/*
 * Today's review. Every number on this screen is counted by the server: cards
 * due now and cards already reviewed today. The comb is drawn from exactly
 * those two, and there is no score, percentage or day count anywhere.
 */

const RATINGS = [
  { value: 1, label: "다시", key: "1" },
  { value: 2, label: "어려움", key: "2" },
  { value: 3, label: "알맞음", key: "3" },
  { value: 4, label: "쉬움", key: "4" },
] as const;

/** A session works from a snapshot, so a background refetch cannot count a card twice. */
type Session = { queue: ReviewCard[]; index: number; revealed: boolean; reviewed: number; baseDone: number };

export default function Remember() {
  const client = useQueryClient();
  const today = useReviewToday();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const due = today.data?.cards.length ?? 0;
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
          setError(err instanceof ApiError ? err.message : "저장하지 못했어요. 다시 눌러 주세요.");
          setSaving(false);
          return;
        }
      }
      setSaving(false);
      setSession((s) => (s ? { ...s, index: s.index + 1, revealed: false, reviewed: s.reviewed + 1 } : s));
    },
    [session, card, saving],
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
        const r = RATINGS.find((x) => x.key === e.key);
        if (r) rate(r.value);
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
  if (today.error) return <p className="py-10">오늘의 카드를 불러오지 못했어요. 새로고침해 주세요.</p>;

  const heading = total ? `오늘의 ${total}장` : "기억";

  return (
    <div className="mx-auto max-w-[36rem]">
      <AppTitle>기억</AppTitle>
      <h1 className="display text-4xl">{heading}</h1>

      {total === 0 ? (
        <div className="mt-6 border-t border-rule pt-8">
          <p className="text-lg font-semibold">오늘 복습할 카드가 없어요.</p>
          <p className="mt-2 leading-relaxed text-slate">강의를 올리면 노트에서 카드가 만들어지고, 잊을 때쯤 여기에 다시 나와요.</p>
          <Link to="/app/learn" className="btn-ink mt-6">배움으로</Link>
        </div>
      ) : (
        <>
          <Comb
            total={total}
            filled={Math.min(done, total)}
            cell={40}
            perRow={Math.max(3, Math.ceil(Math.sqrt(total * 1.5)))}
            label={`오늘 카드 ${total}장 중 ${Math.min(done, total)}장 복습함`}
            className="mt-6"
          />

          {!session ? (
            <div className="mt-8 border-t border-rule pt-8">
              {due ? (
                <>
                  <p className="leading-relaxed text-slate">남은 카드 {due}장. 카드마다 답을 떠올린 뒤 확인하고, 얼마나 쉬웠는지 고르세요.</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSession({ queue: today.data!.cards, index: 0, revealed: false, reviewed: 0, baseDone: today.data!.done })
                    }
                    className="btn-primary mt-6 min-h-[52px] px-8 text-base"
                  >
                    복습 시작
                  </button>
                </>
              ) : (
                <p className="text-lg">오늘 카드 {total}장을 모두 봤어요.</p>
              )}
            </div>
          ) : card ? (
            <div className="mt-8 border-t border-rule pt-8" aria-live="polite">
              <p className="text-sm text-slate">
                {card.courseName} <span aria-hidden="true">/</span> {card.lectureTitle}
              </p>
              <p className="mt-3 text-[1.45rem] font-semibold leading-snug">{card.front}</p>

              {session.revealed ? (
                <>
                  <p className="mt-5 border-t border-dashed border-rule-strong pt-5 text-lg leading-relaxed text-ink/85">{card.back}</p>
                  <div className="mt-8 grid grid-cols-4 gap-2" role="group" aria-label="얼마나 쉬웠나요?">
                    {RATINGS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        disabled={saving}
                        onClick={() => rate(r.value)}
                        className="btn-quiet min-h-[52px] px-1 text-sm"
                        aria-keyshortcuts={r.key}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 hidden text-xs text-slate sm:block">키보드 1~4로도 고를 수 있어요.</p>
                </>
              ) : (
                <button type="button" onClick={reveal} className="btn-ink mt-8 min-h-[52px] w-full sm:w-auto sm:px-10" aria-keyshortcuts="Space">
                  답 보기
                </button>
              )}
              <div className="mt-4"><ErrorLine>{error}</ErrorLine></div>
            </div>
          ) : (
            <div className="mt-8 border-t border-rule pt-8">
              <p className="text-lg">오늘 카드 {total}장을 모두 봤어요.</p>
              <Link to="/app/learn" className="btn-text mt-3">배움으로</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
