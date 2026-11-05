import { cn } from "@/lib/cn";

/*
 * The comb: Junbee's only progress device. One cell is one unit of work; a
 * filled cell is work that was actually done. It never shows a percentage and
 * never invents a number, so it can stand where other study apps count days in a row.
 */

type CombProps = {
  total: number;
  filled: number;
  /** Cells per row before the comb wraps. */
  perRow?: number;
  /** Width of one cell in pixels. */
  cell?: number;
  label: string;
  className?: string;
};

const SQRT3 = Math.sqrt(3);

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

export function Comb({ total, filled, perRow = 5, cell = 36, label, className }: CombProps) {
  if (total <= 0) return null;
  const columns = Math.min(total, perRow);
  const rows = Math.ceil(total / columns);
  const r = cell / SQRT3; // centre to vertex, for a pointy-top cell `cell` wide
  const gap = 2.5;
  const width = columns * cell + (rows > 1 ? cell / 2 : 0) + 4;
  const height = r * 2 + (rows - 1) * r * 1.5 + 4;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width.toFixed(2)} ${height.toFixed(2)}`}
      width={width}
      height={height}
      className={cn("max-w-full", className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const row = Math.floor(i / columns);
        const col = i % columns;
        const cx = 2 + cell / 2 + col * cell + (row % 2 ? cell / 2 : 0);
        const cy = 2 + r + row * r * 1.5;
        const done = i < filled;
        return (
          <polygon
            key={i}
            points={hexPoints(cx, cy, r - gap / 2)}
            className={cn(
              "transition-[fill,stroke] duration-300 ease-out",
              done ? "fill-maroon stroke-maroon" : "fill-transparent stroke-slate-light",
            )}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

/** A single outlined cell with a numeral inside, for real sequences only. */
export function HexNumeral({ n, className }: { n: number; className?: string }) {
  const r = 22;
  return (
    <svg viewBox="0 0 40 46" aria-hidden="true" className={cn("h-11 w-auto", className)}>
      <polygon points={hexPoints(20, 23, r - 1)} className="fill-paper stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />
      <text x="20" y="24" textAnchor="middle" dominantBaseline="central" className="fill-ink font-sans text-[15px] font-semibold">
        {n}
      </text>
    </svg>
  );
}
