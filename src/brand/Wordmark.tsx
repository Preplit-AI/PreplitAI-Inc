import { Bee } from "./Bee";
import { cn } from "@/lib/cn";

/** The bee and the name. Never "Junbee AI" or "Junbee App": the name carries the category. */
export function Wordmark({ className, beeClassName }: { className?: string; beeClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Bee className={cn("h-7 w-auto", beeClassName)} />
      <span className="font-sans text-[1.375rem] font-bold leading-none tracking-[-0.035em] text-ink">Junbee</span>
    </span>
  );
}
