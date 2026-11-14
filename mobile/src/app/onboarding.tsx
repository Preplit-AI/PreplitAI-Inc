import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth, type ProfileChanges } from "@/lib/auth";
import { findUniversities, usualSemesterStart } from "@/lib/data";
import { courseTimes } from "@/lib/format";
import { EXPLAIN_LANGUAGES, languageName, useLang } from "@/lib/i18n";
import { useCourses, useOverview, useSaveSemester } from "@/lib/queries";
import { color, courseTint, font, radius, space } from "@/lib/theme";
import type { Course, DegreeLevel, KoreanLevel, Profile, Stage } from "@/lib/types";
import { Button, Chip, Chips, Field, Icon, IconButton, Notice, ProgressBar, Row, Screen, T, Card } from "@/ui";
import { CourseSheet } from "@/ui/forms";
import { JunoFigure, type JunoMood } from "@/ui/Juno";

/*
 * Onboarding: Juno gets to know the student in about a minute.
 *
 * One question on a screen, answered with one tap wherever a tap can answer
 * it; the screen moves on by itself. Only the university and the major are
 * typed, and both suggest as you type. Every answer is saved as it is given,
 * so leaving and coming back picks up at the same question, and anything can
 * be skipped and changed later from the profile.
 */

const STEPS = ["language", "korean", "university", "degree", "year", "major", "stage", "courses", "done"] as const;
type StepId = (typeof STEPS)[number];
const QUESTIONS = STEPS.length - 1;

const DEGREES: DegreeLevel[] = ["bachelor", "master", "doctorate", "exchange", "language", "other"];
const KOREAN: KoreanLevel[] = ["none", "beginner", "intermediate", "advanced", "fluent"];
const STAGES: Stage[] = ["preparing", "new", "continuing", "graduating"];
const STAGE_ICONS = { preparing: "send", new: "sunrise", continuing: "compass", graduating: "award" } as const;

/** One big answer. Tapping it is the whole interaction. */
function Option({ label, sub, selected, onPress, icon }: { label: string; sub?: string; selected?: boolean; onPress: () => void; icon?: React.ComponentProps<typeof Icon>["name"] }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      aria-pressed={Boolean(selected)}
      onPress={onPress}
      style={({ pressed }) => [
        { minHeight: 58, flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.lg, borderWidth: 2, borderColor: selected ? color.ink : color.rule, backgroundColor: selected ? color.lampSoft : color.surface },
        pressed && { transform: [{ scale: 0.985 }], borderColor: color.ink },
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={color.ink} /> : null}
      <View style={{ flex: 1 }}>
        <T variant="strong" style={{ fontSize: 16.5 }}>{label}</T>
        {sub ? <T variant="small">{sub}</T> : null}
      </View>
      {selected ? <Icon name="check" size={20} color={color.ink} /> : null}
    </Pressable>
  );
}

