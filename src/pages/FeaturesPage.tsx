import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const FeaturesPage = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const capabilities = [
    {
      title: isKo ? "AI 챗 및 답변 인용" : "Grounded AI Chat",
      items: isKo ? [
        "PDF, 강의 슬라이드, 전공 서적 무제한 업로드",
        "페이지 및 문단 단위 정확한 출처 인용 지원",
        "한국어 ↔ 영어 전공 용어 즉시 해설",
        "교수님 스타일 맞춤 1대1 튜터링",
      ] : [
        "Multi-document PDF & slide deck ingestion",
        "Strict page & paragraph level citations",
        "Bilingual Korean ↔ English academic translation",
        "1-on-1 Socratic AI professor tutoring",
      ],
    },
    {
      title: isKo ? "능동적 인출 & 시험 대비" : "Active Recall & Exams",
      items: isKo ? [
        "기출문제 및 족보 분석 출제 예상 문제 예측",
        "객관식, 주관식, 빈칸 채우기 맞춤 퀴즈 생성",
        "SuperMemo SM-2 간격 반복 스마트 플래시카드",
        "AI 질적 피드백 및 모범 답안 풀이",
      ] : [
        "Past exam (Jokbo) pattern analysis & predicted Qs",
        "MCQ, short answer & fill-in-the-blank practice tests",
        "Spaced repetition flashcards (SM-2 algorithm)",
        "Qualitative feedback with model answer breakdown",
      ],
    },
    {
      title: isKo ? "멀티모달 오디오 & 비디오" : "Multimodal Audio & Video",
      items: isKo ? [
        "2인 호스트 AI 학습 팟캐스트 오디오 생성",
        "유튜브 강의 동영상 자막 및 스탬프 Q&A",
        "핵심 요약 노트 및 공식 족보 정리집",
        "드래그앤드롭 개념 연결 인터랙티브 실습",
      ] : [
        "Two-speaker AI conversational podcast generator",
        "YouTube video transcript timestamp sync & Q&A",
        "Executive bullet-point summary cheatsheets",
        "Interactive drag-and-drop concept matching",
      ],
    },
    {
      title: isKo ? "학습 분석 & 보안" : "Analytics & Security",
      items: isKo ? [
        "주간 학습 시간 및 취약 개념 레이더 추적",
        "시험 준비도 성취도 % 실시간 시각화",
        "전 데이터 AES-256 암호화 & 모델 재학습 금지",
        "한국 대학 맞춤 데이터 보안 규정 준수",
      ] : [
        "Weekly study minutes & topic weakness tracking",
        "Exam readiness score % real-time visualization",
        "AES-256 encryption & zero public model retraining",
        "University-grade security & privacy standards",
      ],
    },
  ];

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/features`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
      <SEOHead
        title={isKo ? "PreplitAI 기능 — 9가지 핵심 AI 학업 도구" : "PreplitAI Features — 9 Core AI Study Tools"}
        description={isKo ? "출처 인용 AI 챗봇, 스마트 플래시카드, 퀴즈 생성기, 팟캐스트, 족보 분석 출제 예상 문제 등 핵심 기능을 확인하세요." : "Explore features: Grounded RAG Chat, flashcards, quiz generator, podcast discussion, and exam prediction."}
        url={canonical}
        canonical={canonical}
      />

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-32 pb-12 sm:pb-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block text-sm font-semibold tracking-wide uppercase text-[#630000] dark:text-[#ffaaaa] mb-6"
        >
          {isKo ? '기능 소개' : 'Features'}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-950 dark:text-white leading-[1.1] mb-6"
        >
          {isKo ? '스마트 학업을 위한 ' : 'Powerful features for '}
          <span className="text-[#630000] dark:text-[#ffaaaa]">
            {isKo ? '9가지 AI 전용 도구' : 'modern learning'}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          {isKo
            ? '강의 슬라이드와 PDF를 올리는 즉시 출처 인용 Q&A부터 스마트 퀴즈, 팟캐스트, 출제 예상 문제까지 하나의 워크스페이스에서 시작하세요.'
            : 'Everything you need to transform static PDFs and lecture recordings into an interactive, active learning experience.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="px-8 h-12 text-sm font-semibold bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full shadow-lg"
          >
            <a href="/preplitai-chat" className="flex items-center gap-2">
              <span>{isKo ? '워크스페이스 시작하기' : 'Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 h-12 text-sm font-semibold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
          >
            <a href="/sales">{isKo ? '영업팀 문의' : 'Talk to sales'}</a>
          </Button>
        </motion.div>
      </section>

      {/* ── Capabilities Grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              custom={i}
              variants={fadeUp}
              className="p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-white/20 transition-all"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mb-6 tracking-tight">
                  {cap.title}
                </h3>
                <ul className="space-y-4">
                  {cap.items.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <CheckCircle2 className="w-5 h-5 text-[#630000] dark:text-[#ffaaaa] shrink-0 mt-0.5" />
                      <span className="text-[#333] dark:text-gray-300 text-base leading-snug font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
