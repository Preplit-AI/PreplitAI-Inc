import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/*
 * Language for the public site. Korean is the source and the default; English
 * is the translation. The pilot app itself is Korean only and does not use this.
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

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void } | null>(null);

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

export function useLang() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside LangProvider");
  return value;
}

/** Sets <html lang> for the page that is showing. */
export function useDocumentLang(lang: Lang) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
