import { useEffect, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth, type ProfileChanges } from "@/lib/auth";
import { COUNTRIES, INTEREST_IDEAS, SKILL_IDEAS, findUniversities, usualSemesterStart } from "@/lib/data";
import { courseTimes, isDateText } from "@/lib/format";
import { EXPLAIN_LANGUAGES, languageName, useLang } from "@/lib/i18n";
import { useCourses, useOverview, useSaveSemester } from "@/lib/queries";
import { color, courseTint, radius, space } from "@/lib/theme";
import type { Course, DegreeLevel, KoreanLevel, Profile, Stage } from "@/lib/types";
import { Button, Card, Chip, Chips, Field, Icon, IconButton, Notice, ProgressBar, Row, Screen, Segment, T } from "@/ui";
import { CourseSheet, DateField } from "@/ui/forms";
import { Owl, OwlSays } from "@/ui/Owl";

/*
 * Onboarding: Juno gets to know the student, one question at a time.
 *
 * Six short steps build the Student Intelligence Profile. Every step is saved
 * as it is finished, so a student who leaves comes back to where they were.
 * Only two things are asked for outright (a language and a university); the
 * rest can be skipped and filled in later from the profile screen.
 */

const STEPS = 6;

/** Chips to pick several from, plus a box to add one that is not offered. */
function TagPicker({ ideas, value, onChange, addLabel, max = 8 }: { ideas: string[]; value: string[]; onChange: (value: string[]) => void; addLabel: string; max?: number }) {
  const { t } = useLang();
  const [typed, setTyped] = useState("");
  const has = (tag: string) => value.some((v) => v.toLowerCase() === tag.toLowerCase());
  const toggle = (tag: string) => onChange(has(tag) ? value.filter((v) => v.toLowerCase() !== tag.toLowerCase()) : value.length < max ? [...value, tag] : value);
  const add = () => {
    const tag = typed.trim().slice(0, 40);
    if (tag && !has(tag) && value.length < max) onChange([...value, tag]);
    setTyped("");
  };
  const all = [...ideas, ...value.filter((v) => !ideas.some((i) => i.toLowerCase() === v.toLowerCase()))];
  return (
    <View style={{ gap: space.md }}>
      <Chips>{all.map((tag) => <Chip key={tag} label={tag} selected={has(tag)} onPress={() => toggle(tag)} />)}</Chips>
      <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Field label={addLabel} value={typed} onChangeText={setTyped} maxLength={40} returnKeyType="done" onSubmitEditing={add} style={{ marginBottom: 0 }} />
        </View>
        <View style={{ marginTop: 26 }}>
          <Button small variant="secondary" label={t.common.add} onPress={add} disabled={!typed.trim()} />
        </View>
      </View>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8, marginTop: space.lg }}>{children}</T>;
}

