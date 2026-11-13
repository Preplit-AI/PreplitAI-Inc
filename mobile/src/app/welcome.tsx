import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useLang } from "@/lib/i18n";
import { color, radius, scheme, space } from "@/lib/theme";
import { Button, Icon, Screen, T, useLayout } from "@/ui";
import { OwlFigure } from "@/ui/Owl";

/** The first screen a new student sees: Juno says who he is, and there are two ways forward. */
export default function Welcome() {
  const { t, lang, setLang } = useLang();
  const { tablet } = useLayout();

  const owl = (
    <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: color.goSoft, borderRadius: radius.xl, paddingTop: tablet ? 72 : space.xxl, paddingBottom: tablet ? 56 : space.lg, flex: tablet ? 1 : undefined }}>
      <OwlFigure size={tablet ? 300 : 220} mood="attentive" />
    </View>
  );

  const words = (
    <View style={{ flex: tablet ? 1 : undefined, justifyContent: "center", gap: space.md }}>
      <T variant="display">{t.welcome.hello}</T>
      <T style={{ fontSize: 17, lineHeight: 26, color: color.inkSoft }}>{t.welcome.line}</T>
      <View style={{ gap: space.sm, marginTop: space.sm }}>
        {t.welcome.points.map((point) => (
          <View key={point} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color.action, alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={14} color={color.onAction} />
            </View>
            <T variant="strong">{point}</T>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Screen
      wide
      footer={
        <View style={{ gap: space.sm, maxWidth: 480, width: "100%", alignSelf: "center" }}>
          <Button label={t.welcome.start} icon="arrow-right" onPress={() => router.push("/signup")} />
          <Button variant="secondary" label={t.welcome.login} onPress={() => router.push("/login")} />
        </View>
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <Image source={scheme() === "dark" ? require("../../assets/mark-on-navy.svg") : require("../../assets/mark.svg")} style={{ width: 38, height: 38 }} contentFit="contain" />
          <T variant="title" style={{ fontSize: 21 }}>Campus<T variant="title" tone={color.goInk} style={{ fontSize: 21 }}>Go</T></T>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t.welcome.language} onPress={() => setLang(lang === "en" ? "ko" : "en")} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface }}>
          <Icon name="globe" size={16} color={color.inkMuted} />
          <T variant="small" tone={color.ink} style={{ fontFamily: "SchibstedGrotesk_600SemiBold" }}>{t.welcome.language}</T>
        </Pressable>
      </View>
      {tablet ? (
        <View style={{ flex: 1, flexDirection: "row", gap: space.huge, alignItems: "stretch", paddingVertical: space.xl }}>
          {owl}
          {words}
        </View>
      ) : (
        <View style={{ gap: space.xxl }}>
          {owl}
          {words}
        </View>
      )}
    </Screen>
  );
}
