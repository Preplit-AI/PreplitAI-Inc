import { Platform } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "./api";
import { useRefresh } from "./queries";

/*
 * The campus board (what the student's university has posted, in English) and
 * the community (their university's room). Both follow from the university in
 * the profile: the student never chooses a campus here.
 */

export type CampusKind = "scholarship" | "job" | "program" | "event" | "academic" | "visa" | "housing" | "general";
export type CampusItem = {
  id: string;
  title: string;
  /** The university's own wording, when the title shown is a translation. */
  original: string | null;
  kind: CampusKind;
  forInternational: boolean;
  source: string | null;
  category: string | null;
  url: string;
  postedOn: string | null;
  pinned: boolean;
};
export type CampusBoard =
  | { connected: false; university: string | null }
  | {
      connected: true;
      university: string;
      campus: { key: string; name: string; city: string; links: { label: string; url: string }[]; sources: { label: string; url: string }[] };
      items: CampusItem[];
      fetchedAt: string | null;
      failed: boolean;
      /** Titles still waiting to be put into English. */
      translating: number;
    };

export function useCampus() {
  return useQuery({
    queryKey: ["campus"],
    queryFn: () => request<CampusBoard>("/campus"),
    staleTime: 5 * 60_000,
    // While Juno is still translating titles, look again every few seconds; otherwise every
    // 30 minutes while the app is open, as often as the campus reader brings new notices.
    refetchInterval: (query) => (query.state.data?.connected && query.state.data.translating ? 6000 : 30 * 60_000),
  });
}

export type Post = {
  id: string;
  kind: "post" | "question";
  body: string;
  image: string | null;
  author: string;
  mine: boolean;
  likes: number;
  liked: boolean;
  comments: number;
  createdAt: string;
};
export type Comment = { id: string; body: string; author: string | null; mine: boolean; createdAt: string };
export type Room = { room: { name: string; members: number } | null; posts: Post[] };

export function useCommunity() {
  return useQuery({ queryKey: ["community"], queryFn: () => request<Room>("/community") });
}

export function useCommunityPost(id: string | null) {
  return useQuery({ enabled: Boolean(id), queryKey: ["community", "post", id], queryFn: () => request<{ post: Post; comments: Comment[] }>(`/community/${id}`) });
}

/** A phone photo is far bigger than a feed needs: in a browser it is redrawn at most 1600 px wide before it is sent. */
async function pictureFor(uri: string, mimeType?: string | null): Promise<Blob | { uri: string; name: string; type: string }> {
  if (Platform.OS !== "web") return { uri, name: "photo.jpg", type: mimeType && /^image\/(png|jpeg|webp)$/.test(mimeType) ? mimeType : "image/jpeg" };
  const blob = await (await fetch(uri)).blob();
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const small = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    return small ?? blob;
  } catch {
    return blob;
  }
}

export function useAddPost() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async ({ body, kind, photo }: { body: string; kind: "post" | "question"; photo?: { uri: string; mimeType?: string | null } | null }) => {
      const form = new FormData();
      form.append("body", body);
      form.append("kind", kind);
      if (photo) {
        const picture = await pictureFor(photo.uri, photo.mimeType);
        if (picture instanceof Blob) form.append("image", picture, "photo.jpg");
        else form.append("image", picture as unknown as Blob);
      }
      return request<{ post: Post }>("/community", { method: "POST", form });
    },
    onSuccess: () => refresh("community"),
  });
}

export function usePostAction() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, action, body }: { id: string; action: "like" | "report" | "delete" | "comment"; body?: string }) =>
      action === "delete" ? request(`/community/${id}`, { method: "DELETE" })
      : action === "comment" ? request(`/community/${id}/comments`, { method: "POST", body: { body } })
      : request(`/community/${id}/${action}`, { method: "POST", body: {} }),
    onSuccess: () => refresh("community"),
  });
}