export default function Onboarding() {
  const { t, lang, setLang, errorText } = useLang();
  const { user, profile, saveProfile } = useAuth();
  const params = useLocalSearchParams<{ step?: string }>();
  const courses = useCourses();
  const overview = useOverview();
  const saveSemester = useSaveSemester();
  const p = profile as Profile;
  // Opened again later from the profile screen, to change an answer.
  const [editing] = useState(p.onboarded);

  const [step, setStep] = useState(() => {
    const asked = Number(params.step);
    if (Number.isInteger(asked) && asked >= 0 && asked < STEPS) return asked;
    return editing ? 0 : Math.min(p.onboardingStep, STEPS);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);

  // The answers so far, starting from what is already saved.
  const deviceLanguage = (() => {
    try {
      const code = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];
      return EXPLAIN_LANGUAGES.some((l) => l.code === code) ? code : "en";
    } catch {
      return "en";
    }
  })();
  const [explainLanguage, setExplainLanguage] = useState(p.explainLanguage ?? deviceLanguage);
  const [moreLanguages, setMoreLanguages] = useState(false);
  const [koreanLevel, setKoreanLevel] = useState<KoreanLevel | null>(p.koreanLevel);
  const [country, setCountry] = useState<string>(p.country ?? (p.university ? "OTHER" : "KR"));
  const [university, setUniversity] = useState(p.university ?? "");
  const [universityChosen, setUniversityChosen] = useState(Boolean(p.university));
  const [campus, setCampus] = useState(p.campus ?? "");
  const [department, setDepartment] = useState(p.department ?? "");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel | null>(p.degreeLevel);
  const [academicYear, setAcademicYear] = useState<number | null>(p.academicYear);
  const [stage, setStage] = useState<Stage | null>(p.stage);
  const [startsOn, setStartsOn] = useState("");
  const [weeks, setWeeks] = useState(16);
  const [semesterTouched, setSemesterTouched] = useState(false);
  const [careerInterests, setCareerInterests] = useState<string[]>(p.careerInterests);
  const [targetRole, setTargetRole] = useState(p.targetRole ?? "");
  const [skillsWanted, setSkillsWanted] = useState<string[]>(p.skillsWanted);
  const [courseSheet, setCourseSheet] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });

  // The semester already saved, if any, shows in its field until the student changes it.
  const saved = overview.data?.semester ?? null;
  const semesterDate = semesterTouched ? startsOn : saved?.startsOn ?? startsOn;
  const semesterWeeks = semesterTouched ? weeks : saved?.weeks ?? weeks;
  const usual = usualSemesterStart(country === "OTHER" ? null : country);

  const go = (to: number) => {
    setError(null);
    setShowWhy(false);
    setStep(to);
  };

  /** Saves this step's answers and moves on. */
  const advance = async (fields: ProfileChanges, before?: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      if (before) await before();
      await saveProfile({ ...fields, onboardingStep: Math.max(p.onboardingStep, step + 1) });
      go(step + 1);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  // Home opens only once the profile says onboarding is finished (the root layout
  // guards it), so leaving waits for that to be true.
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (leaving && p.onboarded) router.replace("/");
  }, [leaving, p.onboarded]);

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!p.onboarded) await saveProfile({ onboarded: true });
      setLeaving(true);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const suggestions = universityChosen ? [] : findUniversities(country === "OTHER" ? null : country, university);
  const typedUniversity = university.trim();

  type Step = { title: string; line: string; why: string; body: ReactNode; next: () => void; ready?: boolean; mood?: "attentive" | "attentive" | "attentive" | "next" | "noticing" };

  const steps: Step[] = [
    {
      title: t.onboarding.language.title,
      line: t.onboarding.language.line,
      why: t.onboarding.language.why,
      mood: "attentive",
      next: () => advance({ explainLanguage, uiLanguage: lang, koreanLevel, languages: [...new Set([explainLanguage, lang])] }),
      body: (
        <>
          <Chips>
            {(moreLanguages ? EXPLAIN_LANGUAGES : EXPLAIN_LANGUAGES.filter((l, i) => i < 8 || l.code === explainLanguage)).map((l) => (
              <Chip key={l.code} label={l.name} selected={explainLanguage === l.code} onPress={() => setExplainLanguage(l.code)} />
            ))}
            {moreLanguages ? null : <Chip label={t.onboarding.language.more} icon="plus" onPress={() => setMoreLanguages(true)} />}
          </Chips>
          <Label>{t.onboarding.language.korean}</Label>
          <Chips>
            {(["none", "beginner", "intermediate", "advanced", "fluent"] as const).map((level) => (
              <Chip key={level} label={t.onboarding.koreanLevels[level]} selected={koreanLevel === level} onPress={() => setKoreanLevel(koreanLevel === level ? null : level)} />
            ))}
          </Chips>
          <T variant="small" style={{ marginTop: 8 }}>{t.onboarding.language.koreanWhy}</T>
          <Label>{t.onboarding.language.app}</Label>
          <Segment options={[{ value: "en", label: "English" }, { value: "ko", label: "한국어" }]} value={lang} onChange={setLang} />
        </>
      ),
    },
    {
      title: t.onboarding.university.title,
      line: t.onboarding.university.line,
      why: t.onboarding.university.why,
      ready: typedUniversity.length >= 2,
      next: () => {
        let timezone: string | null = null;
        try {
          timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
        } catch {
          timezone = null;
        }
        return advance({ country: country === "OTHER" ? null : country, university: typedUniversity, campus: campus.trim() || null, timezone });
      },
      body: (
        <>
          <Label>{t.onboarding.university.country}</Label>
          <Chips>
            {COUNTRIES.map((code) => (
              <Chip key={code} label={t.onboarding.university.countries[code]} selected={country === code} onPress={() => setCountry(code)} />
            ))}
          </Chips>
          <View style={{ height: space.lg }} />
          <Field
            label={t.onboarding.university.search}
            value={university}
            onChangeText={(text) => { setUniversity(text); setUniversityChosen(false); }}
            placeholder={t.onboarding.university.searchHint}
            maxLength={120}
            autoCorrect={false}
            style={{ marginBottom: 0 }}
          />
          {suggestions.length || (typedUniversity.length >= 2 && !universityChosen) ? (
            <Card style={{ paddingVertical: 0, marginTop: -space.sm, marginBottom: space.lg }}>
              {suggestions.map((u) => (
                <Row key={u.name} icon="map-pin" title={u.name} sub={u.local} onPress={() => { setUniversity(u.name); setUniversityChosen(true); }} right={<Icon name="plus" size={18} color={color.inkFaint} />} />
              ))}
              <Row icon="edit-3" title={t.onboarding.university.useTyped(typedUniversity)} onPress={() => setUniversityChosen(true)} right={<Icon name="check" size={18} color={color.inkFaint} />} last />
            </Card>
          ) : null}
          <Field label={t.onboarding.university.campus} optional={t.common.optional} value={campus} onChangeText={setCampus} placeholder={t.onboarding.university.campusHint} maxLength={80} />
        </>
      ),
    },
    {
      title: t.onboarding.program.title,
      line: t.onboarding.program.line,
      why: t.onboarding.program.why,
      next: () => advance({ department: department.trim() || null, degreeLevel, academicYear, stage }),
      body: (
        <>
          <Field label={t.onboarding.program.department} value={department} onChangeText={setDepartment} placeholder={t.onboarding.program.departmentHint} maxLength={120} />
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.onboarding.program.degree}</T>
          <Chips>
            {(["bachelor", "master", "doctorate", "exchange", "language", "other"] as const).map((d) => (
              <Chip key={d} label={t.onboarding.degrees[d]} selected={degreeLevel === d} onPress={() => setDegreeLevel(degreeLevel === d ? null : d)} />
            ))}
          </Chips>
          <Label>{t.onboarding.program.year}</Label>
          <Chips>
            {[1, 2, 3, 4, 5, 6].map((y) => <Chip key={y} label={String(y)} selected={academicYear === y} onPress={() => setAcademicYear(academicYear === y ? null : y)} />)}
          </Chips>
          <Label>{t.onboarding.program.stage}</Label>
          <Chips>
            {(["preparing", "new", "continuing", "graduating"] as const).map((s) => (
              <Chip key={s} label={t.onboarding.stages[s]} selected={stage === s} onPress={() => setStage(stage === s ? null : s)} />
            ))}
          </Chips>
        </>
      ),
    },
    {
      title: t.onboarding.semester.title,
      line: t.onboarding.semester.line,
      why: t.onboarding.semester.why,
      next: () => {
        if (!semesterDate) return advance({});
        if (!isDateText(semesterDate)) return setError(t.errors.InvalidDate);
        return advance({}, () => saveSemester.mutateAsync({ startsOn: semesterDate, weeks: semesterWeeks }));
      },
      body: (
        <>
          <DateField label={t.onboarding.semester.starts} value={semesterDate} onChange={(value) => { setSemesterTouched(true); setStartsOn(value); setWeeks(semesterWeeks); }} />
          {usual ? (
            <View style={{ marginTop: -space.sm, marginBottom: space.lg, gap: 8 }}>
              <T variant="small">{t.onboarding.semester.suggestion(t.onboarding.semester[usual.term])}</T>
              <Chips><Chip label={usual.date} icon="calendar" selected={semesterDate === usual.date} onPress={() => { setSemesterTouched(true); setStartsOn(usual.date); setWeeks(semesterWeeks); }} /></Chips>
            </View>
          ) : null}
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.onboarding.semester.weeks}</T>
          <Chips>
            {[15, 16, 18].map((w) => <Chip key={w} label={t.onboarding.semester.weeksValue(w)} selected={semesterWeeks === w} onPress={() => { setSemesterTouched(true); setStartsOn(semesterDate); setWeeks(w); }} />)}
          </Chips>
        </>
      ),
    },
    {
      title: t.onboarding.courses.title,
      line: t.onboarding.courses.line,
      why: t.onboarding.courses.why,
      mood: "attentive",
      next: () => advance({}),
      body: (
        <>
          {courses.data?.length ? (
            <Card style={{ paddingVertical: 0, marginBottom: space.lg }}>
              {courses.data.map((course, i) => (
                <Row
                  key={course.id}
                  mark={<View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: courseTint(i).bg, alignItems: "center", justifyContent: "center" }}><Icon name="book-open" size={17} color={courseTint(i).fg} /></View>}
                  title={course.name}
                  sub={courseTimes(course, t.days.short) || null}
                  onPress={() => setCourseSheet({ open: true, course })}
                  right={<Icon name="edit-2" size={16} color={color.inkFaint} />}
                  last={i === courses.data.length - 1}
                />
              ))}
            </Card>
          ) : null}
          <Button variant="secondary" icon="plus" label={courses.data?.length ? t.onboarding.courses.addAnother : t.onboarding.courses.addFirst} onPress={() => setCourseSheet({ open: true, course: null })} />
          <View style={{ height: space.lg }} />
          <Notice text={courses.data?.length ? t.onboarding.courses.notConnected : `${t.onboarding.courses.none} ${t.onboarding.courses.notConnected}`} />
        </>
      ),
    },
    {
      title: t.onboarding.goals.title,
      line: t.onboarding.goals.line,
      why: t.onboarding.goals.why,
      mood: "noticing",
      next: () => advance({ careerInterests, targetRole: targetRole.trim() || null, skillsWanted }),
      body: (
        <>
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.onboarding.goals.interests}</T>
          <TagPicker ideas={INTEREST_IDEAS[lang]} value={careerInterests} onChange={setCareerInterests} addLabel={t.onboarding.goals.custom} />
          <View style={{ height: space.xl }} />
          <Field label={t.onboarding.goals.role} optional={t.common.optional} value={targetRole} onChangeText={setTargetRole} placeholder={t.onboarding.goals.roleHint} maxLength={120} />
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.onboarding.goals.skills}</T>
          <TagPicker ideas={SKILL_IDEAS[lang]} value={skillsWanted} onChange={setSkillsWanted} addLabel={t.onboarding.goals.custom} max={12} />
        </>
      ),
    },
  ];

  // ── The last screen: what Juno now knows ───────────────────────────────────
  if (step >= STEPS) {
    const studying = [p.department, p.degreeLevel ? t.onboarding.degrees[p.degreeLevel] : null, p.academicYear ? `${p.academicYear}` : null].filter(Boolean).join(" · ");
    const goal = [p.targetRole, ...p.careerInterests].filter(Boolean).join(", ");
    return (
      <Screen back={() => go(STEPS - 1)} footer={<Button label={t.onboarding.done.open} icon="arrow-right" loading={busy} onPress={finish} />}>
        <View style={{ alignItems: "center", marginTop: space.lg, marginBottom: space.xl, gap: space.sm }}>
          <Owl size={88} mood="attentive" />
          <T variant="display" style={{ textAlign: "center", marginTop: space.sm }}>{t.onboarding.done.title(user?.name ?? "")}</T>
          <T tone={color.inkMuted} style={{ textAlign: "center" }}>{t.onboarding.done.line}</T>
        </View>
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="map-pin" title={p.university ?? t.onboarding.done.notSaid} sub={p.campus} onPress={() => go(1)} right={<Icon name="edit-2" size={16} color={color.inkFaint} />} />
          <Row icon="book" title={t.onboarding.done.studying} sub={studying || t.onboarding.done.notSaid} onPress={() => go(2)} right={<Icon name="edit-2" size={16} color={color.inkFaint} />} />
          <Row icon="message-circle" title={t.onboarding.done.explain} sub={languageName(p.explainLanguage) ?? t.onboarding.done.notSaid} onPress={() => go(0)} right={<Icon name="edit-2" size={16} color={color.inkFaint} />} />
          <Row icon="layers" title={t.onboarding.done.courses} sub={courses.data?.length ? courses.data.map((c) => c.name).join(", ") : t.onboarding.done.notSaid} onPress={() => go(4)} right={<Icon name="edit-2" size={16} color={color.inkFaint} />} />
          <Row icon="target" title={t.onboarding.done.goal} sub={goal || t.onboarding.done.notSaid} onPress={() => go(5)} right={<Icon name="edit-2" size={16} color={color.inkFaint} />} last />
        </Card>
        {error ? <View style={{ marginTop: space.lg }}><Notice tone="error" text={error} /></View> : null}
      </Screen>
    );
  }

  const current = steps[step];
  const ready = current.ready ?? true;

  return (
    <Screen
      footer={
        <View style={{ gap: space.sm }}>
          {error ? <Notice tone="error" text={error} /> : null}
          <Button label={t.common.continue} loading={busy} disabled={!ready} onPress={current.next} />
        </View>
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 48 }}>
        {step > 0 ? <IconButton icon="arrow-left" label={t.common.back} onPress={() => go(step - 1)} /> : editing ? <IconButton icon="x" label={t.common.close} onPress={() => router.replace("/")} /> : <View style={{ width: 4 }} />}
        <View style={{ flex: 1 }}><ProgressBar value={(step + 1) / STEPS} /></View>
        <T variant="small" style={{ minWidth: 76, textAlign: "right" }}>{t.onboarding.step(step + 1, STEPS)}</T>
      </View>

      <OwlSays mood={current.mood ?? "attentive"} style={{ marginTop: space.xl, marginBottom: space.xl }}>
        <T variant="title">{current.title}</T>
        <T tone={color.inkMuted}>{current.line}</T>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showWhy }} onPress={() => setShowWhy(!showWhy)} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <Icon name={showWhy ? "chevron-up" : "info"} size={14} color={color.inkMuted} />
          <T variant="small" style={{ textDecorationLine: "underline" }}>{t.onboarding.why}</T>
        </Pressable>
        {showWhy ? <View style={{ backgroundColor: color.sunken, borderRadius: radius.md, padding: space.md }}><T variant="small" tone={color.inkSoft}>{current.why}</T></View> : null}
      </OwlSays>

      {current.body}

      <CourseSheet visible={courseSheet.open} course={courseSheet.course} onClose={() => setCourseSheet({ open: false, course: null })} />
    </Screen>
  );
}
