import { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useLang } from "@/lib/i18n";
import { useDeleteProject, useMilestone, useProjects, useSaveProject } from "@/lib/queries";
import { color, space } from "@/lib/theme";
import { Badge, Button, Card, Failed, Field, Icon, IconButton, Loading, Notice, ProgressBar, Screen, Section, Sheet, T } from "@/ui";
import { Confirm } from "@/ui/parts";

/*
 * One project: what it is, its steps, and where it stands. It moves from an
 * idea, to in progress, to finished, and finishing asks for the evidence (a
 * link, or what was made and learned) that lets its skills count as demonstrated.
 * The student is the builder; this page only keeps track.
 */

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, errorText } = useLang();
  const projects = useProjects();
  const save = useSaveProject();
  const milestone = useMilestone(id);
  const remove = useDeleteProject();
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [link, setLink] = useState("");
  const [outcome, setOutcome] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (projects.isPending) return <Screen back><Loading /></Screen>;
  const project = projects.data?.projects.find((p) => p.id === id);
  if (projects.isError || !project) return <Screen back><Failed text={projects.isError ? t.errors.Network : t.errors.default} retryLabel={t.common.retry} onRetry={() => projects.refetch()} /></Screen>;

  const done = project.milestones.filter((m) => m.done).length;
  const total = project.milestones.length;
  const fail = (err: unknown) => setError(errorText(err));
  const setStatus = (status: "idea" | "active" | "done", extra: { link?: string | null; outcome?: string | null } = {}) => {
    setError(null);
    return save.mutateAsync({ id: project.id, status, ...extra });
  };

  const addStep = () => {
    const title = step.trim();
    if (!title) return;
    setStep("");
    milestone.mutateAsync({ add: title }).catch(fail);
  };

  const finish = async () => {
    try {
      await setStatus("done", { link: link.trim() || null, outcome: outcome.trim() || null });
      setFinishing(false);
    } catch (err) {
      fail(err);
    }
  };

  const tone = project.status === "done" ? { bg: color.sage, fg: color.green } : project.status === "active" ? { bg: color.sky, fg: color.blue } : { bg: color.bone, fg: color.inkSoft };

  return (
    <Screen
      back
      right={<IconButton icon="trash-2" label={t.project.delete} tone={color.slate} onPress={() => setConfirming(true)} />}
      footer={
        project.status === "idea" ? <Button icon="play" label={t.project.start} loading={save.isPending} onPress={() => setStatus("active").catch(fail)} />
        : project.status === "active" ? <Button icon="award" label={t.project.finish} onPress={() => { setLink(project.link ?? ""); setOutcome(project.outcome ?? ""); setError(null); setFinishing(true); }} />
        : <Button variant="secondary" icon="rotate-ccw" label={t.project.reopen} loading={save.isPending} onPress={() => setStatus("active").catch(fail)} />
      }
    >
      <Badge label={t.career.status[project.status]} bg={tone.bg} fg={tone.fg} />
      <T variant="display" style={{ marginTop: space.sm }}>{project.title}</T>
      {project.summary ? <T tone={color.inkSoft} style={{ marginTop: space.sm }}>{project.summary}</T> : null}
      {project.skills.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.md }}>{project.skills.map((s) => <Badge key={s} label={s} bg={tone.bg} fg={tone.fg} />)}</View> : null}
      {error && !finishing ? <View style={{ marginTop: space.md }}><Notice tone="error" text={error} /></View> : null}

      {project.status === "done" ? (
        <Section title={t.project.evidenceTitle}>
          <Card style={{ gap: space.md }}>
            {project.link ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(project.link!)} style={{ flexDirection: "row", alignItems: "center", gap: space.sm, minHeight: 44 }}>
                <Icon name="external-link" size={16} color={color.blue} />
                <T tone={color.blue} numberOfLines={1} style={{ flex: 1, textDecorationLine: "underline" }}>{project.link}</T>
              </Pressable>
            ) : null}
            {project.outcome ? <T>{project.outcome}</T> : null}
          </Card>
        </Section>
      ) : null}

      <Section title={t.project.steps}>
        {total ? (
          <View style={{ gap: 6, marginBottom: space.md }}>
            <ProgressBar value={done / total} tone={project.status === "done" ? color.green : color.ink} />
            <T variant="small">{t.career.milestones(done, total)}</T>
          </View>
        ) : null}
        {total ? (
          <Card style={{ paddingVertical: 0 }}>
            {project.milestones.map((m, i) => (
              <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 56, borderBottomWidth: i === total - 1 ? 0 : 1, borderBottomColor: color.rule }}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: m.done }}
                  accessibilityLabel={m.title}
                  hitSlop={10}
                  onPress={() => milestone.mutateAsync({ id: m.id, done: !m.done }).catch(fail)}
                  style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 1.5, borderColor: m.done ? color.ink : color.ruleStrong, backgroundColor: m.done ? color.ink : color.white, alignItems: "center", justifyContent: "center" }}
                >
                  {m.done ? <Icon name="check" size={15} color={color.white} /> : null}
                </Pressable>
                <T style={[{ flex: 1 }, m.done ? { color: color.slateLight, textDecorationLine: "line-through" } : null]}>{m.title}</T>
                <IconButton icon="x" label={t.common.delete} tone={color.slateLight} onPress={() => milestone.mutateAsync({ remove: m.id }).catch(fail)} />
              </View>
            ))}
          </Card>
        ) : null}
        <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start", marginTop: space.md }}>
          <View style={{ flex: 1 }}><Field label={t.project.addStep} value={step} onChangeText={setStep} placeholder={t.project.stepHint} maxLength={160} returnKeyType="done" onSubmitEditing={addStep} style={{ marginBottom: 0 }} /></View>
          <View style={{ marginTop: 26 }}><Button small variant="secondary" label={t.common.add} onPress={addStep} disabled={!step.trim()} loading={milestone.isPending && Boolean(step)} /></View>
        </View>
      </Section>

      <View style={{ marginTop: space.lg }}><Notice icon="user-check" text={t.project.yours} /></View>

      <Sheet visible={finishing} onClose={() => setFinishing(false)} title={t.project.evidenceTitle} footer={<Button icon="award" label={t.project.finish} loading={save.isPending} onPress={finish} />}>
        <T tone={color.inkSoft} style={{ marginBottom: space.lg }}>{t.project.evidenceLine}</T>
        <Field label={t.project.link} optional={t.common.optional} value={link} onChangeText={setLink} placeholder={t.project.linkHint} autoCapitalize="none" autoCorrect={false} keyboardType="url" maxLength={300} />
        <Field label={t.project.outcome} optional={t.common.optional} value={outcome} onChangeText={setOutcome} placeholder={t.project.outcomeHint} multiline maxLength={800} />
        {error ? <Notice tone="error" text={error} /> : null}
      </Sheet>
      <Confirm
        visible={confirming}
        title={t.project.delete}
        text={t.project.deleteConfirm}
        confirmLabel={t.project.delete}
        busy={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => remove.mutateAsync(project.id).then(() => { setConfirming(false); router.replace("/career"); }).catch((err) => { setConfirming(false); fail(err); })}
      />
    </Screen>
  );
}
