import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { hasDevAccess } from "@/lib/earlyAccess";
import { useLang } from "@/lib/lang";
import { siteCopy, type SiteCopy } from "./copy";

/*
 * The workspace isn't public yet. Signing up and logging in work; every screen
 * of the app shows this note instead, and a signed-in student sees their account
 * named in it, with a way to log out. The backend is unchanged. A developer
 * passes once with ?dev=1 on any page (src/lib/earlyAccess.ts). The static
 * pages show the same note from public/js/early.js.
 */

function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.8c.4 3.2 1.4 4.6 4.2 5.2-2.8.6-3.8 2-4.2 5.2-.4-3.2-1.4-4.6-4.2-5.2 2.8-.6 3.8-2 4.2-5.2zM12.6 10.6c.2 1.3.6 1.9 1.7 2.1-1.1.2-1.5.8-1.7 2.1-.2-1.3-.6-1.9-1.7-2.1 1.1-.2 1.5-.8 1.7-2.1z" />
    </svg>
  );
}

/** The note itself, as a modal dialog: the rest of the page cannot be used while it is open. */
export function EarlyAccessDialog({
  open,
  feature,
  account,
  onClose,
}: {
  open: boolean;
  feature?: string;
  /** The signed-in student, named in the note, with a way to log out. */
  account?: { email: string; onLogout: () => void };
  onClose: () => void;
}) {
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
        {account ? (
          <p className="early__account">
            {t.signedIn}
            <span>{account.email}</span>
          </p>
        ) : null}
        <p className="early__body" id="early-p">{t.body}</p>
        <button ref={ok} type="button" className="early__ok" onClick={onClose}>
          {t.button}
        </button>
        {account ? (
          <button type="button" className="early__logout" onClick={account.onLogout}>
            {t.logout}
          </button>
        ) : null}
      </div>
    </dialog>
  );
}

/**
 * Stands in front of a route while it isn't public. With showPage the page shows
 * behind the note; without it nothing of the route mounts, so the app makes no
 * requests. Closing the note goes back to the landing page; logging out does too.
 */
export function EarlyWall({ feature, showPage = false, children }: { feature: keyof SiteCopy["early"]["features"]; showPage?: boolean; children: ReactNode }) {
  const [blocked] = useState(() => !hasDevAccess());
  const { lang } = useLang();
  const { status, user, logout } = useAuth();
  const c = siteCopy[lang];
  if (!blocked) return <>{children}</>;
  const home = () => window.location.assign(c.home);
  const account = status === "signed-in" && user
    ? { email: user.email, onLogout: () => { logout().finally(home); } }
    : undefined;
  return (
    <>
      {showPage ? children : <div className="min-h-dvh bg-paper" aria-hidden="true" />}
      <EarlyAccessDialog open feature={c.early.features[feature]} account={account} onClose={home} />
    </>
  );
}
