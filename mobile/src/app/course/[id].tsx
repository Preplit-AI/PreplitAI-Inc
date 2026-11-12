import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { courseTimes, shortDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { useDeleteCourse, useLectures, useOverview, useTasks } from "@/lib/queries";
import { color, courseTint, space } from "@/lib/theme";
import type { Task } from "@/lib/types";
import { Badge, Button, Card, Failed, Icon, IconButton, Loading, Notice, Row, Screen, Section, Segment, T, useLayout } from "@/ui";
import { CourseSheet, TaskRow, TaskSheet } from "@/ui/forms";
import { Empty } from "@/ui/Juno";
import { Confirm, LectureRow } from "@/ui/parts";

/*
 * One course's workspace: its timetable and exams, every lecture Juno has
 * organised for it, its tasks, and the three things to do with them: add a
 * lecture, ask Juno, take a quiz. Everything here is this course's and no other's.
 */

export default function CourseWorkspace() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang, errorText } = useLang();
  const { tablet } = useLayout();
  const overview = useOverview();
  const lectures = useLectures(id);
  const tasks = useTasks("open", id);
  const remove = useDeleteCourse();
  const [tab, setTab] = useState<"materials" | "tasks" | "overview">("materials");
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [taskSheet, setTaskSheet] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [error, setError] = useState<string | null>(null);

  if (overview.isPending) return <Screen back><Loading /></Screen>;
  const index = overview.data?.courses.findIndex((c) => c.id === id) ?? -1;
  const course = index >= 0 ? overview.data!.courses[index] : null;
  if (overview.isError || !course) {
    return <Screen back><Failed text={overview.isError ? t.errors.Network : t.errors.default} retryLabel={t.common.retry} onRetry={() => overview.refetch()} /></Screen>;
  }
  const tint = courseTint(index);
  const times = courseTimes(course, t.days.long);

  const materials = (
    <>
      {lectures.isPending ? <Loading /> : lectures.data?.length ? (
        <Card style={{ paddingVertical: 0 }}>
          {lectures.data.map((lecture, i) => <LectureRow key={lecture.id} lecture={lecture} last={i === lectures.data.length - 1} />)}
        </Card>
      ) : (
        <Empty title={t.course.noMaterials} line={t.course.noMaterialsLine} mood="listen" />
      )}
    </>
  );

  const taskList = (
    <>
      <Card style={{ paddingVertical: tasks.data?.length ? 0 : space.lg }}>
        {tasks.data?.length ? tasks.data.map((task, i) => <TaskRow key={task.id} task={task} onOpen={(open) => setTaskSheet({ open: true, task: open })} last={i === tasks.data.length - 1} />) : <T tone={color.slate}>{t.task.empty}</T>}
      </Card>
      <Button small variant="secondary" icon="plus" label={t.home.addTask} onPress={() => setTaskSheet({ open: true, task: null })} style={{ alignSelf: "flex-start", marginTop: space.md }} />
    </>
  );

  const details = (
    <>
      <Card style={{ paddingVertical: 0 }}>
        <Row icon="clock" title={t.course.schedule} sub={times || t.course.noSchedule} />
        {course.location ? <Row icon="map-pin" title={t.course.location} sub={course.location} /> : null}
        {course.instructor ? <Row icon="user" title={t.course.instructor} sub={course.instructor} /> : null}
        {course.language ? <Row icon="globe" title={t.course.language} sub={course.language === "ko" ? "한국어" : course.language === "en" ? "English" : course.language} /> : null}
        <Row icon="flag" title={t.course.midterm} sub={course.midtermOn ? shortDate(`${course.midtermOn}T00:00:00`, lang) : t.common.none} />
        <Row icon="flag" title={t.course.final} sub={course.finalOn ? shortDate(`${course.finalOn}T00:00:00`, lang) : t.common.none} last />
      </Card>
      <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.md }}>
        <Button small variant="secondary" icon="edit-2" label={t.course.edit} onPress={() => setEditing(true)} />
        <Button small variant="danger" icon="trash-2" label={t.course.delete} onPress={() => setConfirming(true)} />
      </View>
    </>
  );

  return (
    <Screen back title={course.code ?? ""} wide right={<IconButton icon="edit-2" label={t.course.edit} onPress={() => setEditing(true)} />}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg, marginTop: space.sm }}>
        <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: tint.bg, alignItems: "center", justifyContent: "center" }}>
          <Icon name="book-open" size={26} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="title">{course.name}</T>
          <T variant="small">{courseTimes(course, t.days.short) || t.course.noSchedule}</T>
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.md }}>
        <Badge icon="file-text" label={t.course.lectures(course.lectureCount ?? 0)} />
        {course.dueCards ? <Badge icon="zap" label={t.course.cardsDue(course.dueCards)} bg={color.goldTint} fg={color.honey} /> : null}
        {course.nextExam ? <Badge icon="flag" label={t.course.examIn(course.nextExam.kind === "midterm" ? t.course.midterm : t.course.final, course.nextExam.days)} bg={color.maroonTint} fg={color.maroonDeep} /> : null}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.xl }}>
        <Button small icon="plus" label={t.course.addMaterial} onPress={() => router.push({ pathname: "/buddy", params: { courseId: course.id } })} />
        <Button small variant="secondary" icon="message-circle" label={t.course.askJuno} onPress={() => router.push({ pathname: "/juno", params: { courseId: course.id } })} />
        {course.totalCards ? <Button small variant="secondary" icon="zap" label={t.course.quiz} onPress={() => router.push({ pathname: "/quiz", params: { courseId: course.id } })} /> : null}
      </View>
      {error ? <View style={{ marginTop: space.md }}><Notice tone="error" text={error} /></View> : null}

      {tablet ? (
        <View style={{ flexDirection: "row", gap: space.xxl, alignItems: "flex-start" }}>
          <View style={{ flex: 1.2 }}><Section title={t.course.materials}>{materials}</Section></View>
          <View style={{ flex: 1 }}>
            <Section title={t.course.tasks}>{taskList}</Section>
            <Section title={t.course.details}>{details}</Section>
          </View>
        </View>
      ) : (
        <>
          <View style={{ marginTop: space.xl, marginBottom: space.lg }}>
            <Segment options={[{ value: "materials", label: t.course.materials }, { value: "tasks", label: t.course.tasks }, { value: "overview", label: t.course.details }]} value={tab} onChange={setTab} />
          </View>
          {tab === "materials" ? materials : tab === "tasks" ? taskList : details}
        </>
      )}

      <CourseSheet visible={editing} course={course} onClose={() => setEditing(false)} />
      <TaskSheet visible={taskSheet.open} task={taskSheet.task} courseId={course.id} onClose={() => setTaskSheet({ open: false, task: null })} />
      <Confirm
        visible={confirming}
        title={t.course.delete}
        text={t.course.deleteConfirm}
        confirmLabel={t.course.delete}
        busy={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() =>
          remove.mutateAsync(course.id).then(() => { setConfirming(false); router.replace("/courses"); }).catch((err) => { setConfirming(false); setError(errorText(err)); })
        }
      />
    </Screen>
  );
}
