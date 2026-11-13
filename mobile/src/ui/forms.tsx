import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/lib/notifications";
import { addDays, clockTime, daysFromToday, isDateText, isTimeText, isoDate, maskDate, maskTime, reminderIsOn, shortDate, toMoment } from "@/lib/format";
import { useCourses, useDeleteTask, useSaveCourse, useSaveTask } from "@/lib/queries";
import { color, space } from "@/lib/theme";
import type { Course, Task, TaskKind } from "@/lib/types";
import { Badge, Button, Chip, Chips, Field, Icon, Notice, Sheet, T } from "./index";

/*
 * The two forms used all over the app: a course (onboarding, Courses, the
 * course workspace) and a task (Home, a course, the task list).
 */

/** A date typed as digits: the dashes fill themselves in. */
export function DateField({ label, value, onChange, optional, error }: { label: string; value: string; onChange: (value: string) => void; optional?: string; error?: string | null }) {
  return <Field label={label} optional={optional} value={value} onChangeText={(text) => onChange(maskDate(text))} placeholder="2026-11-20" keyboardType="number-pad" maxLength={10} error={error} />;
}

export function TimeField({ label, value, onChange, optional }: { label: string; value: string; onChange: (value: string) => void; optional?: string }) {
  return <Field label={label} optional={optional} value={value} onChangeText={(text) => onChange(maskTime(text))} placeholder="10:30" keyboardType="number-pad" maxLength={5} />;
}

const WEEK = [1, 2, 3, 4, 5, 6, 0];

/** Add a course, or edit one. Only the name is needed; days and times make the timetable. */
export function CourseSheet({ visible, onClose, course, onSaved }: { visible: boolean; onClose: () => void; course?: Course | null; onSaved?: (course: Course) => void }) {
  const { t, errorText } = useLang();
  const save = useSaveCourse();
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [code, setCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [midtermOn, setMidtermOn] = useState("");
  const [finalOn, setFinalOn] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(course?.name ?? "");
    setDays(course?.classDays ?? []);
    setStartsAt(course?.startsAt ?? "");
    setEndsAt(course?.endsAt ?? "");
    setLocation(course?.location ?? "");
    setCode(course?.code ?? "");
    setInstructor(course?.instructor ?? "");
    setLanguage(course?.language ?? null);
    setMidtermOn(course?.midtermOn ?? "");
    setFinalOn(course?.finalOn ?? "");
    setError(null);
  }, [visible, course]);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError(t.errors.InvalidName);
    if ((startsAt && !isTimeText(startsAt)) || (endsAt && !isTimeText(endsAt))) return setError(t.errors.InvalidSchedule);
    if ((midtermOn && !isDateText(midtermOn)) || (finalOn && !isDateText(finalOn))) return setError(t.errors.InvalidDate);
    try {
      const res = await save.mutateAsync({
        id: course?.id,
        name: name.trim(),
        classDays: days,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        location: location.trim() || null,
        code: code.trim() || null,
        instructor: instructor.trim() || null,
        language,
        midtermOn: midtermOn || null,
        finalOn: finalOn || null,
      });
      onSaved?.(res.course);
      onClose();
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={course ? t.course.edit : t.course.new} footer={<Button label={t.common.save} loading={save.isPending} onPress={submit} />}>
      <Field label={t.course.name} value={name} onChangeText={setName} placeholder={t.course.nameHint} maxLength={80} autoFocus={!course} />
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.course.days}</T>
      <Chips style={{ marginBottom: space.lg }}>
        {WEEK.map((day) => (
          <Chip key={day} label={t.days.short[day]} selected={days.includes(day)} onPress={() => setDays((now) => (now.includes(day) ? now.filter((d) => d !== day) : [...now, day]))} />
        ))}
      </Chips>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}><TimeField label={t.course.starts} value={startsAt} onChange={setStartsAt} optional={t.common.optional} /></View>
        <View style={{ flex: 1 }}><TimeField label={t.course.ends} value={endsAt} onChange={setEndsAt} optional={t.common.optional} /></View>
      </View>
      <Field label={t.course.location} optional={t.common.optional} value={location} onChangeText={setLocation} maxLength={80} />
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.course.language}</T>
      <Chips style={{ marginBottom: space.lg }}>
        {[["ko", "한국어"], ["en", "English"]].map(([value, label]) => (
          <Chip key={value} label={label} selected={language === value} onPress={() => setLanguage(language === value ? null : value)} />
        ))}
      </Chips>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}><Field label={t.course.code} optional={t.common.optional} value={code} onChangeText={setCode} maxLength={24} autoCapitalize="characters" /></View>
        <View style={{ flex: 1 }}><Field label={t.course.instructor} optional={t.common.optional} value={instructor} onChangeText={setInstructor} maxLength={80} /></View>
      </View>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}><DateField label={t.course.midterm} value={midtermOn} onChange={setMidtermOn} optional={t.common.optional} /></View>
        <View style={{ flex: 1 }}><DateField label={t.course.final} value={finalOn} onChange={setFinalOn} optional={t.common.optional} /></View>
      </View>
      {error ? <Notice tone="error" text={error} /> : null}
    </Sheet>
  );
}

