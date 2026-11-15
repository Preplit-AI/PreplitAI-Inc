import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, X } from "lucide-react";
import { JunoAvatar, type JunoMood } from "@/brand/Juno";
import { CourseMark } from "@/app/parts";
import { keys } from "@/app/queries";
import { AppTitle, ErrorLine, LoadingLine } from "@/app/ui";
import { ApiError, request } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useCopy, useLang, type Lang } from "@/lib/lang";
import type { CourseSummary, SemesterMessage, SemesterOverview, WeekCell } from "@/lib/types";
import { CourseSettings } from "./CourseSettings";
import { useJuno } from "./JunoDock";
import { dayCount, examLabel, junoLine } from "./junoLine";
import { AskJuno, PageHead, SectionHead } from "./kit";
import { MOVEMENTS, type MovementKey } from "./movements";
import { NotificationPrompt } from "./Notifications";
import { semesterKeys, useSemester } from "./queries";
import { useRecorder } from "./recorder/Recorder";
import { RecordingNotices } from "./recorder/RecorderUI";
import { SemesterTrack } from "./SemesterTrack";

/*
 * Home: the semester as one journey. Juno says what matters today; beside it,
 * the four movements each say where they stand and lead there; below, the
 * semester's weeks with Juno on this one, this week, and the courses. Every
 * number here was counted by the server.
 */

