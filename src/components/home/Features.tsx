import { MessageSquare, Layout, MonitorPlay, Radio, Layers, CheckSquare, Target, GraduationCap, BarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const features = [
    {
      icon: MessageSquare,
      label: isKo ? "AI 스터디 챗" : "AI Study Chat",
      description: isKo
        ? "강의 자료와 직접 대화하세요. 출처 인용 RAG 기술이 업로드한 슬라이드 및 교재에서 정답을 가져옵니다."
        : "Chat directly with your study materials. Grounded RAG ensures answers come from your uploaded notes and textbooks.",
    },
    {
      icon: Layout,
      label: isKo ? "인터랙티브 학습 모드" : "Interactive Learning",
      description: isKo
        ? "시퀀스 순서 맞추기, 개념 연결, 도해 라벨링으로 지식을 능동적으로 점검하세요."
        : "Engage with your content through dynamic side-by-side reading and contextual AI assistance.",
    },
    {
      icon: MonitorPlay,
      label: isKo ? "AI 비디오 요약" : "Video Summaries",
      description: isKo
        ? "핵심 개념을 요약한 비디오 강의를 생성하여 어려운 개념을 단 몇 분 만에 파악하세요."
        : "Generate concise video breakdowns of complex concepts to grasp core ideas in minutes.",
    },
    {
      icon: Radio,
      label: isKo ? "팟캐스트 학습" : "Audio Podcasts",
      description: isKo
        ? "이동 중이나 등하교 시간에 AI 대화형 팟캐스트로 주요 학업 내용을 청취하세요."
        : "Listen to AI-generated discussions of your course material while commuting or exercising.",
    },
    {
      icon: Layers,
      label: isKo ? "스마트 플래시카드" : "Flashcards",
      description: isKo
        ? "전공 커리큘럼에 완벽하게 매핑된 간격 반복(SRS) 플래시카드를 자동으로 생성합니다."
        : "Auto-generated spaced repetition flashcards mapped to your curriculum for lasting retention.",
    },
    {
      icon: CheckSquare,
      label: isKo ? "스마트 퀴즈" : "Practice Quizzes",
      description: isKo
        ? "객관식, 주관식, 빈칸 채우기 연습 문제와 상세한 AI 심층 피드백으로 실력을 테스트하세요."
        : "Auto-generated practice exams with multiple formats and detailed AI feedback on each answer.",
    },
    {
      icon: Target,
      label: isKo ? "출제 예상 문제" : "Exam Predictions",
      description: isKo
        ? "족보 및 기출문제를 분석하여 실전 시험에 나올 핵심 수식 및 서술형 문제를 예측합니다."
        : "AI predicts likely exam questions based on syllabus patterns and your uploaded materials.",
    },
    {
      icon: GraduationCap,
      label: isKo ? "한국 대학 학업 어시스턴트" : "Korean Academic Assistant",
      description: isKo
        ? "한국 대학 전문 용어와 다국어 오디오 지원으로 한국 대학생 및 외국인 유학생을 지원합니다."
        : "Optimized for Korean academic terminology, built for university students studying in Korea.",
    },
    {
      icon: BarChart,
      label: isKo ? "학습 분석 리포트" : "Learning Analytics",
      description: isKo
        ? "주간 학습 시간, 단원별 숙달도 및 취약 개념을 실시간 그래프로 모니터링하세요."
        : "Track mastery levels across topics and identify knowledge gaps with real-time analytics.",
    },
  ];

  return (
    <section className="bg-white dark:bg-[#0a0a0a] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
            <span className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400">
              {isKo ? "기능" : "Features"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
            {isKo
              ? "더 똑똑하게 공부하는 데 필요한 모든 것"
              : "Everything you need to study smarter"}
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {isKo
              ? "강의 자료를 업로드하면 나머지는 AI가 처리합니다. 대화, 요약, 퀴즈까지 하나의 워크스페이스에서."
              : "Upload your course materials and let AI handle the rest. Chat, summarize, quiz, and review -- all in one workspace."}
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111] p-6 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5">
                  <Icon className="w-[18px] h-[18px] text-gray-700 dark:text-gray-300" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-gray-900 dark:text-white">
                  {feature.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
