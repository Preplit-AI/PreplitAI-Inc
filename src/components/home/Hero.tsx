import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronRight, Clock, BarChart3, Trophy, Search, Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Hero = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-[#0a0a0a]">
      {/* Timmo Atmospheric Backdrop Image */}
      <div 
        className="absolute inset-0 bg-[url('/trendybg.png')] bg-cover bg-top bg-no-repeat opacity-40 dark:opacity-20 pointer-events-none -z-10" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-[#0a0a0a]/60 dark:to-[#0a0a0a] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        {/* Top Avatar Pill Badge (Matching 'Used by 15+ focus builders') */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-8"
        >
          {/* Overlapping Avatar Initials */}
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
          <span className="text-xs font-semibold text-[#444444] dark:text-[#bbbbbb] tracking-tight">
            {isKo ? "1,000+ 국내외 대학생 및 장학생 사용 중" : "Used by 1,000+ university students"}
          </span>
        </motion.div>

        {/* Display Headline with Serif Italic Pairing */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" as const, bounce: 0 }}
          className="text-[clamp(2.75rem,5.5vw,4.75rem)] font-bold tracking-[-0.035em] leading-[1.08] text-[#111111] dark:text-white mb-6"
        >
          {isKo ? (
            <>
              대학생을 위한
              <br />
              <span className="font-editorial font-normal text-[#550000] dark:text-[#f87171]">
                학습, 실전 연습, 시험 대비 슈퍼 워크스페이스.
              </span>
            </>
          ) : (
            <>
              A student’s super workspace for
              <br />
              <span className="font-editorial font-normal text-[#550000] dark:text-[#f87171]">
                learning, practice, and review.
              </span>
            </>
          )}
        </motion.h1>

        {/* Balanced Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" as const, bounce: 0 }}
          className="text-base sm:text-[17px] text-[#555555] dark:text-[#999999] max-w-[620px] mx-auto leading-relaxed mb-10 font-normal"
        >
          {isKo
            ? "PreplitAI는 모든 강의 자료를 완벽한 학습 시스템으로 전환합니다. 출처 인용 챗봇, 스마트 플래시카드, 퀴즈, 팟캐스트, 출제 예상 문제로 매일 편안하게 몰입하세요."
            : "PreplitAI turns every course syllabus into a complete learning system: grounded AI chat, spaced flashcards, adaptive quizzes, audio podcasts, and exam predictions that feel calm enough to use every day."}
        </motion.p>

        {/* Action Buttons (Get started free ↗ & View product demo >) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" as const, bounce: 0 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-16"
        >
          {/* Black Get Started Free Pill Button */}
          <Button
            asChild
            className="text-[14px] px-7 py-3 h-12 bg-[#111111] hover:bg-[#000000] text-white rounded-full font-semibold transition-all duration-150 active:scale-[0.97] shadow-sm shadow-black/10 flex items-center gap-1.5"
          >
            <a href="/preplitai-chat">
              <span>{isKo ? "무료로 시작하기" : "Get started free"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </Button>

          {/* White View Product Demo Pill Button */}
          <Button
            asChild
            variant="outline"
            className="text-[14px] px-6 py-3 h-12 bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 text-[#111111] dark:text-white rounded-full font-medium transition-all duration-150 active:scale-[0.97] flex items-center gap-1"
          >
            <a href="#how-it-works">
              <span>{isKo ? "제품 데모 보기" : "View product demo"}</span>
              <ChevronRight className="w-4 h-4 text-[#888888]" />
            </a>
          </Button>
        </motion.div>

        {/* App Frame Window Container (Matching screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" as const, bounce: 0 }}
          className="w-full max-w-5xl rounded-[32px] bg-white dark:bg-[#111111] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden text-left p-2 sm:p-3"
        >
          {/* Window Chrome / Title Bar */}
          <div className="bg-[#fafafa] dark:bg-[#161616] rounded-2xl px-4 py-3 border border-black/[0.04] dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-3 mb-3">
            {/* Traffic Light Dots & URL */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="font-mono text-[11.5px] text-[#888888]">preplitai.com/workspace</span>
            </div>

            {/* Top Right Tool Tabs Pill */}
            <div className="flex items-center gap-1 bg-[#eeeeee]/70 dark:bg-white/10 p-1 rounded-full text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#222222] text-[#111111] dark:text-white px-3 py-1 rounded-full shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#550000] dark:text-[#f87171]" />
                <span>Focus Timer</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[#666666] dark:text-[#aaaaaa]">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[#666666] dark:text-[#aaaaaa]">
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </div>
            </div>
          </div>

          {/* Clean Light-Mode Workspace Canvas Mock */}
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Study Block
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111111] dark:text-white tracking-tight">
                  Organic Chemistry II · Reaction Mechanisms
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-[#fafafa] dark:bg-[#1a1a1a] px-3.5 py-2 rounded-full border border-black/[0.06] dark:border-white/[0.06]">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-[#111111] dark:text-white text-xs">14 Days Streak</span>
              </div>
            </div>

            {/* Grounded Citation Card */}
            <div className="bg-[#f9fafb] dark:bg-[#181818] rounded-2xl p-5 border border-black/[0.05] dark:border-white/[0.05] mb-6">
              <div className="flex items-center justify-between text-[11.5px] font-semibold text-[#888888] mb-2">
                <span>AI Grounded Answer · Lecture_Slides_W6.pdf (p. 14)</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ 100% Grounded</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-normal">
                "The \(S_N2\) mechanism occurs via a concerted single-step bimolecular transition state with complete inversion of stereochemical configuration at the chiral center."
              </p>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#fafafa] dark:bg-[#161616] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[10.5px] font-bold uppercase text-[#888888] tracking-wider">Session Time</p>
                <p className="text-xl font-bold text-[#111111] dark:text-white font-mono mt-0.5">00:45:12</p>
              </div>
              <div className="bg-[#fafafa] dark:bg-[#161616] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[10.5px] font-bold uppercase text-[#888888] tracking-wider">Flashcards Mastered</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">24 / 24</p>
              </div>
              <div className="bg-[#fafafa] dark:bg-[#161616] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[10.5px] font-bold uppercase text-[#888888] tracking-wider">Exam Readiness</p>
                <p className="text-xl font-bold text-[#550000] dark:text-[#f87171] font-mono mt-0.5">84% (+12%)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
