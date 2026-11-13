import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { color, setScheme, type Scheme } from "./theme";

/*
 * Day or Night. The app follows the phone unless the student chose one on
 * their profile; the choice is kept on this device.
 *
 * Colours are read while a screen renders (lib/theme), so when the theme
 * changes the screens are drawn again from the top: whoever renders them gives
 * them `scheme` as their key.
 */

export type Appearance = "system" | "light" | "dark";
const KEY = "campusgo.appearance";

type Value = { appearance: Appearance; scheme: Scheme; setAppearance: (next: Appearance) => void };
const AppearanceContext = createContext<Value | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [appearance, setChoice] = useState<Appearance>("system");

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark") setChoice(saved);
      })
      .catch(() => {});
  }, []);

  const setAppearance = useCallback((next: Appearance) => {
    setChoice(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);

  const scheme: Scheme = appearance === "system" ? (system === "dark" ? "dark" : "light") : appearance;
  // Before anything below renders, so every colour read in this pass is the new theme's.
  setScheme(scheme);

  // In a browser the page behind the app shows at the edges and while it loads.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.documentElement.style.backgroundColor = color.ground;
    document.body.style.backgroundColor = color.ground;
    document.documentElement.style.colorScheme = scheme;
  }, [scheme]);

  const value = useMemo(() => ({ appearance, scheme, setAppearance }), [appearance, scheme, setAppearance]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("useAppearance needs AppearanceProvider above it");
  return value;
}