const COPY = {
  ko: {
    title: "이번 학기",
    loadError: "이번 학기를 불러오지 못했어요. 새로고침해 주세요.",
    before: "학기 전",
    over: (w: number) => `${w}주 끝`,
    week: (w: number, of: number) => `${of}주 중 ${w}주차`,
    status: { recording: "수업을 같이 듣는 중", processing: "노트를 만드는 중", week: (w: number) => `${w}주차를 같이 보고 있어요`, follow: "이번 학기를 같이 따라가요" },
    listening: (c: string) => `${c} 수업을 같이 듣고 있어요.`,
    listeningSub: "수업이 끝나면 수업 끝을 누르세요. 이 화면을 켜 두면 돼요.",
    dismiss: "닫기",
    addCourse: "과목 추가",
    openNote: "노트 열기",
    record: "수업 녹음 시작",
    prepare: "시험 준비",
    review: "복습 시작",
    flow: "학기의 흐름",
    map: "학기 지도",
    recorded: (n: number, of: number) => `${of}주 중 ${n}주 녹음`,
    courses: "과목",
    plusCourse: "+ 과목 추가",
    thisWeek: (w: number) => `이번 주 · ${w}주차`,
    weekN: (w: number) => `${w}주차`,
    askWeek: (w: number) => `${w}주차에 뭐 배웠어?`,
    askWeekLabel: "요약 묻기",
    cards: (n: number) => `카드 ${n}장`,
    hints: (n: number) => `시험 힌트 ${n}개`,
    making: "노트 만드는 중",
    missing: "녹음 없음",
    examWeek: (e: string) => `${e} 주간이에요.`,
    future: "아직 오지 않은 주예요.",
    empty: "이 주에 녹음한 강의가 없어요.",
    latest: (t: string) => `최근 ${t}`,
    none: "아직 녹음이 없어요",
    classToday: "오늘 수업",
    todo: "오늘 할 일",
    todoCards: "오늘 카드",
    todoExam: (c: string, e: string) => `${c} ${e}`,
    todoClass: "오늘 수업",
    todoNote: "노트 만드는 중",
    actRecord: "녹음",
    actReview: "복습",
    actPrepare: "준비",
    actSee: "보기",
    setup: { start: "학기 시작일", next: "다음 학기 시작일", weeks: "학기 길이", unit: (w: number) => `${w}주`, save: "저장", fresh: "다음 학기 시작", failed: "저장하지 못했어요." },
    standing: {
      organize: { none: ["과목", "과목을 추가해 주세요"], courses: (n: number) => `과목 ${n}개`, lectures: (n: number) => `강의 ${n}개 정리됨`, tally: (n: number, d: number) => `지난 ${n}주 중 ${d}주 녹음` },
      learn: { now: "지금", making: "노트 만드는 중", latest: "최근 노트", waiting: "첫 녹음을 기다려요" },
      remember: { label: "오늘의 카드", none: "오늘은 없어요", left: (n: number) => `${n}장 남음`, all: (n: number) => `${n}장 모두 봄` },
      build: { cards: "쌓인 카드", count: (n: number) => `카드 ${n}장`, noExam: "시험 날짜를 넣어 주세요" },
    },
  },
  en: {
    title: "This semester",
    loadError: "Couldn't load this semester. Please refresh.",
    before: "Before the semester",
    over: (w: number) => `All ${w} weeks done`,
    week: (w: number, of: number) => `Week ${w} of ${of}`,
    status: { recording: "Listening to class with you", processing: "Making a note", week: (w: number) => `Following week ${w} with you`, follow: "Following the semester with you" },
    listening: (c: string) => `Listening to ${c} with you.`,
    listeningSub: "Press End class when it's over. Just keep this screen on.",
    dismiss: "Dismiss",
    addCourse: "Add a course",
    openNote: "Open the note",
    record: "Record a class",
    prepare: "Prepare for the exam",
    review: "Start review",
    flow: "Semester flow",
    map: "Semester map",
    recorded: (n: number, of: number) => `${n} of ${of} weeks recorded`,
    courses: "Courses",
    plusCourse: "+ Add a course",
    thisWeek: (w: number) => `This week · week ${w}`,
    weekN: (w: number) => `Week ${w}`,
    askWeek: (w: number) => `What did I learn in week ${w}?`,
    askWeekLabel: "Ask for a summary",
    cards: (n: number) => `${n} card${n === 1 ? "" : "s"}`,
    hints: (n: number) => `${n} exam hint${n === 1 ? "" : "s"}`,
    making: "Making a note",
    missing: "No recording",
    examWeek: (e: string) => `${e} week.`,
    future: "This week hasn't come yet.",
    empty: "No lectures were recorded this week.",
    latest: (t: string) => `Latest: ${t}`,
    none: "No recordings yet",
    classToday: "Class today",
    todo: "Today",
    todoCards: "Cards today",
    todoExam: (c: string, e: string) => `${c} ${e.toLowerCase()}`,
    todoClass: "Class today",
    todoNote: "Making a note",
    actRecord: "Record",
    actReview: "Review",
    actPrepare: "Prepare",
    actSee: "See",
    setup: { start: "Semester start", next: "Next semester's start", weeks: "Length", unit: (w: number) => `${w} weeks`, save: "Save", fresh: "Start the next semester", failed: "Couldn't save." },
    standing: {
      organize: { none: ["Courses", "Add your courses"], courses: (n: number) => `${n} course${n === 1 ? "" : "s"}`, lectures: (n: number) => `${n} lecture${n === 1 ? "" : "s"} filed`, tally: (n: number, d: number) => `${d} of the last ${n} weeks recorded` },
      learn: { now: "Now", making: "Making a note", latest: "Latest note", waiting: "Waiting for your first recording" },
      remember: { label: "Today's cards", none: "None today", left: (n: number) => `${n} left`, all: (n: number) => `All ${n} done` },
      build: { cards: "Cards built", count: (n: number) => `${n} cards`, noExam: "Add your exam dates" },
    },
  },
};

type Copy = (typeof COPY)["ko"];

/** "2026년 2학기" from the server reads "Fall 2026" in English. */
export function semesterTitle(name: string, lang: Lang) {
  if (lang !== "en") return name;
  const m = name.match(/^(\d{4})년 ([12])학기$/);
  return m ? `${m[2] === "1" ? "Spring" : "Fall"} ${m[1]}` : name;
}

