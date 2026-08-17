import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sparkles,
  Flame,
  Brain,
  MessageSquare,
  FileCheck2,
  Trophy,
  Users,
  Settings as SettingsIcon,
  Volume2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  // Focus Timer Interactive State
  const [timerMode, setTimerMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusActive && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev - 1);
      }, 1000);
    } else if (focusSeconds === 0) {
      setIsFocusActive(false);
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusSeconds]);

  const handleModeChange = (mode: "pomodoro" | "short" | "long") => {
    setTimerMode(mode);
    setIsFocusActive(false);
    if (mode === "pomodoro") setFocusSeconds(25 * 60);
    else if (mode === "short") setFocusSeconds(5 * 60);
    else setFocusSeconds(15 * 60);
  };

  const toggleTimer = () => {
    if (focusSeconds === 0) {
      if (timerMode === "pomodoro") setFocusSeconds(25 * 60);
      else if (timerMode === "short") setFocusSeconds(5 * 60);
      else setFocusSeconds(15 * 60);
    }
    setIsFocusActive(!isFocusActive);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const maxSecs = timerMode === "pomodoro" ? 25 * 60 : timerMode === "short" ? 5 * 60 : 15 * 60;

  return (
    <section id="features" className="py-20 sm:py-28 px-4 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header with Badge */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-14 sm:mb-16 gap-3">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-rose-600 dark:text-rose-300 text-xs font-semibold shadow-2xs mb-1"
          >
            <Sparkles className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Built for Students. Backed by AI.</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white leading-tight"
          >
            Everything you need to{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#9333ea]">learn</span>,{" "}
            <span className="text-[#2563eb]">practice</span>, and{" "}
            <span className="text-[#dc2626]">ace your exams</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-2xl"
          >
            PreplitAI brings your entire course journey into one intelligent workspace.
          </motion.p>
        </div>

        {/* Row 1: 2 Cards (Your learning in consistency & Stay focused focus timer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Card 1: Your learning, in consistency (Lavender/Soft Purple #f4f0ff) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="lg:col-span-4 bg-[#f4f0ff] dark:bg-[#181126] rounded-[28px] p-7 sm:p-8 border border-[#e2d5ff]/80 dark:border-purple-900/40 flex flex-col justify-between"
          >
            <div>
              {/* Brain Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-[#e9d5ff] dark:bg-purple-950/70 text-[#7e22ce] dark:text-purple-300 flex items-center justify-center mb-6 shadow-2xs">
                <Brain className="w-6 h-6" />
              </div>

              {/* Headline */}
              <h3 className="text-2xl font-bold text-[#6b21a8] dark:text-[#c084fc] tracking-tight leading-tight mb-2">
                Your learning,
                <br />
                in consistency.
              </h3>

              {/* Description */}
              <p className="text-[13.5px] text-neutral-600 dark:text-purple-200/70 leading-relaxed font-normal">
                Build your daily study habit and watch your progress grow with every session.
              </p>
            </div>

            {/* Bottom 14 Day Streak Widget Pill */}
            <div className="mt-8 bg-white dark:bg-[#201833] rounded-2xl p-4 border border-purple-100 dark:border-purple-900/40 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-neutral-900 dark:text-white leading-none">14</span>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Day Streak</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">Keep it going!</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Stay focused. Get more done. (Ice Blue #eef6ff) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="lg:col-span-8 bg-[#eef6ff] dark:bg-[#0c1827] rounded-[28px] p-7 sm:p-9 border border-[#cfe4ff]/80 dark:border-sky-900/40 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* Left Description */}
            <div className="flex-1 max-w-sm">
              <span className="text-xs font-bold text-[#2563eb] dark:text-[#38bdf8] uppercase tracking-wider block mb-1">
                Focus Timer
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight leading-tight mb-3">
                Stay focused.
                <br />
                Get more done.
              </h3>
              <p className="text-sm text-neutral-600 dark:text-sky-200/70 leading-relaxed font-normal">
                Use the Focus Timer to block distractions and dive deep into your study flow.
              </p>
            </div>

            {/* Right Interactive Focus Timer Widget (Matching Image Exactly) */}
            <div className="w-full max-w-[340px] bg-white dark:bg-[#122236] rounded-3xl p-5 border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col items-center">
              {/* Timer Mode Tabs */}
              <div className="flex items-center justify-between w-full border-b border-slate-100 dark:border-neutral-800 pb-3 mb-4 text-[11px] font-semibold text-neutral-400">
                <button
                  onClick={() => handleModeChange("pomodoro")}
                  className={`pb-1 border-b-2 transition-colors ${
                    timerMode === "pomodoro"
                      ? "border-[#2563eb] text-[#2563eb] font-bold"
                      : "border-transparent hover:text-neutral-700"
                  }`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => handleModeChange("short")}
                  className={`pb-1 border-b-2 transition-colors ${
                    timerMode === "short"
                      ? "border-[#2563eb] text-[#2563eb] font-bold"
                      : "border-transparent hover:text-neutral-700"
                  }`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => handleModeChange("long")}
                  className={`pb-1 border-b-2 transition-colors ${
                    timerMode === "long"
                      ? "border-[#2563eb] text-[#2563eb] font-bold"
                      : "border-transparent hover:text-neutral-700"
                  }`}
                >
                  Long Break
                </button>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-100 dark:stroke-neutral-800"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-[#2563eb]"
                    strokeWidth="5"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * focusSeconds) / maxSecs}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                    {formatTimer(focusSeconds)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">Deep Focus</span>
                </div>
              </div>

              {/* Start/Pause Button in Vibrant Blue */}
              <button
                onClick={toggleTimer}
                className="w-full py-2.5 mt-4 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>▶</span>
                <span>{isFocusActive ? "Pause Focus" : "Start Focus"}</span>
              </button>

              {/* Bottom Icon Controls */}
              <div className="flex items-center justify-between w-full mt-3 pt-2 text-neutral-400">
                <button className="p-1 hover:text-neutral-700 dark:hover:text-white transition-colors">
                  <SettingsIcon className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:text-neutral-700 dark:hover:text-white transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 2: 3 Cards (Progress Heatmap, Real-time Activity, Global Community) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: See your progress at a glance (Peach #fff2df) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="bg-[#fff2df] dark:bg-[#1f160e] rounded-[28px] p-7 sm:p-8 border border-[#f5d9b8]/80 dark:border-amber-900/40 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-[#ea580c] dark:text-[#fb923c] tracking-tight leading-snug mb-1.5">
                See your progress
                <br />
                at a glance.
              </h3>
              <p className="text-[13px] text-[#7c2d12]/80 dark:text-[#fdba74]/80 leading-relaxed font-normal mb-5">
                Visualize your study consistency, topics mastered, and performance over time.
              </p>
            </div>

            {/* Heatmap Widget */}
            <div className="bg-white dark:bg-[#2b1f14] p-3.5 rounded-2xl border border-orange-200/60 dark:border-amber-900/40 overflow-x-auto no-scrollbar shadow-2xs">
              <div className="flex gap-2">
                <div className="flex flex-col justify-between text-[8.5px] text-neutral-400 font-semibold pr-1">
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>
                </div>
                <div className="flex-1 flex gap-1 justify-between">
                  {Array.from({ length: 11 }).map((_, col) => (
                    <div key={col} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, row) => {
                        const intensities = [
                          "bg-[#ffedd5] dark:bg-amber-950/80",
                          "bg-[#fdba74] dark:bg-amber-700",
                          "bg-[#fb923c] dark:bg-amber-600",
                          "bg-[#ea580c] dark:bg-orange-600",
                          "bg-[#c2410c] dark:bg-orange-500",
                        ];
                        const val = (col * 3 + row * 2) % 5;
                        return (
                          <div
                            key={row}
                            className={`w-3 h-3 rounded-[3px] ${intensities[val]} transition-transform hover:scale-125 cursor-pointer`}
                            title={`Session activity: ${val + 1}h`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {/* Months & Legend */}
              <div className="flex items-center justify-between text-[9px] text-neutral-400 mt-2.5 pt-2 border-t border-orange-100 dark:border-amber-950 font-medium">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-neutral-400 mt-1.5">
                <span>Less</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-[2px] bg-[#ffedd5]"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-[#fdba74]"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-[#ea580c]"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-[#c2410c]"></span>
                </div>
                <span>More</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Real-time activity in your workspace (Mint Green #effbee) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="bg-[#effbee] dark:bg-[#0d1f14] rounded-[28px] p-7 sm:p-8 border border-[#cbe8c3]/80 dark:border-emerald-900/40 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-[#16a34a] dark:text-[#4ade80] tracking-tight leading-snug mb-1.5">
                Real-time activity
                <br />
                in your workspace
              </h3>
              <p className="text-[13px] text-[#14532d]/80 dark:text-[#86efac]/80 leading-relaxed font-normal mb-5">
                Get instant updates on your study sessions, quizzes, streaks, and achievements.
              </p>
            </div>

            {/* Notification Stack matching screenshot */}
            <div className="space-y-2">
              {/* Item 1 */}
              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">AI Chat session completed</p>
                    <span className="text-[9px] text-neutral-400 shrink-0">2m ago</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">Organic Chemistry II</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">Quiz on Reaction Mechanisms</p>
                    <span className="text-[9px] text-neutral-400 shrink-0">10m ago</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">Score: 87%</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">14 day streak achieved!</p>
                    <span className="text-[9px] text-neutral-400 shrink-0">15m ago</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">Keep going strong</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">You mastered 24 flashcards</p>
                    <span className="text-[9px] text-neutral-400 shrink-0">1h ago</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">Great job!</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Join a community that learns together (Soft Purple #f5f3ff) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" as const, bounce: 0 }}
            className="bg-[#f5f3ff] dark:bg-[#181126] rounded-[28px] p-7 sm:p-8 border border-[#ded0ff]/80 dark:border-purple-900/40 flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-bold text-[#7e22ce] dark:text-[#c084fc] tracking-tight leading-snug mb-1.5">
                Join a community
                <br />
                that learns together.
              </h3>
              <p className="text-[13px] text-[#581c87]/80 dark:text-[#d8b4fe]/80 leading-relaxed font-normal mb-5">
                Connect with students around the world, share resources, and stay motivated.
              </p>
            </div>

            {/* Global Student World Map Graphic */}
            <div className="h-44 relative flex items-center justify-center">
              {/* World map silhouette representation */}
              <svg viewBox="0 0 300 160" className="w-full h-full opacity-30 dark:opacity-20" fill="currentColor">
                <path d="M40,45 Q55,30 75,40 Q90,55 80,75 Q65,85 50,75 Z" fill="#9333ea" />
                <path d="M120,35 Q145,25 170,40 Q180,60 160,75 Q135,75 125,55 Z" fill="#9333ea" />
                <path d="M210,45 Q240,35 260,50 Q270,75 245,85 Q220,80 215,60 Z" fill="#9333ea" />
                <path d="M60,105 Q85,95 95,120 Q85,140 65,135 Z" fill="#9333ea" />
                <path d="M190,105 Q220,95 240,115 Q230,135 200,130 Z" fill="#9333ea" />
              </svg>

              {/* Connected Dashed Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160">
                <line x1="60" y1="65" x2="150" y2="75" stroke="#c084fc" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="150" y1="75" x2="230" y2="55" stroke="#c084fc" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="150" y1="75" x2="100" y2="120" stroke="#c084fc" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="150" y1="75" x2="245" y2="110" stroke="#c084fc" strokeWidth="1" strokeDasharray="3,3" />
              </svg>

              {/* Student Avatars on Map */}
              <div className="absolute top-8 left-8 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                M
              </div>
              <div className="absolute top-4 right-14 w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                K
              </div>
              <div className="absolute top-14 left-[46%] w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center border-2 border-white shadow-md ring-2 ring-purple-300">
                S
              </div>
              <div className="absolute bottom-6 left-16 w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                J
              </div>
              <div className="absolute bottom-6 right-8 w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                A
              </div>

              {/* Bottom Explore Button */}
              <a
                href="/preplitai-chat"
                className="absolute bottom-1 bg-white/95 dark:bg-[#221838] border border-purple-200 dark:border-purple-800/60 rounded-full px-4 py-1.5 text-xs font-bold text-neutral-800 dark:text-purple-200 shadow-xs flex items-center gap-1.5 hover:bg-white hover:shadow-sm transition-all"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Explore Community</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Full-Width CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
        >
          {/* Left Text */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
              From lectures to exams —{" "}
              <span className="text-[#550000] dark:text-rose-400 font-bold">PreplitAI</span> is your all-in-one AI study partner.
            </p>
          </div>

          {/* Right Action Button in Maroon */}
          <a
            href="/preplitai-chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#550000] hover:bg-[#3d0000] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
