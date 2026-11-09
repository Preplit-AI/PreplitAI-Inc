import { useState } from "react";
import { Link } from "react-router-dom";
import { JunoAvatar } from "@/brand/Juno";
import { courseTone } from "@/app/parts";
import { AppTitle, LoadingLine } from "@/app/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useCopy, useLang } from "@/lib/lang";
import type { CourseSummary, ExamFact, Semester, WeekCell } from "@/lib/types";
import { CourseSettings } from "./CourseSettings";
import { dayCount, examLabel, junoLine } from "./junoLine";
import { AskJuno, JunoNote, PageHead, SectionHead } from "./kit";
import { movement } from "./movements";
import { useSemester } from "./queries";
import { semesterTitle } from "./Semester";
import { stateLabel, TrackLegend } from "./SemesterTrack";

/*
 * 04 Build. Every week's lectures pile up into what the exam needs: the whole
 * semester as one map (every course, every week), what has been built so far,
 * and each coming exam with what the lecturer flagged for it. Every number is
 * the server's.
 */

const COPY = {
  ko: {
    title: "쌓기",
    loadError: "이번 학기를 불러오지 못했어요. 새로고침해 주세요.",
    askExam: "시험 준비 묻기",
    askExamQ: "다음 시험까지 뭘 봐야 해?",
    prepare: "시험 준비",
    noDates: "시험 날짜를 넣으면 남은 날과 볼 것을 모아 둘게요.",
    noDatesSub: "교수님이 시험에 나온다고 한 부분, 어려운 카드, 녹음이 없는 주를 시험마다 정리해요.",
    noCourses: "과목을 추가하면 한 학기가 여기에 쌓여요.",
    putDate: (c: string) => `${c} 시험 날짜 넣기`,
    built: "이번 학기에 쌓인 것",
    stats: ["강의", "카드", "시험 힌트", "어려운 카드"],
    units: ["개", "장", "개", "장"],
    noSemester: "이번 학기에서 학기 시작일을 넣으면 주차별 지도가 그려져요.",
    exams: "시험 준비",
    undated: "시험 날짜가 없는 과목",
    putDateShort: (c: string) => `${c} 날짜 넣기`,
    caption: "과목별, 주차별 녹음",
    course: "과목",
    weekN: (w: number) => `${w}주차`,
    lectures: (n: number) => `강의 ${n}개`,
    flagged: "시험에 나온다고 한 부분",
    hard: "어려운 카드",
    gaps: "녹음 없는 주",
    none: "없음",
    weeks: (w: string) => `${w}주차`,
    count: (n: number, u: string) => `${n}${u}`,
    review: "이 과목 복습",
  },
  en: {
    title: "Build",
    loadError: "Couldn't load this semester. Please refresh.",
    askExam: "Ask about exam prep",
    askExamQ: "What should I study before the next exam?",
    prepare: "Prepare",
    noDates: "Add exam dates and I'll gather the days left and what to study.",
    noDatesSub: "For each exam: what the professor flagged, your hard cards, and weeks with no recording.",
    noCourses: "Add a course and the semester builds up here.",
    putDate: (c: string) => `Add ${c} exam dates`,
    built: "Built this semester",
    stats: ["Lectures", "Cards", "Exam hints", "Hard cards"],
    units: ["", "", "", ""],
    noSemester: "Add the semester's start date on This semester and the week map appears.",
    exams: "Exam prep",
    undated: "Courses without exam dates",
    putDateShort: (c: string) => `Add ${c} dates`,
    caption: "Recordings by course and week",
    course: "Course",
    weekN: (w: number) => `Week ${w}`,
    lectures: (n: number) => `${n} lecture${n === 1 ? "" : "s"}`,
    flagged: "Flagged for the exam",
    hard: "Hard cards",
    gaps: "Weeks with no recording",
    none: "None",
    weeks: (w: string) => `Week ${w}`,
    count: (n: number) => `${n}`,
    review: "Review this course",
  },
};

