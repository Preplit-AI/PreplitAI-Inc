import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useProjects, useSaveProject } from "@/lib/queries";
import { color, space } from "@/lib/theme";
import type { Project, Skill } from "@/lib/types";
import { Badge, Button, Card, Chip, Chips, Failed, Field, Icon, Loading, Notice, ProgressBar, Row, Section, Sheet, T, useLayout } from "@/ui";
import { Empty, JunoSays } from "@/ui/Juno";

/*
 * Career: where the student is heading, the skills they have evidence for, and
 * the projects that create that evidence.
 *
 * A skill is never shown as a bare claim. It is "demonstrated" only by a
 * finished project with a link or a write-up, "developing" while a project that
 * uses it is under way, and otherwise something the student wants to build.
 * The server works that out (server/routes/projects.js); this screen shows it.
 */

const EVIDENCE = {
  demonstrated: { bg: color.sage, fg: color.green, icon: "award" },
  developing: { bg: color.sky, fg: color.blue, icon: "tool" },
  wanted: { bg: color.bone, fg: color.inkSoft, icon: "target" },
} as const;

function NewProjectSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, errorText } = useLang();
  const save = useSaveProject();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skill, setSkill] = useState("");
  const [steps, setSteps] = useState(["", "", ""]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle("");
    setSummary("");
    setSkills([]);
    setSkill("");
    setSteps(["", "", ""]);
    setError(null);
  }, [visible]);

  const addSkill = () => {
    const name = skill.trim().slice(0, 40);
    if (name && !skills.some((s) => s.toLowerCase() === name.toLowerCase()) && skills.length < 10) setSkills([...skills, name]);
    setSkill("");
  };

  const submit = async () => {
    setError(null);
    if (!title.trim()) return setError(t.errors.InvalidField);
    try {
      const res = await save.mutateAsync({ title: title.trim(), summary: summary.trim() || null, skills, milestones: steps.map((s) => s.trim()).filter(Boolean) });
      onClose();
      router.push({ pathname: "/project/[id]", params: { id: res.project.id } });
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t.career.newProject} footer={<Button label={t.common.save} loading={save.isPending} onPress={submit} />}>
      <Field label={t.project.title} value={title} onChangeText={setTitle} placeholder={t.project.titleHint} maxLength={120} autoFocus />
      <Field label={t.project.summary} optional={t.common.optional} value={summary} onChangeText={setSummary} placeholder={t.project.summaryHint} maxLength={800} multiline style={{ minHeight: 90 }} />
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.project.skills}</T>
      {skills.length ? <Chips style={{ marginBottom: space.sm }}>{skills.map((s) => <Chip key={s} label={s} selected icon="x" onPress={() => setSkills(skills.filter((x) => x !== s))} />)}</Chips> : null}
      <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}><Field label={t.project.skillHint} value={skill} onChangeText={setSkill} maxLength={40} onSubmitEditing={addSkill} returnKeyType="done" /></View>
        <View style={{ marginTop: 26 }}><Button small variant="secondary" label={t.common.add} onPress={addSkill} disabled={!skill.trim()} /></View>
      </View>
      <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.project.firstSteps}</T>
      {steps.map((step, i) => (
        <Field key={i} label={`${i + 1}`} optional={t.common.optional} value={step} onChangeText={(text) => setSteps(steps.map((s, j) => (j === i ? text : s)))} placeholder={i === 0 ? t.project.stepHint : undefined} maxLength={160} />
      ))}
      {error ? <Notice tone="error" text={error} /> : null}
    </Sheet>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { t } = useLang();
  const done = project.milestones.filter((m) => m.done).length;
  const total = project.milestones.length;
  const look = project.status === "done" ? EVIDENCE.demonstrated : project.status === "active" ? EVIDENCE.developing : EVIDENCE.wanted;
  return (
    <Card onPress={() => router.push({ pathname: "/project/[id]", params: { id: project.id } })} style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="heading" numberOfLines={2}>{project.title}</T>
          {project.summary ? <T variant="small" numberOfLines={2}>{project.summary}</T> : null}
        </View>
        <Badge label={t.career.status[project.status]} bg={look.bg} fg={look.fg} />
      </View>
      {total ? (
        <View style={{ gap: 6 }}>
          <ProgressBar value={done / total} tone={project.status === "done" ? color.green : color.ink} />
          <T variant="small">{t.career.milestones(done, total)}</T>
        </View>
      ) : null}
      {project.skills.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{project.skills.map((s) => <Badge key={s} label={s} />)}</View> : null}
    </Card>
  );
}

