import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, request } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useCopy, useLang } from "@/lib/lang";
import type { Course, LectureSummary } from "@/lib/types";
import { PageHead } from "@/workspace/kit";
import { movement } from "@/workspace/movements";
import { RecordButton } from "@/workspace/recorder/RecorderUI";
import { JunoSlot } from "./JunoSlot";
import { CourseMark, NoteFlow, TodayCard } from "./parts";
import { keys, useCourses, useJunoMessage, useLectures } from "./queries";
import { AppTitle, Dialog, ErrorLine, LoadingLine } from "./ui";
import { UploadDialog } from "./UploadDialog";

/* 02 Learn: every recorded lecture and its note, filtered by course. */

const COPY = {
  ko: {
    title: "배움",
    upload: "파일 올리기",
    loadError: "강의 목록을 불러오지 못했어요. 새로고침해 주세요.",
    courses: "과목",
    all: "전체",
    addCourse: "+ 과목 추가",
    manage: (c: string) => `${c} 과목 관리`,
    emptyTitle: "아직 올린 강의가 없어요.",
    emptyText: "수업이 시작되면 녹음을 누르고, 끝나면 수업 끝을 누르세요. 몇 분 뒤 노트와 복습 카드가 이 과목에 정리돼요.",
    whatJuno: "Juno가 하는 일",
    whatJunoText: "수업 하나를 녹음하면 녹취록, 노트, 카드가 이 순서로 만들어져요. 교수님이 시험에 나온다고 한 부분은 따로 모아요.",
    making: "노트 만드는 중",
    cards: (n: number) => `카드 ${n}장`,
    first: "아직 과목이 없어요.",
    firstText: "Preplit AI로 들을 과목을 먼저 추가하세요. 녹음한 강의는 Juno가 과목별로 모아요.",
    courseName: "과목 이름",
    example: "예: 운영체제",
    add: "과목 추가",
    nameNeeded: "과목 이름을 입력해 주세요.",
    createFailed: "과목을 만들지 못했어요.",
    manageTitle: "과목 관리",
    addTitle: "과목 추가",
    saveName: "이름 저장",
    addShort: "추가",
    saveFailed: "저장하지 못했어요.",
    deleteFailed: "지우지 못했어요.",
    deleteWarn: (c: string) => `${c} 과목의 강의, 노트, 카드가 모두 지워지고 되돌릴 수 없어요.`,
    deleteCourse: "과목 지우기",
    cancel: "취소",
    deleteThis: "이 과목 지우기",
  },
  en: {
    title: "Learn",
    upload: "Upload a file",
    loadError: "Couldn't load your lectures. Please refresh.",
    courses: "Courses",
    all: "All",
    addCourse: "+ Add a course",
    manage: (c: string) => `Manage ${c}`,
    emptyTitle: "No lectures yet.",
    emptyText: "Press record when class starts and End class when it's over. A few minutes later the note and review cards are filed under the course.",
    whatJuno: "What Juno does",
    whatJunoText: "Record one class and a transcript, a note and cards are made, in that order. What the professor flags for the exam is gathered separately.",
    making: "Making a note",
    cards: (n: number) => `${n} card${n === 1 ? "" : "s"}`,
    first: "No courses yet.",
    firstText: "Add the courses you'll use Preplit AI for. Juno files each recorded lecture by course.",
    courseName: "Course name",
    example: "e.g. Operating Systems",
    add: "Add course",
    nameNeeded: "Please enter a course name.",
    createFailed: "Couldn't create the course.",
    manageTitle: "Manage course",
    addTitle: "Add a course",
    saveName: "Save name",
    addShort: "Add",
    saveFailed: "Couldn't save.",
    deleteFailed: "Couldn't delete.",
    deleteWarn: (c: string) => `Every lecture, note and card in ${c} will be deleted, and this can't be undone.`,
    deleteCourse: "Delete course",
    cancel: "Cancel",
    deleteThis: "Delete this course",
  },
};