export default function Onboarding() {
  const { t, lang, errorText } = useLang();
  const { user, profile, saveProfile } = useAuth();
  const params = useLocalSearchParams<{ step?: string }>();
  const courses = useCourses();
  const overview = useOverview();
  const saveSemester = useSaveSemester();
  const p = profile as Profile;
  // Opened again later from the profile screen, to change one answer.
  const [editing] = useState(p.onboarded);

  const [index, setIndex] = useState(() => {
    const asked = STEPS.indexOf(params.step as StepId);
    if (asked >= 0) return asked;
    return editing ? 0 : Math.min(p.onboardingStep, STEPS.length - 1);
  });
  const step = STEPS[index];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<JunoMood>("happy");
  const [allLanguages, setAllLanguages] = useState(false);
  const [university, setUniversity] = useState(p.university ?? "");
  const [campus, setCampus] = useState(p.campus ?? "");
  const [department, setDepartment] = useState(p.department ?? "");
  const [courseSheet, setCourseSheet] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const moving = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (moving.current) clearTimeout(moving.current); }, []);

  const firstName = (user?.name ?? "").trim().split(/\s+/)[0] || "";

  const go = (to: number) => {
    setError(null);
    setMood(to === STEPS.length - 1 ? "happy" : to % 2 ? "idle" : "listen");
    setIndex(Math.max(0, Math.min(STEPS.length - 1, to)));
  };

  /** Saves this answer and moves on. When changing one answer from the profile, it goes back there instead. */
  const answer = async (fields: ProfileChanges, { pause = 0 }: { pause?: number } = {}) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveProfile({ ...fields, onboardingStep: Math.max(p.onboardingStep, index + 1) });
      setMood("happy");
      const leave = () => {
        setBusy(false);
        if (editing && params.step) router.back();
        else go(index + 1);
      };
      // A beat to see the choice land before the next question.
      if (pause) moving.current = setTimeout(leave, pause);
      else leave();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };
  const tap = (fields: ProfileChanges) => answer(fields, { pause: 260 });

  // The semester is assumed to have started on the usual day for Korea, said plainly at the end and changeable.
  const usual = usualSemesterStart(p.country ?? "KR");
  useEffect(() => {
    if (step !== "courses" || overview.isPending || overview.data?.semester || !usual || saveSemester.isPending) return;
    saveSemester.mutate({ startsOn: usual.date, weeks: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, overview.isPending, overview.data?.semester]);

  // Home opens only once the profile says onboarding is finished (the root layout guards it).
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (leaving && p.onboarded) router.replace("/");
  }, [leaving, p.onboarded]);
  const finish = async () => {
    setBusy(true);
    try {
      if (!p.onboarded) await saveProfile({ onboarded: true });
      setLeaving(true);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const matches = findUniversities("KR", university);
  const exact = matches.find((u) => u.name.toLowerCase() === university.trim().toLowerCase());
  const mainLanguages = allLanguages ? EXPLAIN_LANGUAGES : EXPLAIN_LANGUAGES.slice(0, 6);

  let question = "";
  let body: ReactNode = null;
  let footer: ReactNode = null;

  if (step === "language") {
    question = index === 0 && firstName && !editing ? t.onb.hello(firstName) + " " + t.onb.language : t.onb.language;
    body = (
      <View style={{ gap: space.sm }}>
        {mainLanguages.map((l) => <Option key={l.code} label={l.name} selected={p.explainLanguage === l.code} onPress={() => tap({ explainLanguage: l.code, uiLanguage: lang, country: p.country ?? "KR" })} />)}
        {allLanguages ? null : <Button variant="quiet" icon="chevron-down" label={t.onb.languageMore} onPress={() => setAllLanguages(true)} />}
      </View>
    );
  } else if (step === "korean") {
    question = t.onb.korean;
    body = <View style={{ gap: space.sm }}>{KOREAN.map((level) => <Option key={level} label={t.onboarding.koreanLevels[level]} selected={p.koreanLevel === level} onPress={() => tap({ koreanLevel: level })} />)}</View>;
  } else if (step === "university") {
    question = t.onb.university;
    body = (
      <View>
        <Field label={t.onboarding.university.search} value={university} onChangeText={setUniversity} placeholder={t.onboarding.university.searchHint} autoCorrect={false} autoFocus maxLength={120} returnKeyType="done" style={{ marginBottom: space.sm }} />
        {matches.length && !exact ? (
          <Card style={{ paddingVertical: 0, marginBottom: space.lg }}>
            {matches.map((u, i) => <Row key={u.name} icon="map-pin" title={u.name} sub={u.local} last={i === matches.length - 1} onPress={() => { setUniversity(u.name); setMood("found"); }} right={<View />} />)}
          </Card>
        ) : null}
        {university.trim().length >= 2 ? <Field label={t.onb.campus} optional={t.common.optional} value={campus} onChangeText={setCampus} placeholder={t.onboarding.university.campusHint} maxLength={80} /> : null}
      </View>
    );
    footer = <Button label={t.common.continue} icon="arrow-right" loading={busy} disabled={university.trim().length < 2} onPress={() => answer({ country: "KR", university: university.trim(), campus: campus.trim() || null })} />;
  } else if (step === "degree") {
    question = t.onb.degree;
    body = <View style={{ gap: space.sm }}>{DEGREES.map((d) => <Option key={d} label={t.onboarding.degrees[d]} selected={p.degreeLevel === d} onPress={() => tap({ degreeLevel: d })} />)}</View>;
  } else if (step === "year") {
    question = t.onb.year;
    body = <View style={{ gap: space.sm }}>{t.onb.years.map((label, i) => <Option key={label} label={label} selected={p.academicYear === i + 1} onPress={() => tap({ academicYear: i + 1 })} />)}</View>;
  } else if (step === "major") {
    question = t.onb.major;
    body = (
      <View>
        <Field label={t.onboarding.program.department} value={department} onChangeText={setDepartment} placeholder={t.onb.majorHint} maxLength={120} autoFocus returnKeyType="done" />
        <Chips>{t.onb.majorIdeas.map((idea) => <Chip key={idea} label={idea} selected={department === idea} onPress={() => setDepartment(idea)} />)}</Chips>
      </View>
    );
    footer = <Button label={t.common.continue} icon="arrow-right" loading={busy} onPress={() => answer({ department: department.trim() || null })} />;
  } else if (step === "stage") {
    question = t.onb.stage;
    body = <View style={{ gap: space.sm }}>{STAGES.map((s) => <Option key={s} icon={STAGE_ICONS[s]} label={t.onboarding.stages[s]} sub={t.onb.stageLines[s]} selected={p.stage === s} onPress={() => tap({ stage: s })} />)}</View>;
  } else if (step === "courses") {
    question = t.onb.courses;
    body = (
      <View style={{ gap: space.md }}>
        {courses.data?.length ? (
          <Card style={{ paddingVertical: 0 }}>
            {courses.data.map((course, i) => (
              <Row
                key={course.id}
                mark={<View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: courseTint(i).bg, alignItems: "center", justifyContent: "center" }}><Icon name="book-open" size={17} color={courseTint(i).fg} /></View>}
                title={course.name}
                sub={courseTimes(course, t.days.short) || null}
                last={i === courses.data.length - 1}
                onPress={() => setCourseSheet({ open: true, course })}
              />
            ))}
          </Card>
        ) : null}
        <Button variant="secondary" icon="plus" label={courses.data?.length ? t.onboarding.courses.addAnother : t.onb.addCourse} onPress={() => setCourseSheet({ open: true, course: null })} />
        <T variant="small">{t.onb.coursesLine}</T>
      </View>
    );
    footer = <Button label={courses.data?.length ? t.common.continue : t.onb.later} icon="arrow-right" loading={busy} onPress={() => answer({})} />;
  } else {
    const semester = overview.data?.semester;
    const facts = [
      p.university ? { icon: "map-pin" as const, text: [p.university, p.campus].filter(Boolean).join(", ") } : null,
      p.department || p.degreeLevel ? { icon: "book" as const, text: [p.department, p.degreeLevel ? t.onboarding.degrees[p.degreeLevel] : null, p.academicYear ? t.onb.years[Math.min(p.academicYear, 5) - 1] : null].filter(Boolean).join(" · ") } : null,
      p.explainLanguage ? { icon: "message-circle" as const, text: `${t.onboarding.done.explain} ${languageName(p.explainLanguage)}` } : null,
      semester ? { icon: "calendar" as const, text: t.onb.week(semester.currentWeek, semester.weeks) } : null,
      courses.data?.length ? { icon: "layers" as const, text: t.onboarding.courses.added(courses.data.length) } : null,
    ].filter(Boolean) as { icon: React.ComponentProps<typeof Icon>["name"]; text: string }[];
    question = t.onb.doneTitle(firstName || t.onb.friend);
    body = (
      <View style={{ gap: space.lg }}>
        <Card style={{ paddingVertical: space.sm }}>
          {facts.map((fact, i) => (
            <View key={fact.text} style={{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 44, borderBottomWidth: i === facts.length - 1 ? 0 : 1, borderBottomColor: color.rule }}>
              <Icon name={fact.icon} size={17} color={color.inkMuted} />
              <T style={{ flex: 1 }}>{fact.text}</T>
            </View>
          ))}
        </Card>
        <View style={{ gap: space.md }}>
          <T variant="label">{t.onb.doneLine}</T>
          {t.onb.promises.map((promise) => (
            <View key={promise} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color.lamp, alignItems: "center", justifyContent: "center" }}><Icon name="check" size={15} color={color.onLamp} /></View>
              <T variant="strong" style={{ flex: 1 }}>{promise}</T>
            </View>
          ))}
        </View>
        {semester && usual && semester.startsOn === usual.date ? <T variant="small">{t.onb.semesterNote(usual.date)}</T> : null}
      </View>
    );
    footer = <Button label={t.onb.go} icon="arrow-right" loading={busy} onPress={finish} />;
  }

  const canSkip = !editing && step !== "done" && step !== "language" && step !== "university";

  return (
    <Screen footer={footer ?? undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 44, marginBottom: space.md }}>
        {index > 0 || editing ? <IconButton icon="arrow-left" label={t.common.back} onPress={() => (editing && (params.step || index === 0) ? router.back() : go(index - 1))} /> : <View style={{ width: 44 }} />}
        <View style={{ flex: 1 }}><ProgressBar value={Math.min(index, QUESTIONS) / QUESTIONS} tone={color.lamp} /></View>
        {canSkip ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => answer({})} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: space.sm }}>
            <T variant="small" tone={color.inkMuted} style={{ fontFamily: font.semibold }}>{t.onb.skip}</T>
          </Pressable>
        ) : <View style={{ width: 44 }} />}
      </View>

      {/* Juno asks; the answers are below, big enough to tap without aiming. */}
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: space.md, marginBottom: space.xl }}>
        <JunoFigure size={step === "done" ? 104 : 88} mood={mood} />
        <View style={{ flex: 1, backgroundColor: color.surface, borderWidth: 1, borderColor: color.rule, borderRadius: radius.lg, borderBottomLeftRadius: 6, padding: space.lg, marginBottom: space.md }}>
          <T variant="title" accessibilityRole="header" style={{ fontSize: 19, lineHeight: 26 }}>{question}</T>
        </View>
      </View>

      {error ? <View style={{ marginBottom: space.lg }}><Notice tone="error" text={error} /></View> : null}
      {body}
      <CourseSheet visible={courseSheet.open} course={courseSheet.course} onClose={() => setCourseSheet({ open: false, course: null })} />
    </Screen>
  );
}