export default function Build() {
  const semester = useSemester();
  const t = useCopy(COPY);
  const { lang } = useLang();
  const [schedule, setSchedule] = useState<CourseSummary | null>(null);
  const m = movement("build");

  if (semester.isLoading) return <LoadingLine />;
  if (semester.error || !semester.data) return <p className="py-10 text-sm">{t.loadError}</p>;
  const data = semester.data;
  const exam = data.exams[0];
  const juno = exam ? junoLine({ kind: "exam-soon", ...exam }, lang) : null;
  const sum = (pick: (c: CourseSummary) => number) => data.courses.reduce((total, c) => total + pick(c), 0);
  const undated = data.courses.filter((c) => !c.midtermOn && !c.finalOn);
  const totals = [sum((c) => c.lectureCount ?? 0), sum((c) => c.totalCards), sum((c) => c.flaggedCount), sum((c) => c.hardCards)];

  return (
    <div>
      <AppTitle>{t.title}</AppTitle>
      <PageHead movement={m} actions={data.courses.length ? <AskJuno question={t.askExamQ}>{t.askExam}</AskJuno> : null} />

      {juno && exam ? (
        <JunoNote className="mt-5" say={juno.say} sub={juno.sub}>
          <Link to={`/workspace/courses/${exam.courseId}#exam`} className="btn-ink">{t.prepare}</Link>
        </JunoNote>
      ) : (
        <JunoNote className="mt-5" say={data.courses.length ? t.noDates : t.noCourses} sub={data.courses.length ? t.noDatesSub : undefined}>
          {undated[0] ? <button type="button" onClick={() => setSchedule(undated[0])} className="btn-ink">{t.putDate(undated[0].name)}</button> : null}
        </JunoNote>
      )}

      {data.courses.length ? (
        <section aria-labelledby="map-title" className="window mt-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <p className="eyebrow">{t.built}</p>
              <h2 id="map-title" className="mt-1 text-lg font-semibold">{data.semester ? semesterTitle(data.semester.name, lang) : t.title}</h2>
            </div>
            <dl className="grid grid-cols-4 gap-x-6">
              {totals.map((n, i) => (
                <div key={t.stats[i]}>
                  <dt className="text-2xs text-slate">{t.stats[i]}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{n}<span className="ml-0.5 text-xs font-normal text-slate">{t.units[i]}</span></dd>
                </div>
              ))}
            </dl>
          </div>
          {data.semester ? <SemesterMap courses={data.courses} semester={data.semester} /> : <p className="mt-4 text-sm text-slate">{t.noSemester}</p>}
        </section>
      ) : null}

      {data.exams.length || undated.length ? (
        <section aria-labelledby="exams-title" className="mt-7">
          <SectionHead id="exams-title" title={t.exams} />
          {data.exams.length ? (
            <ul className="cards-3 mt-2">
              {data.exams.map((e) => <ExamCard key={`${e.courseId}-${e.exam}`} exam={e} />)}
            </ul>
          ) : null}
          {undated.length ? (
            <div className="window mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <p className="min-w-0 flex-1 basis-60 text-sm text-slate">
                {t.undated}: <span className="text-ink">{undated.map((c) => c.name).join(", ")}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {undated.slice(0, 3).map((c) => (
                  <button key={c.id} type="button" onClick={() => setSchedule(c)} className="btn-quiet min-h-[30px] px-3 text-xs">{t.putDateShort(c.name)}</button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <CourseSettings open={schedule !== null} course={schedule} onClose={() => setSchedule(null)} />
    </div>
  );
}

function cellLook(cell: WeekCell | undefined, isNow: boolean) {
  if (!cell) return "bg-bone";
  return cn(
    cell.state === "done" && "bg-ink",
    cell.state === "processing" && "border border-gold-deep bg-gold-tint",
    cell.state === "gap" && "border border-dashed border-honey bg-transparent",
    cell.state !== "done" && cell.state !== "processing" && cell.state !== "gap" && (cell.exam ? "bg-gold" : "bg-bone"),
    cell.exam && cell.state === "done" && "shadow-[inset_0_-4px_0_rgb(248_208_0)]",
    isNow && "ring-2 ring-gold ring-offset-1",
  );
}

/** Every course, every week: the semester as Juno has filed it. A real table, so it reads in order. */
function SemesterMap({ courses, semester }: { courses: CourseSummary[]; semester: Semester }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const weeks = Array.from({ length: semester.weeks }, (_, i) => i + 1);
  const now = semester.currentWeek;
  return (
    <div className="mt-4">
      <div className="scroll-thin relative -mx-1 overflow-x-auto px-1 pb-1 pt-4">
        <table className="w-full min-w-[34rem] table-fixed border-separate border-spacing-[3px] text-left">
          <caption className="sr-only">{t.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[8.5rem] pb-1 text-2xs font-medium text-slate">{t.course}</th>
              {weeks.map((w) => (
                <th key={w} scope="col" className={cn("relative pb-1 text-center text-2xs font-medium tabular-nums", w === now ? "text-ink" : "text-slate-light")}>
                  {w === now ? (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <JunoAvatar size={16} />
                    </span>
                  ) : null}
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <th scope="row" className="pr-2 text-xs font-normal">
                  <Link to={`/workspace/courses/${course.id}`} className="flex items-center gap-2 hover:underline hover:underline-offset-4">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", courseTone(course.id).dot)} aria-hidden="true" />
                    <span className="min-w-0 truncate">{course.name}</span>
                  </Link>
                </th>
                {weeks.map((w) => {
                  const cell = course.cells.find((c) => c.week === w);
                  const label = cell
                    ? `${t.weekN(w)}${cell.exam ? ` ${examLabel(cell.exam, lang)}` : ""}, ${stateLabel(cell.state, lang)}${cell.lectures.length ? `, ${t.lectures(cell.lectures.length)}` : ""}`
                    : t.weekN(w);
                  const first = cell?.lectures[0];
                  return (
                    <td key={w} className="p-0">
                      {first ? (
                        <Link to={`/app/learn/${first.id}`} className={cn("block h-6 rounded transition-transform hover:-translate-y-0.5", cellLook(cell, w === now))}>
                          <span className="sr-only">{label}</span>
                        </Link>
                      ) : (
                        <span className={cn("block h-6 rounded", cellLook(cell, w === now))}>
                          <span className="sr-only">{label}</span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TrackLegend />
    </div>
  );
}

function ExamCard({ exam }: { exam: ExamFact }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  return (
    <li className="window flex min-w-0 flex-col p-4">
      <p className="eyebrow">{examLabel(exam.exam, lang)} · {formatDate(exam.on, lang)}</p>
      <p className="display mt-2 text-3xl tabular-nums">{dayCount(exam.days, lang)}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{exam.courseName}</p>
      <ul className="mt-3 space-y-1 border-t border-rule pt-3 text-xs">
        <li className="flex justify-between gap-3"><span className="text-slate">{t.flagged}</span><span className="tabular-nums">{exam.flagged}</span></li>
        <li className="flex justify-between gap-3"><span className="text-slate">{t.hard}</span><span className="tabular-nums">{exam.hard}</span></li>
        <li className="flex justify-between gap-3">
          <span className="text-slate">{t.gaps}</span>
          <span className={exam.gaps.length ? "text-honey" : ""}>{exam.gaps.length ? t.weeks(exam.gaps.join(", ")) : t.none}</span>
        </li>
      </ul>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        <Link to={`/workspace/courses/${exam.courseId}#exam`} className="btn-ink min-h-[30px] px-3 text-xs">{t.prepare}</Link>
        <Link to={`/app/remember?course=${exam.courseId}`} className="btn-quiet min-h-[30px] px-3 text-xs">{t.review}</Link>
      </div>
    </li>
  );
}
