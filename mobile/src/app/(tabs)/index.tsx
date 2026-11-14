import { useState, type ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { daysFromToday, reminderIsOn, shortDate } from "@/lib/format";
import { useCampus } from "@/lib/campus";
import { useLang } from "@/lib/i18n";
import { useOverview, useTasks } from "@/lib/queries";
import { color, courseTint, font, radius, space } from "@/lib/theme";
import type { JunoMessage, Task } from "@/lib/types";
import { Badge, Button, Card, Failed, Icon, Loading, Row, Section, T, useLayout } from "@/ui";
import { CourseSheet, TaskRow, TaskSheet } from "@/ui/forms";
import { ScanSheet } from "@/ui/Scan";
import { JunoSays, type JunoMood } from "@/ui/Juno";

/*
 * Home answers five questions: what do I have today, what needs my attention,
 * what is coming next, what should I review, and what can I do now. Everything
 * on it is the student's own; nothing here is a feed.
 */

export default function Home() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const client = useQueryClient();
  const overview = useOverview();
  const tasks = useTasks("open");
  const [taskSheet, setTaskSheet] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [courseSheet, setCourseSheet] = useState(false);
  const [scanning, setScanning] = useState(false);
  const campus = useCampus();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([overview.refetch(), tasks.refetch()]);
    setRefreshing(false);
  };

  if (overview.isPending) return <Loading />;
  if (overview.isError || !overview.data) return <Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => overview.refetch()} />;
  const data = overview.data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.home.morning : hour < 18 ? t.home.afternoon : t.home.evening;
  const today = new Date();
  const classes = data.courses.filter((c) => c.classToday).sort((a, b) => (a.startsAt ?? "99").localeCompare(b.startsAt ?? "99"));
  const courseIndex = (id: string) => data.courses.findIndex((c) => c.id === id);

  // What needs attention: overdue, due within three days, or with its reminder on.
  const urgent = (tasks.data ?? []).filter((task) => reminderIsOn(task) || (task.dueAt !== null && daysFromToday(task.dueAt) <= 3)).slice(0, 5);

  /** Juno's one line for right now, and what to do about it. */
  const owl = ((): { text: string; mood: JunoMood; action?: ReactNode } => {
    const m: JunoMessage = data.message;
    const small = (label: string, onPress: () => void, icon?: "arrow-right" | "plus" | "play") => <Button small label={label} icon={icon} onPress={onPress} style={{ alignSelf: "flex-start" }} />;
    switch (m.kind) {
      case "first-course":
        return { text: t.home.juno["first-course"], mood: "idle", action: small(t.course.new, () => setCourseSheet(true), "plus") };
      case "setup":
        return { text: t.home.juno.setup, mood: "idle", action: small(t.common.continue, () => router.push({ pathname: "/onboarding", params: { step: "3" } }), "arrow-right") };
      case "processing":
        return { text: t.home.juno.processing(m.title), mood: "work" };
      case "lecture": {
        const dismiss = () => request(`/junbee/${m.message.lectureId}/dismiss`, { method: "POST" }).then(() => client.invalidateQueries({ queryKey: ["overview"] })).catch(() => {});
        if (m.message.kind === "failed") return { text: t.home.juno.failed(m.message.lectureTitle), mood: "rest", action: small(t.common.close, dismiss) };
        return {
          text: t.home.juno.ready(m.message.lectureTitle, m.message.cardCount),
          mood: "found",
          action: small(t.common.open, () => { dismiss(); router.push({ pathname: "/lecture/[id]", params: { id: m.message.lectureId } }); }, "arrow-right"),
        };
      }
      case "class-today":
        return { text: t.home.juno.classToday(m.courseName), mood: "idle", action: small(t.home.addLecture, () => router.push({ pathname: "/buddy", params: { courseId: m.courseId } }), "plus") };
      case "semester-over":
        return { text: t.home.juno.semesterOver(m.lectures), mood: "rest" };
      case "exam-soon":
        return { text: t.home.juno.examSoon(m.courseName, m.exam === "midterm" ? t.course.midterm : t.course.final, m.days), mood: "idle", action: small(t.course.quiz, () => router.push("/quiz"), "play") };
      case "cards-due":
        return { text: t.home.juno.cardsDue(m.count), mood: "idle", action: small(t.home.play, () => router.push("/quiz"), "play") };
      case "cards-finished":
        return { text: t.home.juno.cardsFinished(m.count), mood: "idle" };
      default:
        return { text: t.home.juno.quiet, mood: "rest" };
    }
  })();

  const todayBlock = (
    <Section title={t.home.today}>
      {classes.length ? (
        <Card style={{ paddingVertical: 0 }}>
          {classes.map((course, i) => {
            const tint = courseTint(courseIndex(course.id));
            return (
              <Row
                key={course.id}
                mark={
                  <View style={{ width: 58, alignItems: "center", paddingVertical: 8, borderRadius: 12, backgroundColor: tint.bg }}>
                    <T variant="small" tone={tint.fg} style={{ fontFamily: font.bold }}>{course.startsAt ?? "–"}</T>
                    {course.endsAt ? <T variant="small" tone={tint.fg} style={{ fontSize: 11.5 }}>{course.endsAt}</T> : null}
                  </View>
                }
                title={course.name}
                sub={[course.location, course.instructor].filter(Boolean).join(" · ") || null}
                onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })}
                last={i === classes.length - 1}
              />
            );
          })}
        </Card>
      ) : (
        <Card><T tone={color.inkMuted}>{t.home.noClassToday}</T></Card>
      )}
    </Section>
  );

  // Three things a student does most, one tap each.
  const quick = (
    <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg }}>
      {([
        { icon: "mic", label: t.homeX.record, go: () => router.push("/buddy") },
        { icon: "message-circle", label: t.homeX.tell, go: () => router.push("/juno") },
        { icon: "image", label: t.homeX.scan, go: () => setScanning(true) },
      ] as const).map((action) => (
        <Pressable key={action.label} accessibilityRole="button" onPress={action.go} style={({ pressed }) => [{ flex: 1, minHeight: 84, borderRadius: radius.lg, borderWidth: 1, borderColor: color.rule, backgroundColor: color.surface, padding: space.md, justifyContent: "space-between" }, pressed && { backgroundColor: color.sunken }]}>
          <Icon name={action.icon} size={20} color={color.ink} />
          <T variant="small" tone={color.ink} style={{ fontFamily: font.semibold, fontSize: 13 }}>{action.label}</T>
        </Pressable>
      ))}
    </View>
  );

  const coursesBlock = data.courses.length ? (
    <Section title={t.homeX.courses} action={t.homeX.allCourses} onAction={() => router.push("/courses")}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.xl }} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.sm }}>
        {data.courses.map((course, i) => (
          <Pressable key={course.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })} style={({ pressed }) => [{ width: 148, minHeight: 92, borderRadius: radius.lg, backgroundColor: courseTint(i).bg, padding: space.md, justifyContent: "space-between" }, pressed && { opacity: 0.85 }]}>
            <Icon name="book-open" size={18} color={courseTint(i).fg} />
            <T variant="strong" tone={courseTint(i).fg} numberOfLines={2} style={{ fontSize: 14.5, lineHeight: 19 }}>{course.name}</T>
          </Pressable>
        ))}
      </ScrollView>
    </Section>
  ) : null;

  const campusNews = campus.data?.connected ? campus.data.items.filter((item) => item.forInternational).slice(0, 2) : [];
  const campusBlock = campusNews.length ? (
    <Section title={t.homeX.campus} action={t.common.seeAll} onAction={() => router.push("/campus")}>
      <Card style={{ paddingVertical: 0 }}>
        {campusNews.map((item, i) => <Row key={item.id} icon="map-pin" title={item.title} sub={item.source} onPress={() => router.push("/campus")} last={i === campusNews.length - 1} />)}
      </Card>
    </Section>
  ) : null;

  const reviewBlock = (
    <Section title={t.home.review}>
      <Card tone={data.review.due ? color.lampSoft : undefined} onPress={data.review.due ? () => router.push("/quiz") : undefined}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: data.review.due ? color.lamp : color.sunken, alignItems: "center", justifyContent: "center" }}>
            <Icon name={data.review.due ? "zap" : "check"} size={20} color={color.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="strong">{data.review.due ? t.home.reviewLine(data.review.due) : data.review.done ? t.home.reviewDone(data.review.done) : t.home.reviewNone}</T>
            {data.review.due && data.review.done ? <T variant="small" tone={color.lampInk}>{t.home.reviewDone(data.review.done)}</T> : null}
          </View>
          {data.review.due ? <View style={{ backgroundColor: color.action, borderRadius: radius.pill, paddingHorizontal: space.lg, minHeight: 40, justifyContent: "center" }}><T variant="strong" tone={color.onAction} style={{ fontSize: 14 }}>{t.home.play}</T></View> : null}
        </View>
      </Card>
    </Section>
  );

  const attentionBlock = (
    <Section title={t.home.attention} action={t.common.seeAll} onAction={() => router.push("/tasks")}>
      <Card style={{ paddingVertical: urgent.length ? 0 : space.lg }}>
        {urgent.length ? urgent.map((task, i) => <TaskRow key={task.id} task={task} onOpen={(open) => setTaskSheet({ open: true, task: open })} last={i === urgent.length - 1} />) : <T tone={color.inkMuted}>{t.home.nothingDue}</T>}
      </Card>
      <Button small variant="secondary" icon="plus" label={t.home.addTask} onPress={() => setTaskSheet({ open: true, task: null })} style={{ alignSelf: "flex-start", marginTop: space.md }} />
    </Section>
  );

  const comingBlock = data.exams.length ? (
    <Section title={t.home.exams}>
      <Card style={{ paddingVertical: 0 }}>
        {data.exams.slice(0, 3).map((exam, i, all) => (
          <Row
            key={`${exam.courseId}-${exam.exam}`}
            icon="flag"
            title={exam.courseName}
            sub={`${exam.exam === "midterm" ? t.course.midterm : t.course.final} · ${shortDate(`${exam.on}T00:00:00`, lang)}`}
            right={<Badge label={t.common.inDays(exam.days)} bg={exam.days <= 7 ? color.lampSoft : color.sunken} fg={exam.days <= 7 ? color.lampInk : color.inkSoft} />}
            onPress={() => router.push({ pathname: "/course/[id]", params: { id: exam.courseId } })}
            last={i === all.length - 1}
          />
        ))}
      </Card>
    </Section>
  ) : null;

  const latestBlock = data.latestNote ? (
    <Section title={t.home.latest}>
      <Card style={{ paddingVertical: 0 }}>
        <Row icon="file-text" title={data.latestNote.topic || data.latestNote.title} sub={data.latestNote.courseName} onPress={() => router.push({ pathname: "/lecture/[id]", params: { id: data.latestNote!.id } })} last />
      </Card>
    </Section>
  ) : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.ground }}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 120, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: tablet ? 1080 : 640, alignSelf: "center" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={color.ink} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <T variant="small">
            {shortDate(today.toISOString(), lang)}
            {" · "}
            {data.semester ? t.home.week(Math.min(Math.max(data.semester.currentWeek, 1), data.semester.weeks), data.semester.weeks) : t.home.noSemester}
          </T>
          <T variant="display" numberOfLines={2}>{greeting}, {user?.name.split(" ")[0]}</T>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t.profile.title} onPress={() => router.push("/profile")} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: color.ink, alignItems: "center", justifyContent: "center" }}>
          <T variant="strong" tone={color.onInk}>{(user?.name ?? "?").trim().charAt(0).toUpperCase()}</T>
        </Pressable>
      </View>

      <JunoSays mood={owl.mood} action={owl.action} style={{ marginTop: space.xl }}>{owl.text}</JunoSays>
      {quick}

      {tablet ? (
        <View style={{ flexDirection: "row", gap: space.xxl, alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>{todayBlock}{coursesBlock}{reviewBlock}{latestBlock}</View>
          <View style={{ flex: 1 }}>{attentionBlock}{campusBlock}{comingBlock}</View>
        </View>
      ) : (
        <>{attentionBlock}{todayBlock}{coursesBlock}{reviewBlock}{campusBlock}{comingBlock}{latestBlock}</>
      )}

      <ScanSheet visible={scanning} onClose={() => setScanning(false)} />
      <TaskSheet visible={taskSheet.open} task={taskSheet.task} onClose={() => setTaskSheet({ open: false, task: null })} />
      <CourseSheet visible={courseSheet} onClose={() => setCourseSheet(false)} onSaved={(course) => router.push({ pathname: "/course/[id]", params: { id: course.id } })} />
    </ScrollView>
  );
}
