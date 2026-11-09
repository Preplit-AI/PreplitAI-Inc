import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CourseMark } from "@/app/parts";
import { AppTitle, LoadingLine } from "@/app/ui";
import { UploadDialog } from "@/app/UploadDialog";
import { formatDate } from "@/lib/format";
import { useCopy, useLang } from "@/lib/lang";
import type { CellLecture, CourseSpaceData } from "@/lib/types";
import { CourseSettings } from "./CourseSettings";
import { classDaysLine, dayCount, examLabel } from "./junoLine";
import { AskJuno, PageHead, SectionHead } from "./kit";
import { useCourseSpace } from "./queries";
import { RecordButton, RecordingNotices } from "./recorder/RecorderUI";
import { SemesterTrack } from "./SemesterTrack";

/*
 * One course's workspace: its whole semester in one place. Weeks and what was
 * recorded in them, what the lecturer flagged for the exam, and the cards.
 * Juno, opened from here, knows this is the course being looked at.
 */

const COPY = {
  ko: {
    course: "과목",
    notFound: "이 과목을 찾을 수 없어요.",
    back: "정리",
    schedule: "일정",
    noSchedule: "수업 요일과 시험 날짜를 넣으면 알려 드릴게요.",
    map: (c: string) => `${c} 학기 지도`,
    recorded: (n: number) => `${n}주 녹음`,
    noSemester: "이번 학기에서 학기 시작일을 넣으면 주차별로 정리돼요.",
    thisSemester: "이번 학기",
    notes: "주차별 노트",
    askSummary: "요약 묻기",
    askSummaryQ: "가장 최근 강의 요약해 줘",
    weekN: (w: number) => `${w}주차`,
    other: "그 외",
    examWeek: (e: string) => `${e} 주간`,
    missing: "녹음 없음",
    fill: "파일이나 녹취록으로 채우기",
    empty: "아직 녹음이 없어요. 다음 수업에서 녹음을 누르면 여기에 쌓여요.",
    making: (t: string) => `${t} 노트를 만드는 중이에요.`,
    meta: (d: string, c: number, f: number) => `${d} · 카드 ${c}장${f ? ` · 시험 힌트 ${f}개` : ""}`,
    exam: "시험 준비",
    askPrep: "정리 묻기",
    askPrepQ: (c: string, e: string) => `${c} ${e} 대비해서 시험에 나온다고 한 부분 정리해 줘`,
    noDate: "시험 날짜가 아직 없어요.",
    addDate: "날짜 넣기",
    flagged: (n: number) => `시험에 나온다고 한 부분${n ? ` ${n}개` : ""}`,
    noFlags: "교수님이 시험을 언급하면 강의마다 여기로 모여요.",
    gapWeeks: "녹음이 없는 주",
    weeks: (w: string) => `${w}주차`,
    cards: "카드",
    due: "오늘 복습",
    hard: "어려운 카드",
    total: "전체",
    reviewCourse: "이 과목 복습",
    noCards: "노트가 만들어지면 카드가 여기로 모여요.",
  },
  en: {
    course: "Course",
    notFound: "This course can't be found.",
    back: "Organize",
    schedule: "Schedule",
    noSchedule: "Add class days and exam dates and I'll keep you posted.",
    map: (c: string) => `${c} · semester map`,
    recorded: (n: number) => `${n} week${n === 1 ? "" : "s"} recorded`,
    noSemester: "Add the semester's start date on This semester and lectures are filed by week.",
    thisSemester: "This semester",
    notes: "Notes by week",
    askSummary: "Ask for a summary",
    askSummaryQ: "Summarize the latest lecture",
    weekN: (w: number) => `Week ${w}`,
    other: "Other",
    examWeek: (e: string) => `${e} week`,
    missing: "No recording",
    fill: "Fill from a file or transcript",
    empty: "No recordings yet. Press record in the next class and they collect here.",
    making: (t: string) => `Making the note for ${t}.`,
    meta: (d: string, c: number, f: number) => `${d} · ${c} card${c === 1 ? "" : "s"}${f ? ` · ${f} exam hint${f === 1 ? "" : "s"}` : ""}`,
    exam: "Exam prep",
    askPrep: "Ask for a recap",
    askPrepQ: (c: string, e: string) => `Sum up what was flagged for the ${c} ${e.toLowerCase()}`,
    noDate: "No exam date yet.",
    addDate: "Add a date",
    flagged: (n: number) => `Flagged for the exam${n ? ` (${n})` : ""}`,
    noFlags: "When the professor mentions the exam, it gathers here lecture by lecture.",
    gapWeeks: "Weeks with no recording",
    weeks: (w: string) => `Week ${w}`,
    cards: "Cards",
    due: "Due today",
    hard: "Hard",
    total: "Total",
    reviewCourse: "Review this course",
    noCards: "Cards gather here once notes are made.",
  },
};

