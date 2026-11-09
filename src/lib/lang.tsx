import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/*
 * The language of the whole site: the landing page, the sign-in pages and the
 * workspace. Korean is the source and the default; English is the translation.
 * The landing page remembers the language last read (public/js/lang.js writes
 * the same key), so choosing English there carries into the workspace.
 */
export type Lang = "ko" | "en";

const STORAGE_KEY = "jb_lang";

function initialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ko" || stored === "en") return stored;
  } catch {
    // Storage can be blocked; Korean is the default anyway.
  }
  return "ko";
}

type LangValue = { lang: Lang; setLang: (lang: Lang) => void };

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered across visits; nothing else depends on it.
    }
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

/** Outside the provider (a component rendered on its own, as in a test) the language is Korean. */
const FALLBACK: LangValue = { lang: "ko", setLang: () => {} };

export function useLang() {
  return useContext(LangContext) ?? FALLBACK;
}

/** The words of a component, in the language showing: `const t = useCopy(COPY)`. */
export function useCopy<T>(copy: Record<Lang, T>): T {
  return copy[useLang().lang];
}

/** Sets <html lang> for the page that is showing. */
export function useDocumentLang(lang: Lang) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
