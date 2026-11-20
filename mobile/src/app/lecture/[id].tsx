import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shortDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { useDeleteLecture, useLecture } from "@/lib/queries";
import { color, font, radius, space } from "@/lib/theme";
import type { Lecture } from "@/lib/types";
import { Badge, Button, Card, Failed, Icon, IconButton, Loading, Notice, Section, T, useLayout } from "@/ui";
import { JunoSays } from "@/ui/Juno";
import { JunoChat } from "@/ui/JunoChat";
import { Confirm } from "@/ui/parts";

/*
 * One lecture, as Juno organised it. A recorded class reads in this order:
 * what the professor said, told through from start to end; what the professor
 * said matters for the exam; the whole class in English; and the lecture's own
 * key terms with their English meaning. Older lectures, and typed material,
 * have a summary and notes by topic instead. From here the student can be
 * quizzed on it or ask Juno about it.
 *
 * On a tablet the notes and Juno sit side by side, so a question can be asked
 * without leaving the page.
 */

function Notes({ lecture }: { lecture: Lecture }) {
  const { t, lang } = useLang();
  const notes = lecture.notes;
  if (!notes) return null;
  const guide = notes.guide ?? [];
  return (
    <>
      <Badge label={lecture.courseName} />
      <T variant="display" style={{ marginTop: space.sm }}>{notes.title || lecture.title}</T>
      <T variant="small" style={{ marginTop: 4 }}>{[notes.title && notes.title !== lecture.title ? lecture.title : null, shortDate(lecture.recordedAt, lang), t.lecture.cards(lecture.cards.length)].filter(Boolean).join(" · ")}</T>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.lg }}>
        {lecture.cards.length ? <Button small icon="zap" label={t.lecture.quiz} onPress={() => router.push({ pathname: "/quiz", params: { lectureId: lecture.id } })} /> : null}
      </View>

      {guide.length ? (
        <Section title={t.lecture.guide}>
          <Card style={{ gap: space.md }}>
            {guide.map((paragraph, i) => <T key={i} style={{ fontSize: 16, lineHeight: 25 }}>{paragraph}</T>)}
          </Card>
        </Section>
      ) : null}

      {!guide.length && notes.summary ? (
        <Section title={t.lecture.summary}>
          <Card><T style={{ fontSize: 16.5, lineHeight: 25 }}>{notes.summary}</T></Card>
        </Section>
      ) : null}

      {notes.flagged.length ? (
        <Section title={t.lecture.flagged}>
          <View style={{ gap: space.sm }}>
            {notes.flagged.map((flag, i) => (
              <View key={i} style={{ backgroundColor: color.lampSoft, borderRadius: radius.lg, padding: space.lg, gap: 6 }}>
                <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}>
                  <Icon name="flag" size={15} color={color.lampInk} />
                  {flag.at ? <T variant="small" tone={color.lampInk} style={{ fontFamily: font.semibold }}>{flag.at}</T> : null}
                </View>
                {flag.quote ? <T tone={color.ink} style={{ fontFamily: font.medium }}>"{flag.quote}"</T> : null}
                {flag.note ? <T variant="small" tone={color.inkSoft}>{flag.note}</T> : null}
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {!guide.length ? (
        <Section title={t.lecture.notes}>
          <View style={{ gap: space.md }}>
            {notes.sections.map((section, i) => (
              <Card key={i} style={{ gap: space.sm }}>
                <T variant="heading">{section.heading}</T>
                {section.points.map((point, j) => (
                  <View key={j} style={{ flexDirection: "row", gap: space.sm }}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color.inkFaint, marginTop: 10 }} />
                    <T style={{ flex: 1 }}>{point}</T>
                  </View>
                ))}
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      {notes.englishTranscript ? <Transcript text={notes.englishTranscript} /> : null}

      {notes.terms?.length ? (
        <Section title={t.lecture.terms}>
          <T variant="small" style={{ marginTop: -space.sm, marginBottom: space.md }}>{t.lecture.termsLine}</T>
          <View style={{ gap: space.sm }}>
            {notes.terms.map((term) => (
              <Card key={term.term} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.sm }}>
                  <T variant="heading">{term.term}</T>
                  {term.english && term.english.toLowerCase() !== term.term.toLowerCase() ? <Badge label={term.english} bg={color.mist} fg={color.mistInk} /> : null}
                </View>
                <T tone={color.inkSoft}>{term.meaning}</T>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      <View style={{ marginTop: space.xl }}><Notice text={t.lecture.generated} /></View>
    </>
  );
}

/** The whole class in English. Long, so it opens on its first paragraphs. */
function Transcript({ text }: { text: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const paragraphs = useMemo(() => paragraphsOf(text), [text]);
  const shown = open ? paragraphs : paragraphs.slice(0, 3);
  return (
    <Section title={t.lecture.transcript}>
      <Card style={{ gap: space.md }}>
        {shown.map((paragraph, i) => <T key={i} tone={color.inkSoft} style={{ fontSize: 15, lineHeight: 23 }}>{paragraph}</T>)}
        {paragraphs.length > 3 ? (
          <Button small variant="quiet" icon={open ? "chevron-up" : "chevron-down"} label={open ? t.lecture.hideTranscript : t.lecture.showTranscript} onPress={() => setOpen(!open)} style={{ alignSelf: "flex-start" }} />
        ) : null}
      </Card>
    </Section>
  );
}

/** Paragraphs as written; a transcript that came as one block is cut every few sentences so it can be read. */
function paragraphsOf(text: string): string[] {
  const given = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (given.length > 1) return given;
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 5) out.push(sentences.slice(i, i + 5).join("").trim());
  return out.filter(Boolean);
}

export default function LectureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, errorText } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const lecture = useLecture(id);
  const remove = useDeleteLecture();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/buddy"));
  const header = (
    <View style={{ paddingTop: insets.top, paddingHorizontal: space.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: insets.top + 52 }}>
      <IconButton icon="arrow-left" label={t.common.back} onPress={back} />
      {lecture.data ? <IconButton icon="trash-2" label={t.lecture.delete} tone={color.inkMuted} onPress={() => setConfirming(true)} /> : <View />}
    </View>
  );

  let body;
  if (lecture.isPending) body = <Loading />;
  else if (lecture.isError || !lecture.data) body = <Failed text={(lecture.error as { status?: number } | null)?.status === 404 ? t.buddy.failed : t.errors.Network} retryLabel={t.common.retry} onRetry={() => lecture.refetch()} />;
  else if (lecture.data.status === "processing") {
    body = (
      <View style={{ padding: space.xl, maxWidth: 640, width: "100%", alignSelf: "center" }}>
        <T variant="title" style={{ marginBottom: space.lg }}>{lecture.data.title}</T>
        <JunoSays mood="work">{t.lecture.processing}</JunoSays>
      </View>
    );
  } else {
    const data = lecture.data;
    const column = { paddingHorizontal: tablet ? space.xxl : space.xl, paddingBottom: space.huge, paddingTop: space.sm };
    body = tablet ? (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <ScrollView style={{ flex: 1.35 }} contentContainerStyle={column} showsVerticalScrollIndicator={false}>
          {error ? <Notice tone="error" text={error} /> : null}
          <Notes lecture={data} />
        </ScrollView>
        <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: color.rule, backgroundColor: color.surface }}>
          <JunoChat courseId={data.courseId} lectureId={data.id} embedded />
        </View>
      </View>
    ) : (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[column, { width: "100%", maxWidth: 640, alignSelf: "center", paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {error ? <Notice tone="error" text={error} /> : null}
        <Notes lecture={data} />
      </ScrollView>
    );
  }

  const ready = lecture.data?.status === "ready";

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      {header}
      {body}
      {ready && !tablet ? (
        <View style={{ position: "absolute", left: space.xl, right: space.xl, bottom: Math.max(insets.bottom, space.lg) }}>
          <Button icon="message-circle" label={t.lecture.ask} onPress={() => router.push({ pathname: "/juno", params: { lectureId: id, courseId: lecture.data!.courseId } })} style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }} />
        </View>
      ) : null}
      <Confirm
        visible={confirming}
        title={t.lecture.delete}
        text={t.lecture.deleteConfirm}
        confirmLabel={t.lecture.delete}
        busy={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => remove.mutateAsync(id).then(() => { setConfirming(false); back(); }).catch((err) => { setConfirming(false); setError(errorText(err)); })}
      />
    </View>
  );
}
