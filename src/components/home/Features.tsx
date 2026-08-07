import { MessageSquare, Layout, MonitorPlay, Radio, Layers, CheckSquare, Target, GraduationCap, BarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      label: isKo ? "AI 스터디 챗" : "AI Study Chat",
      description: isKo ? "강의 자료와 직접 대화하세요. 출처 인용 RAG 기술이 업로드한 슬라이드 및 교재에서 정답을 가져옵니다." : "Chat directly with your study materials. Grounded RAG ensures answers come from your uploaded notes and textbooks.",
    },
    {
      icon: <Layout className="w-5 h-5 text-white" />,
      label: isKo ? "인터랙티브 학습 모드" : "Interactive Learning Mode",
      description: isKo ? "시퀀스 순서 맞추기, 개념 연결, 도해 라벨링으로 지식을 능동적으로 점검하세요." : "Engage with your content actively. Dynamic side-by-side reading and contextual AI assistance.",
    },
    {
      icon: <MonitorPlay className="w-5 h-5 text-white" />,
      label: isKo ? "AI 비디오 요약" : "AI Video Lectures",
      description: isKo ? "핵심 개념을 요약한 비디오 강의를 생성하여 어려운 개념을 단 몇 분 만에 파악하세요." : "Generate concise video summaries of complex concepts to help you grasp the core ideas faster.",
    },
    {
      icon: <Radio className="w-5 h-5 text-white" />,
      label: isKo ? "팟캐스트 학습 모드" : "Podcast Learning",
      description: isKo ? "이동 중이나 등하교 시간에 AI 대화형 팟캐스트로 주요 학업 내용을 청취하세요." : "Listen to AI-generated podcast discussions of your course material while commuting or walking.",
    },
    {
      icon: <Layers className="w-5 h-5 text-white" />,
      label: isKo ? "스마트 플래시카드" : "Flashcards",
      description: isKo ? "전공 커리큘럼에 완벽하게 매핑된 간격 반복(SRS) 플래시카드를 자동으로 생성합니다." : "Automatically generated space-repetition flashcards mapped perfectly to your curriculum.",
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-white" />,
      label: isKo ? "스마트 퀴즈 생성기" : "Smart Quizzes",
      description: isKo ? "객관식, 주관식, 빈칸 채우기 연습 문제와 상세한 AI 심층 피드백으로 실력을 테스트하세요." : "Test your knowledge with auto-generated practice quizzes featuring detailed AI feedback.",
    },
    {
      icon: <Target className="w-5 h-5 text-white" />,
      label: isKo ? "출제 예상 문제" : "Expected Exam Questions",
      description: isKo ? "족보 및 기출문제를 분석하여 실전 시험에 나올 핵심 수식 및 서술형 문제를 예측합니다." : "AI predicts likely exam questions based on the focus areas of your syllabus and uploaded notes.",
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-white" />,
      label: isKo ? "한국 대학 학업 어시스턴트" : "Korean Academic Assistant",
      description: isKo ? "한국 대학 전문 용어와 다국어 오디오 지원으로 한국 대학생 및 외국인 유학생을 지원합니다." : "Optimized for Korean academic terminology, making it perfect for university students in Korea.",
    },
    {
      icon: <BarChart className="w-5 h-5 text-white" />,
      label: isKo ? "AI 학습 분석 리포트" : "AI Learning Analytics",
      description: isKo ? "주간 학습 시간, 단원별 숙달도 및 취약 개념을 실시간 그래프로 모니터링하세요." : "Track your study progress, mastery levels, and identify knowledge gaps in real time.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#faf9f7] dark:bg-[#111]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-[#630000] mb-3">
            {isKo ? '주요 학업 기능' : 'Capabilities'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white leading-tight">
            {isKo ? '9가지 AI 학업 도구.\n단 하나의 워크스페이스.' : '9 AI-Powered Tools.\nOne Study Space.'}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-black dark:bg-[#222] flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-black dark:text-white mb-2">
                {f.label}
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