export default function Semester() {
  const semester = useSemester();
  const t = useCopy(COPY);
  const { lang } = useLang();
  const [settings, setSettings] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const data = semester.data;
  const currentWeek = data?.semester ? Math.min(data.semester.currentWeek, data.semester.weeks) : null;
  useEffect(() => {
    if (currentWeek && selected === null) setSelected(Math.max(1, currentWeek));
  }, [currentWeek, selected]);

  if (semester.isLoading) return <LoadingLine />;
  if (semester.error || !data) return <p className="py-10 text-sm">{t.loadError}</p>;

  const cell = data.cells.find((c) => c.week === selected) ?? null;
  const recordedWeeks = data.cells.filter((c) => c.state === "done").length;

  return (
    <div>
      <AppTitle>{t.title}</AppTitle>
      <PageHead
        eyebrow={data.semester ? weekLine(data, t) : "Preplit AI"}
        title={data.semester ? semesterTitle(data.semester.name, lang) : t.title}
        sub={todayLine(data.today, lang)}
        actions={data.courses.length ? <AskJuno /> : null}
      />

      <RecordingNotices className="mt-5" />

      <div className="split mt-5 !gap-4">
        <JunoToday overview={data} onAddCourse={() => setSettings(true)} />
        <Flow overview={data} />
      </div>

      {data.semester ? (
        <section className="window mt-4 p-4 sm:p-5" aria-label={t.map}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold">{t.map}</h2>
            <p className="text-xs text-slate">{t.recorded(recordedWeeks, data.semester.weeks)}</p>
          </div>
          <SemesterTrack cells={data.cells} currentWeek={data.semester.currentWeek} selected={selected} onSelect={setSelected} legend className="mt-1" />
        </section>
      ) : null}

      {data.semester ? <NotificationPrompt className="mt-4" /> : null}

      {data.courses.length ? (
        <div className="split mt-6 !gap-6">
          <div className="min-w-0">{cell ? <WeekDetail cell={cell} currentWeek={currentWeek} /> : null}</div>
          <section className="min-w-0" aria-labelledby="courses-title">
            <SectionHead id="courses-title" title={t.courses} aside={<button type="button" onClick={() => setSettings(true)} className="btn-text text-slate">{t.plusCourse}</button>} />
            <ul className="window mt-2 divide-y divide-rule overflow-hidden">
              {data.courses.map((course) => <CourseRow key={course.id} course={course} />)}
            </ul>
          </section>
        </div>
      ) : null}

      <CourseSettings open={settings} course={null} onClose={() => setSettings(false)} />
    </div>
  );
}

function weekLine(data: SemesterOverview, t: Copy) {
  const { currentWeek, weeks } = data.semester!;
  if (currentWeek < 1) return t.before;
  if (currentWeek > weeks) return t.over(weeks);
  return t.week(currentWeek, weeks);
}

