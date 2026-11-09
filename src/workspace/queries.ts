import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { startOfToday } from "@/lib/format";
import type { Conversation, ConversationSummary, CourseSpaceData, SemesterOverview } from "@/lib/types";

/** While a lecture is becoming a note, check back every few seconds; otherwise do not poll. */
const POLL_MS = 4000;

export const semesterKeys = {
  all: ["semester"] as const,
  overview: ["semester", "overview"] as const,
  course: (id: string) => ["semester", "course", id] as const,
};

export function useSemester() {
  return useQuery({
    queryKey: semesterKeys.overview,
    queryFn: () => request<SemesterOverview>(`/semester?since=${encodeURIComponent(startOfToday())}`),
    refetchInterval: (query) => (query.state.data?.processing ? POLL_MS : false),
  });
}

export function useCourseSpace(id: string) {
  return useQuery({
    queryKey: semesterKeys.course(id),
    queryFn: () => request<CourseSpaceData>(`/semester/courses/${id}`),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.lectures.some((l) => l.status === "processing") ? POLL_MS : false),
    retry: (count, err) => (err as { status?: number }).status !== 404 && count < 2,
  });
}

export const chatKeys = {
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversation", id] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: () => request<{ conversations: ConversationSummary[] }>("/chat/conversations").then((r) => r.conversations),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: chatKeys.conversation(id ?? ""),
    queryFn: () => request<{ conversation: Conversation }>(`/chat/conversations/${id}`).then((r) => r.conversation),
    enabled: Boolean(id),
    retry: (count, err) => (err as { status?: number }).status !== 404 && count < 2,
  });
}