export default function CourseSpace() {
  const { id = "" } = useParams();
  const space = useCourseSpace(id);
  const t = useCopy(COPY);
  const { lang } = useLang();
  const [settings, setSettings] = useState(false);
  const [uploadWeek, setUploadWeek] = useState(false);

  // Links like #exam are followed once the data below them has loaded.
  const loaded = Boolean(space.data);
  useEffect(() => {
    if (loaded && window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loaded]);

  if (space.isLoading) return <LoadingLine />;
  if (space.error || !space.data) {
    return (
      <div className="py-10">
        <AppTitle>{t.course}</AppTitle>
        <p className="text-base font-medium">{t.notFound}</p>
        <Link to="/workspace/organize" className="btn-text mt-2">{t.back}</Link>
      </div>
    );
  }

  const { course, semester } = space.data;
  const examLine = course.nextExam ? `${examLabel(course.nextExam.kind, lang)} ${dayCount(course.nextExam.days, lang)}` : null;

  return (
    <div>
      <AppTitle>{course.name}</AppTitle>
      <Link to="/workspace/organize" className="inline-flex min-h-[28px] items-center gap-1 text-xs font-medium text-slate hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {t.back}
      </Link>

      <PageHead
        className="mt-1"
        eyebrow={<><CourseMark name={course.name} id={course.id} size="sm" /> {t.course}</>}
        title={course.name}
        sub={[classDaysLine(course.classDays, lang), examLine].filter(Boolean).join(" · ") || t.noSchedule}
        actions={
          <>
            <button type="button" onClick={() => setSettings(true)} className="btn-quiet">{t.schedule}</button>
            <RecordButton courseId={course.id} />
          </>
        }
      />

      <RecordingNotices className="mt-5" />

      {semester ? (
        <section className="window mt-5 p-4 sm:p-5" aria-label={t.map(course.name)}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold">{t.map(course.name)}</h2>
            <p className="text-xs text-slate">{t.recorded(course.cells.filter((c) => c.state === "done").length)}</p>
          </div>
          <SemesterTrack cells={course.cells} currentWeek={semester.currentWeek} legend className="mt-1" />
        </section>
      ) : (
        <p className="mt-5 text-sm text-slate">
          <Link to="/workspace" className="font-medium text-ink underline underline-offset-4">{t.thisSemester}</Link> · {t.noSemester}
        </p>
      )}

      <div className="split mt-7 !gap-6">
        <div className="min-w-0">
          <Weeks data={space.data} onUpload={() => setUploadWeek(true)} />
        </div>
        <aside className="min-w-0 space-y-6">
          <ExamPrep data={space.data} onOpenSettings={() => setSettings(true)} />
          <CardsPanel data={space.data} />
        </aside>
      </div>

      <CourseSettings open={settings} course={course} onClose={() => setSettings(false)} />
      <UploadDialog open={uploadWeek} onClose={() => setUploadWeek(false)} courses={[course]} defaultCourseId={course.id} />
    </div>
  );
}

function Weeks({ data, onUpload }: { data: CourseSpaceData; onUpload: () => void }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const { course, semester, lectures } = data;
  const rows = useMemo(() => {
    if (!semester) return [{ week: null as number | null, lectures, gap: false, exam: null as string | null }];
    const inRange = course.cells
      .filter((cell) => cell.week <= semester.currentWeek && (cell.lectures.length || cell.state === "gap" || cell.exam))
      .reverse()
      .map((cell) => ({ week: cell.week as number | null, lectures: cell.lectures, gap: cell.state === "gap", exam: cell.exam ? examLabel(cell.exam, lang) : null }));
    const outside = lectures.filter((l) => !l.week || l.week < 1 || l.week > semester.weeks);
    return outside.length ? [...inRange, { week: null, lectures: outside, gap: false, exam: null }] : inRange;
  }, [course.cells, lectures, semester, lang]);

  return (
    <section aria-labelledby="weeks-title">
      <SectionHead id="weeks-title" title={t.notes} aside={<AskJuno question={t.askSummaryQ} small>{t.askSummary}</AskJuno>} />
      {rows.length && (rows[0].lectures.length || rows[0].gap || rows[0].exam) ? (
        <ol className="window mt-2 divide-y divide-rule overflow-hidden">
          {rows.map((row, index) => (
            <li key={row.week ?? `other-${index}`} className="flex gap-4 px-4 py-3">
              <p className="w-16 shrink-0 pt-0.5 text-xs font-semibold tabular-nums">{row.week ? t.weekN(row.week) : t.other}</p>
              <div className="min-w-0 flex-1 space-y-2">
                {row.lectures.map((lecture) => <LectureLine key={lecture.id} lecture={lecture} />)}
                {row.exam && !row.lectures.length ? <p className="w-fit rounded-full bg-gold/70 px-2 py-0.5 text-xs font-medium">{t.examWeek(row.exam)}</p> : null}
                {row.gap ? (
                  <p className="flex flex-wrap items-center gap-x-3 text-sm text-honey">
                    {t.missing}
                    <button type="button" onClick={onUpload} className="btn-text min-h-0 text-xs text-slate">{t.fill}</button>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="window mt-2 px-4 py-4 text-sm text-slate">{t.empty}</p>
      )}
    </section>
  );
}

function LectureLine({ lecture }: { lecture: CellLecture }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  if (lecture.status === "processing") {
    return (
      <p className="flex items-center gap-2.5 text-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold-deep" aria-hidden="true" />
        {t.making(lecture.title)}
      </p>
    );
  }
  return (
    <Link to={`/app/learn/${lecture.id}`} className="group block">
      <span className="block text-sm font-medium group-hover:underline group-hover:underline-offset-4">{lecture.topic || lecture.title}</span>
      <span className="block text-xs text-slate">{t.meta(formatDate(lecture.recordedAt, lang), lecture.cardCount, lecture.flaggedCount)}</span>
    </Link>
  );
}

function ExamPrep({ data, onOpenSettings }: { data: CourseSpaceData; onOpenSettings: () => void }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const { course, flagged } = data;
  return (
    <section id="exam" aria-labelledby="exam-title" className="scroll-mt-24">
      <SectionHead id="exam-title" title={t.exam} />
      <div className="window mt-2 p-4">
        {course.nextExam ? (
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-slate">{examLabel(course.nextExam.kind, lang)} · {formatDate(course.nextExam.on, lang)}</p>
              <p className="display mt-0.5 text-3xl tabular-nums">{dayCount(course.nextExam.days, lang)}</p>
            </div>
            <AskJuno question={t.askPrepQ(course.name, examLabel(course.nextExam.kind, lang))} small>{t.askPrep}</AskJuno>
          </div>
        ) : (
          <p className="text-sm text-ink/80">
            {t.noDate}{" "}
            <button type="button" onClick={onOpenSettings} className="font-medium text-ink underline underline-offset-4">{t.addDate}</button>
          </p>
        )}

        <h3 className="mt-4 text-sm font-semibold">{t.flagged(flagged.length)}</h3>
        {flagged.length ? (
          <ul className="mt-2 space-y-2.5 border-l-2 border-gold-deep pl-3">
            {flagged.map((item, index) => (
              <li key={`${item.lectureId}-${index}`} className="text-sm leading-relaxed">
                <Link to={`/app/learn/${item.lectureId}`} className="group block">
                  <span className="block group-hover:underline group-hover:underline-offset-4">{item.note || item.quote}</span>
                  <span className="block text-xs tabular-nums text-slate">{item.lectureTitle}{item.at ? ` ${item.at}` : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-slate">{t.noFlags}</p>
        )}

        {course.gaps.length ? (
          <p className="mt-4 text-sm">
            <span className="font-medium">{t.gapWeeks}</span>
            <span className="ml-2 text-honey">{t.weeks(course.gaps.join(", "))}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function CardsPanel({ data }: { data: CourseSpaceData }) {
  const t = useCopy(COPY);
  const { course } = data;
  return (
    <section aria-labelledby="cards-title">
      <SectionHead id="cards-title" title={t.cards} />
      <div className="window mt-2 p-4">
        {course.totalCards ? (
          <>
            <dl className="grid grid-cols-3 gap-3">
              <Fact label={t.due} value={course.dueCards} />
              <Fact label={t.hard} value={course.hardCards} />
              <Fact label={t.total} value={course.totalCards} />
            </dl>
            {course.dueCards ? <Link to={`/app/remember?course=${course.id}`} className="btn-ink mt-4 w-full">{t.reviewCourse}</Link> : null}
          </>
        ) : (
          <p className="text-sm text-slate">{t.noCards}</p>
        )}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-2xs text-slate">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
