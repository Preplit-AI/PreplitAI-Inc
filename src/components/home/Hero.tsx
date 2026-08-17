import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronRight, Clock, BarChart3, Trophy, Search, Flame } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Hero = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden px-4 pb-14 pt-36 sm:min-h-[110vh] sm:pb-0 sm:pt-36 flex flex-col items-center justify-start text-center"
    >
      {/* 1. Full-Screen Scenic Landscape Backdrop (Matching Timmo) */}
      <div className="absolute inset-x-0 top-0 -z-10 h-screen overflow-hidden pointer-events-none">
        <div className="h-full w-full bg-[url('/trendybg.png')] bg-cover bg-center" />
      </div>

      {/* 2. Soft sky blend at very top for floating navbar legibility */}
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-white via-white/70 to-transparent pointer-events-none" />

      {/* 3. Main Content Area */}
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center relative z-10">
        <div className="pt-2 sm:pt-6">
          {/* Top Avatar Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#141414]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6 sm:mb-8"
          >
            <div className="flex items-center -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[9px] font-bold border border-white dark:border-[#141414]">
                A
              </div>
              <div className="w-5 h-5 rounded-full bg-[#550000] text-white flex items-center justify-center text-[9px] font-bold border border-white dark:border-[#141414]">
                M
              </div>
              <div className="w-5 h-5 rounded-full bg-[#333333] text-white flex items-center justify-center text-[9px] font-bold border border-white dark:border-[#141414]">
                S
              </div>
            </div>
            <span className="text-xs font-semibold text-[#333333] dark:text-[#cccccc] tracking-tight">
              {isKo ? "1,000+ 국내외 대학생 사용 중" : "Used by 1,000+ university students"}
            </span>
          </motion.div>

          {/* Display Headline matching Text 2 regular weight typography */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" as const, bounce: 0 }}
            className="mx-auto max-w-[22rem] text-[2.25rem] leading-[1.08] tracking-[-0.01em] text-black/90 font-normal sm:max-w-3xl sm:text-5xl sm:leading-[1.0] sm:tracking-[-0.02em] md:text-6xl lg:text-7xl mb-4"
          >
            {isKo ? (
              <>
                대학생을 위한
                <br />
                <span className="font-editorial text-[#550000] block mt-1">
                  학습, 실전 연습, 시험 대비 슈퍼 워크스페이스.
                </span>
              </>
            ) : (
              <>
                A student’s super workspace for
                <br />
                <span className="font-editorial text-[#550000] block mt-1">
                  learning, practice, and review.
                </span>
              </>
            )}
          </motion.h1>


          {/* Dual Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="mx-auto mt-7 flex w-full max-w-[23rem] flex-col items-center justify-center gap-3 px-0 sm:mt-9 sm:max-w-none sm:w-auto sm:flex-row mb-12 sm:mb-16"
          >
            {/* Solid Black Dashboard / Start Pill Button */}
            <Button
              asChild
              className="h-11 w-full rounded-full bg-neutral-950 px-8 text-sm font-semibold text-white hover:bg-neutral-800 sm:h-12 sm:w-auto sm:text-base shadow-md transition-all active:scale-95"
            >
              <a href="/preplitai-chat" className="flex items-center gap-2">
                <span>{isKo ? "대시보드 시작하기" : "Dashboard"}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Button>

            {/* Product Demo Pill Button */}
            <Button
              asChild
              className="h-11 w-full rounded-full border border-lime-500/70 bg-[#bbf451] hover:bg-[#aee645] px-8 text-sm font-semibold text-black sm:h-12 sm:w-auto sm:text-base shadow-sm transition-all active:scale-95"
            >
              <a href="#how-it-works">
                {isKo ? "제품 데모 둘러보기" : "Product Demo"}
              </a>
            </Button>
          </motion.div>
        </div>

        {/* 4. App Window Container Frame (Sitting right over the green rolling landscape) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" as const, bounce: 0 }}
          className="w-full max-w-5xl rounded-[32px] bg-neutral-950 text-white border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden text-left p-2 sm:p-3 mb-16 sm:mb-24"
        >
          {/* Window Chrome Title Bar */}
          <div className="bg-neutral-900 rounded-2xl px-4 py-3 border border-white/5 flex flex-wrap items-center justify-between gap-3 mb-3">
            {/* Traffic Light Dots & URL */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="font-mono text-[11.5px] text-neutral-400">preplitai.com/workspace</span>
            </div>

            {/* Top Right Tool Tabs Pill */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-neutral-800 text-white px-3 py-1 rounded-full shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#f87171]" />
                <span>Focus Timer</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-neutral-400">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-neutral-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </div>
            </div>
          </div>

          {/* Workspace Body */}
          <div className="bg-neutral-900/90 rounded-2xl border border-white/5 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Study Block
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Organic Chemistry II · Reaction Mechanisms
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-neutral-800/80 px-3.5 py-2 rounded-full border border-white/10">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-white text-xs">14 Days Streak</span>
              </div>
            </div>

            {/* Grounded Citation Card */}
            <div className="bg-neutral-800/60 rounded-2xl p-5 border border-white/5 mb-6">
              <div className="flex items-center justify-between text-[11.5px] font-semibold text-neutral-400 mb-2">
                <span>AI Grounded Answer · Lecture_Slides_W6.pdf (p. 14)</span>
                <span className="text-emerald-400">✓ 100% Grounded</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-normal">
                "The \(S_N2\) mechanism occurs via a concerted single-step bimolecular transition state with complete inversion of stereochemical configuration at the chiral center."
              </p>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-neutral-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-[10.5px] font-bold uppercase text-neutral-400 tracking-wider">Session Time</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">00:45:12</p>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-[10.5px] font-bold uppercase text-neutral-400 tracking-wider">Flashcards Mastered</p>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">24 / 24</p>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-[10.5px] font-bold uppercase text-neutral-400 tracking-wider">Exam Readiness</p>
                <p className="text-xl font-bold text-[#f87171] font-mono mt-0.5">84% (+12%)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
