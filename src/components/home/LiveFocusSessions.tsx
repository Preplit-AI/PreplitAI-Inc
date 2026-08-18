import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight } from "lucide-react";

export const LiveFocusSessions = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const [activeFilter, setActiveFilter] = useState<"all" | "progress" | "completed">("all");
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const coursesScrollRef = useRef<HTMLDivElement>(null);

  const handleCoursesScroll = () => {
    if (!coursesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = coursesScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const count = filteredCourses.length;
    const itemWidth = scrollWidth / count;
    const idx = Math.min(count - 1, Math.max(0, Math.round(scrollLeft / itemWidth)));
    setActiveCourseIndex(idx);
  };

  const scrollToCourse = (idx: number) => {
    if (!coursesScrollRef.current) return;
    const { scrollWidth } = coursesScrollRef.current;
    const count = filteredCourses.length;
    const itemWidth = scrollWidth / count;
    coursesScrollRef.current.scrollTo({ left: idx * itemWidth, behavior: "smooth" });
    setActiveCourseIndex(idx);
  };

  const courses = [
    {
      id: "dsa",
      name: "Data Structures & Algorithms",
      dept: "Computer Science",
      progress: 78,
      topics: "18 / 24 topics",
      streak: "12 days",
      chats: 24,
      status: "progress",
    },
    {
      id: "orgo",
      name: "Organic Chemistry II",
      dept: "Chemistry",
      progress: 92,
      topics: "22 / 24 topics",
      streak: "7 days",
      chats: 18,
      status: "progress",
    },
    {
      id: "networks",
      name: "Computer Networks",
      dept: "Computer Science",
      progress: 76,
      topics: "19 / 25 topics",
      streak: "5 days",
      chats: 31,
      status: "progress",
    },
    {
      id: "linalg",
      name: "Linear Algebra",
      dept: "Mathematics",
      progress: 68,
      topics: "17 / 25 topics",
      streak: "9 days",
      chats: 12,
      status: "progress",
    },
  ];

  const filteredCourses =
    activeFilter === "completed"
      ? courses.filter((c) => c.progress === 100)
      : courses;

  const weeklyData = [
    { day: "Mon", height: "35%" },
    { day: "Tue", height: "45%" },
    { day: "Wed", height: "40%" },
    { day: "Thu", height: "55%" },
    { day: "Fri", height: "70%" },
    { day: "Sat", height: "85%" },
    { day: "Sun", height: "100%" },
  ];

  return (
    <section className="py-6 sm:py-10 px-4 bg-[#f8f9fa] dark:bg-[#0c0c0c] border-t border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-5 sm:mb-7 gap-2">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111111] dark:text-white max-w-2xl leading-tight"
          >
            Track Your Learning Progress
            <br />
            All in One Place
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-xl"
          >
            See what you've learned, what to focus on next, and how close you are to mastering your courses.
          </motion.p>
        </div>

        {/* Main Learning Progress Dashboard Container Card (Compact & Proportional) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
          className="w-full rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs p-4 sm:p-5 space-y-4"
        >
          {/* Top Active Course Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-neutral-800">
            {/* Left: Active Course Identity */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                  Data Structures & Algorithms
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-bold">
                  Active Workspace
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Computer Science • Spring 2024
              </p>
            </div>

            {/* Right: Overall Progress & Streak */}
            <div className="flex items-center gap-5 sm:gap-6 shrink-0">
              {/* Overall Progress Widget */}
              <div>
                <span className="text-[10px] font-semibold text-neutral-400 block mb-0.5">
                  Overall Progress
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                    78%
                  </span>
                  <div className="w-24 sm:w-28 h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#550000] rounded-full w-[78%]" />
                  </div>
                </div>
                <span className="text-[9.5px] text-neutral-400 mt-0.5 block">
                  18 / 24 Topics Mastered
                </span>
              </div>

              {/* Streak Widget */}
              <div className="border-l border-slate-100 dark:border-neutral-800 pl-4">
                <p className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-tight">
                  12 Days
                </p>
                <p className="text-[9px] text-neutral-400 font-medium">Study Streak</p>
              </div>
            </div>
          </div>

          {/* Middle: 4 KPI Cards & Weekly Progress Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* 4 KPI Metrics Grid (Col Span 8) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* KPI 1 */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-neutral-800/30 p-2.5 border border-slate-100 dark:border-neutral-800/60 flex flex-col justify-between">
                <p className="text-[10px] font-medium text-neutral-400 leading-none">Study Time</p>
                <p className="text-base font-bold text-neutral-900 dark:text-white my-0.5 leading-tight">24h 36m</p>
                <p className="text-[9px] text-neutral-400 leading-none">This Week</p>
              </div>

              {/* KPI 2 */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-neutral-800/30 p-2.5 border border-slate-100 dark:border-neutral-800/60 flex flex-col justify-between">
                <p className="text-[10px] font-medium text-neutral-400 leading-none">Practice Score</p>
                <p className="text-base font-bold text-neutral-900 dark:text-white my-0.5 leading-tight flex items-baseline gap-1">
                  <span>87%</span>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">+10%</span>
                </p>
                <p className="text-[9px] text-neutral-400 leading-none">vs. last week</p>
              </div>

              {/* KPI 3 */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-neutral-800/30 p-2.5 border border-slate-100 dark:border-neutral-800/60 flex flex-col justify-between">
                <p className="text-[10px] font-medium text-neutral-400 leading-none">Questions Solved</p>
                <p className="text-base font-bold text-neutral-900 dark:text-white my-0.5 leading-tight">142</p>
                <p className="text-[9px] text-neutral-400 leading-none">This Week</p>
              </div>

              {/* KPI 4 */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-neutral-800/30 p-2.5 border border-slate-100 dark:border-neutral-800/60 flex flex-col justify-between">
                <p className="text-[10px] font-medium text-neutral-400 leading-none">Weak Areas</p>
                <p className="text-base font-bold text-neutral-900 dark:text-white my-0.5 leading-tight">2</p>
                <p className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold leading-none">Need Practice</p>
              </div>
            </div>

            {/* Weekly Progress Bar Chart (Col Span 4) */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 p-2.5 bg-slate-50/40 dark:bg-neutral-900/40 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-neutral-800 dark:text-white">Weekly Progress</span>
                <span className="text-[9px] text-neutral-400">24.6 hrs</span>
              </div>

              {/* Vertical Bars */}
              <div className="flex items-end justify-between h-16 pt-0.5 px-0.5">
                {weeklyData.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 flex-1 h-full justify-end">
                    <div className="w-3.5 bg-slate-100 dark:bg-neutral-800 rounded-xs h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-[#550000] dark:bg-rose-600 rounded-xs transition-all duration-500"
                        style={{ height: item.height }}
                      />
                    </div>
                    <span className="text-[8.5px] font-medium text-neutral-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table: "Your Course Workspaces" */}
          <div className="space-y-2 pt-0.5">
            {/* Header & Filter Tabs */}
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                {isKo ? "내 수강 과목 워크스페이스" : "Your Course Workspaces"}
              </h4>

              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`pb-0.5 border-b-2 transition-colors ${
                    activeFilter === "all"
                      ? "border-[#550000] text-[#550000] dark:text-rose-400 font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {isKo ? "전체 과목" : "All Courses"}
                </button>
                <button
                  onClick={() => setActiveFilter("progress")}
                  className={`pb-0.5 border-b-2 transition-colors ${
                    activeFilter === "progress"
                      ? "border-[#550000] text-[#550000] dark:text-rose-400 font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {isKo ? "학습 중" : "In Progress"}
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`pb-0.5 border-b-2 transition-colors ${
                    activeFilter === "completed"
                      ? "border-[#550000] text-[#550000] dark:text-rose-400 font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {isKo ? "완료" : "Completed"}
                </button>
              </div>
            </div>

            {/* Course Rows: Horizontally swipable cards on mobile, clean rows on desktop */}
            <div
              ref={coursesScrollRef}
              onScroll={handleCoursesScroll}
              className="flex overflow-x-auto pb-2.5 pt-0.5 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-3 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-col sm:space-y-1.5 sm:overflow-visible sm:pb-0"
            >
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className="w-[260px] xs:w-[280px] sm:w-auto shrink-0 sm:shrink snap-start flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2.5 p-3.5 sm:p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200/80 dark:border-neutral-800 hover:border-rose-200 dark:hover:border-rose-900/40 hover:shadow-2xs transition-all shadow-xs sm:shadow-none"
                >
                  {/* Course Identity */}
                  <div className="min-w-0 sm:min-w-[180px]">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{c.dept}</p>
                  </div>

                  {/* Progress Bar & Topics */}
                  <div className="flex items-center gap-2.5 sm:flex-1 sm:max-w-xs">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#550000] dark:bg-rose-600 rounded-full"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10.5px] font-bold text-neutral-900 dark:text-white block leading-none">
                        {c.progress}%
                      </span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">{c.topics}</span>
                    </div>
                  </div>

                  {/* Streak & Chats Metrics */}
                  <div className="flex items-center justify-between sm:justify-start gap-3.5 shrink-0 text-xs py-1.5 sm:py-0 border-y sm:border-y-0 border-slate-100 dark:border-neutral-800/80">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white leading-none block text-[10.5px]">
                        {c.streak}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">{isKo ? "연속 학습" : "Streak"}</span>
                    </div>

                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white leading-none block text-[10.5px]">
                        {c.chats}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">{isKo ? "AI 대화" : "AI Chats"}</span>
                    </div>
                  </div>

                  {/* Open Workspace Action Button */}
                  <a
                    href="/preplitai-chat"
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 sm:py-1 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#550000] dark:text-rose-300 font-semibold text-[11px] sm:text-[10.5px] transition-all shrink-0 active:scale-95 text-center"
                  >
                    <span>{isKo ? "워크스페이스 열기" : "Open Workspace"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            {/* Mobile Swipe Indicators & Remaining Counter */}
            {filteredCourses.length > 1 && (
              <div className="flex sm:hidden items-center justify-between px-1 pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  {filteredCourses.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToCourse(i)}
                      aria-label={`Go to course ${i + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        activeCourseIndex === i
                          ? "w-5 h-1.5 bg-[#550000] dark:bg-rose-500"
                          : "w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10.5px] font-semibold text-neutral-400 dark:text-neutral-500">
                  {isKo
                    ? `${activeCourseIndex + 1} / ${filteredCourses.length} (${filteredCourses.length - 1 - activeCourseIndex > 0 ? `${filteredCourses.length - 1 - activeCourseIndex}개 남음` : "끝"})`
                    : `${activeCourseIndex + 1} of ${filteredCourses.length} (${filteredCourses.length - 1 - activeCourseIndex > 0 ? `${filteredCourses.length - 1 - activeCourseIndex} left` : "end"})`}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Inside Banner */}
          <div className="rounded-xl bg-rose-50/40 dark:bg-rose-950/20 p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 border border-rose-100 dark:border-rose-900/30">
            <div>
              <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                {isKo ? "더 스마트하게, 덜 힘들게." : "Study smarter. Not harder."}
              </h5>
              <p className="text-[10.5px] text-neutral-500 dark:text-rose-300/70 mt-0.5">
                {isKo
                  ? "Preplit AI가 학업 진도를 추적하고 올바른 학습 경로를 안내합니다."
                  : "Let PreplitAI track your progress and keep you on the right path."}
              </p>
            </div>

            <a
              href="/preplitai-chat"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#550000] hover:bg-[#3d0000] text-white font-semibold text-[11px] shadow-xs transition-all active:scale-95 shrink-0"
            >
              <span>{isKo ? "내 워크스페이스로 이동" : "Go to My Workspace"}</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
