import { cn } from "@/lib/cn";

/*
 * Juno, the study companion inside Preplit AI: a magpie (까치) wearing the
 * Preplit AI cap. In Korea a magpie calling means good news is on its way; Juno
 * brings the exam hint before the exam.
 *
 * Ink and white like the app, a blue-green wing like a real magpie's, and the
 * logo's maroon board and gold tassel. Drawn from simple shapes in a 120 x 120
 * box, so it stays sharp from 14px on the semester map to the 404 page.
 *
 * JunoAvatar is the head and shoulders on a round tile, everywhere Juno talks.
 * JunoFigure is the whole bird with what is happening around it: sound while a
 * lecture records, dots while it works, gold sparks when it found something.
 * public/brand/juno.svg is the same avatar for the static landing page; a test
 * keeps the two the same.
 */

export const JUNO = "Juno";

/**
 * idle: waiting. happy: something is done. listen: a lecture is recording.
 * work: making the note, answering. found: an exam hint, new cards. rest: nothing today.
 */
export type JunoMood = "idle" | "happy" | "listen" | "work" | "found" | "rest";

const INK = "#0A0A0A";
const WHITE = "#FFFFFF";
const WING = "#1F4250";
const SHEEN = "#2C5D6C";
const MAROON = "#A00020";
const MAROON_DEEP = "#7E0019";
const GOLD = "#F8D000";
const GOLD_DEEP = "#D9B500";
const SLATE = "#5B5F66";
const SLATE_LIGHT = "#9A9EA5";

/** The avatar's crop of the 120 x 120 drawing: head, cap, wing and belly. */
export const AVATAR_VIEWBOX = "31 12 78 78";

const n = (v: number) => Math.round(v * 100) / 100;

/* The mortarboard from the logo, sitting on the head. */
function Cap({ swing }: { swing: number }) {
  const x = 69;
  const y = 29;
  const w = 46;
  const rot = -10;
  const h = w * 0.26;
  const t = w * 0.055;
  const hx = n(x + w * 0.43);
  const hy = n(y + w * 0.035);
  const sw = n(w * 0.036);
  const len = w * 0.3;
  const tw = w * 0.05;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <path d={`M${n(x - w * 0.3)} ${n(y + w * 0.05)} L${n(x - w * 0.27)} ${n(y + w * 0.33)} Q${x} ${n(y + w * 0.43)} ${n(x + w * 0.27)} ${n(y + w * 0.33)} L${n(x + w * 0.3)} ${n(y + w * 0.05)} Z`} fill={MAROON_DEEP} />
      <path d={`M${x - w / 2} ${y} L${x} ${n(y + h)} L${x + w / 2} ${y} L${x + w / 2} ${n(y + t)} L${x} ${n(y + h + t)} L${x - w / 2} ${n(y + t)} Z`} fill={MAROON_DEEP} />
      <path d={`M${x - w / 2} ${y} L${x} ${n(y - h)} L${x + w / 2} ${y} L${x} ${n(y + h)} Z`} fill={MAROON} />
      <circle cx={x} cy={y} r={n(w * 0.045)} fill={MAROON_DEEP} />
      <path d={`M${x} ${y} L${hx} ${hy}`} stroke={GOLD} strokeWidth={sw} strokeLinecap="round" />
      <g transform={`rotate(${-rot + swing} ${hx} ${hy})`}>
        <g className="juno-tassel" style={{ transformOrigin: `${hx}px ${hy}px` }}>
          <path d={`M${hx} ${hy} L${hx} ${n(hy + len)}`} stroke={GOLD} strokeWidth={sw} strokeLinecap="round" />
          <path
            d={`M${n(hx - tw)} ${n(hy + len)} L${n(hx + tw)} ${n(hy + len)} L${n(hx + tw * 1.35)} ${n(hy + len + w * 0.17)} L${n(hx - tw * 1.35)} ${n(hy + len + w * 0.17)} Z`}
            fill={GOLD}
            stroke={GOLD_DEEP}
            strokeWidth={n(w * 0.014)}
            strokeLinejoin="round"
          />
          <circle cx={hx} cy={n(hy + len)} r={n(w * 0.042)} fill={GOLD_DEEP} />
        </g>
      </g>
    </g>
  );
}

