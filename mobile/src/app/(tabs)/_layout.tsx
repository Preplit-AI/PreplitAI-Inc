import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLang } from "@/lib/i18n";
import { color, font } from "@/lib/theme";
import { Icon, useLayout, type IconName } from "@/ui";
import { Juno } from "@/ui/Juno";

/*
 * The five places the app is made of, with Juno in the middle: he is the main
 * way in, so he gets the centre of the bar and his own face on it.
 *
 *   Home · Campus · Juno · Buddy · Community
 *
 * On a phone the tabs sit at the bottom, under the thumb; on a tablet they
 * move to a rail on the left and the content gets the width. Courses and the
 * older Career screens are still reachable from Home and from a course, but
 * they are not tabs.
 */

const TABS: { name: string; icon: IconName | "juno"; key: "home" | "campus" | "juno" | "buddy" | "community" }[] = [
  { name: "index", icon: "home", key: "home" },
  { name: "campus", icon: "map-pin", key: "campus" },
  { name: "juno", icon: "juno", key: "juno" },
  { name: "buddy", icon: "mic", key: "buddy" },
  { name: "community", icon: "users", key: "community" },
];
const HIDDEN = ["courses", "career"];

export default function TabsLayout() {
  const { t } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: tablet ? "left" : "bottom",
          tabBarVariant: tablet ? "material" : "uikit",
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: color.ink,
          tabBarInactiveTintColor: color.inkFaint,
          tabBarActiveBackgroundColor: tablet ? color.sunken : "transparent",
          tabBarLabelStyle: { fontFamily: font.semibold, fontSize: 11 },
          tabBarItemStyle: tablet ? { borderRadius: 14, marginVertical: 4, paddingVertical: 8 } : undefined,
          tabBarStyle: tablet
            ? { backgroundColor: color.surface, borderRightColor: color.rule, borderRightWidth: 1, paddingTop: insets.top + 16, paddingHorizontal: 8, width: 124, minWidth: 124 }
            : { backgroundColor: color.surface, borderTopColor: color.rule, height: 64 + insets.bottom, paddingTop: 6 },
          sceneStyle: { backgroundColor: color.ground },
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: t.nav[tab.key],
              tabBarIcon: ({ color: tint, size, focused }) =>
                tab.icon === "juno" ? (
                  // Juno sits a little above the bar, in a ring that fills when he is open.
                  <View style={{ marginTop: tablet ? 0 : -16, padding: tablet ? 2 : 3, borderRadius: 30, backgroundColor: color.surface, borderWidth: 2, borderColor: focused ? color.ink : color.rule }}>
                    <Juno size={tablet ? 28 : 44} mood={focused ? "happy" : "idle"} />
                  </View>
                ) : (
                  <Icon name={tab.icon} size={size - 2} color={String(tint)} />
                ),
            }}
          />
        ))}
        {HIDDEN.map((name) => <Tabs.Screen key={name} name={name} options={{ href: null }} />)}
      </Tabs>
    </View>
  );
}
