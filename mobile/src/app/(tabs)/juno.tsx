import { KeyboardAvoidingView, Platform, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLang } from "@/lib/i18n";
import { useLecture, useOverview } from "@/lib/queries";
import { color, space } from "@/lib/theme";
import { IconButton, T } from "@/ui";
import { Juno } from "@/ui/Juno";
import { JunoChat } from "@/ui/JunoChat";

/**
 * Juno, in the middle of the app: the one place to ask anything or to tell him
 * something ("my lab report is due Friday"). Opened from a course or a lecture
 * it already knows which one is meant, and says so under his name.
 */
export default function JunoScreen() {
  const params = useLocalSearchParams<{ courseId?: string; lectureId?: string; mode?: string; q?: string }>();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const overview = useOverview();
  const lecture = useLecture(params.lectureId ?? "");
  const mode = params.mode === "career" ? "career" : null;

  const course = params.courseId ? overview.data?.courses.find((c) => c.id === params.courseId) : null;
  const scope = params.lectureId && lecture.data ? t.juno.scopeLecture(lecture.data.topic || lecture.data.title) : course ? t.juno.scope(course.name) : null;
  const scoped = Boolean(params.courseId || params.lectureId || mode);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: color.ground }}>
      <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm, flexDirection: "row", alignItems: "center", gap: space.md, borderBottomWidth: 1, borderBottomColor: color.rule }}>
        <Juno size={40} mood="happy" />
        <View style={{ flex: 1 }}>
          <T variant="heading">{t.juno.title}</T>
          <T variant="small" numberOfLines={1}>{scope ?? t.companion.junoLine}</T>
        </View>
        {/* Leaves the course or lecture and goes back to talking about everything. */}
        {scoped ? <IconButton icon="x" label={t.common.close} onPress={() => router.replace("/juno")} /> : null}
      </View>
      <View style={{ flex: 1, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        <JunoChat key={`${params.courseId ?? ""}:${params.lectureId ?? ""}:${mode ?? ""}`} courseId={params.courseId ?? null} lectureId={params.lectureId ?? null} mode={mode} initialQuestion={params.q} embedded />
      </View>
    </KeyboardAvoidingView>
  );
}
