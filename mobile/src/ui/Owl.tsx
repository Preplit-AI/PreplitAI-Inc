import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { color, radius, space } from "@/lib/theme";
import { T } from "./index";

/*
 * Juno: an Oriental scops owl (소쩍새), the companion that carries the
 * student's context. The drawings are CampusGo's (brand/campusgo at the repo
 * root, drawn by brand/campusgo/source/owl.mjs) and are the same in both themes.
 *
 * It has six moods and no sad one. It never asks for attention: no streaks, no
 * "Juno misses you". When nothing needs the student it rests.
 */

export type OwlMood = "attentive" | "noticing" | "next" | "unsure" | "resting" | "settled";
export type OwlStage = 1 | 2 | 3 | 4 | 5;

const FACE: Record<OwlMood, number> = {
  attentive: require("../../assets/owl/face-attentive.svg"),
  noticing: require("../../assets/owl/face-noticing.svg"),
  next: require("../../assets/owl/face-next.svg"),
  unsure: require("../../assets/owl/face-unsure.svg"),
  resting: require("../../assets/owl/face-resting.svg"),
  settled: require("../../assets/owl/face-settled.svg"),
};

const FIGURE: Record<OwlMood, number> = {
  attentive: require("../../assets/owl/figure-attentive.svg"),
  noticing: require("../../assets/owl/figure-noticing.svg"),
  next: require("../../assets/owl/figure-next.svg"),
  unsure: require("../../assets/owl/figure-unsure.svg"),
  resting: require("../../assets/owl/figure-resting.svg"),
  settled: require("../../assets/owl/figure-settled.svg"),
};

/** Juno as it grows. A stage is earned by something real in the student's life, never by time in the app. */
const STAGE: Record<OwlStage, number> = {
  1: require("../../assets/owl/stage-1.svg"),
  2: require("../../assets/owl/stage-2.svg"),
  3: require("../../assets/owl/stage-3.svg"),
  4: require("../../assets/owl/stage-4.svg"),
  5: require("../../assets/owl/stage-5.svg"),
};

/** Juno's head in a round tile of pale blue: beside its words and wherever it speaks. Decorative unless it stands alone. */
export function Owl({ size = 40, mood = "attentive", label }: { size?: number; mood?: OwlMood; label?: string }) {
  return (
    <View
      accessible={Boolean(label)}
      accessibilityRole={label ? "image" : undefined}
      accessibilityLabel={label}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.goSoft, overflow: "hidden" }}
    >
      <Image source={FACE[mood]} style={{ width: size, height: size }} contentFit="contain" />
    </View>
  );
}

/** The whole bird on its perch, for moments with room. `size` is its height; the drawing is four wide by five tall. */
export function OwlFigure({ size = 160, mood = "attentive", stage }: { size?: number; mood?: OwlMood; stage?: OwlStage }) {
  return <Image source={stage ? STAGE[stage] : FIGURE[mood]} style={{ width: size * 0.8, height: size }} contentFit="contain" accessibilityLabel="Juno" />;
}

/** Something Juno says: its head, then its words. A plain line is set in its own voice. */
export function OwlSays({ children, mood = "attentive", action, style }: { children: ReactNode; mood?: OwlMood; action?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }, style]}>
      <Owl size={46} mood={mood} />
      <View style={{ flex: 1, backgroundColor: color.surface, borderWidth: 1, borderColor: color.rule, borderRadius: radius.lg, borderTopLeftRadius: 6, padding: space.lg, gap: space.md }}>
        {typeof children === "string" ? <T variant="voice">{children}</T> : children}
        {action}
      </View>
    </View>
  );
}

/** Nothing here yet: Juno at rest, a line about what belongs here, and the way to add it. */
export function Empty({ title, line, mood = "resting", action }: { title: string; line?: string; mood?: OwlMood; action?: ReactNode }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: space.xxl, paddingHorizontal: space.lg, gap: space.sm }}>
      <OwlFigure size={132} mood={mood} />
      <T variant="heading" style={{ textAlign: "center", marginTop: space.sm }}>{title}</T>
      {line ? <T variant="small" style={{ textAlign: "center", maxWidth: 320 }}>{line}</T> : null}
      {action ? <View style={{ marginTop: space.md }}>{action}</View> : null}
    </View>
  );
}
