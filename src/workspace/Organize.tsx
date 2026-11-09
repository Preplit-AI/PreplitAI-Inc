import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CourseDot, CourseMark } from "@/app/parts";
import { AppTitle, LoadingLine } from "@/app/ui";
import { UploadDialog } from "@/app/UploadDialog";
import { useCopy, useLang } from "@/lib/lang";
import type { CellLecture, CourseSummary, SemesterOverview } from "@/lib/types";
import { CourseSettings } from "./CourseSettings";
import { classDaysLine, dayCount, examLabel } from "./junoLine";
import { JunoNote, PageHead, SectionHead } from "./kit";
import { movement } from "./movements";
import { useSemester } from "./queries";
import { RecordButton, RecordingNotices } from "./recorder/RecorderUI";

/*
 * 01 Organize. The student records; Juno files every lecture under its course
 * and its week. This screen shows that filing: the courses with their
 * schedules, and the semester's lectures week by week, with the weeks that have
 * nothing in them said plainly.
 */

const COPY = {
  ko: {
    title: "정리",
    loadError: "과목을 불러오지 못했어요. 새로고침해 주세요.",
    upload: "파일 올리기",
    courses: "과목",
    plusCourse: "+ 과목 추가",
    noCourses: "이번 학기에 듣는 과목을 추가하면, 녹음할 때 고르기만 하면 돼요.",
    which: "어떤 수업을 들어요?",
    whichSub: "과목을 추가하면 녹음마다 과목과 주차를 찾아 넣어 둘게요.",
    addCourse: "과목 추가",
    gap: (c: string, w: string) => `${c} ${w}주차 녹음이 없어요.`,
    gapMore: (n: number) => `다른 과목 ${n}개에도 빈 주가 있어요. 파일이나 녹취록으로 채울 수 있어요.`,
    gapOne: "파일이나 녹취록으로 채울 수 있어요.",
    fill: "파일로 채우기",
    filed: (c: number, l: number) => `과목 ${c}개, 강의 ${l}개를 주차별로 정리해 뒀어요.`,
    ready: (c: number) => `과목 ${c}개가 준비됐어요.`,
    noGaps: "빈 주는 없어요.",
    startHint: "수업이 시작되면 녹음을 눌러 주세요. 과목과 주차는 제가 맞출게요.",
    noDays: "수업 요일을 넣으면 수업 날 알려 드려요",
    today: "오늘 수업",
    lectures: "강의",
    cards: "카드",
    exam: "시험",
    noDate: "날짜 없음",
    missing: (w: string) => `${w}주차 녹음 없음`,
    record: "녹음",
    schedule: "일정",
    open: "과목 열기",
    byWeek: "주차별로 정리된 강의",
    seeAll: "배움에서 전체 보기",
    weekN: (w: number) => `${w}주차`,
    mid: "중간",
    fin: "기말",
    noRec: (c: string) => `${c} 녹음 없음`,
    making: "노트 만드는 중",
    cardsN: (n: number) => `카드 ${n}장`,
  },
  en: {
    title: "Organize",
    loadError: "Couldn't load your courses. Please refresh.",
    upload: "Upload a file",
    courses: "Courses",
    plusCourse: "+ Add a course",
    noCourses: "Add the courses you take this semester; then recording is just picking one.",
    which: "Which classes are you taking?",
    whichSub: "Add a course and I'll file every recording under its course and week.",
    addCourse: "Add a course",
    gap: (c: string, w: string) => `${c} has no recording in week ${w}.`,
    gapMore: (n: number) => `${n} other course${n === 1 ? " has" : "s have"} empty weeks too. You can fill them from a file or a transcript.`,
    gapOne: "You can fill it from a file or a transcript.",
    fill: "Fill from a file",
    filed: (c: number, l: number) => `${l} lecture${l === 1 ? "" : "s"} in ${c} course${c === 1 ? "" : "s"}, filed by week.`,
    ready: (c: number) => `${c} course${c === 1 ? " is" : "s are"} ready.`,
    noGaps: "No empty weeks.",
    startHint: "Press record when class starts. I'll match the course and week.",
    noDays: "Add class days and I'll remind you on the day",
    today: "Class today",
    lectures: "Lectures",
    cards: "Cards",
    exam: "Exam",
    noDate: "No date",
    missing: (w: string) => `No recording in week ${w}`,
    record: "Record",
    schedule: "Schedule",
    open: "Open course",
    byWeek: "Lectures, filed by week",
    seeAll: "See all in Learn",
    weekN: (w: number) => `Week ${w}`,
    mid: "Mid",
    fin: "Final",
    noRec: (c: string) => `${c}: no recording`,
    making: "Making a note",
    cardsN: (n: number) => `${n} card${n === 1 ? "" : "s"}`,
  },
};

