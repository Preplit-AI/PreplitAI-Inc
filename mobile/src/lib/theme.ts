/*
 * The design tokens: Preplit AI's. Ink on paper, the logo's maroon, and Juno's
 * gold. Two themes share every name: light (paper) and dark (ink).
 *
 * `color` always holds the theme in use. A screen reads it while it renders, so
 * it must not be copied into a module-level constant; AppearanceProvider
 * (lib/appearance.tsx) switches it and redraws the screens.
 *
 * How the colours are used:
 *   ink     text, and the one filled button on a screen (`action`)
 *   brand   the maroon of the cap: recording, the brand's own moments
 *   lamp    Juno's gold: what Juno is pointing at right now, one thing per screen
 *   danger  errors and wrong answers only
 */

export type Scheme = "light" | "dark";

const light = {
  // Grounds
  ground: "#FAFAF9",
  surface: "#FFFFFF",
  sunken: "#F2F2EF",
  sunkenDeep: "#E7E7E3",
  rule: "#E7E7E4",
  ruleStrong: "#C9C9C4",
  // Text
  ink: "#0A0A0A",
  inkSoft: "#26272B",
  inkMuted: "#5B5F66",
  inkFaint: "#8C9097",
  onInk: "#FFFFFF",
  /** The fill of the one main button on a screen, and of what is switched on or chosen. */
  action: "#0A0A0A",
  onAction: "#FFFFFF",
  // The maroon of the cap
  brand: "#A00020",
  brandDeep: "#7E0019",
  brandSoft: "#F8E4E7",
  onBrand: "#FFFFFF",
  // Juno's gold
  lamp: "#F8D000",
  lampSoft: "#FFF6CC",
  lampInk: "#7A5600",
  onLamp: "#0A0A0A",
  // States
  settled: "#1F6B3A",
  settledSoft: "#DCEBDD",
  danger: "#A00020",
  dangerDeep: "#7E0019",
  dangerSoft: "#F8E4E7",
  mist: "#DCE7F6",
  mistInk: "#234E8C",
  focus: "#0A0A0A",
  scrim: "rgba(10,10,10,0.45)",
};

export type Palette = typeof light;

const dark: Palette = {
  ground: "#0D0D0E",
  surface: "#19191B",
  sunken: "#050506",
  sunkenDeep: "#2A2A2D",
  rule: "#2A2A2D",
  ruleStrong: "#5A5A60",
  ink: "#F4F4F2",
  inkSoft: "#D3D3CF",
  inkMuted: "#A2A2A8",
  inkFaint: "#7B7B82",
  onInk: "#0A0A0A",
  action: "#F4F4F2",
  onAction: "#0A0A0A",
  brand: "#E0405C",
  brandDeep: "#F07F93",
  brandSoft: "#3A1019",
  onBrand: "#FFFFFF",
  lamp: "#F8D000",
  lampSoft: "#332B00",
  lampInk: "#FFE35C",
  onLamp: "#0A0A0A",
  settled: "#7FD19A",
  settledSoft: "#12301D",
  danger: "#FF8C9B",
  dangerDeep: "#FFB0BA",
  dangerSoft: "#3A1218",
  mist: "#172A45",
  mistInk: "#A9C7F2",
  focus: "#F8D000",
  scrim: "rgba(0,0,0,0.6)",
};

const PALETTES: Record<Scheme, Palette> = { light, dark };

/** The colours of the theme in use. Read it while rendering. */
export const color: Palette = { ...light };

let current: Scheme = "light";
export const scheme = () => current;

export function setScheme(next: Scheme) {
  if (next === current) return;
  current = next;
  Object.assign(color, PALETTES[next]);
}

export const font = {
  regular: "SchibstedGrotesk_400Regular",
  medium: "SchibstedGrotesk_500Medium",
  semibold: "SchibstedGrotesk_600SemiBold",
  bold: "SchibstedGrotesk_700Bold",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, huge: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** From this width the layout is a tablet's: a side rail, two columns, split views. */
export const TABLET = 768;
/** The widest a single reading column gets. */
export const COLUMN = 640;

/** One soft tint per course, by its place in the list, so a course looks the same everywhere. */
const COURSE_TINTS: Record<Scheme, { bg: string; fg: string }[]> = {
  light: [
    { bg: "#DCE7F6", fg: "#234E8C" },
    { bg: "#DCEBDD", fg: "#1F6B3A" },
    { bg: "#FBE6D3", fg: "#8A4B12" },
    { bg: "#F6E2DF", fg: "#7E0019" },
    { bg: "#FFF6CC", fg: "#7A5600" },
    { bg: "#E9E9E5", fg: "#26272B" },
  ],
  dark: [
    { bg: "#172A45", fg: "#A9C7F2" },
    { bg: "#12301D", fg: "#9BD9AE" },
    { bg: "#3A2816", fg: "#F1C79A" },
    { bg: "#3A1218", fg: "#F3A9B4" },
    { bg: "#332B00", fg: "#FFE35C" },
    { bg: "#2A2A2D", fg: "#D3D3CF" },
  ],
};

export function courseTint(index: number) {
  const tints = COURSE_TINTS[current];
  return tints[((index % tints.length) + tints.length) % tints.length];
}
