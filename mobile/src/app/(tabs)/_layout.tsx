import { Pressable, View } from "react-native";
import { Tabs, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLang } from "@/lib/i18n";
import { color, font } from "@/lib/theme";
import { Icon, useLayout, type IconName } from "@/ui";
import { Juno } from "@/ui/Juno";

/*
 * The four places the app is made of, and Juno, who is reachable from all of
 * them. On a phone the tabs sit at the bottom, under the thumb; on a tablet
 * they move to a rail on the left and the content gets the width.
 *
 * Explore (campus information and community) is not built yet, so it has no
 * tab: a tab that led nowhere would be worse than none.
 */

const TABS: { name: string; icon: IconName; key: "home" | "courses" | "buddy" | "career" }[] = [
  { name: "index", icon: "home", key: "home" },
  { name: "courses", icon: "book-open", key: "courses" },
  { name: "buddy", icon: "headphones", key: "buddy" },
  { name: "career", icon: "trending-up", key: "career" },
];

export default function TabsLayout() {
  const { t } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: tablet ? "left" : "bottom",
          // On the rail: an icon with its name under it, in a narrow column.
          tabBarVariant: tablet ? "material" : "uikit",
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: color.ink,
          tabBarInactiveTintColor: color.slateLight,
          tabBarActiveBackgroundColor: tablet ? color.bone : "transparent",
          tabBarLabelStyle: { fontFamily: font.semibold, fontSize: tablet ? 11 : 11.5 },
          tabBarItemStyle: tablet ? { borderRadius: 14, marginVertical: 4, paddingVertical: 8 } : undefined,
          tabBarStyle: tablet
            ? { backgroundColor: color.white, borderRightColor: color.rule, borderRightWidth: 1, paddingTop: insets.top + 16, paddingHorizontal: 8, width: 124, minWidth: 124 }
            : { backgroundColor: color.white, borderTopColor: color.rule, height: 62 + insets.bottom, paddingTop: 6 },
          sceneStyle: { backgroundColor: color.paper },
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: t.tabs[tab.key],
              tabBarIcon: ({ color: tint, size }) => <Icon name={tab.icon} size={size - 2} color={String(tint)} />,
            }}
          />
        ))}
      </Tabs>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.course.askJuno}
        onPress={() => router.push("/juno")}
        style={({ pressed }) => [
          {
            position: "absolute",
            right: 18,
            bottom: tablet ? 24 + insets.bottom : 78 + insets.bottom,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: color.gold,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          },
          pressed && { transform: [{ scale: 0.96 }] },
        ]}
      >
        <Juno size={50} mood="happy" tone={color.goldTint} />
      </Pressable>
    </View>
  );
}
