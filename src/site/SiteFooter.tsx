import { Link } from "react-router-dom";
import { Wordmark } from "@/brand/Wordmark";
import { useLang } from "@/lib/lang";
import { siteCopy } from "./copy";

export function SiteFooter() {
  const { lang } = useLang();
  const t = siteCopy[lang].footer;
  return (
    <footer className="border-t border-rule">
      <div className="page flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="text-sm text-slate">{t.company}</p>
        </div>
        <nav className="flex gap-6 text-[0.9375rem]">
          <Link to="/privacy" className="text-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-ink">{t.privacy}</Link>
          <a href="mailto:info@preplitai.com" className="text-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-ink">{t.contact}</a>
        </nav>
      </div>
    </footer>
  );
}
