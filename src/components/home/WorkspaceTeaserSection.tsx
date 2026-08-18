import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  RotateCw,
  RotateCcw,
  ZoomIn,
  Search,
  Settings,
  Play,
  Check,
  Volume2,
  Maximize2,
} from "lucide-react";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const [row1Index, setRow1Index] = useState(0);
  const [row2Index, setRow2Index] = useState(0);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const handleRow1Scroll = () => {
    if (!row1Ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = row1Ref.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const itemWidth = scrollWidth / 5;
    const idx = Math.min(4, Math.max(0, Math.round(scrollLeft / itemWidth)));
    setRow1Index(idx);
  };

  const handleRow2Scroll = () => {
    if (!row2Ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = row2Ref.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const itemWidth = scrollWidth / 5;
    const idx = Math.min(4, Math.max(0, Math.round(scrollLeft / itemWidth)));
    setRow2Index(idx);
  };

  const scrollToRow1 = (idx: number) => {
    if (!row1Ref.current) return;
    const { scrollWidth } = row1Ref.current;
    const itemWidth = scrollWidth / 5;
    row1Ref.current.scrollTo({ left: idx * itemWidth, behavior: "smooth" });
    setRow1Index(idx);
  };

  const scrollToRow2 = (idx: number) => {
    if (!row2Ref.current) return;
    const { scrollWidth } = row2Ref.current;
    const itemWidth = scrollWidth / 5;
    row2Ref.current.scrollTo({ left: idx * itemWidth, behavior: "smooth" });
    setRow2Index(idx);
  };

  return (
    <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── Top Section Header ─── */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-10 sm:mb-12">
          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15]"
          >
            <span className="text-[#550000] dark:text-[#f87171] block">
              {isKo ? "나만의 올인원" : "Your All-in-One"}
            </span>
            <span className="text-neutral-950 dark:text-white block mt-1">
              {isKo ? "AI 학업 워크스페이스" : "AI Study Workspace"}
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-2xl mt-3 leading-relaxed"
          >
            {isKo
              ? "개념 학습부터 실전 연습, 성적 향상까지 — 하나의 연결된 공간에서."
              : "Everything you need to learn, practice, and excel — in one connected space."}
          </motion.p>

          {/* Subtle Decorative Line Under Subtitle */}
          <div className="w-12 h-0.5 bg-[#550000]/40 dark:bg-rose-500/40 rounded-full mt-4" />
        </div>

        {/* ─── Section Header 1: All the basic tools. ─── */}
        <div className="flex items-center gap-4 my-6 sm:my-8">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white whitespace-nowrap">
            {isKo ? "핵심 기본 도구." : "All the basic tools."}
          </h3>
          <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800" />
        </div>

        {/* ─── Row 1: The 5 Basic Tool Cards (Swipable on mobile) ─── */}
        <div
          ref={row1Ref}
          onScroll={handleRow1Scroll}
          className="flex overflow-x-auto overflow-y-hidden touch-pan-y overscroll-x-contain pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible gap-4 mb-4 md:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0"
        >

          {/* 1. AI Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "AI 챗봇" : "AI Chat"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "내 강의 맞춤 AI 튜터." : "Your course. Your AI tutor."}
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료에 대해 무엇이든 질문하고, 정확하고 맥락을 이해한 답변을 받으세요."
                  : "Ask anything about your course materials and get accurate, context-aware answers."}
              </p>
            </div>

            {/* Chat Preview */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="p-2 rounded-lg bg-[#fbf4f2] dark:bg-[#201416] border border-[#f2deda] dark:border-[#3a1d22] text-neutral-800 dark:text-neutral-200 font-medium">
                {isKo ? "SN2 반응을 쉽게 설명해줘." : "Explain SN2 reactions in simple terms."}
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <div className="flex items-center gap-1 font-bold text-[#550000] dark:text-rose-400 mb-0.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#550000] dark:bg-rose-400" />
                  <span>Preplit AI</span>
                </div>
                {isKo
                  ? "SN2 반응은 친핵체가 탄소의 배면을 공격하며 단일 단계로 진행되는 입체 반전 반응입니다..."
                  : "SN2 reactions occur in a single step where a nucleophile attacks the electrophilic carbon from the backside..."}
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200/80 dark:border-neutral-700 text-neutral-400 text-[10px]">
                <span>{isKo ? "질문 입력..." : "Ask a question..."}</span>
                <div className="w-4 h-4 rounded-full bg-[#550000] text-white flex items-center justify-center">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Lecture Buddy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "렉처 버디" : "Lecture Buddy"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "실시간 캡처, 구조화, 완벽 복습." : "Capture, structure, never miss."}
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의를 실시간 녹음하고, AI가 체계적인 노트로 변환하여 이해에만 집중할 수 있게 합니다."
                  : "Record lectures in real-time and let AI convert them into well-organized notes so you can focus on understanding."}
              </p>
            </div>

            {/* Lecture Buddy Preview */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-white text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#550000] animate-pulse" />
                  <span>{isKo ? "녹음 중..." : "Recording..."}</span>
                </div>
                <span className="text-neutral-400 font-mono text-[9.5px]">12:45</span>
              </div>
              {/* Waveform graphic in dark maroon */}
              <div className="flex items-center gap-[2px] h-5 px-1">
                {[4, 9, 15, 6, 12, 17, 8, 14, 6, 11, 16, 7, 13, 18, 10, 5, 12, 7, 14, 6].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#550000]/80 dark:bg-rose-400 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="space-y-1 pt-1 border-t border-neutral-200/60 dark:border-neutral-800 text-[10px]">
                <div className="text-neutral-500 font-semibold mb-0.5">{isKo ? "노트 변환 중..." : "Converting to notes..."}</div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className="w-3 h-3 text-[#550000] dark:text-rose-400 shrink-0" />
                  <span className="truncate">{isKo ? "핵심 개념 추출 완료" : "Key Concepts"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#550000] dark:bg-rose-400 shrink-0 ml-0.5 mr-1" />
                  <span className="truncate">{isKo ? "예시 및 수식 매핑" : "Examples"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#550000] dark:bg-rose-400 shrink-0 ml-0.5 mr-1" />
                  <span className="truncate">{isKo ? "중요 포인트 정리" : "Important Points"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#550000] dark:bg-rose-400 shrink-0 ml-0.5 mr-1" />
                  <span className="truncate">{isKo ? "질문 & 답변 생성" : "Questions Asked"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. AI Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "AI 스마트 노트" : "AI Notes"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "내 과목 맞춤형 스마트 노트." : "Smart notes, made for your course."}
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의, 수업 자료, AI 대화에서 명확하고 구조화된 노트를 생성합니다."
                  : "Get clear, structured, and easy-to-understand notes generated from your lectures and materials."}
              </p>
            </div>

            {/* Note Preview */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-neutral-800 dark:text-white block mb-1.5 text-[10px]">
                    {isKo ? "핵심 개념" : "Key Concepts"}
                  </span>
                  <div className="space-y-1.5">
                    {[100, 75, 85, 60].map((w, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#550000] dark:bg-rose-400 shrink-0" />
                        <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-sm" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-neutral-800 dark:text-white block mb-1.5 text-[10px]">
                    {isKo ? "적용 예시" : "Examples"}
                  </span>
                  <div className="space-y-1.5">
                    {[80, 65, 70, 50].map((w, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#550000] dark:bg-rose-400 shrink-0" />
                        <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-sm" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Flashcards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "플래시카드" : "Flashcards"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "장기 기억 간격 반복 암기." : "Turn content into long-term memory."}
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "자료에서 플래시카드를 자동 생성하고 간격 반복 알고리즘으로 효율적으로 복습하세요."
                  : "Automatically generate flashcards from your materials and review with spaced repetition."}
              </p>
            </div>

            {/* Flashcard Widget */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="p-2.5 rounded-lg bg-[#fbf9f6] dark:bg-[#1c1815] border border-neutral-200/80 dark:border-neutral-700 text-center shadow-xs">
                <p className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 leading-snug">
                  {isKo ? "SN2 반응의 주요 생성물 특징은?" : "What is the main product of an SN2 reaction?"}
                </p>
                <div className="mt-2.5 py-1 px-2 rounded-md bg-[#f4ebe6] dark:bg-[#2d1b1c] text-[#550000] dark:text-rose-300 text-[10px] font-bold">
                  {isKo ? "입체 배치의 반전 (Inversion)" : "Inversion of configuration."}
                </div>
              </div>
              <div className="flex items-center justify-between text-neutral-400 text-[10px] px-1 font-mono">
                <span className="cursor-pointer hover:text-neutral-600">‹</span>
                <span>1 / 25</span>
                <span className="cursor-pointer hover:text-neutral-600">›</span>
              </div>
            </div>
          </motion.div>

          {/* 5. Practice Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "실전 퀴즈" : "Practice Quizzes"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "중요 개념 집중 연습." : "Practice what matters."}
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 내용으로 맞춤 퀴즈를 생성하고 즉각적인 피드백으로 빠르게 개선하세요."
                  : "Generate quizzes from your course content and get instant feedback to improve faster."}
              </p>
            </div>

            {/* Quiz Widget */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2 space-y-1.5 text-[10px]">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                {isKo ? "이진 트리 중위 순회의 순서는?" : "Which traversal visits the root between the left and right subtrees?"}
              </p>
              <div className="space-y-1 pt-0.5">
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  A &nbsp; Preorder
                </div>
                <div className="px-2 py-1 rounded bg-[#fbf4f2] dark:bg-[#201416] border border-[#550000]/60 dark:border-rose-500/60 text-[#550000] dark:text-rose-300 font-bold flex items-center justify-between">
                  <span>B &nbsp; Inorder</span>
                </div>
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  C &nbsp; Postorder
                </div>
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  D &nbsp; Level Order
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Mobile Swipe Indicators (Row 1) */}
        <div className="flex md:hidden items-center justify-center -mt-1 mb-8">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => scrollToRow1(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  row1Index === i
                    ? "w-5 h-1.5 bg-[#550000] dark:bg-rose-500"
                    : "w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── Section Header 2: Plus more. ─── */}
        <div className="flex items-center gap-4 my-6 sm:my-8">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white whitespace-nowrap">
            {isKo ? "더 많은 기능들." : "Plus more."}
          </h3>
          <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800" />
        </div>

        {/* ─── Row 2: The 5 "Plus more." Cards (Swipable on mobile) ─── */}
        <div
          ref={row2Ref}
          onScroll={handleRow2Scroll}
          className="flex overflow-x-auto overflow-y-hidden touch-pan-y overscroll-x-contain pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible gap-4 mb-4 md:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0"
        >

          {/* 6. Exam Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "출제 예상 문제" : "Exam Predictions"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "확신을 주는 시험 대비." : "Study with confidence."}
              </p>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료와 기출문제를 분석하여 출제 가능성이 높은 주제를 강조합니다."
                  : "We analyze your materials and past papers to highlight high probability topics so you can focus on what matters most."}
              </p>
            </div>

            {/* Exam Predictions Widget */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <span className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider block">
                {isKo ? "시험 집중 영역" : "Exam Focus Areas"}
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#550000] dark:bg-rose-400" />
                    <div>
                      <span className="text-[9px] text-neutral-400 block leading-none">High Probability</span>
                      <span className="text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200">Graph Traversal</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#550000] dark:text-rose-400">92%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-700 dark:bg-neutral-400" />
                    <div>
                      <span className="text-[9px] text-neutral-400 block leading-none">Medium Probability</span>
                      <span className="text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200">Dynamic Programming</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">67%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    <div>
                      <span className="text-[9px] text-neutral-400 block leading-none">Review Recommended</span>
                      <span className="text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200">Big-O Analysis</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500">45%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 7. 3D Interactive Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "3D 입체 학습" : "3D Interactive Learning"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "보고 만지며 깊이 이해." : "Understand by seeing and doing."}
              </p>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "공학, 생물학, 화학 등의 복잡한 구조를 회전하고 확대하며 인터랙티브하게 탐색하세요."
                  : "Explore interactive 3D models for complex topics in subjects like engineering, biology, chemistry, and more."}
              </p>
            </div>

            {/* 3D Model Graphic */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 flex flex-col items-center justify-center">
              <svg viewBox="0 0 140 85" className="w-28 h-16" xmlns="http://www.w3.org/2000/svg">
                {/* Bonds */}
                <line x1="45" y1="42" x2="70" y2="22" stroke="#4a000d" strokeWidth="2.5" />
                <line x1="70" y1="22" x2="95" y2="42" stroke="#4a000d" strokeWidth="2.5" />
                <line x1="95" y1="42" x2="70" y2="62" stroke="#4a000d" strokeWidth="2.5" />
                <line x1="70" y1="62" x2="45" y2="42" stroke="#4a000d" strokeWidth="2.5" />
                <line x1="95" y1="42" x2="118" y2="42" stroke="#71717a" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="45" y1="42" x2="22" y2="42" stroke="#71717a" strokeWidth="2" />
                {/* Atoms with Maroon / Dark styling */}
                <circle cx="70" cy="22" r="7" fill="#18181b" />
                <circle cx="95" cy="42" r="7.5" fill="#550000" />
                <circle cx="70" cy="62" r="7" fill="#18181b" />
                <circle cx="45" cy="42" r="7.5" fill="#550000" />
                <circle cx="118" cy="42" r="6" fill="#881337" />
                <circle cx="22" cy="42" r="5.5" fill="#a1a1aa" />
              </svg>
              <div className="flex items-center gap-3 mt-1 text-neutral-400 text-xs">
                <RotateCw className="w-3 h-3 hover:text-neutral-600 cursor-pointer" />
                <ZoomIn className="w-3 h-3 hover:text-neutral-600 cursor-pointer" />
                <Search className="w-3 h-3 hover:text-neutral-600 cursor-pointer" />
                <Settings className="w-3 h-3 hover:text-neutral-600 cursor-pointer" />
              </div>
            </div>
          </motion.div>

          {/* 8. AI Video Lectures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "AI 동영상 강의" : "AI Video Lectures"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "슬라이드가 영상으로." : "From slides to smart lectures."}
              </p>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 슬라이드를 AI 내레이션과 시각 설명이 포함된 몰입형 동영상 강의로 변환합니다."
                  : "Convert your study materials into engaging video lectures with AI narration and visual explanations."}
              </p>
            </div>

            {/* Video Player Preview */}
            <div className="rounded-xl bg-neutral-900 text-white p-2.5 space-y-2 text-[10px] shadow-sm">
              <div className="flex items-center justify-between text-[9px] text-neutral-300">
                <span className="font-semibold">{isKo ? "화학 반응 속도론" : "Chemical Kinetics"}</span>
                <span className="px-1 py-0.5 rounded bg-white/10 text-[8.5px]">HD</span>
              </div>
              <div className="relative py-2.5 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#550000] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
              </div>
              <div>
                <div className="h-1 rounded-full bg-white/20 overflow-hidden mb-1">
                  <div className="h-full bg-[#550000] rounded-full" style={{ width: "35%" }} />
                </div>
                <div className="flex justify-between items-center text-[8.5px] text-neutral-400 font-mono">
                  <span>04:15 / 12:30</span>
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-2.5 h-2.5" />
                    <Maximize2 className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 9. Podcast Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "팟캐스트 학습" : "Podcast Learning"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "이동 중에도 귀로 학습." : "Learn on the go."}
              </p>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "어떤 주제든 대화형 팟캐스트 오디오로 변환하여 언제 어디서나 학습하세요."
                  : "Turn any topic into a podcast-style audio and learn wherever you are, whenever you want."}
              </p>
            </div>

            {/* Podcast Preview */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10px]">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block text-[10px]">
                {isKo ? "광합성 메커니즘 해설" : "Photosynthesis Explained"}
              </span>
              <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                <span>10:45</span>
                <span>12:45</span>
              </div>
              <div className="flex items-center gap-[2px] h-3.5">
                {[4, 9, 14, 7, 11, 16, 8, 13, 5, 11, 15, 7, 13, 6, 12, 17, 9, 5, 13, 7].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#550000]/80 dark:bg-rose-400 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 pt-1 text-neutral-600 dark:text-neutral-300">
                <RotateCcw className="w-3 h-3 cursor-pointer" />
                <div className="w-5 h-5 rounded-full bg-[#550000] text-white flex items-center justify-center shadow-xs cursor-pointer">
                  <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                </div>
                <RotateCw className="w-3 h-3 cursor-pointer" />
              </div>
            </div>
          </motion.div>

          {/* 10. Collaborative Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="w-[280px] xs:w-[300px] md:w-auto flex-shrink-0 md:flex-shrink snap-start rounded-2xl p-5 bg-white dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                {isKo ? "협업 스터디 모드" : "Collaborative Mode"}
              </h4>
              <p className="text-xs font-bold text-[#550000] dark:text-rose-400 mb-1.5">
                {isKo ? "함께 배우고 더 큰 성취." : "Learn together. Achieve more."}
              </p>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "친구들과 스터디하며 자료를 공유하고, 토론하며 실시간으로 함께 문제를 해결하세요."
                  : "Study with friends, share materials, discuss topics, and solve problems together in real-time."}
              </p>
            </div>

            {/* Collab Chat Widget */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 p-2 space-y-1.5 text-[9.5px]">
              <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-1">
                <span className="font-semibold text-neutral-800 dark:text-white truncate">Organic Chemistry II Study Group</span>
                <span className="text-[8.5px] text-neutral-400">4 members online</span>
              </div>
              <div className="space-y-1">
                <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 leading-tight">
                  {isKo ? "3차 탄소 양이온이 왜 더 안정해?" : "Can someone explain why SN1 reactions prefer tertiary carbons?"}
                </div>
                <div className="p-1.5 rounded-lg bg-[#fbf4f2] dark:bg-[#201416] text-[#550000] dark:text-rose-200 leading-tight">
                  {isKo ? "3차 탄소는 하이퍼컨쥬게이션으로 안정화돼!" : "Sure! It's because tertiary carbons form more stable carbocations."}
                </div>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-neutral-800 rounded-md border border-neutral-200/80 dark:border-neutral-700 text-neutral-400 text-[9px]">
                <span>{isKo ? "메시지 입력..." : "Type a message..."}</span>
                <div className="w-3.5 h-3.5 rounded-full bg-[#550000] text-white flex items-center justify-center">
                  <ArrowRight className="w-2 h-2" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Mobile Swipe Indicators (Row 2) */}
        <div className="flex md:hidden items-center justify-center -mt-1 mb-6">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => scrollToRow2(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  row2Index === i
                    ? "w-5 h-1.5 bg-[#550000] dark:bg-rose-500"
                    : "w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