export default function Organize() {
  const semester = useSemester();
  const t = useCopy(COPY);
  const [settings, setSettings] = useState<{ course: CourseSummary | null } | null>(null);
  const [upload, setUpload] = useState(false);
  const m = movement("organize");

  if (semester.isLoading) return <LoadingLine />;
  if (semester.error || !semester.data) return <p className="py-10 text-sm">{t.loadError}</p>;
  const data = semester.data;

  return (
    <div>
      <AppTitle>{t.title}</AppTitle>
      <PageHead
        movement={m}
        actions={
          data.courses.length ? (
            <>
              <button type="button" onClick={() => setUpload(true)} className="btn-quiet">{t.upload}</button>
              <RecordButton />
            </>
          ) : null
        }
      />

      <RecordingNotices className="mt-5" />

      <OrganizeNote overview={data} onAdd={() => setSettings({ course: null })} onUpload={() => setUpload(true)} />

      <section aria-labelledby="courses-title" className="mt-7">
        <SectionHead id="courses-title" title={t.courses} aside={<button type="button" onClick={() => setSettings({ course: null })} className="btn-text text-slate">{t.plusCourse}</button>} />
        {data.courses.length ? (
          <ul className="cards-3 mt-2">
            {data.courses.map((course) => <CourseCard key={course.id} course={course} onSchedule={() => setSettings({ course })} />)}
          </ul>
        ) : (
          <p className="window mt-2 px-4 py-4 text-sm text-slate">{t.noCourses}</p>
        )}
      </section>

      {data.courses.length ? <Filed overview={data} /> : null}

      <CourseSettings open={settings !== null} course={settings?.course ?? null} onClose={() => setSettings(null)} />
      <UploadDialog open={upload} onClose={() => setUpload(false)} courses={data.courses} />
    </div>
  );
}

/** What Juno has filed, or the one week it could not fill, in counts. */
function OrganizeNote({ overview, onAdd, onUpload }: { overview: SemesterOverview; onAdd: () => void; onUpload: () => void }) {
  const t = useCopy(COPY);
  if (!overview.courses.length) {
    return (
      <JunoNote className="mt-5" say={t.which} sub={t.whichSub}>
        <button type="button" onClick={onAdd} className="btn-ink">{t.addCourse}</button>
      </JunoNote>
    );
  }
  const withGaps = overview.courses.filter((c) => c.gaps.length);
  const lectures = overview.courses.reduce((sum, c) => sum + (c.lectureCount ?? 0), 0);
  if (withGaps.length) {
    const first = withGaps[0];
    return (
      <JunoNote className="mt-5" say={t.gap(first.name, first.gaps.join(", "))} sub={withGaps.length > 1 ? t.gapMore(withGaps.length - 1) : t.gapOne}>
        <button type="button" onClick={onUpload} className="btn-ink">{t.fill}</button>
      </JunoNote>
    );
  }
  return <JunoNote className="mt-5" say={lectures ? t.filed(overview.courses.length, lectures) : t.ready(overview.courses.length)} sub={lectures ? t.noGaps : t.startHint} />;
}

