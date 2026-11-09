import type { ReactNode } from "react";
import { JunoAvatar } from "@/brand/Juno";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";
import { useJuno } from "./JunoDock";
import type { Movement } from "./movements";

/*
 * The pieces every workspace screen is built from, so the screens read as one
 * place: the same header, the same way Juno speaks on the page, the same button
 * for asking it. Sized like a tool you use every day, not a poster.
 */

/** A screen's header. A movement's screen says its number, its name and its line. */
export function PageHead({
  movement,
  eyebrow,
  title,
  sub,
  actions,
  className,
}: {
  movement?: Movement;
  eyebrow?: ReactNode;
  title?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const { lang } = useLang();
  const words = movement?.words[lang];
  const line = sub ?? words?.slogan;
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule pb-5", className)}>
      <div className="min-w-0">
        {movement ? (
          <p className="eyebrow">
            <span className="tabular-nums text-ink">{movement.n}</span>
            <span className="tabular-nums">/ 04</span>
            <span className="h-px w-4 bg-rule-strong" aria-hidden="true" />
            {lang === "en" ? "Semester flow" : "학기의 흐름"}
          </p>
        ) : eyebrow ? (
          <p className="eyebrow">{eyebrow}</p>
        ) : null}
        <h1 className={cn("display break-words text-[1.625rem] leading-tight sm:text-[1.875rem]", (movement || eyebrow) && "mt-1.5")}>
          {title ?? words?.name}
        </h1>
        {line ? <p className="mt-1 text-sm text-slate">{line}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Juno speaking on the page: a fact it counted, and the one thing to do about it. */
export function JunoNote({
  say,
  sub,
  children,
  speaking = false,
  className,
}: {
  say: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  speaking?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-3 rounded-card border border-rule bg-white px-4 py-3", className)} role="status">
      <JunoAvatar size={32} speaking={speaking} />
      <div className="min-w-0 flex-1 basis-60">
        <p className="text-sm font-medium leading-snug text-ink">{say}</p>
        {sub ? <p className="mt-0.5 text-sm leading-snug text-slate">{sub}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

/** Opens Juno; with a question, Juno has it in the box ready to send. */
export function AskJuno({ question, children, small = false, className }: { question?: string; children?: ReactNode; small?: boolean; className?: string }) {
  const { open } = useJuno();
  const { lang } = useLang();
  return (
    <button type="button" onClick={() => open(question)} className={cn("btn-quiet pl-1 pr-3.5", small && "min-h-[30px] pr-3 text-xs", className)}>
      <JunoAvatar size={small ? 22 : 26} />
      {children ?? (lang === "en" ? "Ask Juno" : "Juno에게 묻기")}
    </button>
  );
}

/** A section heading inside a screen. */
export function SectionHead({ id, title, aside }: { id?: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex min-h-[32px] items-center justify-between gap-3">
      <h2 id={id} className="text-base font-semibold">{title}</h2>
      {aside}
    </div>
  );
}
