import { useEffect, useRef, useState, type ComponentRef } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { streamChat } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { useRefresh } from "@/lib/queries";
import { color, font, radius, space } from "@/lib/theme";
import type { ChatMessage, Citation } from "@/lib/types";
import { Button, Chip, Icon, Notice, Sheet, T } from "./index";
import { Juno } from "./Juno";
import { ScanSheet } from "./Scan";

/*
 * A conversation with Juno. He answers from the student's own lectures and
 * marks where each part came from; the marks become numbered sources under the
 * answer, and each opens the passage it points to. An answer that did not come
 * from the lectures says so.
 *
 * `courseId` and `lectureId` are the context of the screen it was opened from,
 * so the student never has to say which course they mean.
 */

type Props = {
  courseId?: string | null;
  lectureId?: string | null;
  mode?: "career" | null;
  /** Asked at once when the chat opens (a suggestion pressed on another screen). */
  initialQuestion?: string;
  /** Inside a split view: no bottom inset, tighter empty state. */
  embedded?: boolean;
};

type Shown = ChatMessage | { id: string; role: "user"; content: string; citations: []; grounding: null };

/** The model writes [S3]; the student sees ¹ ² ³ in reading order. */
function numberCitations(content: string) {
  const order: string[] = [];
  const text = content.replace(/\[S(\d+)\]/g, (_, n) => {
    const label = `S${n}`;
    if (!order.includes(label)) order.push(label);
    return ` [${order.indexOf(label) + 1}]`;
  });
  return { text, order };
}

