import { KeyboardAvoidingView, Platform, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLang } from "@/lib/i18n";
import { useLecture, useOverview } from "@/lib/queries";
import { color, space } from "@/lib/theme";
import { IconButton, T } from "@/ui";
import { Owl } from "@/ui/Owl";
import { OwlChat } from "@/ui/OwlChat";

/**
 * Owl, opened from anywhere. The screen it was opened from says what the
 * conversation is about: a course, one lecture, or careers and projects.
 */
export default function OwlScreen() {
  const params = useLocalSearchParams<{ courseId?: string; lectureId?: string; mode?: string; q?: string }>();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const overview = useOverview();
  const lecture = useLecture(params.lectureId ?? "");
  const mode = params.mode === "career" ? "career" : null;

  const course = params.courseId ? overview.data?.courses.find((c) => c.id === params.courseId) : null;
  const scope = params.lectureId && lecture.data ? t.owl.scopeLecture(lecture.data.topic || lecture.data.title) : course ? t.owl.scope(course.name) : mode ? t.tabs.career : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: color.ground }}>
      <View style={{ paddingTop: Platform.OS === "ios" ? space.md : insets.top + space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm, flexDirection: "row", alignItems: "center", gap: space.md, borderBottomWidth: 1, borderBottomColor: color.rule }}>
        <Owl size={40} mood="attentive" />
        <View style={{ flex: 1 }}>
          <T variant="heading">{t.owl.title}</T>
          {scope ? <T variant="small" numberOfLines={1}>{scope}</T> : null}
        </View>
        <IconButton icon="x" label={t.common.close} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      </View>
      <View style={{ flex: 1, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        <OwlChat courseId={params.courseId ?? null} lectureId={params.lectureId ?? null} mode={mode} initialQuestion={params.q} />
      </View>
    </KeyboardAvoidingView>
  );
}
