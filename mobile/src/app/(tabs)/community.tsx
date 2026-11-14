import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_ORIGIN } from "@/lib/api";
import { useAddPost, useCommunity, useCommunityPost, usePostAction, type Post } from "@/lib/campus";
import { useLang } from "@/lib/i18n";
import { color, radius, space } from "@/lib/theme";
import { Badge, Button, Card, Failed, Field, Icon, IconButton, Loading, Notice, Segment, Sheet, T, useLayout } from "@/ui";
import { Empty } from "@/ui/Juno";
import { Confirm } from "@/ui/parts";

/*
 * Community: the room for the student's own university. International students
 * there share photos of the campus, ask each other things, and answer.
 *
 * The room comes from the profile; there is nothing to join and no feed of
 * everyone everywhere. Names are first names only. Anyone can report a post,
 * and a student can always delete their own.
 */

export default function Community() {
  const { t, errorText } = useLang();
  const { tablet } = useLayout();
  const insets = useSafeAreaInsets();
  const room = useCommunity();
  const add = useAddPost();
  const act = usePostAction();

  const [writing, setWriting] = useState(false);
  const [kind, setKind] = useState<"post" | "question">("post");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [removing, setRemoving] = useState<Post | null>(null);
  const [reported, setReported] = useState<string[]>([]);
  const thread = useCommunityPost(openId);

  const ago = (iso: string) => {
    const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
    return minutes < 1 ? t.community.now : minutes < 60 ? t.community.minutes(minutes) : minutes < 1440 ? t.community.hours(Math.round(minutes / 60)) : t.community.days(Math.round(minutes / 1440));
  };

  const pickPhoto = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.5 });
    if (!picked.canceled && picked.assets?.length) setPhoto({ uri: picked.assets[0].uri, mimeType: picked.assets[0].mimeType });
  };

  const send = async () => {
    setError(null);
    try {
      await add.mutateAsync({ body: body.trim(), kind, photo });
      setBody("");
      setPhoto(null);
      setKind("post");
      setWriting(false);
    } catch (err) {
      setError(errorText(err));
    }
  };

  const comment = async () => {
    const text = reply.trim();
    if (!text || !openId) return;
    setReply("");
    try {
      await act.mutateAsync({ id: openId, action: "comment", body: text });
    } catch (err) {
      setReply(text);
      setError(errorText(err));
    }
  };

  // The post itself opens its replies; the buttons under it are their own targets, so a like never opens the thread.
  const card = (post: Post, inThread = false) => {
    const openThread = () => { setError(null); setOpenId(post.id); };
    return (
    <Card key={post.id} style={{ gap: space.md }}>
      <Pressable accessibilityRole={inThread ? undefined : "button"} accessibilityLabel={inThread ? undefined : `${post.author}: ${post.body.slice(0, 80)}`} disabled={inThread} onPress={openThread} style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: post.mine ? color.ink : color.sunkenDeep, alignItems: "center", justifyContent: "center" }}>
          <T variant="strong" tone={post.mine ? color.onInk : color.ink}>{post.author.charAt(0).toUpperCase()}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="strong">{post.mine ? t.community.you : post.author}</T>
          <T variant="small">{ago(post.createdAt)}</T>
        </View>
        {post.kind === "question" ? <Badge icon="help-circle" label={t.community.question} bg={color.lampSoft} fg={color.lampInk} /> : null}
      </View>
      {post.body ? <T style={{ fontSize: 16, lineHeight: 24 }}>{post.body}</T> : null}
      {post.image ? <Image source={{ uri: API_ORIGIN + post.image }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: color.sunken }} contentFit="cover" accessibilityLabel={t.community.photoBy(post.author)} /> : null}
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.community.like} accessibilityState={{ selected: post.liked }} aria-pressed={post.liked} hitSlop={8} onPress={() => act.mutate({ id: post.id, action: "like" })} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36 }}>
          <Icon name="heart" size={18} color={post.liked ? color.brand : color.inkMuted} />
          <T variant="small" tone={post.liked ? color.brand : color.inkMuted}>{post.likes}</T>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t.community.replies} disabled={inThread} hitSlop={8} onPress={openThread} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36 }}>
          <Icon name="message-circle" size={18} color={color.inkMuted} />
          <T variant="small">{post.comments}</T>
        </Pressable>
        <View style={{ flex: 1 }} />
        {post.mine ? <IconButton icon="trash-2" label={t.common.delete} tone={color.inkMuted} onPress={() => setRemoving(post)} />
          : reported.includes(post.id) ? <T variant="small">{t.community.reported}</T>
          : <IconButton icon="flag" label={t.community.report} tone={color.inkFaint} onPress={() => { act.mutate({ id: post.id, action: "report" }); setReported((now) => [...now, post.id]); }} />}
      </View>
    </Card>
    );
  };

  const data = room.data;
  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 48, paddingHorizontal: tablet ? space.xxl : space.xl, width: "100%", maxWidth: 640, alignSelf: "center" }} showsVerticalScrollIndicator={false}>
        <T variant="display">{t.community.title}</T>
        {room.isPending ? <View style={{ paddingTop: space.huge }}><Loading /></View>
        : room.isError || !data ? <Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => room.refetch()} />
        : !data.room ? (
          <Empty title={t.community.noRoom} line={t.community.noRoomLine} action={<Button small icon="edit-3" label={t.campus.setUniversity} onPress={() => router.push({ pathname: "/onboarding", params: { step: "university" } })} />} />
        ) : (
          <>
            <T tone={color.inkMuted}>{t.community.room(data.room.name, data.room.members)}</T>
            <View style={{ marginTop: space.lg }}><Button icon="edit-2" label={t.community.share} onPress={() => { setError(null); setWriting(true); }} /></View>
            {data.posts.length ? <View style={{ gap: space.md, marginTop: space.lg }}>{data.posts.map((post) => card(post))}</View>
              : <Empty mood="happy" title={t.community.empty(data.room.name)} line={t.community.emptyLine} />}
          </>
        )}
      </ScrollView>

      <Sheet visible={writing} onClose={() => setWriting(false)} title={t.community.share} footer={<Button icon="send" label={t.community.post} loading={add.isPending} disabled={!body.trim() && !photo} onPress={send} />}>
        <Segment<"post" | "question"> options={[{ value: "post", label: t.community.kindPost }, { value: "question", label: t.community.kindQuestion }]} value={kind} onChange={setKind} />
        <View style={{ height: space.lg }} />
        <Field label={kind === "question" ? t.community.askLabel : t.community.sayLabel} value={body} onChangeText={setBody} placeholder={kind === "question" ? t.community.askHint : t.community.sayHint} multiline maxLength={1500} />
        {photo ? (
          <View style={{ gap: space.sm }}>
            <Image source={{ uri: photo.uri }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md }} contentFit="cover" />
            <Button small variant="quiet" icon="x" label={t.community.removePhoto} onPress={() => setPhoto(null)} />
          </View>
        ) : <Button small variant="secondary" icon="image" label={t.community.addPhoto} onPress={pickPhoto} style={{ alignSelf: "flex-start" }} />}
        <T variant="small" tone={color.inkFaint} style={{ marginTop: space.lg }}>{t.community.rules}</T>
        {error ? <View style={{ marginTop: space.md }}><Notice tone="error" text={error} /></View> : null}
      </Sheet>

      <Sheet visible={Boolean(openId)} onClose={() => setOpenId(null)} title={t.community.replies}>
        {thread.isPending ? <Loading /> : thread.data ? (
          <View style={{ gap: space.lg }}>
            {card(thread.data.post, true)}
            {thread.data.comments.map((c) => (
              <View key={c.id} style={{ flexDirection: "row", gap: space.md }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color.sunkenDeep, alignItems: "center", justifyContent: "center" }}><T variant="small" tone={color.ink}>{(c.author ?? "•").charAt(0).toUpperCase()}</T></View>
                <View style={{ flex: 1 }}>
                  <T variant="small">{c.mine ? t.community.you : c.author} · {ago(c.createdAt)}</T>
                  <T>{c.body}</T>
                </View>
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}><Field label={t.community.reply} value={reply} onChangeText={setReply} placeholder={t.community.replyHint} maxLength={800} returnKeyType="send" onSubmitEditing={comment} style={{ marginBottom: 0 }} /></View>
              <View style={{ marginTop: 26 }}><Button small label={t.community.send} disabled={!reply.trim()} loading={act.isPending && Boolean(reply)} onPress={comment} /></View>
            </View>
            {error ? <Notice tone="error" text={error} /> : null}
          </View>
        ) : <Notice tone="warn" text={t.community.gone} />}
      </Sheet>

      <Confirm
        visible={Boolean(removing)}
        title={t.community.deleteTitle}
        text={t.community.deleteText}
        confirmLabel={t.common.delete}
        busy={act.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => { if (removing) act.mutate({ id: removing.id, action: "delete" }); setRemoving(null); setOpenId(null); }}
      />
    </View>
  );
}
