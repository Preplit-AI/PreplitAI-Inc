import { Platform, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { googleStartUrl, request } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { color, font, radius, space } from "@/lib/theme";
import { T } from "./index";

/* What the log-in and sign-up screens share. */

type AuthConfig = { inviteRequired: boolean; google: boolean; passwordReset: boolean };

/** What the server has set up: an invite code, Google. The screens show only what works. */
export function useAuthConfig() {
  return useQuery({ queryKey: ["auth-config"], queryFn: () => request<AuthConfig>("/auth/config"), staleTime: Infinity });
}

/**
 * Sign in with Google runs on the server and comes back to the web build, so the
 * button is offered there. The installed app needs its own Google client first
 * (mobile/README.md, "Not done yet"), so it shows nothing rather than a button
 * that leads out of the app.
 */
export const googleAvailable = (config?: AuthConfig) => Platform.OS === "web" && Boolean(config?.google);

/** Google's own button: white, their "G", "Continue with Google". `guard` may stop it (consent not ticked yet). */
export function GoogleButton({ intent, guard }: { intent: "login" | "signup"; guard?: () => boolean }) {
  const { t } = useLang();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.auth.google}
      onPress={() => {
        if (guard && !guard()) return;
        window.location.assign(googleStartUrl(intent));
      }}
      style={({ pressed }) => [{ minHeight: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: "#747775", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.md }, pressed && { backgroundColor: "#F7F8F8" }]}
    >
      <Image source={require("../../assets/google-g.svg")} style={{ width: 20, height: 20 }} contentFit="contain" />
      <Text style={{ fontFamily: font.medium, fontSize: 16, color: "#1F1F1F" }}>{t.auth.google}</Text>
    </Pressable>
  );
}

export function OrLine() {
  const { t } = useLang();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg, marginVertical: space.xl }}>
      <View style={{ flex: 1, height: 1, backgroundColor: color.rule }} />
      <T variant="label">{t.common.or}</T>
      <View style={{ flex: 1, height: 1, backgroundColor: color.rule }} />
    </View>
  );
}
