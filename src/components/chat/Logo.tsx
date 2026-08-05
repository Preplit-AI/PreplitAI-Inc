import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-16 w-16 items-center justify-center">
        <img src="/logo.png" alt="PreplitAI" className="h-16 w-16 object-contain" />
      </div>
    </div>
  );
}
