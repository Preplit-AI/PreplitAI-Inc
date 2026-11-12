import { useEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { fileSize } from "@/lib/format";
import { languageName, useLang } from "@/lib/i18n";
import { useAddLecture, useCourses, useLectures } from "@/lib/queries";
import { color, radius, space } from "@/lib/theme";
import { Button, Card, Chip, Chips, Field, Icon, Loading, Notice, Section, Segment, T, useLayout } from "@/ui";
import { CourseSheet } from "@/ui/forms";
import { Empty, Juno } from "@/ui/Juno";
import { LectureRow } from "@/ui/parts";

/*
 * Lecture Buddy: give Juno a lecture and get back notes, the key terms and a
 * quiz, filed under its course.
 *
 * What works today: slides or readings as a PDF or text file, and pasted text.
 * Recordings need the audio server, which is not switched on for this build,
 * so the screen says so instead of offering a button that would fail.
 */

/** The host accepts request bodies up to about 4.5 MB; a little under that leaves room for the rest of the form. */
const MAX_FILE_BYTES = 4 * 1024 * 1024;

type Picked = { name: string; size: number | null; part: Blob | { uri: string; name: string; type: string } };

export default function Buddy() {
  const params = useLocalSearchParams<{ courseId?: string }>();
  const { t, errorText } = useLang();
  const { profile } = useAuth();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const courses = useCourses();
  const lectures = useLectures();
  const add = useAddLecture();

  const [courseId, setCourseId] = useState<string | null>(params.courseId ?? null);
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [courseSheet, setCourseSheet] = useState(false);

  // Arriving from a course ("Add a lecture") chooses that course.
  useEffect(() => {
    if (params.courseId) setCourseId(params.courseId);
  }, [params.courseId]);
  // With one course there is nothing to choose.
  useEffect(() => {
    if (!courseId && courses.data?.length === 1) setCourseId(courses.data[0].id);
  }, [courseId, courses.data]);

  const pick = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "text/plain", "text/markdown"], copyToCacheDirectory: true, multiple: false });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!/\.(pdf|txt|md)$/i.test(asset.name)) return setError(t.errors.UnsupportedFile);
    if ((asset.size ?? 0) > MAX_FILE_BYTES) return setError(t.errors.FileTooLarge);
    // The browser hands over the file itself; the phone hands over where it is.
    const part = Platform.OS === "web" && asset.file ? asset.file : { uri: asset.uri, name: asset.name, type: asset.mimeType ?? "application/octet-stream" };
    setFile({ name: asset.name, size: asset.size ?? null, part });
    if (!title) setTitle(asset.name.replace(/\.(pdf|txt|md)$/i, "").replace(/[_-]+/g, " ").slice(0, 120));
  };

  const send = async () => {
    setError(null);
    if (!courseId) return setError(t.buddy.chooseCourse);
    if (mode === "file" ? !file : text.trim().split(/\s+/).length < 40) return setError(mode === "file" ? t.errors.NoInput : t.buddy.pasteHint);
    const form = new FormData();
    form.append("courseId", courseId);
    if (title.trim()) form.append("title", title.trim());
    if (mode === "file" && file) form.append("document", file.part as Blob, file.name);
    else form.append("text", text.trim());
    try {
      const res = await add.mutateAsync(form);
      setTitle("");
      setText("");
      setFile(null);
      router.push({ pathname: "/lecture/[id]", params: { id: res.lecture.id } });
    } catch (err) {
      setError(errorText(err));
    }
  };

  const explainIn = languageName(profile?.explainLanguage ?? null);

  const adder = (
    <Card style={{ gap: space.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <Juno size={44} mood="listen" />
        <View style={{ flex: 1 }}>
          <T variant="heading">{t.buddy.add}</T>
          {explainIn ? <T variant="small">{t.buddy.notesIn(explainIn)}</T> : null}
        </View>
      </View>

      {courses.isPending ? <Loading /> : courses.data?.length ? (
        <View>
          <T variant="strong" style={{ fontSize: 13.5, marginBottom: 8 }}>{t.buddy.chooseCourse}</T>
          <Chips>{courses.data.map((c) => <Chip key={c.id} label={c.name} selected={courseId === c.id} onPress={() => setCourseId(c.id)} />)}</Chips>
        </View>
      ) : (
        <View style={{ gap: space.md }}>
          <Notice text={t.buddy.needCourse} />
          <Button small variant="secondary" icon="plus" label={t.course.new} onPress={() => setCourseSheet(true)} style={{ alignSelf: "flex-start" }} />
        </View>
      )}

      {courses.data?.length ? (
        <>
          <Segment options={[{ value: "file", label: t.buddy.tabFile }, { value: "paste", label: t.buddy.tabPaste }]} value={mode} onChange={(next) => { setMode(next); setError(null); }} />
          {mode === "file" ? (
            <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: color.ruleStrong, borderRadius: radius.lg, padding: space.xl, alignItems: "center", gap: space.sm, backgroundColor: color.paper }}>
              <Icon name={file ? "file-text" : "upload-cloud"} size={28} color={color.slate} />
              <T variant="strong" style={{ textAlign: "center" }} numberOfLines={2}>{file ? file.name : t.buddy.file}</T>
              <T variant="small" style={{ textAlign: "center" }}>{file?.size ? fileSize(file.size) : t.buddy.fileLine}</T>
              <Button small variant="secondary" label={t.buddy.pick} onPress={pick} style={{ marginTop: space.sm }} />
            </View>
          ) : (
            <Field label={t.buddy.paste} hint={t.buddy.pasteLine} value={text} onChangeText={setText} multiline placeholder={t.buddy.pasteHint} maxLength={200000} style={{ minHeight: 160 }} />
          )}
          <Field label={t.buddy.lectureTitle} optional={t.common.optional} value={title} onChangeText={setTitle} placeholder={t.buddy.lectureTitleHint} maxLength={120} style={{ marginBottom: 0 }} />
          {error ? <Notice tone="error" text={error} /> : null}
          <Button icon="zap" label={t.buddy.send} loading={add.isPending} onPress={send} />
          <Notice icon="mic-off" text={t.errors.AudioNeedsWorker} />
          <T variant="small" tone={color.slateLight}>{t.buddy.consent}</T>
        </>
      ) : null}
    </Card>
  );

  const list = (
    <Section title={t.buddy.yours} style={tablet ? { marginTop: 0 } : undefined}>
      {lectures.isPending ? <Loading /> : lectures.data?.length ? (
        <Card style={{ paddingVertical: 0 }}>
          {lectures.data.map((lecture, i) => <LectureRow key={lecture.id} lecture={lecture} showCourse last={i === lectures.data.length - 1} />)}
        </Card>
      ) : (
        <Empty title={t.buddy.empty} line={t.buddy.emptyLine} mood="listen" />
      )}
    </Section>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.paper }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 120, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: tablet ? 1080 : 640, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
      <T variant="display">{t.buddy.title}</T>
      <T tone={color.slate} style={{ marginBottom: space.xl }}>{t.buddy.line}</T>
      {tablet ? (
        <View style={{ flexDirection: "row", gap: space.xxl, alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>{adder}</View>
          <View style={{ flex: 1 }}>{list}</View>
        </View>
      ) : (
        <>{adder}{list}</>
      )}
      <CourseSheet visible={courseSheet} onClose={() => setCourseSheet(false)} onSaved={(course) => setCourseId(course.id)} />
    </ScrollView>
  );
}