function SkillRow({ skill, last }: { skill: Skill; last: boolean }) {
  const { t } = useLang();
  const look = EVIDENCE[skill.evidence];
  return (
    <Row
      mark={<View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: look.bg, alignItems: "center", justifyContent: "center" }}><Icon name={look.icon} size={17} color={look.fg} /></View>}
      title={skill.name}
      sub={skill.projects.length ? `${t.career.evidenceLine[skill.evidence]}: ${skill.projects.map((p) => p.title).join(", ")}` : t.career.evidenceLine[skill.evidence]}
      right={<Badge label={t.career.evidence[skill.evidence]} bg={look.bg} fg={look.fg} />}
      onPress={skill.projects.length ? () => router.push({ pathname: "/project/[id]", params: { id: skill.projects[0].id } }) : undefined}
      last={last}
    />
  );
}

export default function Career() {
  const { t } = useLang();
  const { profile } = useAuth();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const projects = useProjects();
  const [sheet, setSheet] = useState(false);

  if (projects.isPending) return <Loading />;
  if (projects.isError || !projects.data) return <Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => projects.refetch()} />;
  const data = projects.data;
  const goal = [profile?.targetRole, ...(profile?.careerInterests ?? [])].filter(Boolean) as string[];
  const editGoals = () => router.push({ pathname: "/onboarding", params: { step: "5" } });
  const askIdea = () => router.push({ pathname: "/juno", params: { mode: "career", q: t.career.ideaQuestion } });

  const goalBlock = (
    <Section title={t.career.goal} action={goal.length ? t.common.edit : undefined} onAction={editGoals} style={{ marginTop: space.xl }}>
      {goal.length ? (
        <Card style={{ gap: space.md }}>
          {profile?.targetRole ? <T variant="title">{profile.targetRole}</T> : null}
          {profile?.careerInterests.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{profile.careerInterests.map((i) => <Badge key={i} label={i} bg={color.goldTint} fg={color.honey} />)}</View> : null}
        </Card>
      ) : (
        <JunoSays mood="idle" action={<Button small icon="target" label={t.career.setGoal} onPress={editGoals} style={{ alignSelf: "flex-start" }} />}>{t.career.noGoal}</JunoSays>
      )}
    </Section>
  );

  const skillsBlock = (
    <Section title={t.career.skills}>
      <T variant="small" style={{ marginTop: -space.sm, marginBottom: space.md }}>{t.career.skillsLine}</T>
      {data.skills.length ? (
        <Card style={{ paddingVertical: 0 }}>{data.skills.map((skill, i) => <SkillRow key={skill.name} skill={skill} last={i === data.skills.length - 1} />)}</Card>
      ) : (
        <Card style={{ gap: space.md }}>
          <T variant="strong">{t.career.noSkills}</T>
          <T variant="small">{t.career.noSkillsLine}</T>
          <Button small variant="secondary" icon="plus" label={t.onboarding.goals.skills} onPress={editGoals} style={{ alignSelf: "flex-start" }} />
        </Card>
      )}
    </Section>
  );

  const projectsBlock = (
    <Section title={t.career.projects} action={t.career.newProject} onAction={() => setSheet(true)}>
      <View style={{ gap: space.md }}>
        {data.projects.length ? data.projects.map((project) => <ProjectCard key={project.id} project={project} />) : <Empty title={t.career.noProjects} line={t.career.noProjectsLine} mood="found" action={<Button small icon="plus" label={t.career.newProject} onPress={() => setSheet(true)} />} />}
        <Button variant="secondary" icon="message-circle" label={t.career.askIdea} onPress={askIdea} />
      </View>
    </Section>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.paper }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 120, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: tablet ? 1080 : 640, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
      <T variant="display">{t.career.title}</T>
      <T tone={color.slate}>{t.career.line}</T>
      {tablet ? (
        <View style={{ flexDirection: "row", gap: space.xxl, alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>{goalBlock}{skillsBlock}</View>
          <View style={{ flex: 1 }}>{projectsBlock}</View>
        </View>
      ) : (
        <>{goalBlock}{projectsBlock}{skillsBlock}</>
      )}
      <NewProjectSheet visible={sheet} onClose={() => setSheet(false)} />
    </ScrollView>
  );
}
