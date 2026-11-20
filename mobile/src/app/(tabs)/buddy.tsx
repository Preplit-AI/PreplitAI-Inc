import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { useClassRecorder } from "@/lib/listen";
import { clearPending, discardPending, loadPending, savePending, sendRecording, type Pending } from "@/lib/recording";
import { useCourses, useLectures, useOverview, useRefresh } from "@/lib/queries";
import { color, courseTint, font, radius, space } from "@/lib/theme";

import { Button, Card, Icon, Loading, Notice, Row, Section, Sheet, T, useLayout } from "@/ui";
import { CourseSheet } from "@/ui/forms";
import { Juno } from "@/ui/Juno";
import { Confirm, LectureRow } from "@/ui/parts";

/*
 * Lecture Buddy. Choose the course, press one button, and Juno records the
 * class. Pressing Stop sends the recording once and Juno writes the notes into
 * that course's workspace.
 *
 * Nothing is sent while the class goes on: the whole class is one recording,
 * transcribed once. Until it has been sent the recording stays on the phone,
 * so a send that fails can be tried again; once the notes are being written,
 * the server deletes it.
 */

const CONSENT_KEY = "preplit.listen.consent";
const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds) % 60).padStart(2, "0")}`;


export default function Buddy() {
  const params = useLocalSearchParams<{ courseId?: string }>();
  const { t, errorText } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const courses = useCourses();
  const overview = useOverview();
  const lectures = useLectures();
  const refresh = useRefresh();

  const [courseId, setCourseId] = useState<string | null>(params.courseId ?? null);
  const [picking, setPicking] = useState(false);
  const [courseSheet, setCourseSheet] = useState(false);
  const [consenting, setConsenting] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [phase, setPhase] = useState<"idle" | "starting" | "listening" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sent, setSent] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);

  const recording = useRef<{ courseId: string; recordedAt: string } | null>(null);
  const recorder = useClassRecorder();

  // A class that was recorded but not sent (no signal, the app was closed) is offered again.
  useEffect(() => {
    loadPending().then(setPending);
  }, []);

  // Arriving from a course ("Record a lecture") chooses that course.
  useEffect(() => {
    if (params.courseId) setCourseId(params.courseId);
  }, [params.courseId]);
  // Otherwise: the class that is on today, or the only course there is.
  useEffect(() => {
    if (courseId || !courses.data?.length) return;
    const today = overview.data?.classToday[0]?.courseId;
    if (today && courses.data.some((c) => c.id === today)) setCourseId(today);
    else if (courses.data.length === 1) setCourseId(courses.data[0].id);
  }, [courseId, courses.data, overview.data]);

  const courseIndex = courses.data?.findIndex((c) => c.id === courseId) ?? -1;
  const course = courseIndex >= 0 ? courses.data![courseIndex] : null;

  // The clock, and the screen kept on, while Juno listens.
  useEffect(() => {
    if (phase !== "listening") return;
    const startedAt = Date.now() - elapsed * 1000;
    const tick = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 500);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    if (phase !== "listening" && phase !== "sending") return;
    activateKeepAwakeAsync("listening").catch(() => {});
    return () => {
      deactivateKeepAwake("listening").catch(() => {});
    };
  }, [phase]);

  const begin = async () => {
    if (!course) return;
    setError(null);
    setPhase("starting");
    setElapsed(0);
    const ok = await recorder.start();
    if (!ok) {
      setPhase("idle");
      return;
    }
    recording.current = { courseId: course.id, recordedAt: new Date().toISOString() };
    setPhase("listening");
  };

  /** The first time, Juno asks about permission to record; after that the button just starts. */
  const press = async () => {
    if (!course) return setPicking(true);
    const agreed = await AsyncStorage.getItem(CONSENT_KEY).catch(() => null);
    if (agreed === "1") begin();
    else setConsenting(true);
  };
  const agree = () => {
    AsyncStorage.setItem(CONSENT_KEY, "1").catch(() => {});
    setConsenting(false);
    begin();
  };

  /** Sends a recorded class; if that fails it stays on the phone as a class waiting to be sent. */
  const send = async (take: Pending) => {
    setError(null);
    setSent(0);
    setPhase("sending");
    try {
      const lecture = await sendRecording(take, setSent);
      setPending(null);
      refresh("lectures", "overview", "courses");
      setPhase("idle");
      router.push({ pathname: "/lecture/[id]", params: { id: lecture.id } });
    } catch (err) {
      setPhase("idle");
      const code = err instanceof ApiError ? err.code : "";
      if (code === "RecordingMissing") {
        await discardPending(take);
        setPending(null);
        setError(t.listen.missing);
        return;
      }
      setPending({ ...take });
      setError(code === "MonthlyLimit" || code === "Busy" ? errorText(err) : t.listen.sendFailed);
    }
  };

  const stop = async () => {
    const mine = recording.current;
    if (!mine) return;
    recording.current = null;
    setPhase("sending");
    const take = await recorder.stop().catch(() => null);
    if (!take) {
      setPhase("idle");
      setError(t.listen.tooShort);
      return;
    }
    const waiting: Pending = { ...take, ...mine };
    await savePending(waiting);
    await send(waiting);
  };

  const discard = async () => {
    setDiscarding(false);
    if (recording.current) {
      recording.current = null;
      await recorder.stop().catch(() => null);
    } else {
      await discardPending(pending);
      setPending(null);
    }
    await clearPending();
    setPhase("idle");
  };

  const listening = phase === "listening" || phase === "sending";
  const micProblem = recorder.state === "denied" ? t.listen.denied : recorder.state === "unsupported" ? t.listen.unsupported : null;
  const tint = courseIndex >= 0 ? courseTint(courseIndex) : null;

  const picker = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.listen.course}: ${course ? course.name : t.listen.pickCourse}`}
      disabled={listening}
      onPress={() => setPicking(true)}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 60, paddingHorizontal: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface }, pressed && { backgroundColor: color.sunken }, listening && { opacity: 0.7 }]}
    >
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tint ? tint.fg : color.ruleStrong }} />
      <View style={{ flex: 1 }}>
        <T variant="label">{t.listen.course}</T>
        <T variant="strong" numberOfLines={1}>{course ? course.name : t.listen.pickCourse}</T>
      </View>
      {listening ? null : <Icon name="chevron-down" size={20} color={color.inkMuted} />}
    </Pressable>
  );

  const idle = (
    <View style={{ alignItems: "center", gap: space.lg, paddingVertical: space.xxl }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.listen.start}
        disabled={phase === "starting" || courses.isPending}
        onPress={press}
        style={({ pressed }) => [{ width: 148, height: 148, borderRadius: 74, backgroundColor: color.brand, alignItems: "center", justifyContent: "center", shadowColor: color.brand, shadowOpacity: 0.3, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 8 }, pressed && { transform: [{ scale: 0.97 }] }, phase === "starting" && { opacity: 0.7 }]}
      >
        {phase === "starting" ? <Loading /> : <Icon name="mic" size={52} color={color.onBrand} />}
      </Pressable>
      <View style={{ alignItems: "center", gap: 4 }}>
        <T variant="title">{t.listen.start}</T>
        <T variant="small" style={{ textAlign: "center" }}>{course ? t.listen.savedTo(course.name) : t.listen.ready}</T>
      </View>
    </View>
  );

  const live = (
    <View style={{ gap: space.lg, paddingTop: space.lg }}>
      <View style={{ alignItems: "center", gap: space.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <Pulse on={phase === "listening"} />
          <T variant="label" tone={color.brand}>{phase === "sending" ? t.listen.sending(Math.round(sent * 100)) : t.listen.listening}</T>
        </View>
        <T accessibilityLabel={clock(elapsed)} style={{ fontFamily: font.bold, fontSize: 56, lineHeight: 62, letterSpacing: -1.5, fontVariant: ["tabular-nums"] }}>{clock(elapsed)}</T>
        {phase === "sending" ? (
          <View style={{ alignSelf: "stretch", height: 6, borderRadius: 3, backgroundColor: color.sunken, overflow: "hidden" }}>
            <View style={{ width: `${Math.max(4, Math.round(sent * 100))}%`, height: 6, borderRadius: 3, backgroundColor: color.brand }} />
          </View>
        ) : null}
      </View>

      <Card style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
        <Juno size={40} mood={phase === "sending" ? "work" : "listen"} />
        <T variant="small" style={{ flex: 1 }}>{phase === "sending" ? t.listen.sendingLine : t.listen.recordingLine}</T>
      </Card>

      <Button icon="square" label={t.listen.stop} loading={phase === "sending"} onPress={stop} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md }}>
        <T variant="small" style={{ flex: 1 }}>{t.listen.keepOpen}</T>
        <Button small variant="quiet" label={t.listen.discard} disabled={phase === "sending"} onPress={() => setDiscarding(true)} />
      </View>
    </View>
  );

  const pendingCourse = pending ? courses.data?.find((c) => c.id === pending.courseId) : null;
  const waitingCard = pending && !listening ? (
    <Card style={{ gap: space.md, marginTop: space.lg }}>
      <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
        <Juno size={40} mood="work" />
        <View style={{ flex: 1 }}>
          <T variant="strong">{t.listen.pendingTitle}</T>
          <T variant="small">{t.listen.pendingLine(pendingCourse?.name ?? "", clock(pending.seconds))}</T>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <Button small icon="upload" label={t.listen.send} onPress={() => send(pending)} />
        <Button small variant="quiet" label={t.listen.discard} onPress={() => setDiscarding(true)} />
      </View>
    </Card>
  ) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 48, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: 640, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
      <T variant="display">{t.buddy.title}</T>
      <View style={{ height: space.lg }} />

      {courses.isPending ? <Loading /> : courses.data?.length ? picker : (
        <View style={{ gap: space.md }}>
          <Notice text={t.listen.noCourse} />
          <Button small variant="secondary" icon="plus" label={t.listen.addCourse} onPress={() => setCourseSheet(true)} style={{ alignSelf: "flex-start" }} />
        </View>
      )}

      {error ? <View style={{ marginTop: space.lg }}><Notice tone="error" text={error} /></View> : null}
      {micProblem && !listening ? <View style={{ marginTop: space.lg }}><Notice tone="warn" icon="mic-off" text={micProblem} /></View> : null}

      {waitingCard}

      {courses.data?.length ? (listening ? live : pending ? null : idle) : null}

      {!listening ? (
        <>
          <Card onPress={() => router.push({ pathname: "/material", params: course ? { courseId: course.id } : {} })} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color.sunken, alignItems: "center", justifyContent: "center" }}><Icon name="file-text" size={18} color={color.ink} /></View>
            <View style={{ flex: 1 }}>
              <T variant="strong">{t.listen.instead}</T>
              <T variant="small">{t.listen.addMaterial}</T>
            </View>
            <Icon name="chevron-right" size={18} color={color.inkFaint} />
          </Card>

          {lectures.data?.length ? (
            <Section title={t.listen.recent}>
              <Card style={{ paddingVertical: 0 }}>
                {lectures.data.slice(0, 5).map((lecture, i, shown) => <LectureRow key={lecture.id} lecture={lecture} showCourse last={i === shown.length - 1} />)}
              </Card>
            </Section>
          ) : null}
        </>
      ) : null}

      <Sheet visible={picking} onClose={() => setPicking(false)} title={t.listen.pickCourse}>
        {courses.data?.map((c, i) => (
          <Row
            key={c.id}
            mark={<View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: courseTint(i).bg, alignItems: "center", justifyContent: "center" }}><Icon name="book-open" size={17} color={courseTint(i).fg} /></View>}
            title={c.name}
            right={c.id === courseId ? <Icon name="check" size={20} color={color.ink} /> : <View />}
            onPress={() => { setCourseId(c.id); setPicking(false); }}
          />
        ))}
        <Row icon="plus" title={t.listen.addCourse} onPress={() => { setPicking(false); setCourseSheet(true); }} last />
      </Sheet>

      <Sheet visible={consenting} onClose={() => setConsenting(false)} title={t.listen.consentTitle} footer={<Button icon="mic" label={t.listen.agree} onPress={agree} />}>
        <View style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
          <Juno size={48} mood="listen" />
          <T style={{ flex: 1 }}>{t.listen.consent}</T>
        </View>
      </Sheet>

      <Confirm visible={discarding} title={t.listen.discardTitle} text={t.listen.discardConfirm} confirmLabel={t.listen.discard} onClose={() => setDiscarding(false)} onConfirm={discard} />
      <CourseSheet visible={courseSheet} onClose={() => setCourseSheet(false)} onSaved={(saved) => setCourseId(saved.id)} />
    </ScrollView>
  );
}

/** The recording light: it breathes while Juno is listening, so recording is never silent or hidden. */
function Pulse({ on }: { on: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [on, scale]);
  return <Animated.View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.brand, transform: [{ scale }] }} />;
}