function todayLine(today: string, lang: Lang) {
  const date = new Date(`${today.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

/** Juno: what it has to say today, and the one thing to do about it. */
/** How Juno looks while it says this: pleased with a finished note, resting on a quiet day. */
function moodFor(message: SemesterMessage): JunoMood | undefined {
  if (message.kind === "lecture") return message.message.kind === "ready" ? "found" : undefined;
  if (message.kind === "cards-finished" || message.kind === "semester-over") return "happy";
  if (message.kind === "quiet") return "rest";
  return undefined;
}

function JunoToday({ overview, onAddCourse }: { overview: SemesterOverview; onAddCourse: () => void }) {
  const { phase, live, openDialog } = useRecorder();
  const client = useQueryClient();
  const t = useCopy(COPY);
  const { lang } = useLang();
  const message = overview.message;

  const dismiss = useMutation({
    mutationFn: (lectureId: string) => request(`/juno/${lectureId}/dismiss`, { method: "POST" }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: semesterKeys.all });
      client.invalidateQueries({ queryKey: keys.juno });
    },
  });

  const recording = phase === "recording" && live;
  const line = recording ? { say: t.listening(live.courseName), sub: t.listeningSub } : junoLine(message, lang);
  const working = Boolean(recording) || overview.processing;
  const s = overview.semester;
  const status = recording
    ? t.status.recording
    : overview.processing
      ? t.status.processing
      : s && s.currentWeek >= 1 && s.currentWeek <= s.weeks
        ? t.status.week(s.currentWeek)
        : t.status.follow;

  return (
    <section className="window flex min-w-0 flex-col p-4 sm:p-5" role="status" aria-label="Juno">
      <div className="flex items-center gap-2.5">
        <JunoAvatar size={32} speaking={working} mood={recording ? "listen" : overview.processing ? "work" : moodFor(message)} />
        <p className="min-w-0 flex-1 text-xs text-slate">
          <span className="font-semibold text-ink">Juno</span> · {status}
        </p>
        {!recording && message.kind === "lecture" ? (
          <button type="button" onClick={() => dismiss.mutate(message.message.lectureId)} aria-label={t.dismiss} className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-bone hover:text-ink">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-lg font-semibold leading-snug">{line.say}</p>
      {line.sub ? <p className="mt-1 text-sm leading-relaxed text-slate">{line.sub}</p> : null}
      {recording ? null : <TodayList overview={overview} openRecord={openDialog} />}
      {recording ? null : (
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <JunoAction message={message} onAddCourse={onAddCourse} openRecord={openDialog} t={t} />
        </div>
      )}
    </section>
  );
}

/** What there is to do today, each with its one action. Only what the server counted. */
function TodayList({ overview, openRecord }: { overview: SemesterOverview; openRecord: (courseId?: string | null) => void }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  type Row = { key: string; label: string; fact: string; action: { text: string; to?: string; record?: string } };
  const rows: Row[] = [];
  for (const c of overview.classToday) {
    if (!c.recordedToday) rows.push({ key: `class-${c.courseId}`, label: t.todoClass, fact: c.courseName, action: { text: t.actRecord, record: c.courseId } });
  }
  if (overview.review.due) rows.push({ key: "cards", label: t.todoCards, fact: t.cards(overview.review.due), action: { text: t.actReview, to: "/app/remember" } });
  const exam = overview.exams[0];
  if (exam) {
    rows.push({
      key: "exam",
      label: t.todoExam(exam.courseName, examLabel(exam.exam, lang)),
      fact: dayCount(exam.days, lang),
      action: { text: t.actPrepare, to: `/workspace/courses/${exam.courseId}#exam` },
    });
  }
  if (overview.processing && overview.latestNote?.status === "processing") {
    rows.push({ key: "note", label: t.todoNote, fact: overview.latestNote.title, action: { text: t.actSee, to: "/app/learn" } });
  }
  if (!rows.length) return null;
  return (
    <div className="mt-4">
      <p className="eyebrow">{t.todo}</p>
      <ul className="mt-1.5 divide-y divide-rule rounded-xl border border-rule">
        {rows.slice(0, 4).map((row) => (
          <li key={row.key} className="flex items-center gap-3 px-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-2xs text-slate">{row.label}</span>
              <span className="block truncate text-sm font-medium">{row.fact}</span>
            </span>
            {row.action.record ? (
              <button type="button" onClick={() => openRecord(row.action.record)} className="btn-record min-h-[28px] px-3 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                {row.action.text}
              </button>
            ) : (
              <Link to={row.action.to!} className="btn-quiet min-h-[28px] px-3 text-xs">{row.action.text}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function JunoAction({ message, onAddCourse, openRecord, t }: { message: SemesterMessage; onAddCourse: () => void; openRecord: (courseId?: string | null) => void; t: Copy }) {
  switch (message.kind) {
    case "first-course":
      return <button type="button" onClick={onAddCourse} className="btn-ink">{t.addCourse}</button>;
    case "setup":
      return <SemesterSetup />;
    case "lecture":
      return message.message.kind === "failed" ? null : <Link to={`/app/learn/${message.message.lectureId}`} className="btn-ink">{t.openNote}</Link>;
    case "class-today":
      return (
        <button type="button" onClick={() => openRecord(message.courseId)} className="btn-ink">
          <span className="h-2 w-2 rounded-full bg-maroon ring-2 ring-white/90" aria-hidden="true" />
          {t.record}
        </button>
      );
    case "exam-soon":
      return <Link to={`/workspace/courses/${message.courseId}#exam`} className="btn-ink">{t.prepare}</Link>;
    case "cards-due":
      return <Link to="/app/remember" className="btn-ink">{t.review}</Link>;
    case "semester-over":
      return <SemesterSetup fresh />;
    default:
      return <AskJuno />;
  }
}

/** The usual start of the semester a student is probably in. They confirm it; it is never assumed. */
function likelyStart(today = new Date()) {
  const kst = new Date(today.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1;
  if (month >= 2 && month <= 7) return `${year}-03-02`;
  return `${month === 1 ? year - 1 : year}-09-01`;
}

function SemesterSetup({ fresh = false }: { fresh?: boolean }) {
  const client = useQueryClient();
  const t = useCopy(COPY).setup;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await request("/semester", { method: "PUT", body: { startsOn: String(data.get("startsOn") ?? ""), weeks: Number(data.get("weeks")), fresh } });
      await client.invalidateQueries({ queryKey: semesterKeys.all });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="w-full max-w-lg">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="semester-start" className="field-label">{fresh ? t.next : t.start}</label>
          <input id="semester-start" name="startsOn" type="date" required className="field" defaultValue={fresh ? "" : likelyStart()} />
        </div>
        <div>
          <label htmlFor="semester-weeks" className="field-label">{t.weeks}</label>
          <select id="semester-weeks" name="weeks" defaultValue="16" className="field">
            {[14, 15, 16, 17, 18].map((w) => <option key={w} value={w}>{t.unit(w)}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-2"><ErrorLine>{error}</ErrorLine></div>
      <button type="submit" disabled={busy} className="btn-ink mt-2">{fresh ? t.fresh : t.save}</button>
    </form>
  );
}

type Standing = { label: string; value: string };

/** Where each movement stands right now, from the server's counts. */
function standing(key: MovementKey, o: SemesterOverview, t: Copy, lang: Lang): Standing {
  const s = t.standing;
  switch (key) {
    case "organize": {
      if (!o.courses.length) return { label: s.organize.none[0], value: s.organize.none[1] };
      const lectures = o.courses.reduce((sum, c) => sum + (c.lectureCount ?? 0), 0);
      return { label: s.organize.courses(o.courses.length), value: s.organize.lectures(lectures) };
    }
    case "learn":
      if (o.processing) return { label: s.learn.now, value: s.learn.making };
      return o.latestNote ? { label: s.learn.latest, value: `${o.latestNote.courseName} · ${o.latestNote.topic || o.latestNote.title}` } : { label: s.learn.latest, value: s.learn.waiting };
    case "remember": {
      const total = o.review.due + o.review.done;
      if (!total) return { label: s.remember.label, value: s.remember.none };
      return { label: s.remember.label, value: o.review.due ? s.remember.left(o.review.due) : s.remember.all(total) };
    }
    case "build": {
      const exam = o.exams[0];
      const cards = o.courses.reduce((sum, c) => sum + c.totalCards, 0);
      if (exam) return { label: `${exam.courseName} ${examLabel(exam.exam, lang)}`, value: `${dayCount(exam.days, lang)} · ${s.build.count(cards)}` };
      return { label: s.build.cards, value: cards ? s.build.count(cards) : s.build.noExam };
    }
  }
}

/** The four movements of the semester, each saying where it stands and leading there. */
function Flow({ overview }: { overview: SemesterOverview }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  return (
    <section className="window min-w-0 overflow-hidden" aria-labelledby="flow-title">
      <h2 id="flow-title" className="border-b border-rule px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate">{t.flow}</h2>
      <ol>
        {MOVEMENTS.map((m) => {
          const st = standing(m.key, overview, t, lang);
          const Icon = m.icon;
          const words = m.words[lang];
          return (
            <li key={m.key} className="border-b border-rule last:border-b-0">
              <Link to={m.to} className="row-link group flex items-center gap-3 px-4 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bone text-ink">
                  <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-2xs tabular-nums text-slate">{m.n}</span>
                    <span className="text-sm font-semibold">{words.name}</span>
                  </span>
                  <span className="block truncate text-xs text-slate">{words.slogan}</span>
                </span>
                <span className="hidden min-w-0 max-w-[13rem] text-right sm:block">
                  <span className="block truncate text-2xs text-slate">{st.label}</span>
                  <span className="block truncate text-sm font-medium">{st.value}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-light transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function WeekDetail({ cell, currentWeek }: { cell: WeekCell; currentWeek: number | null }) {
  const isNow = cell.week === currentWeek;
  const { open } = useJuno();
  const t = useCopy(COPY);
  const { lang } = useLang();
  return (
    <section aria-labelledby="week-title">
      <SectionHead
        id="week-title"
        title={isNow ? t.thisWeek(cell.week) : t.weekN(cell.week)}
        aside={cell.lectures.length ? <button type="button" onClick={() => open(t.askWeek(cell.week))} className="btn-text text-slate">{t.askWeekLabel}</button> : null}
      />
      {cell.lectures.length || cell.missing.length ? (
        <ul className="window mt-2 divide-y divide-rule overflow-hidden">
          {cell.lectures.map((lecture) => (
            <li key={lecture.id}>
              <Link to={`/app/learn/${lecture.id}`} className="row-link group flex items-center gap-3 px-4 py-2.5">
                <CourseMark name={lecture.courseName} id={lecture.courseId} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate">{lecture.courseName}</p>
                  <p className="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4">{lecture.topic || lecture.title}</p>
                </div>
                <p className="shrink-0 text-right text-xs text-slate">
                  {lecture.status === "processing" ? t.making : (
                    <>
                      {t.cards(lecture.cardCount)}
                      {lecture.flaggedCount ? <span className="block text-honey">{t.hints(lecture.flaggedCount)}</span> : null}
                    </>
                  )}
                </p>
              </Link>
            </li>
          ))}
          {cell.missing.map((name) => (
            <li key={name} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <p className="min-w-0 truncate text-sm text-ink/80">{name}</p>
              <p className="shrink-0 rounded-full border border-dashed border-honey px-2 py-0.5 text-2xs font-medium text-honey">{t.missing}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="window mt-2 px-4 py-4 text-sm text-slate">
          {cell.exam ? t.examWeek(examLabel(cell.exam, lang)) : cell.week > (currentWeek ?? 0) ? t.future : t.empty}
        </p>
      )}
    </section>
  );
}

function CourseRow({ course }: { course: CourseSummary }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const facts = [
    course.nextExam ? `${examLabel(course.nextExam.kind, lang)} ${dayCount(course.nextExam.days, lang)}` : null,
    course.flaggedCount ? t.hints(course.flaggedCount) : null,
    course.dueCards ? t.cards(course.dueCards) : null,
  ].filter(Boolean);
  return (
    <li>
      <Link to={`/workspace/courses/${course.id}`} className="row-link group flex items-center gap-3 px-4 py-2.5">
        <CourseMark name={course.name} id={course.id} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4">{course.name}</p>
          <p className="truncate text-xs text-slate">{facts.length ? facts.join(" · ") : course.lastLecture ? t.latest(course.lastLecture.title) : t.none}</p>
        </div>
        {course.classToday && !course.recordedToday ? <span className="shrink-0 rounded-full bg-maroon-tint px-2 py-0.5 text-2xs font-medium text-maroon">{t.classToday}</span> : null}
        <ChevronRight className={cn("h-4 w-4 shrink-0 text-slate-light")} aria-hidden="true" />
      </Link>
    </li>
  );
}
