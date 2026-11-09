import { Suspense, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { JunoAvatar } from "@/brand/Juno";
import { Wordmark } from "@/brand/Wordmark";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useCopy, useDocumentLang, useLang, type Lang } from "@/lib/lang";
import type { CourseSummary } from "@/lib/types";
import { CourseSettings } from "@/workspace/CourseSettings";
import { JunoProvider, useJuno } from "@/workspace/JunoDock";
import { dayCount, junoLine } from "@/workspace/junoLine";
import { NAV } from "@/workspace/movements";
import { useSemester } from "@/workspace/queries";
import { RecorderProvider, useRecorder } from "@/workspace/recorder/Recorder";
import { RecordButton, RecordDialog, RecordingBar } from "@/workspace/recorder/RecorderUI";
import { CourseDot } from "./parts";
import { LoadingLine } from "./ui";

/*
 * The signed-in shell: one workspace for the whole semester.
 *
 * On the left, the semester and its four movements, then the student's
 * courses, then Juno. On a phone the same five places are a tab bar. The
 * recorder and Juno live here, above the routes, so a class being recorded
 * and an answer being written stay with the student on every screen. The
 * logo leads back to the home page, in the language being read.
 */

const COPY = {
  ko: {
    loading: "불러오는 중",
    skip: "본문으로 건너뛰기",
    home: "Preplit AI 처음으로",
    flow: "학기의 흐름",
    courses: "과목",
    addCourse: "과목 추가",
    addHint: "듣는 과목을 추가하면 여기에 모여요.",
    account: "계정",
    record: "수업 녹음 시작",
    recordShort: "녹음",
    recording: (c: string) => `${c} 녹음 중`,
    listening: (c: string) => `${c} 수업을 같이 듣고 있어요.`,
    ask: "Juno에게 묻기",
    beside: "오른쪽에 있어요",
    today: "오늘",
    menu: "주 메뉴",
    aside: "워크스페이스",
    language: "언어",
  },
  en: {
    loading: "Loading",
    skip: "Skip to the content",
    home: "Preplit AI home",
    flow: "Semester flow",
    courses: "Courses",
    addCourse: "Add a course",
    addHint: "Add the courses you take and they gather here.",
    account: "Account",
    record: "Record a class",
    recordShort: "Record",
    recording: (c: string) => `Recording ${c}`,
    listening: (c: string) => `Listening to ${c} with you.`,
    ask: "Ask Juno",
    beside: "On the right",
    today: "Today",
    menu: "Main",
    aside: "Workspace",
    language: "Language",
  },
};

const homeHref = (lang: Lang) => (lang === "ko" ? "/ko/" : "/");

export function AppLayout() {
  const { status, user } = useAuth();
  const location = useLocation();
  const { lang } = useLang();
  const t = useCopy(COPY);
  useDocumentLang(lang);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true" aria-label={t.loading}>
        <JunoAvatar size={48} speaking />
      </div>
    );
  }
  if (status === "signed-out") {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const who = (user?.name || user?.email || "").trim();

  return (
    <RecorderProvider>
      <JunoProvider>
        <Shell who={who} />
      </JunoProvider>
    </RecorderProvider>
  );
}

function Shell({ who }: { who: string }) {
  const { docked } = useJuno();
  const { lang } = useLang();
  const t = useCopy(COPY);
  const [addCourse, setAddCourse] = useState(false);
  const initial = (who || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh bg-white font-kr text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {t.skip}
      </a>

      <Sidebar who={who} initial={initial} onAddCourse={() => setAddCourse(true)} />

      <div className={cn("min-w-0 transition-[padding] duration-300 lg:pl-60", docked && "min-[1600px]:pr-[37.5rem]")}>
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-rule bg-white/90 px-3 backdrop-blur-md lg:hidden">
          <a href={homeHref(lang)} aria-label={t.home} className="rounded-md">
            <Wordmark markClassName="h-6" className="[&>span:last-child]:text-base" />
          </a>
          <LangSwitch short className="ml-auto" />
          <RecordButton label={t.recordShort} className="min-h-[32px] px-3 text-xs" />
          <Link to="/app/account" aria-label={t.account} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-medium text-white">
            {initial}
          </Link>
        </header>
        <RecordingBar />
        <main id="main" className="cq mx-auto w-full max-w-[74rem] px-4 pb-32 pt-5 sm:px-6 lg:px-8 lg:pb-16 lg:pt-7">
          <Suspense fallback={<LoadingLine />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <TabBar />
      <RecordDialog />
      <CourseSettings open={addCourse} course={null} onClose={() => setAddCourse(false)} />
    </div>
  );
}

/** One switch for the whole site: the landing page, sign-in and the workspace read the same choice. */
function LangSwitch({ className, short = false }: { className?: string; short?: boolean }) {
  const { lang, setLang } = useLang();
  const t = useCopy(COPY);
  return (
    <div role="group" aria-label={t.language} className={cn("inline-flex rounded-full bg-bone p-0.5 text-2xs font-medium", className)}>
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn("rounded-full py-1 transition-colors", short ? "px-2" : "px-2.5", lang === l ? "bg-white text-ink shadow-window" : "text-slate hover:text-ink")}
        >
          {l === "ko" ? (short ? "KO" : "한국어") : "EN"}
        </button>
      ))}
    </div>
  );
}