/** Enough Markdown for an answer: paragraphs, bullets and **bold**. */
function Rich({ text }: { text: string }) {
  return (
    <View style={{ gap: 8 }}>
      {text.split(/\n+/).filter((line) => line.trim()).map((line, i) => {
        const bullet = /^\s*(?:[-*•]|\d+[.)])\s+/.exec(line);
        const heading = /^#{1,4}\s+/.exec(line);
        const body = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").replace(/^#{1,4}\s+/, "");
        const parts = body.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        return (
          <View key={i} style={{ flexDirection: "row", gap: 8 }}>
            {bullet ? <Text style={{ fontFamily: font.bold, fontSize: 15.5, lineHeight: 23, color: color.inkMuted }}>•</Text> : null}
            <Text style={{ flex: 1, fontFamily: heading ? font.semibold : font.regular, fontSize: 15.5, lineHeight: 23, color: color.ink }}>
              {parts.map((part, j) => (part.startsWith("**") ? <Text key={j} style={{ fontFamily: font.semibold }}>{part.slice(2, -2)}</Text> : part))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function JunoChat({ courseId = null, lectureId = null, mode = null, initialQuestion, embedded }: Props) {
  const { t, errorText } = useLang();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Shown[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [writing, setWriting] = useState<{ text: string; searching: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<Citation | null>(null);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const abort = useRef<AbortController | null>(null);
  const askedInitial = useRef(false);
  const refresh = useRefresh();
  // What Juno did for the student in this conversation: a deadline saved, a task ticked off.
  const [did, setDid] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const companion = mode !== "career";

  const toEnd = () => setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || writing) return;
    setDraft("");
    setError(null);
    const temp: Shown = { id: `temp-${Date.now()}`, role: "user", content: text, citations: [], grounding: null };
    setMessages((now) => [...now, temp]);
    setWriting({ text: "", searching: false });
    toEnd();
    abort.current = new AbortController();
    let finished = false;
    try {
      await streamChat(
        { question: text, conversationId, courseId: conversationId ? null : courseId, lectureId, mode: mode ?? "companion" },
        (event) => {
          if (event.type === "delta") setWriting((now) => ({ text: (now?.text ?? "") + event.text, searching: false }));
          else if (event.type === "reset") setWriting({ text: "", searching: true });
          else if (event.type === "status") setWriting((now) => ({ text: now?.text ?? "", searching: true }));
          else if (event.type === "action") {
            const line = event.action.type === "task_saved" ? t.companion.saved(event.action.task.title) : t.companion.done(event.action.task.title);
            setDid((now) => [...now, line]);
            refresh("tasks", "overview");
          }
          else if (event.type === "done") {
            finished = true;
            setConversationId(event.conversation.id);
            setMessages((now) => [...now.filter((m) => m.id !== temp.id), ...event.messages]);
          } else if (event.type === "error") {
            finished = true;
            setMessages((now) => now.filter((m) => m.id !== temp.id));
            setDraft(text);
            setError(t.errors.AnswerFailed);
          }
          toEnd();
        },
        abort.current.signal,
      );
      if (!finished) throw new Error("ended early");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((now) => now.filter((m) => m.id !== temp.id));
        setDraft(text);
        setError((err as { code?: string }).code ? errorText(err) : t.errors.AnswerFailed);
      }
    } finally {
      setWriting(null);
      toEnd();
    }
  };

  useEffect(() => {
    if (initialQuestion && !askedInitial.current) {
      askedInitial.current = true;
      ask(initialQuestion);
    }
    return () => abort.current?.abort();
    // Asked once, when the chat opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const general = !lectureId && !courseId && companion;
  const suggestions = mode === "career" ? t.juno.suggestions.career : lectureId ? t.juno.suggestions.lecture : general ? t.companion.ideas : t.juno.suggestions.general;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: space.xl, paddingBottom: space.lg, gap: space.lg, flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {messages.length === 0 && !writing ? (
          <View style={{ flex: 1, justifyContent: "center", gap: space.md, paddingVertical: embedded ? space.md : space.xxl }}>
            <Juno size={embedded ? 64 : 72} mood={mode === "career" ? "found" : "happy"} />
            <T variant="title">{mode === "career" ? t.juno.careerTitle : general ? t.companion.emptyTitle : t.juno.emptyTitle}</T>
            <T tone={color.inkMuted}>{mode === "career" ? t.juno.careerLine : general ? t.companion.emptyLine : t.juno.emptyLine}</T>
            <View style={{ gap: space.sm, marginTop: space.sm, alignItems: "flex-start" }}>
              {suggestions.map((s) => <Chip key={s} label={s} icon="corner-down-right" onPress={() => ask(s)} />)}
            </View>
          </View>
        ) : null}

        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <View key={message.id} style={{ alignSelf: "flex-end", maxWidth: "86%", backgroundColor: color.action, borderRadius: radius.lg, borderBottomRightRadius: 6, paddingHorizontal: space.lg, paddingVertical: space.md }}>
                <Text style={{ fontFamily: font.regular, fontSize: 15.5, lineHeight: 22, color: color.onAction }}>{message.content}</Text>
              </View>
            );
          }
          const { text, order } = numberCitations(message.content);
          const cited = order.map((label) => message.citations.find((c) => c.label === label)).filter((c): c is Citation => Boolean(c));
          return (
            <View key={message.id} style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
              <Juno size={34} />
              <View style={{ flex: 1, gap: space.sm }}>
                <View style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.rule, borderRadius: radius.lg, borderTopLeftRadius: 6, padding: space.lg }}>
                  <Rich text={text} />
                </View>
                {message.grounding ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Icon name={message.grounding === "cited" ? "check-circle" : message.grounding === "account" ? "user" : "info"} size={13} color={message.grounding === "general" ? color.lampInk : color.settled} />
                    <T variant="small" tone={message.grounding === "general" ? color.lampInk : color.settled} style={{ fontFamily: font.medium }}>{t.juno.grounding[message.grounding]}</T>
                  </View>
                ) : null}
                {cited.length ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {cited.map((c, i) => (
                      <Pressable key={c.label} accessibilityRole="button" accessibilityLabel={`${t.juno.sources} ${i + 1}`} onPress={() => setSource(c)} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 34, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: color.sunken, maxWidth: "100%" }}>
                        <Text style={{ fontFamily: font.bold, fontSize: 12, color: color.ink }}>{i + 1}</Text>
                        <Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 12.5, color: color.inkSoft, flexShrink: 1 }}>{c.deleted ? "—" : `${c.lectureTitle}${c.at ? ` · ${c.at}` : ""}`}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}

        {writing ? (
          <View style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
            <Juno size={34} mood="work" />
            <View style={{ flex: 1, backgroundColor: color.surface, borderWidth: 1, borderColor: color.rule, borderRadius: radius.lg, borderTopLeftRadius: 6, padding: space.lg }}>
              {writing.text ? <Rich text={numberCitations(writing.text.replace(/\[S?\d*$/, "")).text} /> : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }} accessibilityRole="progressbar">
                  <ActivityIndicator size="small" color={color.inkMuted} />
                  <T variant="small">{writing.searching ? t.juno.searching : t.juno.thinking}</T>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {did.map((line, i) => <Notice key={i} tone="good" icon="check-circle" text={line} />)}
        {error ? <Notice tone="error" text={error} /> : null}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: color.rule, backgroundColor: color.ground, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: embedded ? space.md : Math.max(insets.bottom, space.md) }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: space.sm }}>
          {companion ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t.companion.scan} onPress={() => setScanning(true)} style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" }, pressed && { backgroundColor: color.sunken }]}>
              <Icon name="image" size={20} color={color.ink} />
            </Pressable>
          ) : null}
          <TextInput
            accessibilityLabel={mode === "career" ? t.juno.placeholderCareer : general ? t.companion.junoLine : t.juno.placeholder}
            value={draft}
            onChangeText={setDraft}
            placeholder={mode === "career" ? t.juno.placeholderCareer : general ? t.companion.junoLine : t.juno.placeholder}
            placeholderTextColor={color.inkFaint}
            multiline
            maxLength={4000}
            onSubmitEditing={() => ask(draft)}
            blurOnSubmit
            style={{ flex: 1, minHeight: 48, maxHeight: 130, borderRadius: 24, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface, paddingHorizontal: space.lg, paddingTop: 13, paddingBottom: 13, fontFamily: font.regular, fontSize: 16, color: color.ink }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.juno.send}
            disabled={!draft.trim() || Boolean(writing)}
            onPress={() => ask(draft)}
            style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.action, alignItems: "center", justifyContent: "center" }, (!draft.trim() || writing) && { opacity: 0.35 }, pressed && { opacity: 0.8 }]}
          >
            <Icon name="arrow-up" size={20} color={color.onAction} />
          </Pressable>
        </View>
        <T variant="small" tone={color.inkFaint} style={{ fontSize: 12, textAlign: "center", marginTop: 8 }}>{t.juno.aiNote}</T>
      </View>

      <ScanSheet visible={scanning} onClose={() => setScanning(false)} onSaved={(count) => setDid((now) => [...now, t.companion.scanSaved(count)])} />
      <Sheet
        visible={Boolean(source)}
        onClose={() => setSource(null)}
        title={t.juno.sources}
        footer={source && !source.deleted ? <Button icon="arrow-right" label={t.juno.openLecture} onPress={() => { const id = source.lectureId; setSource(null); router.push({ pathname: "/lecture/[id]", params: { id } }); }} /> : undefined}
      >
        {source && !source.deleted ? (
          <View style={{ gap: space.md }}>
            <T variant="small">{[source.courseName, source.lectureTitle, source.at].filter(Boolean).join(" · ")}</T>
            <View style={{ borderLeftWidth: 3, borderLeftColor: color.ruleStrong, paddingLeft: space.md }}>
              <T>{source.excerpt}</T>
            </View>
          </View>
        ) : null}
      </Sheet>
    </View>
  );
}
