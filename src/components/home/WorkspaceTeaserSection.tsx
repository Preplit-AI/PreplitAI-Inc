import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, BookOpen, FileText, Radio, Target, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

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
    }
  ];

  return (
    <section id="workspace-teaser" className="py-24 px-6 bg-[#faf9f7] dark:bg-[#111]">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-4 leading-tight">
            {isKo ? 'PreplitAI 워크스페이스 탐색' : 'Explore PreplitAI Workspace'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {isKo
              ? '강의 자료를 업로드하면 나만의 커리큘럼에 맞춰진 올인원 AI 학습 튜터가 열립니다.'
              : 'Upload your course materials and unlock an all-in-one AI learning suite tailored directly to your curriculum.'}
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-4 text-black dark:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-black dark:bg-white text-white dark:text-black flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isKo ? '학습 효율을 극대화할 준비가 되셨나요?' : 'Ready to elevate your study sessions?'}
            </h3>
            <p className="text-sm opacity-80">
              {isKo ? '지금 바로 인터랙티브 AI 워크스페이스를 무료로 시작하세요.' : 'Open the interactive AI Workspace now — free to start.'}
            </p>
          </div>
          <Button
            asChild
            className="px-7 py-3 h-12 text-[14px] font-semibold bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all shrink-0"
          >
            <a href="/preplitai-chat" className="flex items-center gap-2">
              <span>{isKo ? '워크스페이스 열기' : 'Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
};
