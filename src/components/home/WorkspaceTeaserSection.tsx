import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  MessageSquare,
  Mic,
  FileText,
  Layers,
  CheckSquare,
  Target,
  Box,
  Video,
  Headphones,
  Users,
  Sparkles,
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
  Sparkle,
} from "lucide-react";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── Top Section Header ─── */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-10 sm:mb-12 gap-2">
          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-tight"
          >
            <span className="text-[#6366f1] dark:text-[#818cf8]">Preplit AI.</span>{" "}
            <span>{isKo ? "올인원 AI 학습 워크스페이스." : "Your All-in-One AI Study Workspace."}</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-2xl mt-1 leading-relaxed"
          >
            {isKo
              ? "학습, 연습, 시험 준비까지 필요한 모든 것을 — 하나의 연결된 공간에서."
              : "Everything you need to learn, practice, and excel — in one connected space."}
          </motion.p>
        </div>

        {/* ─── Divider 1: All the basic features: ─── */}
        <div className="relative flex items-center justify-center my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200/70 dark:border-purple-900/40" />
          </div>
          <div className="relative bg-white dark:bg-[#0a0a0a] px-4 flex items-center gap-2 text-[#4f46e5] dark:text-[#a5b4fc] text-sm sm:text-base font-bold tracking-tight">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{isKo ? "핵심 기본 기능:" : "All the basic features:"}</span>
          </div>
        </div>

        {/* ─── Row 1: The 5 Basic Feature Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">

          {/* 1. AI Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "AI 챗봇" : "AI Chat"}
                  </h3>
                  <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {isKo ? "내 강의 맞춤 AI 튜터" : "Your course. Your AI tutor."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료에 대해 무엇이든 질문하고, 정확하고 맥락을 이해한 답변을 받으세요."
                  : "Ask anything about your course materials and get accurate, context-aware answers."}
              </p>
            </div>

            {/* Chat Preview */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="p-2 rounded-lg bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 text-purple-950 dark:text-purple-200 font-medium">
                {isKo ? "SN2 반응을 쉽게 설명해줘." : "Explain SN2 reactions in simple terms."}
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <div className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 mb-0.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  <span>Preplit AI</span>
                </div>
                {isKo
                  ? "SN2 반응은 친핵체가 탄소의 배면을 공격하며 단일 단계로 진행되는 입체 반전 반응입니다..."
                  : "SN2 reactions occur in a single step where a nucleophile attacks the electrophilic carbon from the backside..."}
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200/80 dark:border-neutral-700 text-neutral-400 text-[10px]">
                <span>{isKo ? "질문 입력..." : "Ask a question..."}</span>
                <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "렉처 버디" : "Lecture Buddy"}
                  </h3>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {isKo ? "실시간 캡처, 구조화, 완벽 복습" : "Capture. Structure. Never miss."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의를 실시간 녹음하고, AI가 체계적인 노트로 변환하여 이해에만 집중할 수 있게 합니다."
                  : "Record lectures in real-time and let AI convert them into well-organized notes so you can focus on understanding."}
              </p>
            </div>

            {/* Lecture Buddy Preview */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-white text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{isKo ? "녹음 중..." : "Recording..."}</span>
                </div>
                <span className="text-neutral-400 font-mono text-[9.5px]">12:45</span>
              </div>
              {/* Waveform graphic */}
              <div className="flex items-center gap-[2px] h-5 px-1">
                {[4, 9, 15, 6, 12, 17, 8, 14, 6, 11, 16, 7, 13, 18, 10, 5, 12, 7, 14, 6].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500/80 dark:bg-blue-400 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-neutral-800 text-[10px]">
                <div className="text-neutral-500 font-semibold mb-0.5">{isKo ? "노트 변환 중..." : "Converting to notes..."}</div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{isKo ? "핵심 개념 추출 완료" : "Key Concepts"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{isKo ? "예시 및 수식 매핑" : "Examples"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-0.5 mr-1" />
                  <span className="truncate">{isKo ? "중요 포인트 정리" : "Important Points"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-0.5 mr-1" />
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "AI 스마트 노트" : "AI Notes"}
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {isKo ? "내 과목 맞춤형 요약" : "Smart notes, for your course."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의, 수업 자료, AI 대화에서 명확하고 구조화된 노트를 생성합니다."
                  : "Get clear, structured, and easy-to-understand notes generated from your lectures, materials, and chats."}
              </p>
            </div>

            {/* Note Preview */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-neutral-800 dark:text-white block mb-1.5 text-[10px]">
                    {isKo ? "핵심 개념" : "Key Concepts"}
                  </span>
                  <div className="space-y-1.5">
                    {[100, 75, 85, 60].map((w, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div className="h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-sm" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-neutral-800 dark:text-white block mb-1.5 text-[10px]">
                    {isKo ? "적용 예시" : "Examples"}
                  </span>
                  <div className="space-y-1.5">
                    {[80, 65, 70].map((w, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div className="h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-sm" style={{ width: `${w}%` }} />
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "플래시카드" : "Flashcards"}
                  </h3>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {isKo ? "장기 기억 간격 반복" : "Turn into long-term memory."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "자료에서 플래시카드를 자동 생성하고 간격 반복 알고리즘으로 효율적으로 복습하세요."
                  : "Automatically generate flashcards from your materials and review with spaced repetition."}
              </p>
            </div>

            {/* Flashcard Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-center shadow-xs">
                <p className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
                  {isKo ? "SN2 반응의 주요 생성물 특징은?" : "What is the main product of an SN2 reaction?"}
                </p>
                <div className="mt-2 py-1 px-2 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "실전 퀴즈" : "Practice Quizzes"}
                  </h3>
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {isKo ? "중요 개념 집중 연습" : "Practice what matters."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 내용으로 맞춤 퀴즈를 생성하고 즉각적인 피드백으로 빠르게 개선하세요."
                  : "Generate quizzes from your course content and get instant feedback to improve faster."}
              </p>
            </div>

            {/* Quiz Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2 space-y-1.5 text-[10px]">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                {isKo ? "이진 트리 중위 순회의 순서는?" : "Which traversal visits the root between left & right?"}
              </p>
              <div className="space-y-1">
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  A &nbsp; Preorder
                </div>
                <div className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-between">
                  <span>B &nbsp; Inorder</span>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  C &nbsp; Postorder
                </div>
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  D &nbsp; Level Order
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── Divider 2: Plus more! ─── */}
        <div className="relative flex items-center justify-center my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200/70 dark:border-purple-900/40" />
          </div>
          <div className="relative bg-white dark:bg-[#0a0a0a] px-4 flex items-center gap-1.5 text-[#4f46e5] dark:text-[#a5b4fc] text-sm sm:text-base font-bold tracking-tight">
            <Sparkle className="w-4 h-4 fill-purple-600 text-purple-600 dark:fill-purple-400 dark:text-purple-400" />
            <span>{isKo ? "더 많은 기능들!" : "Plus more!"}</span>
          </div>
        </div>

        {/* ─── Row 2: The 5 "Plus more!" Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          {/* 6. Exam Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "출제 예상 문제" : "Exam Predictions"}
                  </h3>
                  <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    {isKo ? "확신을 주는 시험 대비" : "Study with confidence."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료와 기출문제를 분석하여 출제 가능성이 높은 주제를 강조합니다."
                  : "We analyze your materials and past papers to highlight high probability topics so you can focus on what matters most."}
              </p>
            </div>

            {/* Exam Predictions Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <span className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider block">
                {isKo ? "시험 집중 영역" : "Exam Focus Areas"}
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200">Graph Traversal</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600">92%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200">Dynamic Programming</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">67%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10.5px] font-medium text-neutral-800 dark:text-neutral-200">Big-O Analysis</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">45%</span>
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "3D 입체 학습" : "3D Interactive Learning"}
                  </h3>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {isKo ? "보고 만지며 깊이 이해" : "Understand by seeing and doing."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "공학, 생물학, 화학 등의 복잡한 구조를 회전하고 확대하며 인터랙티브하게 탐색하세요."
                  : "Explore interactive 3D models for complex topics in subjects like engineering, biology, chemistry, and more."}
              </p>
            </div>

            {/* 3D Model Graphic */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 flex flex-col items-center justify-center">
              <svg viewBox="0 0 140 85" className="w-28 h-16" xmlns="http://www.w3.org/2000/svg">
                {/* Bonds */}
                <line x1="45" y1="42" x2="70" y2="22" stroke="#64748b" strokeWidth="2.5" />
                <line x1="70" y1="22" x2="95" y2="42" stroke="#64748b" strokeWidth="2.5" />
                <line x1="95" y1="42" x2="70" y2="62" stroke="#64748b" strokeWidth="2.5" />
                <line x1="70" y1="62" x2="45" y2="42" stroke="#64748b" strokeWidth="2.5" />
                <line x1="95" y1="42" x2="118" y2="42" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="45" y1="42" x2="22" y2="42" stroke="#94a3b8" strokeWidth="2" />
                {/* Atoms */}
                <circle cx="70" cy="22" r="7" fill="#1e293b" />
                <circle cx="95" cy="42" r="7.5" fill="#3b82f6" />
                <circle cx="70" cy="62" r="7" fill="#1e293b" />
                <circle cx="45" cy="42" r="7.5" fill="#6366f1" />
                <circle cx="118" cy="42" r="6" fill="#ef4444" />
                <circle cx="22" cy="42" r="5.5" fill="#10b981" />
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "AI 동영상 강의" : "AI Video Lectures"}
                  </h3>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {isKo ? "슬라이드가 영상으로" : "From slides to smart lectures."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 슬라이드를 AI 내레이션과 시각 설명이 포함된 몰입형 동영상 강의로 변환합니다."
                  : "Convert your study materials into engaging video lectures with AI narration and visual explanations."}
              </p>
            </div>

            {/* Video Player Preview */}
            <div className="rounded-xl bg-slate-900 text-white p-2.5 space-y-2 text-[10px] shadow-sm">
              <div className="flex items-center justify-between text-[9px] text-slate-300">
                <span className="font-semibold">{isKo ? "화학 반응 속도론" : "Chemical Kinetics"}</span>
                <span className="px-1 py-0.5 rounded bg-white/10 text-[8.5px]">HD</span>
              </div>
              <div className="relative py-2.5 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
              </div>
              <div>
                <div className="h-1 rounded-full bg-white/20 overflow-hidden mb-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "35%" }} />
                </div>
                <div className="flex justify-between text-[8.5px] text-slate-400 font-mono">
                  <span>04:15</span>
                  <span>12:30</span>
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "팟캐스트 학습" : "Podcast Learning"}
                  </h3>
                  <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                    {isKo ? "이동 중에도 귀로 학습" : "Learn on the go."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "어떤 주제든 대화형 팟캐스트 오디오로 변환하여 언제 어디서나 학습하세요."
                  : "Turn any topic into a podcast-style audio and learn wherever you are, whenever you want."}
              </p>
            </div>

            {/* Podcast Preview */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10px]">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block text-[10px]">
                {isKo ? "광합성 메커니즘 해설" : "Photosynthesis Explained"}
              </span>
              <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                <span>10:45</span>
                <span>12:45</span>
              </div>
              <div className="flex items-center gap-[2px] h-3.5">
                {[4, 9, 14, 7, 11, 16, 8, 13, 5, 11, 15, 7, 13, 6, 12, 17, 9, 5, 13, 7].map((h, i) => (
                  <div key={i} className="flex-1 bg-orange-500/70 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 pt-1 text-neutral-600 dark:text-neutral-300">
                <RotateCcw className="w-3 h-3 cursor-pointer" />
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs cursor-pointer">
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
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "협업 스터디 모드" : "Collaborative Mode"}
                  </h3>
                  <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {isKo ? "함께 배우고 더 큰 성취" : "Learn together. Achieve more."}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "친구들과 스터디하며 자료를 공유하고, 토론하며 실시간으로 함께 문제를 해결하세요."
                  : "Study with friends, share materials, discuss topics, and solve problems together in real-time."}
              </p>
            </div>

            {/* Collab Chat Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2 space-y-1.5 text-[9.5px]">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-neutral-800 pb-1">
                <span className="font-semibold text-neutral-800 dark:text-white truncate">Org Chem Study Group</span>
                <span className="text-[8.5px] text-neutral-400">4 online</span>
              </div>
              <div className="space-y-1">
                <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 leading-tight">
                  {isKo ? "3차 탄소 양이온이 왜 더 안정해?" : "Can someone explain why SN1 reactions prefer tertiary carbons?"}
                </div>
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 leading-tight">
                  {isKo ? "3차 탄소는 하이퍼컨쥬게이션으로 안정화돼!" : "Sure! It's because tertiary carbons form more stable carbocations."}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── Bottom Wide Callout Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-[#f4f2ff] dark:bg-[#1a1429] border border-purple-200/80 dark:border-purple-800/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs"
        >
          {/* Left Text with Icon */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                {isKo ? "모든 과목. 모든 도구. 하나의 공간에서." : "All your courses. All your tools. All in one place."}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-purple-200/80 mt-0.5">
                {isKo
                  ? "Preplit AI는 전체 학습 과정을 하나로 연결합니다 — 더 스마트하고 효율적으로 공부하세요."
                  : "Preplit AI brings your entire learning journey together — so you can study smarter, not harder."}
              </p>
            </div>
          </div>

          {/* Right Action Button & Microcopy */}
          <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
            <a
              href="/preplitai-chat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <span>{isKo ? "지금 바로 시작하기" : "Start Your Journey Today"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {isKo ? "수많은 학생들이 이미 Preplit AI로 스마트하게 학습하고 있습니다." : "Join thousands of students already learning smarter with Preplit AI."}
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