const REMINDERS = [
  { key: "none", minutes: null },
  { key: "hour", minutes: 60 },
  { key: "day", minutes: 1440 },
  { key: "days3", minutes: 4320 },
] as const;

/** Add a task, or edit one. A new task can arrive with its course already chosen. */
export function TaskSheet({ visible, onClose, task, courseId }: { visible: boolean; onClose: () => void; task?: Task | null; courseId?: string | null }) {
  const { t, errorText } = useLang();
  const courses = useCourses();
  const save = useSaveTask();
  const remove = useDeleteTask();
  const notifications = useNotifications();
  const remindNote = !notifications.on ? t.notify.taskOff : notifications.whenClosed ? t.notify.taskOn : t.notify.taskOnOpen;
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("task");
  const [course, setCourse] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [remind, setRemind] = useState<number | null>(null);
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? "");
    setKind(task?.kind ?? "task");
    setCourse(task ? task.courseId : courseId ?? null);
    setDate(task?.dueAt ? isoDate(new Date(task.dueAt)) : "");
    setTime(task?.dueAt && clockTime(task.dueAt) !== "23:59" ? clockTime(task.dueAt) : "");
    setRemind(task?.remindMinutes ?? null);
    setPriority(task?.priority ?? 2);
    setError(null);
  }, [visible, task, courseId]);

  const submit = async () => {
    setError(null);
    if (!title.trim()) return setError(t.errors.InvalidField);
    if (date && !isDateText(date)) return setError(t.errors.InvalidDate);
    if (time && !isTimeText(time)) return setError(t.errors.InvalidSchedule);
    try {
      await save.mutateAsync({
        id: task?.id,
        title: title.trim(),
        kind,
        courseId: course,
        dueAt: date ? toMoment(date, time) : null,
        remindMinutes: date ? remind : null,
        priority,
      });
      onClose();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const quick = [
    [t.task.quick.today, 0],
    [t.task.quick.tomorrow, 1],
    [t.task.quick.week, 7],
  ] as const;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={task ? t.task.edit : t.task.new}
      footer={
        <View style={{ gap: space.sm }}>
          <Button label={t.common.save} loading={save.isPending} onPress={submit} />
          {task ? <Button variant="danger" small icon="trash-2" label={t.common.delete} loading={remove.isPending} onPress={() => remove.mutateAsync(task.id).then(onClose).catch((err) => setError(errorText(err)))} /> : null}
        </View>
      }
    >
      <Field label={t.task.title} value={title} onChangeText={setTitle} placeholder={t.task.titleHint} maxLength={160} autoFocus={!task} returnKeyType="done" />
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.task.kind}</T>
      <Chips style={{ marginBottom: space.lg }}>
        {(["task", "assignment", "exam", "study"] as const).map((k) => <Chip key={k} label={t.task.kinds[k]} selected={kind === k} onPress={() => setKind(k)} />)}
      </Chips>
      {courses.data?.length ? (
        <>
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.task.course}</T>
          <Chips style={{ marginBottom: space.lg }}>
            {courses.data.map((c) => <Chip key={c.id} label={c.name} selected={course === c.id} onPress={() => setCourse(course === c.id ? null : c.id)} />)}
          </Chips>
        </>
      ) : null}
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.task.due}</T>
      <Chips style={{ marginBottom: space.md }}>
        {quick.map(([label, days]) => {
          const value = isoDate(addDays(new Date(), days));
          return <Chip key={label} label={label} selected={date === value} onPress={() => setDate(date === value ? "" : value)} />;
        })}
      </Chips>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}><DateField label={t.task.due} value={date} onChange={setDate} optional={t.common.optional} /></View>
        <View style={{ flex: 1 }}><TimeField label={t.task.time} value={time} onChange={setTime} optional={t.common.optional} /></View>
      </View>
      {date ? (
        <>
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.task.remind}</T>
          <Chips style={{ marginBottom: space.sm }}>
            {REMINDERS.map((r) => <Chip key={r.key} label={t.task.reminders[r.key]} selected={remind === r.minutes} onPress={() => setRemind(r.minutes)} />)}
          </Chips>
          {remind !== null ? <T variant="small" style={{ marginBottom: space.lg }}>{remindNote}</T> : <View style={{ height: space.md }} />}
        </>
      ) : null}
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.task.priority}</T>
      <Chips style={{ marginBottom: space.lg }}>
        {([1, 2, 3] as const).map((p) => <Chip key={p} label={t.task.priorities[p]} selected={priority === p} onPress={() => setPriority(p)} />)}
      </Chips>
      {error ? <Notice tone="error" text={error} /> : null}
    </Sheet>
  );
}

