import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { JunoAvatar } from "@/brand/Juno";
import { useLang } from "@/lib/lang";

/*
 * Juno, on every signed-in screen.
 *
 * On a wide screen (1600px and up) Juno sits beside the work as a column of its
 * own and stays there (closing it is remembered on this device). On a laptop it
 * slides in over the right edge, framed like a tablet; on a phone it is a sheet
 * from the bottom. Wherever it is, it
 * already knows what the student is looking at, so asking never means leaving
 * the work. Once opened it stays mounted, so an answer still being written
 * keeps coming while the panel is closed.
 */

const JunoPanel = lazy(() => import("./JunoPanel"));

const WIDE = "(min-width: 1600px)";
const PREF = "preplit.juno.docked";

export type Asked = { text: string; at: number };

type JunoValue = {
  isOpen: boolean;
  /** Open as a column beside the page, which then makes room for it. */
  docked: boolean;
  /** Opens Juno; with a question, it is put in the box ready to send. */
  open: (question?: string) => void;
  close: () => void;
};

const JunoContext = createContext<JunoValue>({ isOpen: false, docked: false, open: () => {}, close: () => {} });

export const useJuno = () => useContext(JunoContext);

function readPref(): boolean | null {
  try {
    const value = window.localStorage.getItem(PREF);
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
}

function writePref(value: boolean) {
  try {
    window.localStorage.setItem(PREF, value ? "1" : "0");
  } catch {
    /* A private window: the choice lasts until the tab closes. */
  }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function JunoProvider({ children }: { children: ReactNode }) {
  const wide = useMedia(WIDE);
  const [dockOpen, setDockOpen] = useState(() => readPref() ?? true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [asked, setAsked] = useState<Asked | null>(null);
  // Bumped only when the student opens Juno, so the box takes focus then and never on page load.
  const [focusKey, setFocusKey] = useState(0);

  const isOpen = wide ? dockOpen : overlayOpen;
  const [used, setUsed] = useState(isOpen);
  useEffect(() => {
    if (isOpen) setUsed(true);
  }, [isOpen]);

  const open = useCallback(
    (question?: string) => {
      if (question) setAsked({ text: question, at: Date.now() });
      setFocusKey((key) => key + 1);
      if (wide) {
        setDockOpen(true);
        writePref(true);
      } else {
        setOverlayOpen(true);
      }
    },
    [wide],
  );

  const close = useCallback(() => {
    if (wide) {
      setDockOpen(false);
      writePref(false);
    } else {
      setOverlayOpen(false);
    }
  }, [wide]);

  const value = useMemo(() => ({ isOpen, docked: wide && dockOpen, open, close }), [isOpen, wide, dockOpen, open, close]);
  const { lang } = useLang();

  return (
    <JunoContext.Provider value={value}>
      {children}
      {/* On a phone or tablet; with the sidebar showing, Juno's card there is the way in. */}
      {isOpen ? null : (
        <button
          type="button"
          onClick={() => open()}
          aria-label={lang === "en" ? "Ask Juno" : "Juno에게 묻기"}
          className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-3 z-30 flex h-12 items-center gap-2 rounded-full bg-night pl-1.5 pr-1.5 text-white shadow-float transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:pr-4 lg:hidden"
        >
          <JunoAvatar size={36} tone="night" />
          <span className="hidden text-sm font-medium sm:inline">{lang === "en" ? "Ask Juno" : "Juno에게 묻기"}</span>
        </button>
      )}
      {used ? (
        <Suspense fallback={null}>
          <JunoPanel open={isOpen} docked={wide} onClose={close} asked={asked} focusKey={focusKey} />
        </Suspense>
      ) : null}
    </JunoContext.Provider>
  );
}
