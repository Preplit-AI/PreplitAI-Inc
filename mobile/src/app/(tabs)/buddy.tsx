import { useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { Animated, Easing, Pressable, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { appendPiece, usePieceRecorder, type Piece } from "@/lib/listen";
import { useCourses, useLectures, useOverview, useRefresh } from "@/lib/queries";
import { color, courseTint, font, radius, space } from "@/lib/theme";
import type { LectureSummary } from "@/lib/types";
import { Button, Card, Icon, Loading, Notice, Row, Section, Sheet, T, useLayout } from "@/ui";
import { CourseSheet } from "@/ui/forms";
import { Juno } from "@/ui/Juno";
import { Confirm, LectureRow } from "@/ui/parts";

/*
 * Lecture Buddy. Choose the course, press one button, and Juno listens to the
 * class: the words appear as they are said, and pressing Stop saves the notes
 * to that course's workspace.
 *
 * The class is recorded in short pieces. Each piece is sent to be written down
 * as soon as it is finished and then thrown away, so no recording is kept on
 * the phone or the server: only the transcript.
 */

const CONSENT_KEY = "preplit.listen.consent";
const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds) % 60).padStart(2, "0")}`;

type Session = { id: string; courseId: string };
type ChunkAnswer = { heard?: boolean; lines: string[]; session: { seconds: number } };

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
  const [phase, setPhase] = useState<"idle" | "starting" | "listening" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [written, setWritten] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lost, setLost] = useState(0);

  const session = useRef<Session | null>(null);
  const sending = useRef<Promise<void>>(Promise.resolve());
  const seq = useRef(0);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);

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

  /** One finished piece: sent after the one before it, tried three times, then marked as lost. */
  const send = useCallback((piece: Piece) => {
    const mine = session.current;
    if (!mine) return;
    const n = seq.current++;
    sending.current = sending.current.then(async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (session.current !== mine) return;
        const form = new FormData();
        form.append("seq", String(n));
        form.append("seconds", piece.seconds.toFixed(1));
        appendPiece(form, piece);
        try {
          const answer = await request<ChunkAnswer>(`/listen/${mine.id}/chunk`, { method: "POST", form });
          if (answer.lines.length) setLines((before) => [...before, ...answer.lines]);
          if (answer.heard === false) setLost((count) => count + 1);
          setWritten(answer.session.seconds);
          return;
        } catch (err) {
          // Refused for good (the class was closed, the piece is not audio): trying again will not help.
          const status = err instanceof ApiError ? err.status : 0;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) break;
          await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
        }
      }
      setLost((count) => count + 1);
    });
  }, []);

  const recorder = usePieceRecorder(send);

  // The clock, and the screen kept on, while Juno listens.
  useEffect(() => {
    if (phase !== "listening") return;
    const startedAt = Date.now() - elapsed * 1000;
    const tick = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 500);
    activateKeepAwakeAsync("listening").catch(() => {});
    return () => {
      clearInterval(tick);
      deactivateKeepAwake("listening").catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    scroller.current?.scrollToEnd({ animated: true });
  }, [lines.length]);

  const begin = async () => {
    if (!course) return;
    setError(null);
    setPhase("starting");
    try {
      const made = await request<{ session: { id: string } }>("/listen", { method: "POST", body: { courseId: course.id } });
      session.current = { id: made.session.id, courseId: course.id };
      seq.current = 0;
      sending.current = Promise.resolve();
      setLines([]);
      setWritten(0);
      setElapsed(0);
      setLost(0);
      const ok = await recorder.start();
      if (!ok) {
        request(`/listen/${made.session.id}`, { method: "DELETE" }).catch(() => {});
        session.current = null;
        setPhase("idle");
        return;
      }
      setPhase("listening");
    } catch (err) {
      session.current = null;
      setPhase("idle");
      setError(errorText(err));
    }
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

  const stop = async () => {
    const mine = session.current;
    if (!mine) return;
    setPhase("saving");
    try {
      await recorder.stop();
      await sending.current;
      const done = await request<{ lecture: LectureSummary }>(`/listen/${mine.id}/finish`, { method: "POST", body: {} });
      session.current = null;
      refresh("lectures", "overview", "courses");
      setPhase("idle");
      router.push({ pathname: "/lecture/[id]", params: { id: done.lecture.id } });
    } catch (err) {
      session.current = null;
      setPhase("idle");
      setError(err instanceof ApiError && err.code === "TooShort" ? t.listen.tooShort : errorText(err));
    }
  };

  const discard = async () => {
    const mine = session.current;
    session.current = null;
    setDiscarding(false);
    await recorder.stop().catch(() => {});
    if (mine) request(`/listen/${mine.id}`, { method: "DELETE" }).catch(() => {});
    setPhase("idle");
    setLines([]);
  };

  const listening = phase === "listening" || phase === "saving";
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
          <T variant="label" tone={color.brand}>{phase === "saving" ? t.listen.saving : t.listen.listening}</T>
        </View>
        <T accessibilityLabel={clock(elapsed)} style={{ fontFamily: font.bold, fontSize: 56, lineHeight: 62, letterSpacing: -1.5, fontVariant: ["tabular-nums"] }}>{clock(elapsed)}</T>
        <T variant="small">{written ? t.listen.heardUpTo(clock(written)) : t.listen.waiting}</T>
      </View>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <ScrollView ref={scroller} style={{ maxHeight: tablet ? 320 : 220 }} contentContainerStyle={{ padding: space.lg, gap: space.sm }} showsVerticalScrollIndicator={false}>
          {lines.length ? lines.map((line, i) => {
            const at = /^\[(\d{2}:\d{2})\] (.*)$/.exec(line);
            const said = at ? at[2] : line;
            const unclear = said === "[불명확]";
            return (
              <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                <T variant="small" tone={color.inkFaint} style={{ width: 46, fontSize: 12.5, fontVariant: ["tabular-nums"] }}>{at ? at[1] : ""}</T>
                <T style={{ flex: 1, fontSize: 15, lineHeight: 22 }} tone={unclear ? color.inkFaint : color.ink}>{unclear ? t.listen.unclear : said}</T>
              </View>
            );
          }) : (
            <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
              <Juno size={36} mood="listen" />
              <T variant="small" style={{ flex: 1 }}>{t.listen.waiting}</T>
            </View>
          )}
        </ScrollView>
      </Card>

      {lost ? <Notice tone="warn" text={t.listen.lost(lost)} /> : null}
      <Button icon="square" label={t.listen.stop} loading={phase === "saving"} onPress={stop} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md }}>
        <T variant="small" style={{ flex: 1 }}>{t.listen.keepOpen}</T>
        <Button small variant="quiet" label={t.listen.discard} disabled={phase === "saving"} onPress={() => setDiscarding(true)} />
      </View>
    </View>
  );

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

      {courses.data?.length ? (listening ? live : idle) : null}

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
