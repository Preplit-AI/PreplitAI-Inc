import { cn } from "@/lib/cn";

/** The Preplit AI mark: the "p" in its graduation cap, then the name. */
export function LogoMark({ className, white = false }: { className?: string; white?: boolean }) {
  return (
    <img
      src={white ? "/brand/preplit-mark-white-256.png" : "/brand/preplit-mark-256.png"}
      alt=""
      width={26}
      height={28}
      draggable={false}
      className={cn("h-7 w-auto select-none", className)}
    />
  );
}

export function Wordmark({ className, markClassName, white = false }: { className?: string; markClassName?: string; white?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} white={white} />
      <span className={cn("font-sans text-[1.3125rem] font-semibold leading-none tracking-[-0.035em]", white ? "text-white" : "text-ink")}>
        Preplit AI
      </span>
    </span>
  );
}
