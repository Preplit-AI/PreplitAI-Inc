import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  HelpCircle,
  BookOpen,
  FileText,
  Radio,
  Target,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const features = [
    {
      icon: MessageSquare,
      title: isKo ? "출처 인용 RAG AI 챗" : "Grounded RAG Chat",
      desc: isKo
        ? "전공 서적 및 강의 PDF에 관해 질문하면 환각 없이 원문 페이지를 명확히 인용하며 답변합니다."
        : "Ask questions and get instant answers backed directly by your course PDFs and lecture notes with precise page citations.",
    },
    {
      icon: HelpCircle,
      title: isKo ? "AI 퀴즈 생성기" : "AI Quiz Generator",
      desc: isKo
        ? "실제 시험 출제 스타일(객관식, 빈칸, 단답형)에 맞춘 실전 모의고사 퀴즈를 자동 생성합니다."
        : "Auto-generate practice exams with multiple choice, fill-in-the-blank, and short answers mapped to your syllabus.",
    },
    {
      icon: BookOpen,
      title: isKo ? "스마트 플래시카드" : "Smart Flashcards",
      desc: isKo
        ? "교재의 주요 개념과 암기 키워드를 자동 추출하여 간격 반복 학습덱을 생성합니다."
        : "Master key terminology with active recall flashcard decks extracted directly from your study documents.",
    },
    {
      icon: FileText,
      title: isKo ? "핵심 요약 노트" : "Dense Summaries",
      desc: isKo
        ? "수백 페이지의 전공서와 강의 슬라이드를 구조화된 핵심 족보 요약집으로 정리합니다."
        : "Convert lengthy textbooks and slide decks into crisp, structured bullet-point executive summaries.",
    },
    {
      icon: Radio,
      title: isKo ? "오디오 팟캐스트 생성기" : "Audio Podcast Generator",
      desc: isKo
        ? "이동 중에도 학습할 수 있도록 학습 자료를 2인 대화형 AI 팟캐스트 오디오로 변환합니다."
        : "Listen on the go with two-speaker AI conversational podcast episodes discussing your course topics.",
    },
    {
      icon: Target,
      title: isKo ? "출제 예상 문제 예측" : "Expected Exam Questions",
      desc: isKo
        ? "기출 패턴과 교수님 강의 특징을 분석하여 시험 출제 확률이 높은 예상 문제를 뽑아줍니다."
        : "Generate target exam items with step-by-step model answers and probability ratings.",
    },
  ];

  const faqs = [
    {
      q: isKo ? "PreplitAI란 무엇인가요?" : "What is PreplitAI?",
      a: isKo
        ? "PreplitAI는 강의 슬라이드, PDF, 교재를 인터랙티브 학습 도구로 변환하는 AI 학업 파트너입니다. 출처 인용 챗, 퀴즈, 플래시카드, 팟캐스트, 시험 예측 기능을 제공합니다."
        : "PreplitAI is an AI-powered study companion that transforms your lecture slides, PDFs, and textbooks into interactive learning tools including grounded chat, quizzes, flashcards, podcasts, and exam predictions.",
    },
    {
      q: isKo
        ? "PreplitAI가 시험 준비에 어떻게 도움이 되나요?"
        : "How does PreplitAI help me study for exams?",
      a: isKo
        ? "강의 자료를 업로드하면 PreplitAI가 연습 퀴즈, 출제 예상 문제, 간격 반복 플래시카드, 핵심 요약집을 자동 생성합니다."
        : "Upload your course materials and PreplitAI analyzes them to generate practice quizzes, predicted exam questions, spaced-repetition flashcards, and dense summaries — all grounded in your actual syllabus.",
    },
    {
      q: isKo
        ? "어떤 자료를 업로드할 수 있나요?"
        : "What kinds of materials can I upload?",
      a: isKo
        ? "PDF, DOCX, 텍스트 파일을 업로드할 수 있습니다. 강의 슬라이드, 교재, 기출문제, 스캔한 필기 노트 모두 지원합니다."
        : "You can upload PDFs, DOCX files, and plain text. This includes lecture slides, textbook chapters, past exams, and handwritten notes (as scanned PDFs).",
    },
    {
      q: isKo
        ? "업로드한 자료에 대해 질문할 수 있나요?"
        : "Can I ask questions about my materials?",
      a: isKo
        ? "네. 출처 인용 RAG 챗봇이 업로드한 문서에서 정확한 페이지를 인용하며 답변합니다."
        : "Yes. The grounded RAG chat lets you ask any question and get precise answers with page-level citations from your uploaded documents — no hallucination.",
    },
    {
      q: isKo
        ? "PreplitAI가 퀴즈와 플래시카드를 생성하나요?"
        : "Does PreplitAI generate quizzes and flashcards?",
      a: isKo
        ? "네. 객관식, 빈칸 채우기, 단답형 퀴즈와 간격 반복 플래시카드를 커리큘럼에 맞춰 자동 생성합니다."
        : "Yes. PreplitAI auto-generates multiple-choice, fill-in-the-blank, and short-answer quizzes plus spaced-repetition flashcards, all mapped to your curriculum.",
    },
    {
      q: isKo
        ? "PreplitAI는 무료인가요?"
        : "Is PreplitAI free to use?",
      a: isKo
        ? "무료 체험판으로 시작할 수 있으며, 프리미엄 플랜에서 무제한 업로드와 고급 분석 기능을 이용할 수 있습니다."
        : "PreplitAI offers a free tier to get started. Premium plans unlock unlimited uploads, advanced analytics, and priority AI processing.",
    },
  ];

  return (
    <section
      id="workspace-teaser"
      className="py-24 px-6 bg-white dark:bg-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-4">
            {isKo ? "올인원 학습 플랫폼" : "All-in-one study platform"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-5 leading-[1.15]">
            {isKo
              ? "필요한 모든 학습 도구, 하나의 워크스페이스에"
              : "Your entire study toolkit, in one workspace"}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {isKo
              ? "강의 자료를 업로드하면 나만의 커리큘럼에 맞춰진 AI 학습 도구가 자동으로 열립니다."
              : "Upload your course materials and unlock a complete AI learning suite built around your actual curriculum."}
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.12] transition-all duration-200 flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-5">
                  <Icon className="w-[18px] h-[18px] text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-black dark:bg-white/[0.04] dark:border dark:border-white/[0.08] px-8 py-10 sm:px-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isKo
                ? "학습 효율을 극대화할 준비가 되셨나요?"
                : "Ready to transform how you study?"}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {isKo
                ? "지금 바로 AI 워크스페이스를 무료로 시작하세요."
                : "Open the interactive AI Workspace now — free to start."}
            </p>
          </div>
          <Button
            asChild
            className="px-7 py-3 h-12 text-[14px] font-semibold bg-white text-black hover:bg-gray-100 rounded-full transition-all shrink-0"
          >
            <a href="/preplitai-chat" className="flex items-center gap-2">
              <span>
                {isKo ? "워크스페이스 열기" : "Launch Workspace"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isKo ? "자주 묻는 질문" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#0a0a0a]">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              const isLast = i === faqs.length - 1;
              return (
                <div
                  key={i}
                  className={
                    !isLast
                      ? "border-b border-gray-100 dark:border-white/[0.06]"
                      : ""
                  }
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <span className="text-[15px] font-medium text-gray-900 dark:text-white leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
