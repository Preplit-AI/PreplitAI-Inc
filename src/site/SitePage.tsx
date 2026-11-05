import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useDocumentLang, useLang } from "@/lib/lang";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

const SITE_URL = "https://preplitai.com";

/** Frame for every public page: header, footer, title, description, language. */
export function SitePage({
  title,
  description,
  path,
  noindex,
  children,
}: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  children: ReactNode;
}) {
  const { lang } = useLang();
  useDocumentLang(lang);
  return (
    <>
      <Helmet>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        {description ? <meta property="og:description" content={description} /> : null}
        <meta property="og:title" content={title} />
        {path ? <link rel="canonical" href={SITE_URL + path} /> : null}
        {noindex ? <meta name="robots" content="noindex" /> : null}
      </Helmet>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bone">
        {lang === "ko" ? "본문으로 건너뛰기" : "Skip to content"}
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
