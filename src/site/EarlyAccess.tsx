import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { hasDevAccess } from "@/lib/earlyAccess";
import { useLang } from "@/lib/lang";
import { siteCopy, type SiteCopy } from "./copy";

/*
 * Preplit AI isn't public yet. Logging in, signing up and every screen of the app
 * show this note instead; the backend is unchanged. A developer passes once with
 * ?dev=1 on any page (src/lib/earlyAccess.ts). The static pages show the same
 * note from public/js/early.js.
 */

function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.8c.4 3.2 1.4 4.6 4.2 5.2-2.8.6-3.8 2-4.2 5.2-.4-3.2-1.4-4.6-4.2-5.2 2.8-.6 3.8-2 4.2-5.2zM12.6 10.6c.2 1.3.6 1.9 1.7 2.1-1.1.2-1.5.8-1.7 2.1-.2-1.3-.6-1.9-1.7-2.1 1.1-.2 1.5-.8 1.7-2.1z" />
    </svg>
  );
}

/** The note itself, as a modal dialog: the rest of the page cannot be used while it is open. */
export function EarlyAccessDialog({ open, feature, onClose }: { open: boolean; feature?: string; onClose: () => void }) {
  const { lang } = useLang();
  const t = siteCopy[lang].early;
  const ref = useRef<HTMLDialogElement>(null);
  const ok = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      // Focus starts on the main button, so Enter closes the note.
      ok.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="early"
      aria-labelledby="early-h"
      aria-describedby="early-p"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // The card fills the dialog, so a click on the dialog itself is a click on the dimmed page around it.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="early__card">
        <button type="button" className="early__x" onClick={onClose} aria-label={t.close}>
          <X aria-hidden="true" />
        </button>
        <span className="early__mark" aria-hidden="true">
          <img src="/brand/preplit-mark-256.png" alt="" draggable={false} />
          <i className="early__dot" />
        </span>
        <p className="early__badge">
          <Sparkle />
          <span>{t.badge}</span>
        </p>
        <h2 id="early-h">{t.title}</h2>
        {feature ? <p className="early__feature">{feature}</p> : null}
        <p className="early__body" id="early-p">{t.body}</p>
        <button ref={ok} type="button" className="early__ok" onClick={onClose}>
          {t.button}
        </button>
      </div>
    </dialog>
  );
}

/**
 * Stands in front of a route while Preplit AI isn't public. With showPage the page
 * shows behind the note (log-in, sign-up); without it nothing of the route mounts,
 * so the app makes no requests. Closing the note goes back to the landing page.
 */
export function EarlyWall({ feature, showPage = false, children }: { feature: keyof SiteCopy["early"]["features"]; showPage?: boolean; children: ReactNode }) {
  const [blocked] = useState(() => !hasDevAccess());
  const { lang } = useLang();
  const c = siteCopy[lang];
  if (!blocked) return <>{children}</>;
  return (
    <>
      {showPage ? children : <div className="min-h-dvh bg-paper" aria-hidden="true" />}
      <EarlyAccessDialog open feature={c.early.features[feature]} onClose={() => window.location.assign(c.home)} />
    </>
  );
}
