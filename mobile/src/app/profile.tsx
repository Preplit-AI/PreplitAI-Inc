import { useState } from "react";
import { Linking, Platform, View } from "react-native";
import { router } from "expo-router";
import { API_ORIGIN } from "@/lib/api";
import { useAppearance, type Appearance } from "@/lib/appearance";
import { useAuth, type ProfileChanges } from "@/lib/auth";
import { EXPLAIN_LANGUAGES, languageName, useLang } from "@/lib/i18n";
import { useNotifications } from "@/lib/notifications";
import { color, radius, space } from "@/lib/theme";
import type { Profile, UiLanguage } from "@/lib/types";
import { Button, Card, Chip, Chips, Notice, Row, Screen, Section, Segment, Sheet, T, Toggle } from "@/ui";
import { Owl, OwlFigure } from "@/ui/Owl";

/*
 * The profile: who the student is to Owl, and the settings that are theirs to
 * change. Everything Juno knows about them is shown here and can be edited.
 */

const QUIET_PRESETS: [number, number][] = [[22, 8], [23, 7], [0, 9]];

export default function ProfileScreen() {
  const { t, lang, setLang, errorText } = useLang();
  const { user, profile, saveProfile, logout } = useAuth();
  const notifications = useNotifications();
  const { appearance, setAppearance } = useAppearance();
  const [languages, setLanguages] = useState(false);
  const [tested, setTested] = useState<"sent" | "failed" | null>(null);

  // Where reminders stand on this device, in one plain sentence.
  const notifyLine =
    notifications.permission === "unsupported" ? t.notify.unsupported
    : notifications.blocked ? t.notify.blocked
    : notifications.wanted && !notifications.on ? t.notify.asking
    : !notifications.on ? t.notify.off
    : notifications.whenClosed ? t.notify.onClosed
    : t.notify.onOpen;
  const toggleNotifications = (next: boolean) => {
    setTested(null);
    if (next) notifications.turnOn();
    else notifications.turnOff();
  };
  const sendTest = async () => setTested((await notifications.sendTest()) ? "sent" : "failed");
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const p = profile as Profile;

  const change = (changes: ProfileChanges) => {
    setError(null);
    saveProfile(changes).catch((err) => setError(errorText(err)));
  };
  // Leaves for the welcome screen first, then ends the session: the screens behind this one
  // close the moment the student is signed out, and this way there is somewhere to be.
  const signOut = () => {
    setLeaving(true);
    router.replace("/welcome");
    logout().catch(() => {});
  };
  const edit = (step: number) => router.push({ pathname: "/onboarding", params: { step: String(step) } });
  const studying = [p.department, p.degreeLevel ? t.onboarding.degrees[p.degreeLevel] : null, p.academicYear ? `${p.academicYear}` : null].filter(Boolean).join(" · ");
  const privacy = () => Linking.openURL(`${API_ORIGIN || (Platform.OS === "web" ? window.location.origin : "")}/privacy`);

  return (
    <Screen back title={t.profile.title}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg, marginTop: space.md }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: color.goSoft, alignItems: "center", justifyContent: "center" }}>
          <T variant="title" tone={color.goInk}>{(user?.name ?? "?").trim().charAt(0).toUpperCase()}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="title">{user?.name}</T>
          <T variant="small">{user?.email}</T>
        </View>
      </View>
      {error ? <View style={{ marginTop: space.md }}><Notice tone="error" text={error} /></View> : null}

      {/* Juno lives here. Its stage is a record of something real; starting a profile is the first. */}
      <View style={{ marginTop: space.xl, flexDirection: "row", alignItems: "flex-end", gap: space.lg, backgroundColor: color.panel, borderRadius: radius.xl, paddingHorizontal: space.xl, paddingTop: space.lg }}>
        <OwlFigure size={150} stage={1} />
        <View style={{ flex: 1, paddingBottom: space.xl, gap: 4 }}>
          <T variant="label" tone={color.lamp}>{t.profile.owlStage}</T>
          <T variant="title" tone={color.onNavy}>{t.profile.owlTitle}</T>
          <T variant="small" tone={color.onNavySoft}>{t.profile.owlLine}</T>
        </View>
      </View>

      <Section title={t.profile.study}>
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="map-pin" title={p.university ?? t.onboarding.done.notSaid} sub={p.campus} onPress={() => edit(1)} />
          <Row icon="book" title={t.onboarding.done.studying} sub={studying || t.onboarding.done.notSaid} onPress={() => edit(2)} />
          <Row icon="target" title={t.onboarding.done.goal} sub={[p.targetRole, ...p.careerInterests].filter(Boolean).join(", ") || t.onboarding.done.notSaid} onPress={() => edit(5)} last />
        </Card>
      </Section>

      <Section title={t.profile.languages}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <Owl size={40} mood="attentive" />
            <View style={{ flex: 1 }}>
              <T variant="small">{t.profile.explainLanguage}</T>
              <T variant="heading">{languageName(p.explainLanguage) ?? t.onboarding.done.notSaid}</T>
            </View>
            <Button small variant="secondary" label={t.common.edit} onPress={() => setLanguages(true)} />
          </View>
          <View>
            <T variant="small" style={{ marginBottom: 8 }}>{t.profile.appLanguage}</T>
            <Segment<UiLanguage> options={[{ value: "en", label: "English" }, { value: "ko", label: "한국어" }]} value={lang} onChange={(next) => { setLang(next); change({ uiLanguage: next }); }} />
          </View>
        </Card>
      </Section>

      <Section title={t.profile.appearance}>
        <Segment<Appearance>
          options={[{ value: "system", label: t.profile.themeSystem }, { value: "light", label: t.profile.themeDawn }, { value: "dark", label: t.profile.themeDusk }]}
          value={appearance}
          onChange={setAppearance}
        />
      </Section>

      <Section title={t.profile.notifications}>
        <Card style={{ paddingVertical: space.xs }}>
          {notifications.permission === "unsupported" ? null : (
            <Toggle label={t.notify.device} value={notifications.wanted} onChange={toggleNotifications} />
          )}
          <View style={{ paddingBottom: space.md, gap: space.md }}>
            <Notice tone={notifications.blocked ? "warn" : notifications.on ? "good" : "info"} icon={notifications.on ? "bell" : "bell-off"} text={notifyLine} />
            {notifications.blocked && notifications.canOpenSettings ? <Button small variant="secondary" icon="settings" label={t.notify.openSettings} onPress={notifications.openSettings} style={{ alignSelf: "flex-start" }} /> : null}
            {notifications.on ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.md }}>
                <Button small variant="secondary" icon="send" label={t.notify.test} onPress={sendTest} />
                <T variant="small">{tested === "sent" ? t.notify.testSent : tested === "failed" ? t.notify.testFailed : t.notify.scheduled(notifications.scheduled)}</T>
              </View>
            ) : null}
          </View>
        </Card>
        <Card style={{ paddingVertical: space.xs, marginTop: space.md }}>
          <Toggle label={t.profile.dailyQuiz} sub={t.notify.dailyAt(notifications.dailyQuizHour)} value={p.dailyQuiz} onChange={(dailyQuiz) => change({ dailyQuiz })} />
          <View style={{ paddingBottom: space.md, gap: 8 }}>
            <T variant="strong">{t.profile.quiet}</T>
            <T variant="small">{t.profile.quietLine(p.quietFrom, p.quietUntil)}</T>
            <Chips>
              {QUIET_PRESETS.map(([from, until]) => (
                <Chip key={from} label={`${from}:00 – ${until}:00`} selected={p.quietFrom === from && p.quietUntil === until} onPress={() => change({ quietFrom: from, quietUntil: until })} />
              ))}
            </Chips>
          </View>
        </Card>
      </Section>

      <Section title={t.profile.data}>
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="shield" title={t.profile.privacy} onPress={privacy} />
          <Row icon="lock" title={t.profile.data} sub={t.profile.dataLine} last />
        </Card>
      </Section>

      <View style={{ marginTop: space.xxl, gap: space.md }}>
        <Button variant="secondary" icon="log-out" label={t.profile.logout} loading={leaving} onPress={signOut} />
        <T variant="small" tone={color.inkFaint} style={{ textAlign: "center" }}>{t.appName} · {t.profile.version} 0.1.0</T>
      </View>

      <Sheet visible={languages} onClose={() => setLanguages(false)} title={t.profile.explainLanguage}>
        <T variant="small" style={{ marginBottom: space.lg }}>{t.onboarding.language.why}</T>
        <Chips>
          {EXPLAIN_LANGUAGES.map((l) => (
            <Chip key={l.code} label={l.name} selected={p.explainLanguage === l.code} onPress={() => { change({ explainLanguage: l.code }); setLanguages(false); }} />
          ))}
        </Chips>
      </Sheet>
    </Screen>
  );
}
