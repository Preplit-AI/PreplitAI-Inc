import { useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCampus, type CampusItem, type CampusKind } from "@/lib/campus";
import { shortDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { color, radius, space } from "@/lib/theme";
import { Badge, Button, Card, Failed, Icon, Loading, Notice, Segment, T, useLayout } from "@/ui";
import { Empty } from "@/ui/Juno";

/*
 * Campus: what the student's university has posted on its own notice boards,
 * gathered and put into English, with the things an international student
 * needs first and the opportunities (scholarships, jobs, programs) on their
 * own tab. Every item opens the university's own page: Juno translates the
 * titles, the notice itself is the university's.
 */

type Tab = "you" | "chances" | "all";
const CHANCES: CampusKind[] = ["scholarship", "job", "program"];
const ICONS: Record<CampusKind, React.ComponentProps<typeof Icon>["name"]> = {
  scholarship: "award", job: "briefcase", program: "send", event: "calendar", academic: "book", visa: "globe", housing: "home", general: "bell",
};

export default function Campus() {
  const { t, lang } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const board = useCampus();
  const [tab, setTab] = useState<Tab>("you");

  const frame = (children: React.ReactNode) => (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 48, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: 720, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
      <T variant="display">{t.campus.title}</T>
      {children}
    </ScrollView>
  );

  if (board.isPending) return frame(<View style={{ paddingTop: space.huge }}><Loading label={t.campus.reading} /></View>);
  if (board.isError || !board.data) return frame(<Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => board.refetch()} />);

  const data = board.data;
  if (!data.connected) {
    return frame(
      <Empty
        mood="rest"
        title={data.university ? t.campus.notYet(data.university) : t.campus.noUniversity}
        line={data.university ? t.campus.notYetLine : t.campus.noUniversityLine}
        action={data.university ? undefined : <Button small icon="edit-3" label={t.campus.setUniversity} onPress={() => router.push({ pathname: "/onboarding", params: { step: "university" } })} />}
      />,
    );
  }

  const shown = data.items.filter((item) => (tab === "you" ? item.forInternational : tab === "chances" ? CHANCES.includes(item.kind) : true));
  const open = (url: string) => Linking.openURL(url).catch(() => {});

  const row = (item: CampusItem) => (
    <Pressable key={item.id} accessibilityRole="link" accessibilityLabel={item.title} onPress={() => open(item.url)} style={({ pressed }) => [{ flexDirection: "row", gap: space.md, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: color.rule, backgroundColor: color.surface }, pressed && { backgroundColor: color.sunken }]}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color.sunken, alignItems: "center", justifyContent: "center" }}>
        <Icon name={ICONS[item.kind]} size={18} color={color.ink} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, flexWrap: "wrap" }}>
          <Badge label={t.campus.kinds[item.kind]} />
          {item.pinned ? <Badge icon="bookmark" label={t.campus.pinned} bg={color.lampSoft} fg={color.lampInk} /> : null}
          {item.postedOn ? <T variant="small">{shortDate(item.postedOn, lang)}</T> : null}
        </View>
        <T variant="strong">{item.title}</T>
        {item.original ? <T variant="small" numberOfLines={2}>{item.original}</T> : null}
        {item.source ? <T variant="small" tone={color.inkFaint}>{item.source}</T> : null}
      </View>
      <Icon name="arrow-up-right" size={16} color={color.inkFaint} />
    </Pressable>
  );

  return frame(
    <>
      <T tone={color.inkMuted}>{`${data.campus.name} · ${data.campus.city}`}</T>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.lg, marginHorizontal: -space.xl }} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.sm }}>
        {data.campus.links.map((link) => (
          <Pressable key={link.url} accessibilityRole="link" onPress={() => open(link.url)} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface }, pressed && { backgroundColor: color.sunken }]}>
            <T variant="small" tone={color.ink} style={{ fontSize: 14.5 }}>{link.label}</T>
            <Icon name="arrow-up-right" size={14} color={color.inkMuted} />
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ marginTop: space.lg }}>
        <Segment<Tab> options={[{ value: "you", label: t.campus.forYou }, { value: "chances", label: t.campus.chances }, { value: "all", label: t.campus.all }]} value={tab} onChange={setTab} />
      </View>

      {data.failed && !data.items.length ? <View style={{ marginTop: space.lg }}><Notice tone="warn" text={t.campus.siteDown} /></View> : null}

      <View style={{ gap: space.md, marginTop: space.lg }}>
        {shown.length ? shown.map(row) : <Card><T variant="small">{tab === "chances" ? t.campus.noChances : t.campus.nothing}</T></Card>}
      </View>

      <T variant="small" tone={color.inkFaint} style={{ marginTop: space.xl }}>
        {t.campus.from(data.campus.name)}{data.fetchedAt ? ` ${t.campus.updated(new Date(data.fetchedAt).toLocaleTimeString(lang === "ko" ? "ko-KR" : "en-GB", { hour: "2-digit", minute: "2-digit" }))}` : ""}
      </T>
    </>,
  );
}
