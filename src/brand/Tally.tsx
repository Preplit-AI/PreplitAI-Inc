import { cn } from "@/lib/cn";

/*
 * The tally: the app's only progress drawing. One segment is one unit of work
 * (a card, a week); a filled segment is work that was actually done. It never
 * shows a percentage and never invents a number, so it can stand where other
 * study apps count days in a row.
 */

type Props = {
  total: number;
  filled: number;
  label: string;
  /** "night" on Juno's dark panel or a dark band. */
  tone?: "light" | "night";
  className?: string;
};

export function Tally({ total, filled, label, tone = "light", className }: Props) {
  if (total <= 0) return null;
  const done = Math.max(0, Math.min(filled, total));
  return (
    <div role="img" aria-label={label} className={cn("flex flex-wrap gap-1", className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          data-tally=""
          data-done={i < done ? "" : undefined}
          className={cn(
            "h-2 min-w-[8px] max-w-[30px] flex-1 basis-[8px] rounded-full transition-colors duration-300",
            i < done ? (tone === "night" ? "bg-gold" : "bg-ink") : tone === "night" ? "bg-night-line" : "bg-bone-deep",
          )}
        />
      ))}
    </div>
  );
}
