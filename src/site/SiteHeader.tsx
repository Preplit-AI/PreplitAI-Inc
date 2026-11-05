import { Link, useLocation } from "react-router-dom";
import { Wordmark } from "@/brand/Wordmark";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/lang";
import { siteCopy } from "./copy";

export function SiteHeader() {
  const { lang, setLang } = useLang();
  const { status } = useAuth();
  const { pathname } = useLocation();
  const t = siteCopy[lang].nav;
  const onHome = pathname === "/";
  const anchor = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-bone/95 backdrop-blur supports-[backdrop-filter]:bg-bone/80">
      <div className="page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Junbee" className="rounded-md">
          <Wordmark />
        </Link>

        <nav aria-label={t.menu} className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href={anchor("learn")} className="text-ink/80 hover:text-ink">{t.learn}</a>
          <a href={anchor("remember")} className="text-ink/80 hover:text-ink">{t.remember}</a>
          <Link to="/privacy" className="text-ink/80 hover:text-ink">{t.privacy}</Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={() => setLang(lang === "ko" ? "en" : "ko")}
            aria-label={t.switchLabel}
            lang={lang === "ko" ? "en" : "ko"}
            className="min-h-[44px] rounded-full px-3 text-sm font-semibold text-slate hover:text-ink"
          >
            {t.switchTo}
          </button>
          {status === "signed-in" ? (
            <Link to="/app/learn" className="btn-ink min-h-[40px] px-4">
              {lang === "ko" ? "내 노트" : "My notes"}
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden min-h-[44px] items-center px-2 text-sm font-semibold text-ink hover:underline sm:inline-flex">
                {t.login}
              </Link>
              <Link to="/signup" className="btn-ink min-h-[40px] px-4">
                {t.start}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
