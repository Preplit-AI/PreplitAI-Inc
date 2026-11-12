import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { color, radius, space } from "@/lib/theme";
import { T } from "./index";

/*
 * Juno, the magpie in the graduation cap. The drawing is the website's
 * (src/brand/Juno.tsx at the repo root); these files are exported from it and
 * kept identical by src/test/juno.test.tsx, so Juno is one bird everywhere.
 */

export type JunoMood = "idle" | "happy" | "listen" | "work" | "found" | "rest";

const FACE: Record<JunoMood, number> = {
  idle: require("../../assets/juno/idle.svg"),
  happy: require("../../assets/juno/happy.svg"),
  listen: require("../../assets/juno/listen.svg"),
  work: require("../../assets/juno/work.svg"),
  found: require("../../assets/juno/found.svg"),
  rest: require("../../assets/juno/rest.svg"),
};

const FIGURE: Record<JunoMood, number> = {
  idle: require("../../assets/juno/figure-idle.svg"),
  happy: require("../../assets/juno/figure-happy.svg"),
  listen: require("../../assets/juno/figure-listen.svg"),
  work: require("../../assets/juno/figure-work.svg"),
  found: require("../../assets/juno/figure-found.svg"),
  rest: require("../../assets/juno/figure-rest.svg"),
};

/** Juno's face in a round tile: beside his name and wherever he speaks. Decorative unless it stands alone. */
export function Juno({ size = 40, mood = "idle", tone = color.goldTint, label }: { size?: number; mood?: JunoMood; tone?: string; label?: string }) {
  return (
    <View
      accessible={Boolean(label)}
      accessibilityRole={label ? "image" : undefined}
      accessibilityLabel={label}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tone, overflow: "hidden" }}
    >
      <Image source={FACE[mood]} style={{ width: size, height: size }} contentFit="contain" />
    </View>
  );
}

/** The whole bird, for moments with room: the welcome screen, an empty state, the end of a quiz. */
export function JunoFigure({ size = 160, mood = "idle" }: { size?: number; mood?: JunoMood }) {
  return <Image source={FIGURE[mood]} style={{ width: size, height: size }} contentFit="contain" accessibilityLabel="Juno" />;
}

/** Something Juno says: his face, then his words in a bubble. */
export function JunoSays({ children, mood = "idle", action, style }: { children: ReactNode; mood?: JunoMood; action?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }, style]}>
      <Juno size={44} mood={mood} />
      <View style={{ flex: 1, backgroundColor: color.white, borderWidth: 1, borderColor: color.rule, borderRadius: radius.lg, borderTopLeftRadius: 6, padding: space.lg, gap: space.md }}>
        {typeof children === "string" ? <T>{children}</T> : children}
        {action}
      </View>
    </View>
  );
}

/** Nothing here yet: Juno, a line about what belongs here, and the way to add it. */
export function Empty({ title, line, mood = "rest", action }: { title: string; line?: string; mood?: JunoMood; action?: ReactNode }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: space.xxl, paddingHorizontal: space.lg, gap: space.sm }}>
      <JunoFigure size={120} mood={mood} />
      <T variant="heading" style={{ textAlign: "center", marginTop: space.sm }}>{title}</T>
      {line ? <T variant="small" style={{ textAlign: "center", maxWidth: 320 }}>{line}</T> : null}
      {action ? <View style={{ marginTop: space.md }}>{action}</View> : null}
    </View>
  );
}
