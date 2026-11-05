import { useState } from "react";
import { Comb } from "@/brand/Comb";
import type { SiteCopy } from "./copy";

/** A three-card review the visitor can do on the page. Runs entirely in the browser. */
export function ReviewDemo({ t }: { t: SiteCopy["remember"]["demo"] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const total = t.cards.length;
  const card = t.cards[index];

  const rate = () => {
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="surface p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="display text-xl">{t.today(total)}</p>
          <Comb total={total} filled={index} cell={34} label={t.combLabel(index, total)} className="mt-3" />
        </div>
        <span className="rounded-full border border-rule-strong px-2.5 py-0.5 text-xs font-semibold text-slate">{t.badge}</span>
      </div>

      <div className="mt-6 min-h-[15rem] border-t border-rule pt-6" aria-live="polite">
        {card ? (
          <div>
            <p className="text-xs text-slate">{t.course}</p>
            <p className="mt-2 font-serif text-[1.35rem] leading-snug text-ink">{card.front}</p>
            {revealed ? (
              <>
                <p className="mt-4 font-serif text-[1.1rem] leading-relaxed text-ink/80">{card.back}</p>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {t.ratings.map((label) => (
                    <button key={label} type="button" onClick={rate} className="btn-quiet min-h-[44px] px-2 text-xs sm:text-sm">
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <button type="button" onClick={() => setRevealed(true)} className="btn-ink mt-6">
                {t.reveal}
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="font-serif text-[1.2rem] text-ink">{t.done(total)}</p>
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setRevealed(false);
              }}
              className="btn-text mt-3"
            >
              {t.restart}
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-slate">{t.hint}</p>
    </div>
  );
}