/* White eyes on the black head; the mood is mostly in here. */
function Eyes({ mood }: { mood: JunoMood }) {
  const y = 56;
  const e = 3.1;
  const xs = [63, 77];
  const sw = n(e * 0.6);
  if (mood === "happy" || mood === "listen" || mood === "rest") {
    const d = (cx: number) =>
      mood === "rest"
        ? `M${n(cx - e * 1.2)} ${y} Q${cx} ${n(y + e)} ${n(cx + e * 1.2)} ${y}`
        : `M${n(cx - e * 1.25)} ${n(y + e * 0.4)} Q${cx} ${n(y - e * 1.2)} ${n(cx + e * 1.25)} ${n(y + e * 0.4)}`;
    return (
      <>
        {xs.map((cx) => (
          <path key={cx} d={d(cx)} fill="none" stroke={WHITE} strokeWidth={sw} strokeLinecap="round" />
        ))}
      </>
    );
  }
  const r = mood === "found" ? e * 1.15 : e;
  const [lx, ly] = mood === "work" ? [0.7, -0.7] : [0, 0];
  return (
    <>
      {xs.map((cx) => {
        const px = n(cx + lx * r * 0.55);
        const py = n(y + ly * r * 0.55 + r * 0.12);
        return (
          <g key={cx}>
            <circle cx={cx} cy={y} r={n(r * 1.55)} fill={WHITE} />
            <circle cx={px} cy={py} r={n(r)} fill={INK} />
            <circle cx={n(px + r * 0.36)} cy={n(py - r * 0.36)} r={n(r * 0.34)} fill={WHITE} />
          </g>
        );
      })}
    </>
  );
}

function Spark({ x, y, s }: { x: number; y: number; s: number }) {
  const k = 0.2;
  return (
    <path
      className="juno-spark"
      d={`M${x} ${n(y - s)} Q${n(x + s * k)} ${n(y - s * k)} ${n(x + s)} ${y} Q${n(x + s * k)} ${n(y + s * k)} ${x} ${n(y + s)} Q${n(x - s * k)} ${n(y + s * k)} ${n(x - s)} ${y} Q${n(x - s * k)} ${n(y - s * k)} ${x} ${n(y - s)} Z`}
      fill={GOLD}
      stroke={GOLD_DEEP}
      strokeWidth={0.9}
      strokeLinejoin="round"
    />
  );
}

/* What happens around the bird, for the whole figure only. */
function Around({ mood }: { mood: JunoMood }) {
  if (mood === "listen") {
    const waves = (x: number, y: number, dir: number) =>
      [
        [0, 5, 1],
        [5, 9.5, 0.5],
      ].map(([d, r, op], i) => (
        <path
          key={`${x}-${i}`}
          className={cn("juno-wave", i === 1 && "juno-wave--2")}
          d={`M${x + dir * d} ${n(y - r)} Q${n(x + dir * (d + r * 0.95))} ${y} ${x + dir * d} ${n(y + r)}`}
          fill="none"
          stroke={MAROON}
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={op}
        />
      ));
    return (
      <>
        {waves(40, 52, -1)}
        {waves(108, 40, 1)}
      </>
    );
  }
  if (mood === "work") {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <circle key={i} className="juno-dot" style={{ animationDelay: `${i * 0.2}s` }} cx={n(92 + i * 6.5)} cy={14} r={2.4} fill={SLATE} />
        ))}
      </>
    );
  }
  if (mood === "found") {
    return (
      <>
        <Spark x={108} y={30} s={8} />
        <Spark x={99} y={42} s={4.4} />
      </>
    );
  }
  if (mood === "rest") {
    const font = "'Schibsted Grotesk', system-ui, sans-serif";
    return (
      <>
        <text x={94} y={20} fontFamily={font} fontWeight={700} fontSize={12} fill={SLATE_LIGHT}>z</text>
        <text x={102} y={12} fontFamily={font} fontWeight={700} fontSize={8.5} fill={SLATE_LIGHT}>z</text>
      </>
    );
  }
  return null;
}

