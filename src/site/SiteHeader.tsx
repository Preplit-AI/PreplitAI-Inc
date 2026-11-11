import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { hasDevAccess } from "@/lib/earlyAccess";
import { useLang } from "@/lib/lang";
import { siteCopy } from "./copy";
import { EarlyAccessDialog } from "./EarlyAccess";

/**
 * The landing page's header on the React pages: one white bar floating over the
 * page, the mark, four words in spaced capitals, the language, log in and Start.
 */
export function SiteHeader() {
  const { lang, setLang } = useLang();
  const { status, logout } = useAuth();
  const c = siteCopy[lang];
  const t = c.nav;
  const words = [
    [`${c.home}#features`, t.product],
    [`${c.home}#juno`, t.juno],
    [c.pricing, t.pricing],
    [`${c.home}#faq`, t.faq],
  ] as const;
  const word = `text-[0.8125rem] font-semibold text-ink/80 transition-colors hover:text-ink ${lang === "en" ? "uppercase tracking-[0.14em]" : "tracking-[0.02em]"}`;

  // Signing up and logging in are open; the workspace is not public yet, so its link
  // opens the early-access note instead (a developer passes with ?dev=1).
  const [early, setEarly] = useState<string | null>(null);
  const gate = (label: string) => (event: MouseEvent) => {
    if (hasDevAccess()) return;
    event.preventDefault();
    setEarly(label);
  };

  return (
    <header className="sticky top-0 z-30 px-3 pt-2.5 sm:px-6 sm:pt-4">
      <div className="mx-auto flex h-[60px] max-w-[70rem] items-center justify-between gap-4 rounded-full border border-ink/[0.06] bg-white pl-5 pr-2 shadow-[0_1px_2px_rgb(10_10_10/0.04),0_18px_44px_-24px_rgb(10_10_10/0.38)] sm:h-[76px] sm:pl-8 sm:pr-3.5">
        {/* The landing page is static, outside this app: plain links, not router ones. */}
        <a href={c.home} aria-label="Preplit AI" className="shrink-0 rounded-md">
          <img src="/brand/preplit-mark-256.png" alt="" className="h-[30px] w-auto sm:h-9" draggable={false} />
        </a>

        <nav aria-label={t.menu} className="hidden items-center gap-8 lg:flex">
          {words.map(([href, label]) => (
            <a key={href} href={href} className={word}>{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setLang(lang === "ko" ? "en" : "ko")}
            aria-label={t.switchLabel}
            lang={lang === "ko" ? "en" : "ko"}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/[0.12] pl-3 pr-3.5 text-[0.8125rem] font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-bone"
          >
            <Globe className="h-[18px] w-[18px] text-slate" strokeWidth={1.4} aria-hidden="true" />
            {t.switchTo}
          </button>
          {status === "signed-in" ? (
            <>
              <button type="button" onClick={() => { logout().finally(() => window.location.assign(c.home)); }} className="hidden min-h-[44px] items-center px-2.5 text-[0.9375rem] font-medium text-ink sm:inline-flex">{t.logout}</button>
              <Link to="/workspace" onClick={gate(t.myNotes)} className="btn-ink">{t.myNotes}</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden min-h-[44px] items-center px-2.5 text-[0.9375rem] font-medium text-ink sm:inline-flex">{t.login}</Link>
              <Link to="/signup" className="btn-ink gap-1.5 sm:h-12 sm:px-6">
                {t.start}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
      <EarlyAccessDialog open={early !== null} feature={early ?? undefined} onClose={() => setEarly(null)} />
    </header>
  );
}
