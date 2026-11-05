import { useEffect, useId, useRef, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function AppTitle({ children }: { children: string }) {
  return (
    <Helmet>
      <title>{`${children} · Junbee`}</title>
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
        "m-auto w-[min(100vw-2rem,32rem)] rounded-card border border-rule bg-paper p-0 text-ink shadow-[0_30px_80px_-20px_rgba(21,24,30,0.45)]",
        className,
      )}
    >
      {open ? (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="display text-2xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-slate hover:bg-bone hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}

export function ErrorLine({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="text-sm font-semibold text-maroon">{children}</p>;
}

export function LoadingLine({ children = "불러오는 중이에요." }: { children?: string }) {
  return <p className="py-10 text-slate" aria-busy="true">{children}</p>;
}
