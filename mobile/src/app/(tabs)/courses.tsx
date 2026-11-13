import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { courseTimes, termName } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { useOverview } from "@/lib/queries";
import { color, courseTint, font, radius, space } from "@/lib/theme";
import type { CourseSummary } from "@/lib/types";
import { Badge, Button, Card, Failed, Icon, IconButton, Loading, Segment, T, useLayout } from "@/ui";
import { CourseSheet } from "@/ui/forms";
import { Empty } from "@/ui/Owl";

/* Every course this semester, as a list of workspaces or as the week's timetable. */

const WEEK = [1, 2, 3, 4, 5, 6, 0];

function CourseCard({ course, index }: { course: CourseSummary; index: number }) {
  const { t } = useLang();
  const tint = courseTint(index);
  const times = courseTimes(course, t.days.short);
  return (
    <Card onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })} style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: tint.bg, alignItems: "center", justifyContent: "center" }}>
          <Icon name="book-open" size={20} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="heading" numberOfLines={2}>{course.name}</T>
          <T variant="small" numberOfLines={1}>{[course.code, times].filter(Boolean).join(" · ") || t.course.noSchedule}</T>
        </View>
        <Icon name="chevron-right" size={18} color={color.inkFaint} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <Badge icon="file-text" label={t.course.lectures(course.lectureCount ?? 0)} />
        {course.dueCards ? <Badge icon="zap" label={t.course.cardsDue(course.dueCards)} bg={color.sunken} fg={color.inkSoft} /> : null}
        {course.nextExam ? (
          <Badge icon="flag" label={t.course.examIn(course.nextExam.kind === "midterm" ? t.course.midterm : t.course.final, course.nextExam.days)} bg={course.nextExam.days <= 7 ? color.lampSoft : color.sunken} fg={course.nextExam.days <= 7 ? color.lampInk : color.inkSoft} />
        ) : null}
        {course.location ? <Badge icon="map-pin" label={course.location} /> : null}
      </View>
    </Card>
  );
}

/** The week as columns on a tablet and as a day-by-day list on a phone. */
function WeekView({ courses }: { courses: CourseSummary[] }) {
  const { t } = useLang();
  const { tablet } = useLayout();
  const today = new Date().getDay();
  const days = WEEK.map((day) => ({
    day,
    classes: courses.map((course, index) => ({ course, index })).filter(({ course }) => course.classDays.includes(day)).sort((a, b) => (a.course.startsAt ?? "99").localeCompare(b.course.startsAt ?? "99")),
  })).filter(({ day, classes }) => classes.length || (day !== 0 && day !== 6));

  return (
    <View style={{ flexDirection: tablet ? "row" : "column", gap: tablet ? space.sm : space.lg }}>
      {days.map(({ day, classes }) => (
        <View key={day} style={{ flex: tablet ? 1 : undefined, gap: space.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <T variant="label" tone={day === today ? color.ink : color.inkMuted}>{tablet ? t.days.short[day] : t.days.long[day]}</T>
            {day === today ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.lamp }} /> : null}
          </View>
          {classes.length ? classes.map(({ course, index }) => {
            const tint = courseTint(index);
            return (
              <Card key={course.id} tone={tint.bg} onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })} style={{ padding: space.md, borderRadius: radius.md }}>
                <T variant="small" tone={tint.fg} style={{ fontFamily: font.bold }}>{course.startsAt ? `${course.startsAt}${course.endsAt ? `–${course.endsAt}` : ""}` : "–"}</T>
                <T variant="strong" tone={tint.fg} numberOfLines={2} style={{ fontSize: 14.5, lineHeight: 20 }}>{course.name}</T>
                {course.location ? <T variant="small" tone={tint.fg} numberOfLines={1}>{course.location}</T> : null}
              </Card>
            );
          }) : <T variant="small" tone={color.inkFaint}>{t.course.noClasses}</T>}
        </View>
      ))}
    </View>
  );
}

export default function Courses() {
  const { t, lang } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const overview = useOverview();
  const [view, setView] = useState<"list" | "week">("list");
  const [sheet, setSheet] = useState(false);

  if (overview.isPending) return <Loading />;
  if (overview.isError || !overview.data) return <Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => overview.refetch()} />;
  const { courses, semester } = overview.data;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 120, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: tablet ? 1080 : 640, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <T variant="small">{semester ? `${termName(semester.startsOn, lang)} · ${t.home.week(Math.min(Math.max(semester.currentWeek, 1), semester.weeks), semester.weeks)}` : t.home.noSemester}</T>
          <T variant="display">{t.tabs.courses}</T>
        </View>
        <IconButton icon="plus" label={t.course.new} onPress={() => setSheet(true)} filled />
      </View>

      {courses.length ? (
        <>
          <View style={{ marginTop: space.xl, marginBottom: space.lg, maxWidth: 280 }}>
            <Segment options={[{ value: "list", label: t.course.list }, { value: "week", label: t.course.week }]} value={view} onChange={setView} />
          </View>
          {view === "list" ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
              {courses.map((course, i) => (
                <View key={course.id} style={{ width: tablet ? "48.8%" : "100%" }}><CourseCard course={course} index={i} /></View>
              ))}
            </View>
          ) : (
            <WeekView courses={courses} />
          )}
        </>
      ) : (
        <Empty title={t.course.noCourses} line={t.course.noCoursesLine} mood="attentive" action={<Button small icon="plus" label={t.course.new} onPress={() => setSheet(true)} />} />
      )}

      <CourseSheet visible={sheet} onClose={() => setSheet(false)} onSaved={(course) => router.push({ pathname: "/course/[id]", params: { id: course.id } })} />
    </ScrollView>
  );
}
