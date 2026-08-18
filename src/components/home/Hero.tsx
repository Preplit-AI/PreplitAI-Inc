import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
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

        {/* 4. Modern Cinematic Hero Feature Showcase (Image 1) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" as const, bounce: 0 }}
          className="w-full max-w-5xl rounded-[28px] sm:rounded-[36px] bg-neutral-950 text-white border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden text-left mb-16 sm:mb-24 relative group"
        >
          {/* Main Visual Banner */}
          <div className="relative min-h-[400px] sm:min-h-[460px] md:min-h-[500px] bg-[url('/reach-potential.png')] bg-cover bg-center sm:bg-right-top flex flex-col justify-between p-6 sm:p-10 md:p-12 overflow-hidden">
            {/* Subtle Gradient Overlays for optimal typography readability on all screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 pointer-events-none" />

            {/* Top Bar inside Banner */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Preplit AI</span>
              </span>
              <a
                href="/preplitai-chat"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs font-semibold text-white transition-all active:scale-95"
              >
                <span>{isKo ? "워크스페이스 열기" : "Open Workspace"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Middle Main Headline */}
            <div className="relative z-10 max-w-xl my-auto py-6 sm:py-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.12]">
                {isKo ? (
                  <>
                    AI 학습 도구로
                    <br />
                    나만의 잠재력을
                    <br />
                    실현하세요
                  </>
                ) : (
                  <>
                    Reach your
                    <br />
                    potential with
                    <br />
                    AI learning tools
                  </>
                )}
              </h2>
            </div>

            {/* Bottom 6 Feature Columns */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-white/15">
              {/* 1. Smart Notes */}
              <div className="space-y-1 lg:border-r border-white/15 lg:pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {isKo ? "스마트 노트" : "Smart Notes"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-neutral-300/80 leading-snug">
                  {isKo ? "내 자료 기반 자동 생성" : "AI-generated from your materials"}
                </p>
              </div>

              {/* 2. AI Lecture Buddy */}
              <div className="space-y-1 lg:border-r border-white/15 lg:pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {isKo ? "AI 렉처 버디" : "AI Lecture Buddy"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-neutral-300/80 leading-snug">
                  {isKo ? "실시간 강의 캡처 및 구조화 노트" : "Capture lectures in real-time and get structured notes"}
                </p>
              </div>

              {/* 3. Practice Quizzes */}
              <div className="space-y-1 lg:border-r border-white/15 lg:pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {isKo ? "실전 퀴즈" : "Practice Quizzes"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-neutral-300/80 leading-snug">
                  {isKo ? "자체 테스트로 빠른 실력 향상" : "Test yourself and improve faster"}
                </p>
              </div>

              {/* 4. Exam Predictions */}
              <div className="space-y-1 lg:border-r border-white/15 lg:pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {isKo ? "출제 예상 문제" : "Exam Predictions"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-neutral-300/80 leading-snug">
                  {isKo ? "핵심 출제 주제 집중 공략" : "Focus on what matters most"}
                </p>
              </div>

              {/* 5. 3D Learning Mode */}
              <div className="space-y-1 lg:border-r border-white/15 lg:pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {isKo ? "3D 입체 학습" : "3D Learning Mode"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-neutral-300/80 leading-snug">
                  {isKo ? "3D 모델로 시각적 입체 학습" : "Learn visually with interactive 3D models"}
                </p>
              </div>

              {/* 6. & more */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {isKo ? "& 그 외 기능" : "& more"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-neutral-300/80 leading-snug">
                  {isKo ? "플래시카드, 협업 모드, 동영상 강의, 팟캐스트" : "Flashcards, Collaborative Mode, AI Video Lectures, Podcast Learning"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