/** The magpie itself, in the 120 x 120 box. */
export function JunoArt({ mood = "idle", around = false }: { mood?: JunoMood; around?: boolean }) {
  return (
    <>
      {/* long tail, back and down to the left, with a blue-green sheen */}
      <path d="M50 85 L12 106 Q8 110 14 111.5 L58 97 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M45 92 L19 106" stroke={SHEEN} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M61 99 L59 111 M55 111 L63 111 M73 98 L74 111 M70 111 L78 111" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      {/* body, head, white belly */}
      <ellipse cx={64} cy={81} rx={27} ry={21} transform="rotate(-16 64 81)" fill={INK} />
      <circle cx={71} cy={56} r={20} fill={INK} />
      <ellipse cx={74} cy={88} rx={15} ry={9.5} transform="rotate(-18 74 88)" fill={WHITE} />
      {/* the wing: blue-green under a white shoulder stripe */}
      <path d="M39 81 Q50 70 66 78 Q63 93 47 96 Q39 92 39 81 Z" fill={WING} />
      <path d="M47 90 L58 87 M45 94 L55 92" stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
      <path d="M37 80 Q48 66 65 75 Q50 75.5 40 86 Q36 84 37 80 Z" fill={WHITE} />
      {/* the beak opens when Juno found something */}
      {mood === "found" ? (
        <>
          <path d="M87 52 L103 53 L88 58 Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M88 60 L100 66 L87 64 Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M88 58 L99 62 L88 60 Z" fill={MAROON} />
        </>
      ) : (
        <path d="M86 52 Q95 54 104 58 Q95 61 86 64 Z" fill={INK} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      )}
      <Cap swing={mood === "found" ? 16 : 0} />
      <Eyes mood={mood} />
      {around ? <Around mood={mood} /> : null}
    </>
  );
}

type AvatarProps = {
  /** Diameter in pixels. */
  size?: number;
  /** "night" on Juno's dark panel, "light" on the white page. */
  tone?: "light" | "night";
  /** A soft ring breathes and the tassel swings while Juno is working or has something to say. */
  speaking?: boolean;
  /** What Juno is doing. Without one, speaking means working. */
  mood?: JunoMood;
  className?: string;
  /** Give it a name when it stands alone; next to the word "Juno" it is decoration. */
  title?: string;
};

export function JunoAvatar({ size = 36, tone = "light", speaking = false, mood, className, title }: AvatarProps) {
  const shown = mood ?? (speaking ? "work" : "idle");
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-juno={shown}
      className={cn("relative inline-flex shrink-0 rounded-full", speaking && "juno-sway", className)}
      style={{ width: size, height: size }}
    >
      {speaking ? <span className="juno-ring" /> : null}
      <span className={cn("block h-full w-full overflow-hidden rounded-full", tone === "night" ? "bg-white" : "bg-gold-tint")}>
        <svg viewBox={AVATAR_VIEWBOX} className="block h-full w-full" aria-hidden="true" focusable="false">
          <JunoArt mood={shown} />
        </svg>
      </span>
      {tone === "light" ? <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-gold-deep/40" /> : null}
    </span>
  );
}

type FigureProps = {
  /** Width and height in pixels. */
  size?: number;
  mood?: JunoMood;
  className?: string;
  title?: string;
};

/** The whole bird, for the places with room: the 404 page, empty screens. */
export function JunoFigure({ size = 160, mood = "idle", className, title }: FigureProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-juno={mood}
      className={cn("juno-figure shrink-0", className)}
    >
      <JunoArt mood={mood} around />
    </svg>
  );
}
