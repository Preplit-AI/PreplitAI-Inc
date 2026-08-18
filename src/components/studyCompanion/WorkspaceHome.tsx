import React from "react";
import { Plus, TrendingUp, MessageSquare, Zap, Sparkles, BookOpen, HelpCircle, Globe, Radio, BarChart2, Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Space { id: string; name: string; }
interface WorkspaceHomeProps {
  onCreateSpace: () => void;
  onSelectSpace: (spaceId: string) => void;
  onUploadContent: () => void;
  spaces: Space[];
  activeSpaceId: string;
  onToolSelect: (tool: string) => void;
}

export function WorkspaceHome({ onCreateSpace, spaces, activeSpaceId, onToolSelect }: WorkspaceHomeProps) {
  const { checkDeveloperAccess } = useAuth();
  const { language } = useLanguage();
  const isKo = language === "ko";
  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
  const hour = new Date().getHours();
  
  const greeting = isKo 
    ? (hour < 12 ? "좋은 아침입니다" : hour < 17 ? "즐거운 오후입니다" : "좋은 저녁입니다")
    : (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

  const tools = [
    { id: "chat",       icon: MessageSquare, label: isKo ? "AI 학습 챗봇" : "AI Study Chat",           desc: isKo ? "업로드한 노트를 바탕으로 실시간 질문" : "Ask anything, grounded in your notes",    flagship: false },
    { id: "explore3d",  icon: Zap,           label: isKo ? "3D 인터랙티브 학습" : "3D Interactive Learning", desc: isKo ? "교재 2D 구조도를 회전 조작 3D 모델로 전환" : "Turn any diagram into a 3D model",        flagship: true  },
    { id: "expected",   icon: Sparkles,      label: isKo ? "출제 예상 족보" : "Exam Predictor",          desc: isKo ? "수업 족보 및 노트 기반 시험 예상 문제" : "Predicted questions from your uploads",   flagship: false },
    { id: "flashcards", icon: BookOpen,      label: isKo ? "AI 플래시카드" : "Flashcards",              desc: isKo ? "망각 곡선 맞춤형 벼락치기 복습 카드" : "Spaced repetition, tuned to you",         flagship: false },
    { id: "quizzes",    icon: HelpCircle,    label: isKo ? "스마트 개념 퀴즈" : "Smart Quiz",              desc: isKo ? "개념해설이 포함된 자동 생성 연습 문제" : "Unlimited quizzes, graded conceptually", flagship: false },
    { id: "chat",       icon: Globe,         label: isKo ? "한국어 학업 보조 AI" : "Korean Assistant",        desc: isKo ? "이중 언어 전공 번역 및 교수님 족보 분석" : "Bilingual, tuned to your professor",      flagship: false },
    { id: "podcast",    icon: Radio,         label: isKo ? "AI 팟캐스트 오디오" : "Podcast Mode",            desc: isKo ? "이동 시간 듣는 전공 요약 라디오" : "Study on your commute",                   flagship: false },
    { id: "analytics",  icon: BarChart2,     label: isKo ? "학습 성취도 분석" : "Analytics",               desc: isKo ? "취약 단원 및 복습 우선순위 차트" : "See exactly what to review next",         flagship: false },
    { id: "lecture-buddy", icon: Mic,          label: isKo ? "AI 강의 녹음" : "AI Lecture Buddy",          desc: isKo ? "강의 녹음 후 AI 노트 자동 생성" : "Record lectures, get AI notes",           flagship: true  },
  ];

  const handleToolClick = (tool: { id: string; label: string }) => {
    if (!checkDeveloperAccess(tool.label, isKo)) return;
    onToolSelect(tool.id);
  };

  const handleCreateSpaceClick = () => {
    if (!checkDeveloperAccess(isKo ? "새 스터디 공간" : "New Study Space", isKo)) return;
    onCreateSpace();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto md:overflow-hidden bg-[#f5f4f1] px-4 sm:px-6 md:px-8 py-5 gap-4">
      {/* Greeting Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11.5px] text-[#888] font-medium">{greeting}</p>
          <h1 className="text-[20px] sm:text-[24px] font-bold text-[#111] tracking-tight leading-tight">
            {activeSpace ? activeSpace.name : (isKo ? "나만의 학습 공간" : "Your Workspace")}
          </h1>
          <p className="text-[12px] text-[#888] mt-0.5">
            {isKo ? "중간고사 D-6 · 강의 노트를 업로드해 시작해보세요" : "Midterm in 6 days · Upload notes to get started"}
          </p>
        </div>
        <div className="bg-[#550000] text-white rounded-2xl px-4 py-2.5 text-right shrink-0 hidden sm:block shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-0.5">
            {isKo ? "시험 준비도" : "Exam Readiness"}
          </p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[20px] font-bold">78%</span>
            <TrendingUp className="w-4 h-4 opacity-90" />
          </div>
        </div>
      </div>

      {/* Stats Cards - Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="flex overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] sm:grid sm:grid-cols-3 gap-2.5 shrink-0 scrollbar-none pb-1 sm:pb-0 scroll-smooth">
        {[
          { icon: "🔥", title: isKo ? "12일 연속 학습" : "12-day streak",    sub: isKo ? "꾸준한 습관 달성 중!" : "Keep it up!" },
          { icon: "🃏", title: isKo ? "복습 카드 24개" : "24 cards due",      sub: isKo ? "오늘 복습 대기 중" : "Ready today" },
          { icon: "📝", title: isKo ? "시험 3개 분석 완료" : "3 exams analyzed", sub: isKo ? "예상 족보 생성 완료" : "Exam predictor fed" },
        ].map((stat, i) => (
          <div key={i} className="ws-card flex items-center gap-3 px-3.5 py-3 min-w-[150px] sm:min-w-0 shrink-0">
            <span className="text-xl shrink-0">{stat.icon}</span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[#111] truncate">{stat.title}</p>
              <p className="text-[11px] text-[#888] truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tools Section */}
      <div className="flex-1 md:min-h-0 flex flex-col">
        <p className="text-[11.5px] font-bold text-[#888] uppercase tracking-wider mb-2 shrink-0">
          {isKo ? "AI 학습 도구 모음" : "Your tools"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:flex-1 md:min-h-0 md:auto-rows-fr">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <button
                key={i}
                onClick={() => handleToolClick(tool)}
                className="ws-card text-left p-3 sm:p-4 hover:shadow-md hover:border-[#d0cbc4] transition-all group relative flex flex-col justify-between min-h-[76px] sm:min-h-[92px] md:min-h-0"
              >
                {tool.flagship && (
                  <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-[#550000] text-white text-[8px] sm:text-[8.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {isKo ? "핵심 기능" : "Flagship"}
                  </span>
                )}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-[#e8e5e0] bg-[#f7f4f0] flex items-center justify-center mb-1.5 sm:mb-2 group-hover:border-[#550000]/30 transition-colors shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#550000]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[12.5px] sm:text-[13px] font-semibold text-[#111] leading-snug">{tool.label}</p>
                  <p className="hidden sm:block text-[11.5px] text-[#888] mt-0.5 leading-snug line-clamp-2">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {spaces.length === 0 && (
        <div className="border border-dashed border-[#d5d0c8] rounded-2xl p-5 text-center bg-white/60 shrink-0">
          <p className="text-[13px] font-semibold text-[#666]">{isKo ? "등록된 스터디 공간이 없습니다" : "No study spaces yet"}</p>
          <p className="text-[12px] text-[#999] mt-0.5 mb-3">{isKo ? "과목별 스터디 공간을 만들어 교재를 업로드해보세요" : "Create a space for each course"}</p>
          <button onClick={handleCreateSpaceClick} className="ws-btn-primary text-[12.5px] px-4 py-2 inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> {isKo ? "첫 스터디 공간 만들기" : "Create first space"}
          </button>
        </div>
      )}
    </div>
  );
}
