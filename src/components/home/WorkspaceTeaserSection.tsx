import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, BookOpen, FileText, Radio, Target, ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tools = [
    { icon: MessageSquare, title: isKo ? "출처 인용 RAG 챗" : "Grounded RAG Chat", sub: isKo ? "페이지 인용 즉시 답변" : "Answers with page citations" },
    { icon: HelpCircle, title: isKo ? "AI 퀴즈 생성" : "AI Quiz Generator", sub: isKo ? "실전 모의고사 자동 생성" : "Auto-generated practice exams" },
    { icon: BookOpen, title: isKo ? "스마트 플래시카드" : "Smart Flashcards", sub: isKo ? "간격 반복 암기 카드" : "Spaced repetition decks" },
    { icon: FileText, title: isKo ? "핵심 요약" : "Dense Summaries", sub: isKo ? "수백 페이지를 핵심만" : "Long readings, distilled" },
    { icon: Radio, title: isKo ? "오디오 팟캐스트" : "Audio Podcasts", sub: isKo ? "AI 대화형 학습 라디오" : "Two-speaker AI discussions" },
    { icon: Target, title: isKo ? "출제 예상 문제" : "Exam Predictions", sub: isKo ? "시험 출제 확률 분석" : "Likely questions, ranked" },
  ];

  const faqs = [
    {
      q: isKo ? "PreplitAI란 무엇인가요?" : "What is PreplitAI?",
      a: isKo
        ? "PreplitAI는 강의 슬라이드, PDF, 교재를 인터랙티브 학습 도구로 변환하는 AI 학업 파트너입니다. 출처 인용 챗, 퀴즈, 플래시카드, 팟캐스트, 시험 예측 기능을 제공합니다."
        : "PreplitAI is an AI-powered study companion that transforms your lecture slides, PDFs, and textbooks into interactive learning tools including grounded chat, quizzes, flashcards, podcasts, and exam predictions.",
    },
    {
      q: isKo ? "시험 준비에 어떻게 도움이 되나요?" : "How does PreplitAI help me study for exams?",
      a: isKo
        ? "강의 자료를 업로드하면 연습 퀴즈, 출제 예상 문제, 간격 반복 플래시카드, 핵심 요약집을 자동 생성합니다."
        : "Upload your course materials and PreplitAI generates practice quizzes, predicted exam questions, spaced-repetition flashcards, and dense summaries \u2014 all grounded in your actual syllabus.",
    },
    {
      q: isKo ? "어떤 자료를 업로드할 수 있나요?" : "What kinds of materials can I upload?",
      a: isKo
        ? "PDF, DOCX, 텍스트 파일을 업로드할 수 있습니다. 강의 슬라이드, 교재, 기출문제, 스캔한 필기 노트 모두 지원합니다."
        : "You can upload PDFs, DOCX files, and plain text. This includes lecture slides, textbook chapters, past exams, and handwritten notes as scanned PDFs.",
    },
    {
      q: isKo ? "업로드한 자료에 대해 질문할 수 있나요?" : "Can I ask questions about my materials?",
      a: isKo
        ? "네. 출처 인용 RAG 챗봇이 업로드한 문서에서 정확한 페이지를 인용하며 답변합니다."
        : "Yes. The grounded RAG chat gives you precise answers with page-level citations from your uploaded documents \u2014 no hallucination.",
    },
    {
      q: isKo ? "퀴즈와 플래시카드를 생성하나요?" : "Does PreplitAI generate quizzes and flashcards?",
      a: isKo
        ? "네. 객관식, 빈칸 채우기, 단답형 퀴즈와 간격 반복 플래시카드를 커리큘럼에 맞춰 자동 생성합니다."
        : "Yes. PreplitAI auto-generates multiple-choice, fill-in-the-blank, and short-answer quizzes plus spaced-repetition flashcards, all mapped to your curriculum.",
    },
    {
      q: isKo ? "PreplitAI는 무료인가요?" : "Is PreplitAI free to use?",
      a: isKo
        ? "무료 체험판으로 시작할 수 있으며, 프리미엄 플랜에서 무제한 업로드와 고급 분석 기능을 이용할 수 있습니다."
        : "PreplitAI offers a free tier to get started. Premium plans unlock unlimited uploads, advanced analytics, and priority AI processing.",
    },
  ];

  return (
    <section id="workspace-teaser" className="py-20 sm:py-28 px-6 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            {isKo ? "하나의 워크스페이스, 모든 학습 도구" : "Your entire study toolkit, in one workspace"}
          </h2>
          <p className="mt-4 text-[15px] sm:text-base text-gray-500 dark:text-gray-400">
            {isKo ? "업로드하면 커리큘럼에 맞춘 AI 도구가 자동으로 열립니다." : "Upload your materials. Everything else is built for you."}
          </p>
        </div>

        {/* 6 Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/[0.06] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] mb-16">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.title}
                className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-7 flex items-start gap-4 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-[17px] h-[17px] text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">{t.title}</p>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">{t.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-gray-950 dark:bg-white/[0.04] dark:border dark:border-white/[0.08] px-8 py-10 sm:px-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isKo ? "지금 바로 시작하세요" : "Ready to study smarter?"}
            </h3>
            <p className="text-sm text-white/50">
              {isKo ? "무료로 AI 워크스페이스를 체험해보세요." : "Open the AI Workspace \u2014 free to start."}
            </p>
          </div>
          <Button
            asChild
            className="px-7 py-3 h-11 text-[14px] font-semibold bg-white text-black hover:bg-gray-100 rounded-full transition-all shrink-0"
          >
            <a href="/preplitai-chat" className="flex items-center gap-2">
              <span>{isKo ? "워크스페이스 열기" : "Launch Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* FAQ */}
        <div className="mt-20 sm:mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center mb-10">
            {isKo ? "자주 묻는 질문" : "Frequently Asked Questions"}
          </h2>
          <div className="max-w-3xl mx-auto rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={i < faqs.length - 1 ? "border-b border-gray-100 dark:border-white/[0.06]" : ""}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-[15px] font-medium text-gray-900 dark:text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-6 pb-5">
                      <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
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
