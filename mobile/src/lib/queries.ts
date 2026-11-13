import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./api";
import type { Course, Lecture, LectureSummary, Overview, Project, ReviewCard, Semester, Skill, Task } from "./types";

/*
 * Everything the screens read from the API, cached by React Query, and every
 * change they make. A change refreshes what it affects, so the home screen is
 * right the moment the student goes back to it.
 */

/** Midnight today on the student's own clock, so "today" follows their day and not the server's. */
const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
};

export const keys = {
  overview: ["overview"] as const,
  courses: ["courses"] as const,
  lectures: (courseId?: string) => ["lectures", courseId ?? "all"] as const,
  lecture: (id: string) => ["lecture", id] as const,
  tasks: (state: string, courseId?: string) => ["tasks", state, courseId ?? "all"] as const,
  review: ["review"] as const,
  projects: ["projects"] as const,
};

export function useOverview(enabled = true) {
  return useQuery({
    enabled,
    queryKey: keys.overview,
    queryFn: () => request<Overview>(`/semester?since=${encodeURIComponent(startOfToday())}`),
    // While Juno is reading a lecture, look again every few seconds.
    refetchInterval: (query) => (query.state.data?.processing ? 4000 : false),
  });
}

export function useCourses() {
  return useQuery({ queryKey: keys.courses, queryFn: async () => (await request<{ courses: Course[] }>("/courses")).courses });
}

export function useLectures(courseId?: string) {
  return useQuery({
    queryKey: keys.lectures(courseId),
    queryFn: async () => (await request<{ lectures: LectureSummary[] }>(`/lectures${courseId ? `?courseId=${courseId}` : ""}`)).lectures,
    refetchInterval: (query) => (query.state.data?.some((l) => l.status === "processing") ? 4000 : false),
  });
}

export function useLecture(id: string) {
  return useQuery({
    queryKey: keys.lecture(id),
    queryFn: async () => (await request<{ lecture: Lecture }>(`/lectures/${id}`)).lecture,
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 4000 : false),
  });
}

export function useTasks(state: "open" | "done" | "all" = "open", courseId?: string, enabled = true) {
  return useQuery({
    enabled,
    queryKey: keys.tasks(state, courseId),
    queryFn: async () => (await request<{ tasks: Task[] }>(`/tasks?state=${state}${courseId ? `&courseId=${courseId}` : ""}`)).tasks,
  });
}

export function useReview() {
  return useQuery({
    queryKey: keys.review,
    queryFn: () => request<{ done: number; cards: ReviewCard[] }>(`/review/today?since=${encodeURIComponent(startOfToday())}`),
  });
}

export function useProjects() {
  return useQuery({ queryKey: keys.projects, queryFn: () => request<{ projects: Project[]; skills: Skill[] }>("/projects") });
}

/** After a change: every list that could show it is fetched again. */
function useRefresh() {
  const client = useQueryClient();
  return (...roots: string[]) => Promise.all(roots.map((root) => client.invalidateQueries({ queryKey: [root] })));
}

export type CourseInput = Partial<Omit<Course, "id" | "lectureCount" | "createdAt">> & { name?: string };

export function useSaveCourse() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, ...body }: CourseInput & { id?: string }) =>
      request<{ course: Course }>(id ? `/courses/${id}` : "/courses", { method: id ? "PATCH" : "POST", body }),
    onSuccess: () => refresh("courses", "overview"),
  });
}

export function useDeleteCourse() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => request(`/courses/${id}`, { method: "DELETE" }),
    onSuccess: () => refresh("courses", "overview", "lectures", "tasks", "review"),
  });
}

export function useSaveSemester() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (body: { startsOn: string; weeks: number }) => request<{ semester: Semester }>("/semester", { method: "PUT", body }),
    onSuccess: () => refresh("overview"),
  });
}

export type TaskInput = Partial<Pick<Task, "title" | "notes" | "kind" | "dueAt" | "priority" | "remindMinutes" | "courseId" | "done">>;

export function useSaveTask() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, ...body }: TaskInput & { id?: string }) =>
      request<{ task: Task }>(id ? `/tasks/${id}` : "/tasks", { method: id ? "PATCH" : "POST", body }),
    onSuccess: () => refresh("tasks"),
  });
}

export function useDeleteTask() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => request(`/tasks/${id}`, { method: "DELETE" }), onSuccess: () => refresh("tasks") });
}

export function useAddLecture() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (form: FormData) => request<{ lecture: LectureSummary }>("/lectures", { method: "POST", form }),
    onSuccess: () => refresh("lectures", "overview"),
  });
}

export function useDeleteLecture() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => request(`/lectures/${id}`, { method: "DELETE" }),
    onSuccess: () => refresh("lectures", "overview", "review", "courses"),
  });
}

/** Rates one review card: 1 = again, 3 = good. A card already reviewed today (409) is not an error. */
export function useRateCard() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: 1 | 3 }) => {
      try {
        await request(`/review/cards/${id}`, { method: "POST", body: { rating } });
      } catch (err) {
        if ((err as { status?: number }).status !== 409) throw err;
      }
    },
    onSettled: () => refresh("review", "overview"),
  });
}

export type ProjectInput = Partial<Pick<Project, "title" | "summary" | "status" | "skills" | "link" | "outcome" | "courseId">> & { milestones?: string[] };

export function useSaveProject() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, ...body }: ProjectInput & { id?: string }) =>
      request<{ project: Project }>(id ? `/projects/${id}` : "/projects", { method: id ? "PATCH" : "POST", body }),
    onSuccess: () => refresh("projects"),
  });
}

export function useDeleteProject() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => request(`/projects/${id}`, { method: "DELETE" }), onSuccess: () => refresh("projects") });
}

export function useMilestone(projectId: string) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (change: { add: string } | { id: string; done: boolean } | { remove: string }) => {
      if ("add" in change) return request(`/projects/${projectId}/milestones`, { method: "POST", body: { title: change.add } });
      if ("remove" in change) return request(`/projects/${projectId}/milestones/${change.remove}`, { method: "DELETE" });
      return request(`/projects/${projectId}/milestones/${change.id}`, { method: "PATCH", body: { done: change.done } });
    },
    onSuccess: () => refresh("projects"),
  });
}
