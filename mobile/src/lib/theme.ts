/*
 * The design tokens. The colours are the website's (tailwind.config.ts at the
 * repo root): ink, paper and bone, with the logo's maroon and gold used sparingly.
 * See mobile/README.md, "Design system".
 */
export const color = {
  ink: "#0A0A0A",
  inkSoft: "#26272B",
  paper: "#FAFAF9",
  bone: "#F4F4F2",
  boneDeep: "#E9E9E5",
  white: "#FFFFFF",
  maroon: "#A00020",
  maroonDeep: "#7E0019",
  maroonTint: "#F8E4E7",
  gold: "#F8D000",
  goldTint: "#FFF6CC",
  honey: "#8F6400",
  honeyTint: "#FFF4CF",
  slate: "#5B5F66",
  slateLight: "#9A9EA5",
  rule: "#E7E7E4",
  ruleStrong: "#D3D3CF",
  sage: "#DCEBDD",
  sageSoft: "#EEF5EE",
  green: "#1F6B3A",
  sky: "#DCE7F6",
  skySoft: "#EEF3FB",
  blue: "#234E8C",
  blush: "#F6E2DF",
  peach: "#FBE6D3",
  peachSoft: "#FDF3EA",
} as const;

export const font = {
  regular: "SchibstedGrotesk_400Regular",
  medium: "SchibstedGrotesk_500Medium",
  semibold: "SchibstedGrotesk_600SemiBold",
  bold: "SchibstedGrotesk_700Bold",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, huge: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

/** From this width the layout is a tablet's: a side rail, two columns, split views. */
export const TABLET = 768;
/** The widest a single reading column gets. */
export const COLUMN = 640;

/** One soft colour per course, by its place in the list, so a course looks the same everywhere. */
const COURSE_TINTS = [
  { bg: color.sky, fg: color.blue },
  { bg: color.sage, fg: color.green },
  { bg: color.peach, fg: "#8A4B12" },
  { bg: color.blush, fg: color.maroonDeep },
  { bg: color.goldTint, fg: color.honey },
  { bg: color.boneDeep, fg: color.inkSoft },
] as const;

export function courseTint(index: number) {
  return COURSE_TINTS[((index % COURSE_TINTS.length) + COURSE_TINTS.length) % COURSE_TINTS.length];
}
