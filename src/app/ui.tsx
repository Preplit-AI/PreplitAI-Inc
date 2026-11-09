import { useEffect, useId, useRef, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";

export function AppTitle({ children }: { children: string }) {
  return (
    <Helmet>
      <title>{`${children} · Preplit AI`}</title>
      <meta name="robots" content="noindex" />
    </Helmet>
  );
}

/** A native <dialog>: focus trapping, Escape and the backdrop come from the browser. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { lang } = useLang();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[min(100vw-2rem,30rem)] rounded-2xl border border-rule bg-white p-0 text-ink shadow-float",
        className,
      )}
    >
      {open ? (
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="display text-xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === "en" ? "Close" : "닫기"}
              className="-mr-2 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-bone hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}

export function ErrorLine({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="text-sm font-medium text-maroon">{children}</p>;
}

export function LoadingLine({ children }: { children?: string }) {
  const { lang } = useLang();
  return <p className="py-10 text-sm text-slate" aria-busy="true">{children ?? (lang === "en" ? "Loading…" : "불러오는 중이에요.")}</p>;
}

/** Shows "[불명확]" (or "[unclear]") as a mark, so the gap is visible rather than read past. */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[불명확\]|\[unclear\])/);
  return (
    <>
      {parts.map((part, i) =>
        part === "[불명확]" || part === "[unclear]" ? (
          <mark key={i} className="rounded bg-honey-tint px-1 text-ink">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
