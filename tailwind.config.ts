import type { Config } from "tailwindcss";

/*
 * Junbee brand tokens (brand book v1, section 06). These are the only colours
 * and type families in the product; components read them from here rather
 * than retyping hex values.
 *
 * Maroon marks one thing per screen. Honey is for the mascot and for marks,
 * never for buttons. The bee is ink and bone.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      ink: { DEFAULT: "#15181E", soft: "#2A2E36" },
      bone: { DEFAULT: "#EDEDE7", deep: "#E3E3DB" },
      paper: "#F8F8F4",
      maroon: { DEFAULT: "#8A1328", deep: "#6F0F20", tint: "#F3E4E6" },
      honey: { DEFAULT: "#A8690F", tint: "#F4EBDC" },
      slate: { DEFAULT: "#626A76", light: "#9AA0A9" },
      rule: { DEFAULT: "#D8D8D0", strong: "#C4C4BB" },
    },
    fontFamily: {
      sans: ['"Bricolage Grotesque"', '"IBM Plex Sans KR"', "system-ui", "sans-serif"],
      serif: ["Newsreader", '"IBM Plex Sans KR"', "Georgia", "serif"],
      kr: ['"IBM Plex Sans KR"', "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: ["0.8125rem", { lineHeight: "1.4" }],
      sm: ["0.9375rem", { lineHeight: "1.5" }],
      base: ["1.0625rem", { lineHeight: "1.65" }],
      lg: ["1.25rem", { lineHeight: "1.5" }],
      xl: ["1.5rem", { lineHeight: "1.35" }],
      "2xl": ["1.875rem", { lineHeight: "1.25" }],
      "3xl": ["2.375rem", { lineHeight: "1.2" }],
      "4xl": ["3rem", { lineHeight: "1.15" }],
      "5xl": ["4rem", { lineHeight: "1.1" }],
    },
    extend: {
      maxWidth: {
        page: "75rem",
        read: "42rem",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
} satisfies Config;
