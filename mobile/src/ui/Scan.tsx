import { useState } from "react";
import { Platform, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { request } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { useRefresh } from "@/lib/queries";
import { color, space } from "@/lib/theme";
import type { TaskKind } from "@/lib/types";
import { Button, Checkbox, Loading, Notice, Sheet, T } from "./index";
import { useDueLabel } from "./forms";
import { Juno } from "./Juno";

/*
 * A screenshot of the student's LMS in, their deadlines out. Juno reads the
 * picture and lists what he can see; the student ticks what to keep, and only
 * then is anything saved. A date that is not in the picture stays empty.
 */

type Found = { title: string; kind: TaskKind; dueAt: string | null; courseId: string | null; courseName: string | null };

/** With more than a day and a half to go the reminder comes the day before; otherwise two hours before. */
const reminderFor = (dueAt: string | null) => (dueAt ? (Date.parse(dueAt) - Date.now() > 36 * 3600000 ? 24 * 60 : 120) : null);

export function ScanSheet({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved?: (count: number) => void }) {
  const { t, errorText } = useLang();
  const refresh = useRefresh();
  const dueLabel = useDueLabel();
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [found, setFound] = useState<Found[] | null>(null);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [have, setHave] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setFound(null);
    setError(null);
    onClose();
  };

  const pick = async () => {
    setError(null);
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (picked.canceled || !picked.assets?.length) return;
    const asset = picked.assets[0];
    setReading(true);
    try {
      const form = new FormData();
      const type = asset.mimeType && /^image\/(png|jpeg|webp)$/.test(asset.mimeType) ? asset.mimeType : "image/jpeg";
      const name = `screenshot.${type.split("/")[1]}`;
      if (Platform.OS === "web") form.append("image", await (await fetch(asset.uri)).blob(), name);
      else form.append("image", { uri: asset.uri, name, type } as unknown as Blob);
      const answer = await request<{ items: Found[] }>("/tasks/from-image", { method: "POST", form });
      // What is already on the list is shown but left unticked, so scanning the same page twice adds nothing twice.
      const open = await request<{ tasks: { title: string; dueAt: string | null }[] }>("/tasks?state=open").catch(() => ({ tasks: [] }));
      const known = new Set(open.tasks.map((task) => `${task.title.trim().toLowerCase()}|${task.dueAt ? Date.parse(task.dueAt) : ""}`));
      const already = answer.items.map((item) => known.has(`${item.title.trim().toLowerCase()}|${item.dueAt ? Date.parse(item.dueAt) : ""}`));
      setFound(answer.items);
      setHave(already);
      setKeep(already.map((saved) => !saved));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setReading(false);
    }
  };

  const chosen = (found ?? []).filter((_, i) => keep[i]);
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const item of chosen) {
        await request("/tasks", { method: "POST", body: { title: item.title, kind: item.kind, dueAt: item.dueAt, courseId: item.courseId, remindMinutes: reminderFor(item.dueAt) } });
      }
      refresh("tasks", "overview");
      onSaved?.(chosen.length);
      close();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={found?.length ? t.companion.scanTitle : t.companion.scan}
      footer={found?.length ? <Button icon="check" label={t.companion.scanSave(chosen.length)} disabled={!chosen.length} loading={saving} onPress={save} /> : undefined}
    >
      {reading ? (
        <View style={{ paddingVertical: space.xxl }}><Loading label={t.companion.scanReading} /></View>
      ) : found?.length ? (
        <View style={{ gap: space.lg }}>
          {found.map((item, i) => (
            <Checkbox key={i} label={item.title} checked={keep[i]} onChange={(next) => setKeep((now) => now.map((value, at) => (at === i ? next : value)))}>
              <T variant="strong">{item.title}</T>
              <T variant="small" tone={item.dueAt ? color.inkMuted : color.lampInk}>{[item.courseName, item.dueAt ? dueLabel(item).text : t.companion.scanNoDate, have[i] ? t.companion.scanHave : null].filter(Boolean).join(" · ")}</T>
            </Checkbox>
          ))}
          {error ? <Notice tone="error" text={error} /> : null}
        </View>
      ) : (
        <View style={{ gap: space.lg }}>
          <View style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
            <Juno size={48} mood="work" />
            <T style={{ flex: 1 }}>{t.companion.scanLine}</T>
          </View>
          {found && !found.length ? <Notice tone="warn" text={t.companion.scanNone} /> : null}
          {error ? <Notice tone="error" text={error} /> : null}
          <Button icon="image" label={t.companion.scanPick} onPress={pick} />
        </View>
      )}
    </Sheet>
  );
}
