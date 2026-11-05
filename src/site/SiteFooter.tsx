import { Link } from "react-router-dom";
import { Wordmark } from "@/brand/Wordmark";
import { useLang } from "@/lib/lang";
import { siteCopy } from "./copy";

export function SiteFooter() {
  const { lang } = useLang();
  const t = siteCopy[lang].footer;
  return (
    <footer className="border-t border-rule">
      <div className="page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Wordmark beeClassName="h-6" />
          <p className="text-xs text-slate">{t.company}</p>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link to="/privacy" className="text-slate hover:text-ink">{t.privacy}</Link>
          <a href="mailto:info@preplitai.com" className="text-slate hover:text-ink">
            {t.contact} · info@preplitai.com
          </a>
        </nav>
      </div>
    </footer>
  );
}
