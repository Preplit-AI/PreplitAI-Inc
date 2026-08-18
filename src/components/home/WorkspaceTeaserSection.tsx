import React, { useState } from "react";
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
  ZoomIn,
  Search,
  Settings,
  Play,
  RotateCcw,
  Send,
  Check,
  Circle,
  Clock,
  BookOpen,
  HelpCircle,
  BarChart3,
  Flame,
} from "lucide-react";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── Top Tag & Section Header ─── */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-10 sm:mb-14 gap-3">
          {/* Tag Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/60 text-[#6b21a8] dark:text-[#c084fc] text-xs font-semibold tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{isKo ? "올인원 AI 학습 워크스페이스" : "All-in-one AI Study Workspace"}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.15] max-w-4xl"
          >
            {isKo ? (
              <>
                학습에 필요한 모든 것.{" "}
                <span className="text-[#6366f1] dark:text-[#818cf8]">Preplit AI 하나로.</span>
              </>
            ) : (
              <>
                Everything you need to study. All in{" "}
                <span className="text-[#6366f1] dark:text-[#818cf8]">Preplit AI.</span>
              </>
            )}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-2xl mt-1 leading-relaxed"
          >
            {isKo
              ? "개념 이해부터 시험 당일까지 — Preplit AI는 학습 여정의 모든 단계를 하나의 지능형 워크스페이스로 통합합니다."
              : "From understanding to exam day — Preplit AI brings every part of your learning journey together in one intelligent workspace."}
          </motion.p>
        </div>

        {/* ─── Grid Row 1: 5 Core Tool Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">

          {/* 1. AI Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료에 대해 무엇이든 질문하고, 정확한 출처 기반 답변을 받으세요."
                  : "Ask anything about your course materials and get accurate, context-aware answers grounded in your content."}
              </p>
            </div>

            {/* Chat Preview Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                {isKo ? "SN2 반응을 쉽게 설명해줘." : "Explain SN2 reactions in simple terms."}
              </div>
              <div className="p-2 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 text-purple-950 dark:text-purple-200 text-[10.5px] leading-relaxed">
                <div className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  <span>Preplit AI</span>
                </div>
                {isKo
                  ? "SN2 반응은 친핵체가 탄소의 배면을 단일 단계로 공격하는 입체 반전 반응입니다."
                  : "SN2 reactions occur in a single step where a nucleophile attacks the electrophilic carbon from the backside..."}
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200/80 dark:border-neutral-700 text-neutral-400 text-[10px]">
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "렉처 버디" : "Lecture Buddy"}
                  </h3>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {isKo ? "실시간 강의 캡처 & 구조화" : "Capture. Structure. Never miss."}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의를 실시간 녹음하고, AI가 체계적인 복습 노트로 즉시 변환합니다."
                  : "Record lectures in real-time and let AI convert them into well-organized notes so you can focus on understanding."}
              </p>
            </div>

            {/* Lecture Buddy Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{isKo ? "녹음 중..." : "Recording..."}</span>
                </div>
                <span className="text-neutral-400 font-mono text-[10px]">12:45</span>
              </div>
              {/* Waveform graphic */}
              <div className="flex items-center gap-[2px] h-6 px-1">
                {[4, 8, 14, 6, 12, 18, 9, 15, 6, 11, 16, 8, 14, 7, 12, 19, 10, 5, 13, 8, 14, 6].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500/70 dark:bg-blue-400/80 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-neutral-800 text-[10.5px]">
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
                  <span className="truncate">{isKo ? "중요 시험 포인트 생성" : "Important Points"}</span>
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료와 수업 내용을 명확하고 구조화된 요약본으로 정리합니다."
                  : "Get clear, structured, and easy-to-understand notes generated from your lectures, materials, and chats."}
              </p>
            </div>

            {/* Note Preview Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div>
                  <span className="font-bold text-neutral-800 dark:text-white block mb-1.5">
                    {isKo ? "핵심 개념" : "Key Concepts"}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="h-2 bg-slate-200 dark:bg-neutral-700 rounded-sm w-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="h-2 bg-slate-200 dark:bg-neutral-700 rounded-sm w-3/4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="h-2 bg-slate-200 dark:bg-neutral-700 rounded-sm w-5/6" />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-neutral-800 dark:text-white block mb-1.5">
                    {isKo ? "적용 예시" : "Examples"}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="h-2 bg-slate-200 dark:bg-neutral-700 rounded-sm w-4/5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="h-2 bg-slate-200 dark:bg-neutral-700 rounded-sm w-2/3" />
                    </div>
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 자료에서 플래시카드를 자동 생성하고 간격 반복 알고리즘으로 암기하세요."
                  : "Automatically generate flashcards from your materials and review with spaced repetition."}
              </p>
            </div>

            {/* Flashcard Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-center shadow-xs">
                <span className="text-[10px] text-neutral-400 block mb-1">{isKo ? "질문" : "Prompt"}</span>
                <p className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 leading-snug">
                  {isKo ? "SN2 반응의 주요 생성물 특징은?" : "What is the main product of an SN2 reaction?"}
                </p>
                <div className="mt-2 py-1 px-2 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10.5px] font-bold">
                  {isKo ? "입체 배치의 반전 (Inversion)" : "Inversion of configuration"}
                </div>
              </div>
              <div className="flex items-center justify-between text-neutral-400 text-[10px] px-1">
                <span className="cursor-pointer hover:text-neutral-600">‹</span>
                <span className="font-mono">1 / 25</span>
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 내용으로 맞춤 퀴즈를 생성하고 즉각적인 해설 피드백을 받으세요."
                  : "Generate quizzes from your course content and get instant feedback to improve faster."}
              </p>
            </div>

            {/* Quiz Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-1.5 text-[10.5px]">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                {isKo ? "이진 탐색 트리 순회 순서는?" : "Which traversal visits the root between left & right?"}
              </p>
              <div className="space-y-1 pt-1">
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  A &nbsp; Preorder
                </div>
                <div className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-between">
                  <span>B &nbsp; Inorder</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  C &nbsp; Postorder
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── Grid Row 2: 5 Advanced Tool Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

          {/* 6. Exam Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "기출문제와 강의 패턴을 분석하여 출제 확률이 높은 핵심 주제를 도출합니다."
                  : "We analyze your materials and past papers to highlight high-probability topics so you can focus on what matters most."}
              </p>
            </div>

            {/* Exam Predictions Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 space-y-2 text-[11px]">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                {isKo ? "시험 집중 영역" : "Exam Focus Areas"}
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">Graph Traversal</span>
                  </div>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-600">High</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">Dynamic Prog.</span>
                  </div>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600">Medium</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">Big-O Analysis</span>
                  </div>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-700 text-neutral-500">Low</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 7. 3D Interactive Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {isKo ? "3D 입체 학습" : "3D Interactive Learning"}
                  </h3>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {isKo ? "보고 만지며 깊이 이해" : "Understand by seeing & doing."}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "공학, 생물학, 화학 등의 복잡한 구조를 회전하고 확대하며 인터랙티브하게 탐색하세요."
                  : "Explore interactive 3D models for complex topics in subjects like engineering, biology, chemistry, and more."}
              </p>
            </div>

            {/* 3D Model Graphic */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 flex flex-col items-center justify-center">
              <svg viewBox="0 0 140 90" className="w-32 h-20" xmlns="http://www.w3.org/2000/svg">
                {/* Bonds */}
                <line x1="45" y1="45" x2="70" y2="25" stroke="#94a3b8" strokeWidth="2.5" />
                <line x1="70" y1="25" x2="95" y2="45" stroke="#94a3b8" strokeWidth="2.5" />
                <line x1="95" y1="45" x2="70" y2="65" stroke="#94a3b8" strokeWidth="2.5" />
                <line x1="70" y1="65" x2="45" y2="45" stroke="#94a3b8" strokeWidth="2.5" />
                <line x1="95" y1="45" x2="120" y2="45" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="45" y1="45" x2="20" y2="45" stroke="#cbd5e1" strokeWidth="2" />
                {/* Atoms */}
                <circle cx="70" cy="25" r="7" fill="#1e293b" />
                <circle cx="95" cy="45" r="8" fill="#3b82f6" />
                <circle cx="70" cy="65" r="7" fill="#1e293b" />
                <circle cx="45" cy="45" r="8" fill="#6366f1" />
                <circle cx="120" cy="45" r="6" fill="#ef4444" />
                <circle cx="20" cy="45" r="5" fill="#10b981" />
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
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "강의 슬라이드를 AI 내레이션과 시각 자료가 포함된 몰입형 동영상 강의로 변환합니다."
                  : "Convert study materials into engaging video lectures with AI narration and visual explanations."}
              </p>
            </div>

            {/* Video Player Widget */}
            <div className="rounded-xl bg-slate-900 text-white p-3 space-y-2 text-[11px] shadow-sm">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span className="font-semibold">{isKo ? "화학 반응 속도론" : "Chemical Kinetics"}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px]">HD</span>
              </div>
              <div className="relative py-4 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
              <div>
                <div className="h-1 rounded-full bg-white/20 overflow-hidden mb-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "35%" }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
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
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-100 dark:border-orange-800/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "어떤 주제든 대화형 팟캐스트 오디오로 변환하여 언제 어디서나 학습하세요."
                  : "Turn any topic into a podcast-style audio and learn wherever you are, whenever you want."}
              </p>
            </div>

            {/* Podcast Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {isKo ? "광합성 메커니즘 해설" : "Photosynthesis Explained"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9.5px] text-neutral-400 font-mono">
                <span>10:45</span>
                <span>12:45</span>
              </div>
              <div className="flex items-center gap-[2px] h-4">
                {[5, 10, 16, 8, 12, 18, 9, 14, 6, 12, 17, 8, 14, 7, 13, 19, 10, 6, 14, 8].map((h, i) => (
                  <div key={i} className="flex-1 bg-orange-500/70 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 pt-1 text-neutral-600 dark:text-neutral-300">
                <RotateCcw className="w-3.5 h-3.5 cursor-pointer" />
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs cursor-pointer">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
                <RotateCw className="w-3.5 h-3.5 cursor-pointer" />
              </div>
            </div>
          </motion.div>

          {/* 10. Collaborative Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {isKo
                  ? "친구들과 자료를 공유하고, 토론하며 실시간으로 함께 문제를 해결하세요."
                  : "Study with friends, share materials, discuss topics, and solve problems together in real-time."}
              </p>
            </div>

            {/* Collab Chat Widget */}
            <div className="rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200/60 dark:border-neutral-800 p-2.5 space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-neutral-800 pb-1.5">
                <span className="font-semibold text-neutral-800 dark:text-white truncate">Org Chem Group</span>
                <div className="flex -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center border border-white font-bold">A</div>
                  <div className="w-4 h-4 rounded-full bg-purple-500 text-[8px] text-white flex items-center justify-center border border-white font-bold">J</div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center border border-white font-bold">+2</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 leading-tight">
                  {isKo ? "3차 탄소 양이온이 왜 더 안정해?" : "Why are tertiary carbocations more stable?"}
                </div>
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[10px] text-purple-900 dark:text-purple-200 leading-tight">
                  {isKo ? "하이퍼컨쥬게이션 효과 때문이야!" : "Hyperconjugation stabilizes the charge!"}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── Grid Row 3: All-in-One Workspace Hub & Real-time Progress ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">

          {/* 11. All-in-One Study Workspace Hub (8 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-8 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                <span>{isKo ? "통합 허브" : "Unified Hub"}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                {isKo ? "올인원 학습 워크스페이스" : "All-in-One Study Workspace"}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                {isKo
                  ? "강의 자료, 필기 노트, 퀴즈, 플래시카드, 강의 영상, 성취도 분석까지 — 모든 것이 개인 스터디 허브에 완벽히 동기화됩니다."
                  : "Your materials, notes, quizzes, flashcards, lectures, and progress — all synced in your personal study hub."}
              </p>
            </div>

            {/* Embedded Workspace Preview */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/90 overflow-hidden shadow-inner flex flex-col md:flex-row">
              {/* Mini Sidebar */}
              <div className="w-full md:w-44 bg-white dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-neutral-800 p-3.5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
                  <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">P</div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Preplit AI</span>
                </div>
                <div className="space-y-1 text-[11px] font-medium">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>My Courses</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Materials</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Quizzes</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analytics</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-neutral-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Organic Chemistry II</h4>
                    <p className="text-[10.5px] text-neutral-500">Prof. Harrison · Spring Semester</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-lg border border-slate-200 dark:border-neutral-700 text-[10.5px]">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">Overview</span>
                    <span className="px-2 py-0.5 text-neutral-500">Notes</span>
                    <span className="px-2 py-0.5 text-neutral-500">Quizzes</span>
                  </div>
                </div>

                {/* Timeline activity */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Recent Activity</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                          <Mic className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">Lecture Buddy session recorded</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Today, 10:20 AM</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                          <CheckSquare className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">Practice Quiz Completed (92%)</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Today, 09:15 AM</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                          <Layers className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">25 New Flashcards Generated</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 12. Real-time Progress (4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                <span>{isKo ? "실시간 성취도" : "Real-time Progress"}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                {isKo ? "학습 분석 & 성장 추적" : "Track. Improve. Grow."}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                {isKo
                  ? "정밀한 분석 데이터로 학습 진도, 강점, 취약 영역을 실시간으로 확인하세요."
                  : "Monitor your learning progress, strengths, and weak areas with detailed analytics."}
              </p>
            </div>

            {/* Donut & Weekly Activity Widget */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/90 p-4 space-y-4">
              {/* Circular Progress Gauge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Overall Progress</span>
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">78%</span>
                  <span className="text-[10px] font-semibold text-emerald-600 block">Top 5% in class</span>
                </div>
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeDasharray={`${78 * 2.39} ${100 * 2.39}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-800 dark:text-white">78%</span>
                  </div>
                </div>
              </div>

              {/* Weekly Activity Bars */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Weekly Activity</span>
                <div className="flex items-end justify-between gap-1.5 h-14 pt-2">
                  {[
                    { day: "Mon", h: 70 },
                    { day: "Tue", h: 90 },
                    { day: "Wed", h: 45 },
                    { day: "Thu", h: 100 },
                    { day: "Fri", h: 80 },
                    { day: "Sat", h: 30 },
                    { day: "Sun", h: 60 },
                  ].map((item) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm bg-emerald-500/80 dark:bg-emerald-400" style={{ height: `${item.h}%` }} />
                      <span className="text-[9px] text-neutral-400 font-mono">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── Bottom Callout Strip with Action Button ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
        >
          {/* Left Text with Sparkle */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white">
              {isKo ? (
                <>
                  Preplit AI는 전체 학습 과정을 하나로 연결합니다 —{" "}
                  <span className="text-purple-700 dark:text-purple-300 font-bold">더 스마트하고 효율적인 학업을 시작하세요.</span>
                </>
              ) : (
                <>
                  Preplit AI brings your entire learning journey together —{" "}
                  <span className="text-purple-700 dark:text-purple-300 font-bold">so you can study smarter, not harder.</span>
                </>
              )}
            </p>
          </div>

          {/* Right Action Button */}
          <a
            href="/preplitai-chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            <span>{isKo ? "지금 바로 시작하기" : "Start Your Journey Today"}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
};
