import { JunbeeMessage } from "@/brand/JunbeeMessage";
import { cn } from "@/lib/cn";
import type { SiteCopy } from "./copy";

/** What a finished lecture note looks like. Always labelled as an example. */
export function ExampleNote({ t, className }: { t: SiteCopy["example"]; className?: string }) {
  return (
    <figure
      className={cn(
        "surface relative p-5 shadow-[0_1px_0_rgba(21,24,30,0.04),0_30px_60px_-30px_rgba(21,24,30,0.35)] sm:p-7",
        className,
      )}
    >
      <span className="absolute right-4 top-4 rounded-full border border-rule-strong px-2.5 py-0.5 text-xs font-semibold text-slate">
        {t.badge}
      </span>
      <p className="text-sm text-slate">
        {t.course} <span aria-hidden="true">/</span> {t.lecture}
      </p>
      <h3 className="display mt-1 text-2xl">{t.topic}</h3>
      <p className="mt-1 text-xs text-slate">{t.meta}</p>

      <p className="mt-5 border-t border-rule pt-5 font-serif text-[1.05rem] leading-relaxed text-ink">{t.summary}</p>

      <div className="mt-5 border-l-[3px] border-honey pl-4">
        <p className="text-sm font-semibold text-ink">{t.flagLabel}</p>
        <p className="mt-1 font-serif text-[1.05rem] leading-relaxed text-ink">
          {t.flagQuote} <span className="whitespace-nowrap font-sans text-xs text-slate">{t.flagAt}</span>
        </p>
      </div>

      <JunbeeMessage text={t.junbee} className="mt-6 bg-bone/60" />
    </figure>
  );
}
