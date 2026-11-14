import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts, SchibstedGrotesk_400Regular, SchibstedGrotesk_500Medium, SchibstedGrotesk_600SemiBold, SchibstedGrotesk_700Bold } from "@expo-google-fonts/schibsted-grotesk";
import { AppearanceProvider, useAppearance } from "@/lib/appearance";
import { AuthProvider, useAuth } from "@/lib/auth";
import { hasDevAccess } from "@/lib/earlyAccess";
import { LangProvider, useLang } from "@/lib/i18n";
import { NotificationsProvider } from "@/lib/notifications";
import { color, space } from "@/lib/theme";
import { Button, Failed, Loading, T } from "@/ui";
import { JunoFigure } from "@/ui/Juno";

/*
 * The root of the app: fonts, the data cache, the language, the signed-in
 * student, and the three groups of screens. Which group is reachable follows
 * from who is signed in:
 *
 *   anyone                   welcome, log in, sign up
 *   signed in                onboarding
 *   signed in, onboarded     everything else
 */

const PUBLIC = new Set(["/welcome", "/login", "/signup"]);

function Screens() {
  const { status, profile, profileFailed, reloadProfile } = useAuth();
  const { t } = useLang();
  const pathname = usePathname();
  const before = useRef<typeof status>("loading");
  const ready = status === "signed-out" || (status === "signed-in" && Boolean(profile));
  const isOnboarded = Boolean(profile?.onboarded);

  // The guards below keep a student out of screens that are not theirs yet, but
  // they do not choose where to go instead. This does, each time who is signed
  // in changes: out → welcome, in and new → onboarding, in and set up → home.
  useEffect(() => {
    if (!ready) return;
    const was = before.current;
    before.current = status;
    let to: "/welcome" | "/onboarding" | "/" | null = null;
    if (status === "signed-out") {
      if (was === "signed-in" || !PUBLIC.has(pathname)) to = "/welcome";
    } else if (!isOnboarded) {
      if (pathname !== "/onboarding") to = "/onboarding";
    } else if (was === "signed-out" || PUBLIC.has(pathname)) {
      to = "/";
    }
    if (!to) return;
    const target = to;
    // After the screens have mounted for this state.
    const timer = setTimeout(() => router.replace(target), 0);
    return () => clearTimeout(timer);
    // Only when the signed-in state changes, not on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, status, isOnboarded]);

  if (status === "loading" || (status === "signed-in" && !profile)) {
    return (
      <View style={{ flex: 1, backgroundColor: color.ground, alignItems: "center", justifyContent: "center" }}>
        {profileFailed ? <Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={reloadProfile} /> : <Loading />}
      </View>
    );
  }

  const signedIn = status === "signed-in";
  const onboarded = Boolean(profile?.onboarded);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.ground }, animation: "slide_from_right" }}>
      {/* Open to everyone, so a redirect here can never be refused; a signed-in student is moved on by the effect above. */}
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="lecture/[id]" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="quiz" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="material" />
      </Stack.Protected>
    </Stack>
  );
}

/** The web build is a preview: it shows the website's early-access note unless this device has the developer pass (?dev=1). */
function EarlyAccess() {
  const { t } = useLang();
  return (
    <View style={{ flex: 1, backgroundColor: color.ground, alignItems: "center", justifyContent: "center", padding: space.xxl, gap: space.md }}>
      <JunoFigure size={140} mood="rest" />
      <T variant="label" tone={color.brand}>{t.early.badge}</T>
      <T variant="title" style={{ textAlign: "center" }}>{t.early.title}</T>
      <T style={{ textAlign: "center", maxWidth: 420, color: color.inkMuted }}>{t.early.body}</T>
      <Button small variant="secondary" label={t.early.button} onPress={() => window.location.assign("/")} style={{ marginTop: space.md }} />
    </View>
  );
}

/** Everything that is drawn. Its screens carry the theme as their key, so a change of theme draws them again in the new colours. */
function Themed({ allowed }: { allowed: boolean }) {
  const { scheme } = useAppearance();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {allowed ? (
        <AuthProvider>
          <NotificationsProvider>
            <Screens key={scheme} />
          </NotificationsProvider>
        </AuthProvider>
      ) : (
        <EarlyAccess key={scheme} />
      )}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsFailed] = useFonts({ SchibstedGrotesk_400Regular, SchibstedGrotesk_500Medium, SchibstedGrotesk_600SemiBold, SchibstedGrotesk_700Bold });
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: (count, err) => ((err as { status?: number }).status ?? 0) >= 500 && count < 2,
          },
        },
      }),
  );
  const [allowed] = useState(() => Platform.OS !== "web" || hasDevAccess());

  // A font that cannot be fetched must not keep the app from opening: it starts in the system font instead.
  if (!fontsLoaded && !fontsFailed) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <LangProvider>
          <AppearanceProvider>
            <Themed allowed={allowed} />
          </AppearanceProvider>
        </LangProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
