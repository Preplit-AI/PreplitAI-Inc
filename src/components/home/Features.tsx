import { MessageSquare, Layout, MonitorPlay, Radio, Layers, CheckSquare, Target, GraduationCap, BarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const features = [
    { icon: MessageSquare, label: isKo ? "AI 스터디 챗" : "AI Study Chat", sub: isKo ? "교재 기반 즉시 답변" : "Instant answers from your notes" },
    { icon: Layout, label: isKo ? "인터랙티브 학습" : "Interactive Learning", sub: isKo ? "능동적 개념 점검" : "Active content engagement" },
    { icon: MonitorPlay, label: isKo ? "비디오 요약" : "Video Summaries", sub: isKo ? "핵심을 영상으로 정리" : "Complex topics, simplified" },
    { icon: Radio, label: isKo ? "오디오 팟캐스트" : "Audio Podcasts", sub: isKo ? "이동 중 청취 학습" : "Study while commuting" },
    { icon: Layers, label: isKo ? "스마트 플래시카드" : "Flashcards", sub: isKo ? "간격 반복 자동 생성" : "Spaced repetition, auto-built" },
    { icon: CheckSquare, label: isKo ? "연습 퀴즈" : "Practice Quizzes", sub: isKo ? "AI 피드백 모의고사" : "Auto-graded with AI feedback" },
    { icon: Target, label: isKo ? "출제 예상" : "Exam Predictions", sub: isKo ? "시험 출제 패턴 분석" : "Predict what's on the test" },
    { icon: GraduationCap, label: isKo ? "한국 학업 지원" : "Korean Academic", sub: isKo ? "전공 용어 다국어 지원" : "Built for Korean universities" },
    { icon: BarChart, label: isKo ? "학습 분석" : "Learning Analytics", sub: isKo ? "실시간 숙달도 추적" : "Track mastery in real time" },
  ];

  return (
    <section className="bg-white dark:bg-[#0a0a0a] py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            {isKo ? "더 똑똑하게 공부하는 데 필요한 모든 것" : "Everything you need to study smarter"}
          </h2>
          <p className="mt-4 text-[15px] sm:text-base text-gray-500 dark:text-gray-400">
            {isKo ? "9가지 도구. 하나의 워크스페이스. 업로드만 하면 끝." : "Nine tools. One workspace. Just upload and go."}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/[0.06] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06]">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-7 flex items-start gap-4 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-[17px] h-[17px] text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">{f.label}</p>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">{f.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