function CourseCard({ course, onSchedule }: { course: CourseSummary; onSchedule: () => void }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const days = classDaysLine(course.classDays, lang);
  return (
    <li className="window flex min-w-0 flex-col p-4">
      <div className="flex items-start gap-3">
        <CourseMark name={course.name} id={course.id} size="lg" />
        <div className="min-w-0 flex-1">
          <Link to={`/workspace/courses/${course.id}`} className="block truncate text-sm font-semibold hover:underline hover:underline-offset-4">{course.name}</Link>
          <p className="mt-0.5 truncate text-xs text-slate">{days ?? t.noDays}</p>
        </div>
        {course.classToday && !course.recordedToday ? <span className="shrink-0 rounded-full bg-maroon-tint px-2 py-0.5 text-2xs font-medium text-maroon">{t.today}</span> : null}
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-rule pt-3">
        <div>
          <dt className="text-2xs text-slate">{t.lectures}</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">{course.lectureCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-2xs text-slate">{t.cards}</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">{course.totalCards}</dd>
        </div>
        <div>
          <dt className="text-2xs text-slate">{course.nextExam ? examLabel(course.nextExam.kind, lang) : t.exam}</dt>
          <dd className={course.nextExam ? "mt-0.5 text-lg font-semibold tabular-nums" : "mt-1 text-xs text-slate"}>{course.nextExam ? dayCount(course.nextExam.days, lang) : t.noDate}</dd>
        </div>
      </dl>
      {course.gaps.length ? <p className="mt-2 text-xs text-honey">{t.missing(course.gaps.join(", "))}</p> : null}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <RecordButton courseId={course.id} label={t.record} className="min-h-[30px] px-3 text-xs" />
        <button type="button" onClick={onSchedule} className="btn-quiet min-h-[30px] px-3 text-xs">{t.schedule}</button>
        <Link to={`/workspace/courses/${course.id}`} className="btn-text ml-auto min-h-[30px] text-xs">{t.open}</Link>
      </div>
    </li>
  );
}

/** The semester's lectures as Juno filed them: newest week first, each lecture under its course. */
function Filed({ overview }: { overview: SemesterOverview }) {
  const t = useCopy(COPY);
  const weeks = useMemo(() => {
    const current = overview.semester ? Math.min(overview.semester.currentWeek, overview.semester.weeks) : Infinity;
    return overview.cells.filter((c) => c.week <= current && (c.lectures.length || c.missing.length)).reverse();
  }, [overview]);

  if (!weeks.length) return null;
  return (
    <section aria-labelledby="filed-title" className="mt-7">
      <SectionHead id="filed-title" title={t.byWeek} aside={<Link to="/app/learn" className="btn-text text-slate">{t.seeAll}</Link>} />
      <ol className="window mt-2 divide-y divide-rule overflow-hidden">
        {weeks.slice(0, 8).map((cell) => (
          <li key={cell.week} className="flex gap-4 px-4 py-3">
            <p className="w-16 shrink-0 pt-0.5 text-xs font-semibold tabular-nums">
              {t.weekN(cell.week)}
              {cell.exam ? <span className="mt-1 block w-fit rounded-full bg-gold/70 px-1.5 py-px text-2xs font-medium">{cell.exam === "midterm" ? t.mid : t.fin}</span> : null}
            </p>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {cell.lectures.map((lecture) => <FiledLecture key={lecture.id} lecture={lecture} />)}
              {cell.missing.map((name) => (
                <li key={name} className="flex items-center gap-2.5 text-xs text-honey">
                  <span className="h-2 w-2 shrink-0 rounded-full border border-dashed border-honey" aria-hidden="true" />
                  {t.noRec(name)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FiledLecture({ lecture }: { lecture: CellLecture }) {
  const t = useCopy(COPY);
  return (
    <li>
      <Link to={`/app/learn/${lecture.id}`} className="group flex items-center gap-2.5 text-sm">
        <CourseDot id={lecture.courseId} />
        <span className="min-w-0 flex-1 truncate">
          <span className="text-slate">{lecture.courseName}</span>{" "}
          <span className="font-medium group-hover:underline group-hover:underline-offset-4">{lecture.topic || lecture.title}</span>
        </span>
        <span className="shrink-0 text-xs text-slate">{lecture.status === "processing" ? t.making : t.cardsN(lecture.cardCount)}</span>
      </Link>
    </li>
  );
}
