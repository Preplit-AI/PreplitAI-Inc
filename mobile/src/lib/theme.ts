/*
 * The design tokens: CampusGo's, from brand/campusgo/tokens.json at the repo
 * root. Two themes share every name: Day (a pale sky ground, white cards, navy
 * ink) and Night (deep navy).
 *
 * `color` always holds the theme in use. A screen reads it while it renders, so
 * it must not be copied into a module-level constant; AppearanceProvider
 * (lib/appearance.tsx) switches it and redraws the screens.
 *
 * Blue is the brand and the action: one filled button per screen. The one
 * accent is `lamp`, the amber of the logo's tassel and Juno's eyes. It marks
 * the thing that matters now: use it once on a screen.
 */

export type Scheme = "light" | "dark";

const day = {
  // Grounds
  ground: "#F5F8FF",
  surface: "#FFFFFF",
  sunken: "#E8EEFB",
  sunkenDeep: "#D8E1F4",
  rule: "#D8E1F4",
  ruleStrong: "#7685AC",
  // Text
  ink: "#0B1A45",
  inkSoft: "#35456F",
  inkMuted: "#56658F",
  inkFaint: "#7685AC",
  /** On a fill of `ink`. */
  onInk: "#F5F8FF",
  // The brand blue
  go: "#2B5FF5",
  onGo: "#FFFFFF",
  goSoft: "#E3EBFF",
  goInk: "#1F4FD6",
  /** The fill of the one main button on a screen, and of what is switched on or chosen. */
  action: "#2B5FF5",
  onAction: "#FFFFFF",
  // The brand navy
  navy: "#0B1A45",
  navyDeep: "#060F2E",
  navyRaise: "#1B2A63",
  onNavy: "#F5F8FF",
  onNavySoft: "#C6D0EE",
  /** A dark brand field that stands off the ground in both themes: Juno's card on the Profile. */
  panel: "#0B1A45",
  // The lamp
  lamp: "#F0A63A",
  lampSoft: "#FCEBCB",
  lampInk: "#7D4A05",
  onLamp: "#0B1A45",
  // States
  settled: "#0E6F60",
  settledSoft: "#D9F0EA",
  danger: "#B0371A",
  dangerDeep: "#8F2C13",
  dangerSoft: "#FBE4DC",
  mist: "#E3EBFF",
  mistInk: "#1F4FD6",
  focus: "#0B1A45",
  scrim: "rgba(6,15,46,0.45)",
};

export type Palette = typeof day;

const night: Palette = {
  ground: "#0A1330",
  surface: "#131F47",
  sunken: "#060C22",
  sunkenDeep: "#243263",
  rule: "#243263",
  ruleStrong: "#6C7FBC",
  ink: "#EEF2FF",
  inkSoft: "#C2CCEA",
  inkMuted: "#95A3CC",
  inkFaint: "#7384B8",
  onInk: "#0A1330",
  go: "#2B5FF5",
  onGo: "#FFFFFF",
  goSoft: "#1A2960",
  goInk: "#A3BBFF",
  action: "#7FA2FF",
  onAction: "#0A1330",
  navy: "#0B1A45",
  navyDeep: "#060F2E",
  navyRaise: "#1B2A63",
  onNavy: "#F5F8FF",
  onNavySoft: "#C6D0EE",
  panel: "#1B2A63",
  lamp: "#F0A63A",
  lampSoft: "#3A2D14",
  lampInk: "#F6C672",
  onLamp: "#0B1A45",
  settled: "#78D6C5",
  settledSoft: "#12322E",
  danger: "#FFA283",
  dangerDeep: "#FFB8A0",
  dangerSoft: "#3C1F17",
  mist: "#1A2960",
  mistInk: "#A3BBFF",
  focus: "#F8CF8A",
  scrim: "rgba(0,0,0,0.6)",
};

const PALETTES: Record<Scheme, Palette> = { light: day, dark: night };

/** The colours of the theme in use. Read it while rendering. */
export const color: Palette = { ...day };

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
  /** Lexend: headings, card titles, the name. */
  display: "Lexend_600SemiBold",
  /** Lexend, medium: Juno speaking in the first person. */
  voice: "Lexend_500Medium",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, huge: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** From this width the layout is a tablet's: a side rail, two columns, split views. */
export const TABLET = 768;
/** The widest a single reading column gets. */
export const COLUMN = 640;

/** One quiet tint per course, by its place in the list, so a course looks the same everywhere. None is the lamp. */
const COURSE_TINTS: Record<Scheme, { bg: string; fg: string }[]> = {
  light: [
    { bg: "#E3EBFF", fg: "#1F4FD6" },
    { bg: "#EFE6D6", fg: "#6B5237" },
    { bg: "#DDEFE3", fg: "#2F6340" },
    { bg: "#ECE3F3", fg: "#6A3F85" },
    { bg: "#F6E3DC", fg: "#8A4630" },
    { bg: "#E2E7F2", fg: "#35456F" },
  ],
  dark: [
    { bg: "#1A2960", fg: "#A3BBFF" },
    { bg: "#3A3026", fg: "#E3CFB0" },
    { bg: "#16301F", fg: "#A6D3A9" },
    { bg: "#30244A", fg: "#D4BCEC" },
    { bg: "#3A231C", fg: "#EDB9A6" },
    { bg: "#243263", fg: "#C2CCEA" },
  ],
};

export function courseTint(index: number) {
  const tints = COURSE_TINTS[current];
  return tints[((index % tints.length) + tints.length) % tints.length];
}
