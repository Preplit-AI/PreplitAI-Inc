import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { startOfToday } from "@/lib/format";
import type { Course, LectureMessage, LectureDetail, LectureSummary, ReviewToday } from "@/lib/types";

/** While anything is processing, check back every few seconds; otherwise do not poll. */
const POLL_MS = 4000;

export const keys = {
  courses: ["courses"] as const,
  lectures: ["lectures"] as const,
  lecture: (id: string) => ["lecture", id] as const,
  juno: ["juno"] as const,
  review: ["review-today"] as const,
};

export function useCourses() {
  return useQuery({
    queryKey: keys.courses,
    queryFn: () => request<{ courses: Course[] }>("/courses").then((r) => r.courses),
  });
}

export function useLectures() {
  return useQuery({
    queryKey: keys.lectures,
    queryFn: () => request<{ lectures: LectureSummary[] }>("/lectures").then((r) => r.lectures),
    refetchInterval: (query) => (query.state.data?.some((l) => l.status === "processing") ? POLL_MS : false),
  });
}

export function useLecture(id: string) {
  return useQuery({
    queryKey: keys.lecture(id),
    queryFn: () => request<{ lecture: LectureDetail }>(`/lectures/${id}`).then((r) => r.lecture),
    // Juno's panel asks on every screen; only a lecture's own page has an id.
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.status === "processing" ? POLL_MS : false),
    retry: (count, err) => (err as { status?: number }).status !== 404 && count < 2,
  });
}

export function useJunoMessage(poll: boolean) {
  return useQuery({
    queryKey: keys.juno,
    queryFn: () => request<{ message: LectureMessage | null }>("/junbee").then((r) => r.message),
    refetchInterval: poll ? POLL_MS : false,
  });
}

export function useReviewToday() {
  return useQuery({
    queryKey: keys.review,
    queryFn: () => request<ReviewToday>(`/review/today?since=${encodeURIComponent(startOfToday())}`),
  });
}
