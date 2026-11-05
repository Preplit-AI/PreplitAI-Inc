import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, request } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Course, LectureSummary } from "@/lib/types";
import { JunbeeSlot } from "./JunbeeSlot";
import { keys, useCourses, useJunbee, useLectures } from "./queries";
import { AppTitle, Dialog, ErrorLine, LoadingLine } from "./ui";
import { UploadDialog } from "./UploadDialog";

export default function Learn() {
  const client = useQueryClient();
  const courses = useCourses();
  const lectures = useLectures();
  const processing = lectures.data?.filter((l) => l.status === "processing").length ?? 0;
  const junbee = useJunbee(processing > 0);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [courseDialog, setCourseDialog] = useState<null | { mode: "add" } | { mode: "edit"; course: Course }>(null);

  // A lecture finished (or failed and left the list): fetch what Junbee says,
  // the new cards and the course counts.
  const previous = useRef(processing);
  useEffect(() => {
    if (processing < previous.current) {
      client.invalidateQueries({ queryKey: keys.junbee });
      client.invalidateQueries({ queryKey: keys.review });
      client.invalidateQueries({ queryKey: keys.courses });
    }
    previous.current = processing;
  }, [processing, client]);

  const courseList = courses.data ?? [];
  const selected = courseList.find((c) => c.id === courseFilter) ?? null;
  const shown = (lectures.data ?? []).filter((l) => !selected || l.courseId === selected.id);
  const loading = courses.isLoading || lectures.isLoading;
  const loadError = courses.error || lectures.error;

  return (
    <div>
      <AppTitle>배움</AppTitle>
      <JunbeeSlot message={junbee.data} className="mb-8" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">배움</h1>
          <p className="mt-2 text-slate">녹음한 강의와 노트</p>
        </div>
        {courseList.length ? (
          <button type="button" onClick={() => setUploadOpen(true)} className="btn-primary min-h-[48px] px-6">
            강의 올리기
          </button>
        ) : null}
      </div>

      {loading ? (
        <LoadingLine />
      ) : loadError ? (
        <p className="py-10 text-ink">강의 목록을 불러오지 못했어요. 새로고침해 주세요.</p>
      ) : !courseList.length ? (
        <FirstCourse />
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="과목">
            <Chip active={!selected} onClick={() => setCourseFilter(null)}>전체</Chip>
            {courseList.map((c) => (
              <Chip key={c.id} active={selected?.id === c.id} onClick={() => setCourseFilter(c.id)}>
                {c.name}
              </Chip>
            ))}
            <button type="button" onClick={() => setCourseDialog({ mode: "add" })} className="min-h-[40px] rounded-full px-3 text-sm font-semibold text-slate hover:text-ink">
              + 과목 추가
            </button>
          </div>
          {selected ? (
            <button type="button" onClick={() => setCourseDialog({ mode: "edit", course: selected })} className="btn-text mt-1 text-slate">
              {selected.name} 과목 관리
            </button>
          ) : null}

          {shown.length ? (
            <ul className="mt-6 border-t border-rule">
              {shown.map((l) => (
                <LectureRow key={l.id} lecture={l} />
              ))}
            </ul>
          ) : (
            <div className="mt-6 border-t border-rule py-12">
              <p className="text-lg font-semibold">아직 올린 강의가 없어요.</p>
              <p className="mt-2 max-w-read leading-relaxed text-slate">
                강의를 휴대폰으로 녹음한 뒤 올리세요. 몇 분 뒤 노트와 복습 카드가 만들어져요.
              </p>
            </div>
          )}
        </>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        courses={courseList}
        defaultCourseId={selected?.id}
      />
      <CourseDialog
        state={courseDialog}
        onClose={() => setCourseDialog(null)}
        onDeleted={() => setCourseFilter(null)}
      />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors",
        active ? "border-ink bg-ink text-bone" : "border-rule-strong text-ink hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

function LectureRow({ lecture: l }: { lecture: LectureSummary }) {
  return (
    <li className="border-b border-rule">
      <Link to={`/app/learn/${l.id}`} className="group flex items-center justify-between gap-4 py-4 sm:py-5">
        <div className="min-w-0">
          <p className="text-sm text-slate">{l.courseName}</p>
          <p className="mt-0.5 truncate text-lg font-semibold group-hover:underline group-hover:underline-offset-4">
            {l.title}
            {l.topic ? <span className="font-normal text-ink/70"> · {l.topic}</span> : null}
          </p>
        </div>
        <div className="shrink-0 text-right text-sm">
          {l.status === "processing" ? (
            <p className="flex items-center gap-2 text-ink">
              <span className="h-2 w-2 animate-pulse rounded-full bg-honey" aria-hidden="true" />
              노트 만드는 중
            </p>
          ) : (
            <p className="text-ink">카드 {l.cardCount}장</p>
          )}
          <p className="mt-0.5 text-slate">{formatDate(l.createdAt)}</p>
        </div>
      </Link>
    </li>
  );
}

/** The empty state when there is no course yet: the one thing to do is add one. */
function FirstCourse() {
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    if (!name) return setError("과목 이름을 입력해 주세요.");
    setBusy(true);
    try {
      await request("/courses", { method: "POST", body: { name } });
      await client.invalidateQueries({ queryKey: keys.courses });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "과목을 만들지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 max-w-read border-t border-rule pt-10">
      <p className="text-xl font-semibold">아직 과목이 없어요.</p>
      <p className="mt-2 leading-relaxed text-slate">Junbee로 들을 과목을 먼저 추가하세요. 강의는 과목별로 모여요.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="first-course" className="sr-only">과목 이름</label>
        <input id="first-course" name="name" className="field sm:max-w-xs" placeholder="예: 운영체제" maxLength={80} />
        <button type="submit" disabled={busy} className="btn-primary min-h-[50px] px-6">과목 추가</button>
      </form>
      <div className="mt-3"><ErrorLine>{error}</ErrorLine></div>
    </div>
  );
}

function CourseDialog({
  state,
  onClose,
  onDeleted,
}: {
  state: null | { mode: "add" } | { mode: "edit"; course: Course };
  onClose: () => void;
  onDeleted: () => void;
}) {
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const course = state?.mode === "edit" ? state.course : null;

  const close = () => {
    setError(null);
    setConfirming(false);
    onClose();
  };

  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: keys.courses }),
      client.invalidateQueries({ queryKey: keys.lectures }),
      client.invalidateQueries({ queryKey: keys.review }),
    ]);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    if (!name) return setError("과목 이름을 입력해 주세요.");
    try {
      if (course) await request(`/courses/${course.id}`, { method: "PATCH", body: { name } });
      else await request("/courses", { method: "POST", body: { name } });
      await refresh();
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "저장하지 못했어요.");
    }
  };

  const remove = async () => {
    if (!course) return;
    try {
      await request(`/courses/${course.id}`, { method: "DELETE" });
      onDeleted();
      await refresh();
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "지우지 못했어요.");
    }
  };

  return (
    <Dialog open={state !== null} onClose={close} title={course ? "과목 관리" : "과목 추가"}>
      <form onSubmit={save} className="flex flex-col gap-4">
        <div>
          <label htmlFor="course-name" className="field-label">과목 이름</label>
          <input id="course-name" name="name" className="field" defaultValue={course?.name ?? ""} placeholder="예: 운영체제" maxLength={80} />
        </div>
        <ErrorLine>{error}</ErrorLine>
        <button type="submit" className="btn-ink min-h-[48px]">{course ? "이름 저장" : "추가"}</button>
      </form>
      {course ? (
        <div className="mt-6 border-t border-rule pt-5">
          {confirming ? (
            <div>
              <p className="text-sm leading-relaxed text-ink">
                {course.name} 과목의 강의, 노트, 카드가 모두 지워지고 되돌릴 수 없어요.
              </p>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={remove} className="btn-quiet min-h-[44px] border-maroon text-maroon hover:border-maroon-deep">
                  과목 지우기
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="btn-text">취소</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="btn-text text-slate">
              이 과목 지우기
            </button>
          )}
        </div>
      ) : null}
    </Dialog>
  );
}