/** When a task is due, in words, and whether that is urgent. */
export function useDueLabel() {
  const { t, lang } = useLang();
  return (task: Pick<Task, "dueAt">) => {
    if (!task.dueAt) return { text: t.home.noDate, urgent: false };
    const days = daysFromToday(task.dueAt);
    const time = clockTime(task.dueAt) === "23:59" ? "" : ` · ${clockTime(task.dueAt)}`;
    if (days < 0) return { text: `${t.home.overdue} · ${shortDate(task.dueAt, lang)}`, urgent: true };
    if (days === 0) return { text: `${t.home.dueToday}${time}`, urgent: true };
    if (days === 1) return { text: `${t.home.dueTomorrow}${time}`, urgent: false };
    if (days <= 7) return { text: `${t.home.dueIn(days)} · ${shortDate(task.dueAt, lang)}`, urgent: false };
    return { text: shortDate(task.dueAt, lang), urgent: false };
  };
}

/** One task: a circle to tick it off, what it is, and when it is due. Pressing the text opens it. */
export function TaskRow({ task, onOpen, last }: { task: Task; onOpen: (task: Task) => void; last?: boolean }) {
  const { t } = useLang();
  const save = useSaveTask();
  const due = useDueLabel()(task);
  const reminding = reminderIsOn(task);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, minHeight: 60, borderBottomWidth: last ? 0 : 1, borderBottomColor: color.rule }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        aria-checked={task.done}
        accessibilityLabel={task.done ? t.task.markOpen : t.task.markDone}
        hitSlop={10}
        onPress={() => save.mutate({ id: task.id, done: !task.done })}
        style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: task.done ? color.action : color.ruleStrong, backgroundColor: task.done ? color.action : color.surface, alignItems: "center", justifyContent: "center" }}
      >
        {task.done ? <Icon name="check" size={15} color={color.onAction} /> : null}
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => onOpen(task)} style={{ flex: 1, gap: 3 }}>
        <T variant="strong" numberOfLines={2} style={task.done ? { textDecorationLine: "line-through", color: color.inkFaint } : null}>{task.title}</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          {task.kind !== "task" ? <Badge label={t.task.kinds[task.kind]} bg={task.kind === "exam" ? color.sunken : color.sunken} fg={task.kind === "exam" ? color.inkSoft : color.inkSoft} /> : null}
          {reminding ? <Badge icon="bell" label={t.task.reminderNow} bg={color.lampSoft} fg={color.lampInk} /> : null}
          <T variant="small" tone={due.urgent && !task.done ? color.lampInk : color.inkMuted}>{[task.courseName, task.dueAt ? due.text : null].filter(Boolean).join(" · ") || due.text}</T>
        </View>
      </Pressable>
    </View>
  );
}
