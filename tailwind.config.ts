import type { Config } from "tailwindcss";

/*
 * Preplit AI tokens, the same ones the landing page uses (site/landing.css):
 * a white page, one ink for text and buttons, hairlines, and soft pastel
 * grounds for the cards. Maroon is the logo's cap and the recording light;
 * gold is the tassel and marks what Juno found (sources, exam hints). Night is
 * Juno's own panel, the dark phone from the landing page.
 *
 * The names (ink, bone, paper, rule, slate, honey...) are kept from before so
 * every screen picks up the new look from here.
 */
export default {
  content: ["./app.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
      "2xl": "1440px",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      ink: { DEFAULT: "#0A0A0A", soft: "#26272B" },
      bone: { DEFAULT: "#F4F4F2", deep: "#E9E9E5" },
      paper: "#FAFAF9",
      maroon: { DEFAULT: "#A00020", deep: "#7E0019", tint: "#F8E4E7" },
      gold: { DEFAULT: "#F8D000", deep: "#D9B500", tint: "#FFF6CC" },
      /* Text-safe amber, for "no recording this week" and other things missing. */
      honey: { DEFAULT: "#8F6400", tint: "#FFF4CF" },
      slate: { DEFAULT: "#5B5F66", light: "#9A9EA5" },
      rule: { DEFAULT: "#E7E7E4", strong: "#D3D3CF" },
      sage: { DEFAULT: "#DCEBDD", soft: "#EEF5EE", deep: "#BFD8C2" },
      sky: { DEFAULT: "#DCE7F6", soft: "#EEF3FB", deep: "#B9CDEB" },
      blush: { DEFAULT: "#F6E2DF", soft: "#FBF1EF", deep: "#EBC6C1" },
      peach: { DEFAULT: "#FBE6D3", soft: "#FDF3EA", deep: "#F2CCA8" },
      night: {
        DEFAULT: "#0B0B0D",
        2: "#17181C",
        3: "#222328",
        line: "#2E2F35",
        text: "#ECECEE",
        muted: "#9C9EA6",
      },
    },
    fontFamily: {
      sans: ['"Schibsted Grotesk"', '"IBM Plex Sans KR"', "system-ui", "sans-serif"],
      kr: ['"Schibsted Grotesk"', '"IBM Plex Sans KR"', "system-ui", "sans-serif"],
      mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
    /* An app's scale, not a landing page's: 14px reading text, 13px for most of the chrome. */
    fontSize: {
      "2xs": ["0.6875rem", { lineHeight: "1.35" }],
      xs: ["0.75rem", { lineHeight: "1.45" }],
      sm: ["0.8125rem", { lineHeight: "1.5" }],
      base: ["0.875rem", { lineHeight: "1.6" }],
      lg: ["1rem", { lineHeight: "1.5" }],
      xl: ["1.125rem", { lineHeight: "1.4" }],
      "2xl": ["1.375rem", { lineHeight: "1.3" }],
      "3xl": ["1.75rem", { lineHeight: "1.2" }],
      "4xl": ["2.25rem", { lineHeight: "1.1" }],
      "5xl": ["3rem", { lineHeight: "1.05" }],
    },
    extend: {
      maxWidth: {
        page: "80rem",
        read: "42rem",
        work: "72rem",
      },
      borderRadius: {
        card: "14px",
        panel: "22px",
      },
      boxShadow: {
        window: "0 1px 2px rgb(10 10 10 / 0.04)",
        float: "0 2px 6px rgb(10 10 10 / 0.08), 0 28px 60px -24px rgb(10 10 10 / 0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