function Sidebar({ who, initial, onAddCourse }: { who: string; initial: string; onAddCourse: () => void }) {
  const semester = useSemester();
  const { lang } = useLang();
  const t = useCopy(COPY);
  const courses = semester.data?.courses ?? [];
  const [home, ...movements] = NAV;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-rule bg-paper lg:flex" aria-label={t.aside}>
      <div className="flex h-14 shrink-0 items-center px-4">
        <a href={homeHref(lang)} aria-label={t.home} className="rounded-md">
          <Wordmark markClassName="h-6" className="[&>span:last-child]:text-[1.0625rem]" />
        </a>
      </div>

      <div className="px-3">
        <RecordButton label={t.record} className="w-full" />
        <LiveChip />
      </div>

      <nav aria-label={t.menu} className="mt-4 px-2">
        <SideLink to={home.to} end icon={home.icon} label={lang === "en" ? home.labelEn : home.label} />
        <p className="eyebrow mt-4 px-3 pb-1">{t.flow}</p>
        <ul>
          {movements.map((m) => (
            <li key={m.to}>
              <SideLink to={m.to} icon={m.icon} label={lang === "en" ? m.labelEn : m.label} n={m.n} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="scroll-thin mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex items-center justify-between px-3 pb-1">
          <p className="eyebrow">{t.courses}</p>
          <button type="button" onClick={onAddCourse} aria-label={t.addCourse} className="-mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-bone hover:text-ink">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        {courses.length ? (
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                <CourseLink course={course} />
              </li>
            ))}
          </ul>
        ) : semester.data ? (
          <button type="button" onClick={onAddCourse} className="mx-3 text-left text-xs leading-relaxed text-slate hover:text-ink">
            {t.addHint}
          </button>
        ) : null}
      </div>

      <JunoCard />

      <div className="flex shrink-0 items-center gap-2 border-t border-rule px-3 py-2.5">
        <Link to="/app/account" className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-bone">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-medium text-white">{initial}</span>
          <span className="min-w-0 flex-1 truncate text-sm">{who || t.account}</span>
        </Link>
        <LangSwitch />
      </div>
    </aside>
  );
}

function SideLink({ to, end, icon: Icon, label, n }: { to: string; end?: boolean; icon: (typeof NAV)[number]["icon"]; label: string; n?: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn("group flex h-8 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors", isActive ? "bg-ink font-medium text-white" : "text-ink hover:bg-bone")
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate group-hover:text-ink")} strokeWidth={1.7} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {n ? <span className={cn("text-2xs tabular-nums", isActive ? "text-white/60" : "text-slate-light")}>{n}</span> : null}
        </>
      )}
    </NavLink>
  );
}

function CourseLink({ course }: { course: CourseSummary }) {
  const { lang } = useLang();
  const t = useCopy(COPY);
  const exam = course.nextExam && course.nextExam.days <= 21 ? course.nextExam : null;
  return (
    <NavLink
      to={`/workspace/courses/${course.id}`}
      className={({ isActive }) => cn("flex h-8 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors", isActive ? "bg-bone-deep font-medium" : "hover:bg-bone")}
    >
      <CourseDot id={course.id} />
      <span className="min-w-0 flex-1 truncate">{course.name}</span>
      {course.classToday && !course.recordedToday ? <span className="text-2xs font-medium text-maroon">{t.today}</span> : null}
      {exam ? <span className="rounded bg-gold-tint px-1.5 py-px text-2xs font-medium tabular-nums text-honey">{dayCount(exam.days, lang)}</span> : null}
    </NavLink>
  );
}

/** While recording, the sidebar's record button becomes where the class is. */
function LiveChip() {
  const { phase, live } = useRecorder();
  const t = useCopy(COPY);
  if (phase !== "recording" || !live) return null;
  return (
    <p className="flex h-9 items-center gap-2 rounded-full bg-night px-3.5 text-sm font-medium text-white">
      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#ff3b4e]" aria-hidden="true" />
      <span className="min-w-0 truncate">{t.recording(live.courseName)}</span>
    </p>
  );
}

/** Juno, at the foot of every screen: what it sees now, and the way to ask. */
function JunoCard() {
  const semester = useSemester();
  const { open, isOpen, docked } = useJuno();
  const { phase, live } = useRecorder();
  const { lang } = useLang();
  const t = useCopy(COPY);
  const recording = phase === "recording" && live;
  const line = recording ? t.listening(live.courseName) : semester.data ? junoLine(semester.data.message, lang).say : null;

  return (
    <div className="on-night mx-2 mb-2 shrink-0 rounded-2xl bg-night p-3 text-night-text">
      <div className="flex items-center gap-2">
        <JunoAvatar size={24} tone="night" speaking={Boolean(recording || semester.data?.processing)} mood={recording ? "listen" : undefined} />
        <p className="text-xs font-semibold text-white">Juno</p>
        {docked && isOpen ? <span className="ml-auto text-2xs text-night-muted">{t.beside}</span> : null}
      </div>
      {line ? <p className="mt-2 line-clamp-3 text-xs leading-snug [@media(max-height:780px)]:line-clamp-2">{line}</p> : null}
      {docked && isOpen ? null : (
        <button type="button" onClick={() => open()} className="btn-light mt-2.5 min-h-[30px] w-full text-xs">
          {t.ask}
        </button>
      )}
    </div>
  );
}

/** The same five places on a phone. */
function TabBar() {
  const { lang } = useLang();
  const t = useCopy(COPY);
  return (
    <nav aria-label={t.menu} className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV.map(({ to, label, labelEn, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cn("flex h-14 flex-col items-center justify-center gap-0.5 text-2xs font-medium transition-colors", isActive ? "text-ink" : "text-slate")}>
              {({ isActive }) => (
                <>
                  <span className={cn("flex h-6 w-10 items-center justify-center rounded-full transition-colors", isActive && "bg-ink text-white")}>
                    <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="max-w-full truncate px-0.5">{lang === "en" ? labelEn : label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
