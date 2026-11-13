import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { shortDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { color, space } from "@/lib/theme";
import type { LectureSummary } from "@/lib/types";
import { Badge, Button, Icon, Row, Sheet, T } from "./index";

/* Small parts more than one screen uses. */

/** "Are you sure?" for something that cannot be undone. The system alert does not exist on the web, so this is the app's own. */
export function Confirm({ visible, title, text, confirmLabel, busy, onConfirm, onClose }: { visible: boolean; title: string; text: string; confirmLabel: string; busy?: boolean; onConfirm: () => void; onClose: () => void }) {
  const { t } = useLang();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      footer={
        <View style={{ gap: space.sm }}>
          <Button variant="danger" icon="trash-2" label={confirmLabel} loading={busy} onPress={onConfirm} />
          <Button variant="secondary" label={t.common.cancel} onPress={onClose} />
        </View>
      }
    >
      <T tone={color.inkSoft}>{text}</T>
    </Sheet>
  );
}

/** One lecture in a list: what it was made from, its topic, and whether Juno has finished with it. */
export function LectureRow({ lecture, showCourse, last }: { lecture: LectureSummary; showCourse?: boolean; last?: boolean }) {
  const { t, lang } = useLang();
  const processing = lecture.status === "processing";
  const from = lecture.source === "audio" ? t.buddy.fromAudio : lecture.material === "pdf" ? t.buddy.fromPdf : t.buddy.fromText;
  const icon = lecture.source === "audio" ? "mic" : lecture.material === "pdf" ? "file" : "file-text";
  const when = shortDate(lecture.recordedAt, lang);
  return (
    <Row
      icon={icon}
      title={lecture.topic || lecture.title}
      sub={[showCourse ? lecture.courseName : null, lecture.topic && lecture.topic !== lecture.title ? lecture.title : null, when, from].filter(Boolean).join(" · ")}
      onPress={() => router.push({ pathname: "/lecture/[id]", params: { id: lecture.id } })}
      right={
        processing ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ActivityIndicator size="small" color={color.mistInk} />
            <Badge label={t.buddy.processing} bg={color.mist} fg={color.mistInk} />
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {lecture.cardCount ? <Badge icon="zap" label={String(lecture.cardCount)} /> : null}
            <Icon name="chevron-right" size={18} color={color.inkFaint} />
          </View>
        )
      }
      last={last}
    />
  );
}
