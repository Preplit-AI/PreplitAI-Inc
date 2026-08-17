import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  FileText,
  Target,
  Flame,
  MessageSquare,
  ChevronRight,
  Trophy,
  Laptop,
  FlaskConical,
  Code2,
  TrendingUp,
} from "lucide-react";

export const LiveFocusSessions = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const [activeFilter, setActiveFilter] = useState<"all" | "progress" | "completed">("all");

  const courses = [
    {
      id: "dsa",
      name: "Data Structures & Algorithms",
      dept: "Computer Science",
      icon: Laptop,
      iconColor: "text-[#550000] bg-rose-50 dark:bg-rose-950/50",
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
      icon: FlaskConical,
      iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
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
      icon: Code2,
      iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
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
      icon: TrendingUp,
      iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
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
    <section className="py-20 sm:py-28 px-4 bg-[#f8f9fa] dark:bg-[#0c0c0c] border-t border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Section Header with Badge */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-12 sm:mb-14 gap-3">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-[#550000] dark:text-rose-300 text-xs font-semibold shadow-2xs mb-1"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Course Workspace</span>
          </motion.div>

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

        {/* Main Learning Progress Dashboard Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" as const, bounce: 0 }}
          className="w-full rounded-[28px] border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm p-6 sm:p-8 space-y-7"
        >
          {/* Top Active Course Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-neutral-800">
            {/* Left: Active Course Identity */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#550000] dark:text-rose-300 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Data Structures & Algorithms
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active Workspace
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Computer Science • Spring 2024
                </p>
              </div>
            </div>

            {/* Right: Overall Progress & Streak Badge */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0">
              {/* Overall Progress Widget */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Overall Progress
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">
                    78%
                  </span>
                  <div className="w-36 h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#550000] rounded-full w-[78%]" />
                  </div>
                </div>
                <span className="text-[10.5px] text-neutral-400 mt-1 block">
                  18 / 24 Topics Mastered
                </span>
              </div>

              {/* Streak Widget */}
              <div className="border-l border-slate-100 dark:border-neutral-800 pl-6 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#550000] dark:text-rose-300 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 fill-[#550000] text-[#550000] dark:fill-rose-400 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                    12 Days
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">Study Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: 4 KPI Cards & Weekly Progress Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* 4 KPI Metrics Grid (Col Span 8) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* KPI 1 */}
              <div className="rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 p-4 border border-rose-100 dark:border-rose-900/30 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-rose-900/50 text-[#550000] dark:text-rose-300 flex items-center justify-center mb-3 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-rose-300/70">Study Time</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5 leading-tight">24h 36m</p>
                  <p className="text-[10px] text-neutral-400 mt-1">This Week</p>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="rounded-2xl bg-[#eefbee] dark:bg-[#102316] p-4 border border-[#cbe8c3]/80 dark:border-emerald-900/30 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-emerald-300/70">Practice Score</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5 leading-tight flex items-baseline gap-1">
                    <span>87%</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">▲ 10%</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">vs. last week</p>
                </div>
              </div>

              {/* KPI 3 */}
              <div className="rounded-2xl bg-[#eef6ff] dark:bg-[#101e30] p-4 border border-[#cfe2ff]/80 dark:border-sky-900/30 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-sky-900/50 text-blue-600 dark:text-sky-300 flex items-center justify-center mb-3 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-sky-300/70">Questions Solved</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5 leading-tight">142</p>
                  <p className="text-[10px] text-neutral-400 mt-1">This Week</p>
                </div>
              </div>

              {/* KPI 4 */}
              <div className="rounded-2xl bg-[#fff0f2] dark:bg-[#271217] p-4 border border-[#ffd1d9]/80 dark:border-rose-900/30 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center mb-3 shadow-2xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-rose-300/70">Weak Areas</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5 leading-tight">2</p>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">Need More Practice</p>
                </div>
              </div>
            </div>

            {/* Weekly Progress Bar Chart in Maroon */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 bg-slate-50/50 dark:bg-neutral-900/40 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-white">Weekly Progress</span>
                <span className="text-[10px] text-neutral-400">Total 24.6 hrs</span>
              </div>

              {/* Vertical Bars in Maroon */}
              <div className="flex items-end justify-between h-28 pt-2 px-1">
                {weeklyData.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                    <div className="w-5 bg-slate-100 dark:bg-neutral-800 rounded-md h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-[#550000] dark:bg-rose-600 rounded-sm transition-all duration-500"
                        style={{ height: item.height }}
                      />
                    </div>
                    <span className="text-[9.5px] font-semibold text-neutral-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table: "Your Course Workspaces" */}
          <div className="space-y-4 pt-2">
            {/* Header & Filter Tabs */}
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                Your Course Workspaces
              </h4>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`pb-1 border-b-2 transition-colors ${
                    activeFilter === "all"
                      ? "border-[#550000] text-[#550000] dark:text-rose-400 font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setActiveFilter("progress")}
                  className={`pb-1 border-b-2 transition-colors ${
                    activeFilter === "progress"
                      ? "border-[#550000] text-[#550000] dark:text-rose-400 font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`pb-1 border-b-2 transition-colors ${
                    activeFilter === "completed"
                      ? "border-[#550000] text-[#550000] dark:text-rose-400 font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Course Rows */}
            <div className="space-y-2.5">
              {filteredCourses.map((c) => {
                const IconComponent = c.icon;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/80 dark:border-neutral-800 hover:border-rose-200 dark:hover:border-rose-900/40 hover:shadow-xs transition-all"
                  >
                    {/* Course Identity */}
                    <div className="flex items-center gap-3.5 min-w-[220px]">
                      <div className={`w-9 h-9 rounded-xl ${c.iconColor} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">{c.dept}</p>
                      </div>
                    </div>

                    {/* Progress Bar & Topics in Maroon */}
                    <div className="flex items-center gap-3 flex-1 max-w-xs">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#550000] dark:bg-rose-600 rounded-full"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block leading-none">
                          {c.progress}%
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">{c.topics}</span>
                      </div>
                    </div>

                    {/* Streak & Chats Metrics */}
                    <div className="flex items-center gap-5 shrink-0 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#550000] fill-[#550000] dark:text-rose-400 dark:fill-rose-400" />
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white leading-none block">
                            {c.streak}
                          </span>
                          <span className="text-[10px] text-neutral-400 block">Streak</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#550000] dark:text-rose-400" />
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white leading-none block">
                            {c.chats}
                          </span>
                          <span className="text-[10px] text-neutral-400 block">AI Chats</span>
                        </div>
                      </div>
                    </div>

                    {/* Open Workspace Action Button in Maroon */}
                    <a
                      href="/preplitai-chat"
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 text-[#550000] dark:text-rose-300 font-bold text-xs shadow-2xs transition-all shrink-0 active:scale-95 text-center justify-center"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Inside Banner */}
          <div className="rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-rose-900/50 text-[#550000] dark:text-rose-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Study smarter. Not harder.
                </h5>
                <p className="text-xs text-neutral-500 dark:text-rose-300/70 mt-0.5">
                  Let PreplitAI track your progress and keep you on the right path.
                </p>
              </div>
            </div>

            <a
              href="/preplitai-chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#550000] hover:bg-[#3d0000] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 shrink-0"
            >
              <span>Go to My Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