export default function Learn() {
  const client = useQueryClient();
  const t = useCopy(COPY);
  const courses = useCourses();
  const lectures = useLectures();
  const processing = lectures.data?.filter((l) => l.status === "processing").length ?? 0;
  const juno = useJunoMessage(processing > 0);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [courseDialog, setCourseDialog] = useState<null | { mode: "add" } | { mode: "edit"; course: Course }>(null);

  // A lecture finished (or failed and left the list): fetch what Juno says, the new cards and the course counts.
  const previous = useRef(processing);
  useEffect(() => {
    if (processing < previous.current) {
      client.invalidateQueries({ queryKey: keys.juno });
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
      <AppTitle>{t.title}</AppTitle>
      <PageHead
        movement={movement("learn")}
        actions={
          courseList.length ? (
            <>
              <button type="button" onClick={() => setUploadOpen(true)} className="btn-quiet">{t.upload}</button>
              <RecordButton courseId={selected?.id} />
            </>
          ) : null
        }
      />
      <JunoSlot message={juno.data} className="mt-5" />

      {loading ? (
        <LoadingLine />
      ) : loadError ? (
        <p className="py-10 text-sm">{t.loadError}</p>
      ) : !courseList.length ? (
        <FirstCourse />
      ) : (
        <div className="split mt-5 !gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t.courses}>
              <Chip active={!selected} onClick={() => setCourseFilter(null)}>{t.all}</Chip>
              {courseList.map((c) => (
                <Chip key={c.id} active={selected?.id === c.id} onClick={() => setCourseFilter(c.id)}>{c.name}</Chip>
              ))}
              <button type="button" onClick={() => setCourseDialog({ mode: "add" })} className="min-h-[30px] rounded-full px-2.5 text-xs font-medium text-slate hover:text-ink">{t.addCourse}</button>
            </div>
            {selected ? (
              <button type="button" onClick={() => setCourseDialog({ mode: "edit", course: selected })} className="btn-text mt-1 text-xs text-slate">{t.manage(selected.name)}</button>
            ) : null}

            {shown.length ? (
              <ul className="window mt-3 divide-y divide-rule overflow-hidden">
                {shown.map((l) => <LectureRow key={l.id} lecture={l} />)}
              </ul>
            ) : (
              <div className="window mt-3 px-5 py-6">
                <p className="text-base font-semibold">{t.emptyTitle}</p>
                <p className="mt-1 max-w-read text-sm leading-relaxed text-slate">{t.emptyText}</p>
                <NoteFlow className="mt-5 max-w-sm" />
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <TodayCard />
            <div className="window p-4">
              <p className="text-sm font-semibold">{t.whatJuno}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate">{t.whatJunoText}</p>
              <NoteFlow className="mt-4" />
            </div>
          </aside>
        </div>
      )}

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} courses={courseList} defaultCourseId={selected?.id} />
      <CourseDialog state={courseDialog} onClose={() => setCourseDialog(null)} onDeleted={() => setCourseFilter(null)} />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn("min-h-[30px] rounded-full border px-3 text-xs font-medium transition-colors", active ? "border-ink bg-ink text-white" : "border-rule-strong bg-white text-ink hover:border-ink")}
    >
      {children}
    </button>
  );
}

function LectureRow({ lecture: l }: { lecture: LectureSummary }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  return (
    <li>
      <Link to={`/app/learn/${l.id}`} className="row-link group flex items-center gap-3 px-4 py-2.5">
        <CourseMark name={l.courseName} id={l.courseId} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate">{l.courseName}</p>
          <p className="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4">
            {l.title}
            {l.topic ? <span className="font-normal text-ink/70"> · {l.topic}</span> : null}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs">
          {l.status === "processing" ? (
            <div className="flex flex-col items-end gap-1.5">
              <span className="flow-line flow-line--live block h-0.5 w-12 rounded-full" aria-hidden="true" />
              <p className="text-ink">{t.making}</p>
            </div>
          ) : (
            <>
              <p className="text-ink">{t.cards(l.cardCount)}</p>
              <p className="mt-0.5 text-slate">{formatDate(l.createdAt, lang)}</p>
            </>
          )}
        </div>
      </Link>
    </li>
  );
}

/** The empty state when there is no course yet: the one thing to do is add one. */
function FirstCourse() {
  const client = useQueryClient();
  const t = useCopy(COPY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    if (!name) return setError(t.nameNeeded);
    setBusy(true);
    try {
      await request("/courses", { method: "POST", body: { name } });
      await client.invalidateQueries({ queryKey: keys.courses });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.createFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split mt-5">
      <div className="window p-5">
        <p className="text-lg font-semibold">{t.first}</p>
        <p className="mt-1 max-w-read text-sm leading-relaxed text-slate">{t.firstText}</p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="first-course" className="sr-only">{t.courseName}</label>
          <input id="first-course" name="name" className="field sm:max-w-xs" placeholder={t.example} maxLength={80} />
          <button type="submit" disabled={busy} className="btn-ink">{t.add}</button>
        </form>
        <div className="mt-2"><ErrorLine>{error}</ErrorLine></div>
      </div>
      <div className="window flex items-center p-5">
        <NoteFlow className="w-full" />
      </div>
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
  const t = useCopy(COPY);
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
    if (!name) return setError(t.nameNeeded);
    try {
      if (course) await request(`/courses/${course.id}`, { method: "PATCH", body: { name } });
      else await request("/courses", { method: "POST", body: { name } });
      await refresh();
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.saveFailed);
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
      setError(err instanceof ApiError ? err.message : t.deleteFailed);
    }
  };

  return (
    <Dialog open={state !== null} onClose={close} title={course ? t.manageTitle : t.addTitle}>
      <form onSubmit={save} className="flex flex-col gap-3">
        <div>
          <label htmlFor="course-name" className="field-label">{t.courseName}</label>
          <input id="course-name" name="name" className="field" defaultValue={course?.name ?? ""} placeholder={t.example} maxLength={80} />
        </div>
        <ErrorLine>{error}</ErrorLine>
        <button type="submit" className="btn-ink">{course ? t.saveName : t.addShort}</button>
      </form>
      {course ? (
        <div className="mt-5 border-t border-rule pt-4">
          {confirming ? (
            <div>
              <p className="text-sm leading-relaxed text-ink">{t.deleteWarn(course.name)}</p>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={remove} className="btn-quiet border-maroon text-maroon hover:border-maroon-deep">{t.deleteCourse}</button>
                <button type="button" onClick={() => setConfirming(false)} className="btn-text">{t.cancel}</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="btn-text text-slate">{t.deleteThis}</button>
          )}
        </div>
      ) : null}
    </Dialog>
  );
}
