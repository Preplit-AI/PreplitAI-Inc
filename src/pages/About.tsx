import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  BookOpen,
  HelpCircle,
  Headphones,
  BarChart2,
  Star,
  Globe,
  Video,
  Target,
  Heart,
  Lightbulb,
  Users,
  Sparkles,
} from "lucide-react";

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" },
  }),
};

const fadeIn: any = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

/* ─── Component ─────────────────────────────────────────────────────── */
const About = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const pillars = [
    { icon: MessageSquare, label: isKo ? "AI 스터디 챗" : "AI Study Chat", desc: isKo ? "정확한 페이지 출처 인용 기반 Q&A — 환각 없는 답변." : "Grounded RAG chat with exact page citations — no hallucinations." },
    { icon: Zap, label: isKo ? "인터랙티브 학습" : "Interactive Learning", desc: isKo ? "시각적 시뮬레이션, 개념도 및 드래그앤드롭 실습." : "Visual simulations, concept maps & drag-and-drop exercises." },
    { icon: Video, label: isKo ? "AI 비디오 강의" : "AI Video Lectures", desc: isKo ? "교재 및 슬라이드 기반 마이크로 강의 영상 생성." : "Generate micro-lecture videos directly from your study material." },
    { icon: Headphones, label: isKo ? "팟캐스트 학습 모드" : "Podcast Learning Mode", desc: isKo ? "전공 서적 및 슬라이드를 대화형 오디오 팟캐스트로 변환." : "Turn any PDF or slides into a conversational audio podcast." },
    { icon: BookOpen, label: isKo ? "스마트 플래시카드" : "Smart Flashcards", desc: isKo ? "콘텐츠에서 자동 추출되는 간격 반복 학습덱." : "Spaced-repetition decks auto-generated from your content." },
    { icon: HelpCircle, label: isKo ? "스마트 퀴즈 생성기" : "Smart Quiz Generator", desc: isKo ? "객관식·주관식·빈칸 채우기 퀴즈 맞춤 생성." : "MCQ, short-answer & fill-in-the-blank quizzes on demand." },
    { icon: Target, label: isKo ? "출제 예상 문제" : "Expected Exam Questions", desc: isKo ? "기출 및 족보 분석 기반 AI 예상 문제 예측." : "AI-predicted exam questions based on past papers & syllabi." },
    { icon: BarChart2, label: isKo ? "학습 성과 분석" : "Learning Analytics", desc: isKo ? "취약 개념 및 공부 시간을 추적해 스마트하게 대비." : "Track weak spots and time-on-task to study smarter every session." },
    { icon: Globe, label: isKo ? "한국 대학 학업 어시스턴트" : "Korean Academic Assist.", desc: isKo ? "한국 대학생 및 GKS 외국인 유학생을 위한 이중언어 지원." : "Bilingual support for Korean domestic & international students." },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: isKo ? "단순 암기가 아닌 깊은 이해" : "Understanding over memorising",
      body: isKo ? "벼락치기 후 잊어버리는 공부가 아닌, 진정한 개념 이해를 돕도록 모든 기능을 설계합니다." : "We design every feature to build genuine comprehension — not to help students cram and forget.",
    },
    {
      icon: Heart,
      title: "언제나 학생 중심",
      body: isKo ? "모든 의사결정의 중심에는 '이 기능이 실제 학생의 공부를 돕는가?'라는 질문이 있습니다." : "Every decision starts with a single question: does this make a real student's study session better?",
    },
    {
      icon: Users,
      title: "글로벌 접근성",
      body: isKo ? "언어가 학업의 장벽이 되어서는 안 됩니다. 이중언어 학습 지원이 PreplitAI의 핵심입니다." : "Language should never be a barrier to learning. Multilingual support is built into the core of PreplitAI.",
    },
    {
      icon: Sparkles,
      title: "정직한 AI",
      body: isKo ? "저희 AI 엔진은 출처를 명확히 밝힙니다. 근거가 없으면 솔직하게 한계를 안내합니다." : "Our Grounded RAG engine cites sources. If PreplitAI doesn't know, it says so — no fabrications.",
    },
  ];

  const timeline = [
    {
      year: isKo ? "문제 발견" : "The Problem",
      title: isKo ? "학생들은 스마트하게 공부하지 못하고 있었습니다." : "Students were studying harder, not smarter.",
      body: isKo ? "수많은 PDF 슬라이드, 교재, 강의 녹음 속에서 효율적인 학습 방법을 찾지 못하고 있었습니다." : "University students were drowning in PDFs, textbook chapters, and recorded lectures — with no intelligent way to engage with the material.",
    },
    {
      year: isKo ? "새로운 인사이트" : "The Insight",
      title: isKo ? "AI가 모든 자료를 1대1 튜터로 만들 수 있습니다." : "AI could transform any material into a tutor.",
      body: isKo ? "강의 슬라이드와 교재가 나에게 질문을 던지고, 시각적으로 설명하며, 시험 문제를 예측해주는 튜터가 된다면 어떨까요?" : "What if any document — a slide deck, a textbook chapter, a YouTube lecture — could become an interactive teacher that quizzes you?",
    },
    {
      year: isKo ? "플랫폼 개발" : "The Build",
      title: isKo ? "PreplitAI: 단 하나의 올인원 스터디 워크스페이스." : "PreplitAI: One complete study workspace.",
      body: isKo ? "출처 인용 챗봇, 퀴즈, 플래시카드, 팟캐스트, 출제 예상 문제를 하나의 통합 워크스페이스로 완성했습니다." : "We combined Grounded RAG chat, adaptive quizzes, smart flashcards, AI-generated podcasts, and predicted exam questions into one platform.",
    },
    {
      year: isKo ? "현재" : "Today",
      title: isKo ? "한국 고등교육 및 유학생 지원에 집중." : "Focused on Korean higher education first.",
      body: isKo ? "한국 대학생과 GKS 장학생 및 외국인 유학생들이 가장 신뢰하는 AI 학업 플랫폼으로 성장하고 있습니다." : "Our initial market is Korean university students and international students studying in Korea — demanding AI-native learning tools.",
    },
  ];

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://preplitai.com";
  const canonical = `${siteUrl}/about`;

  const founderSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Khan Muhammad Ahsan",
      jobTitle: "Founder & Chief Executive Officer",
      worksFor: {
        "@type": "Organization",
        name: "PreplitAI",
        url: "https://preplitai.com"
      },
      description: "Khan Muhammad Ahsan is the Founder and Chief Architect of PreplitAI, building AI study companion tools and GKS application prep solutions."
    },
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About PreplitAI & Founder Khan Muhammad Ahsan",
      url: canonical,
      mainEntity: {
        "@type": "Organization",
        name: "PreplitAI",
        founder: {
          "@type": "Person",
          name: "Khan Muhammad Ahsan"
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] overflow-x-hidden text-black dark:text-white">
      <SEOHead
        title={isKo ? "PreplitAI 소개 & 설립자 Khan Muhammad Ahsan — AI 학업 파트너" : "About PreplitAI & Founder Khan Muhammad Ahsan — AI Study Companion"}
        description={isKo ? "설립자 Khan Muhammad Ahsan이 이끄는 PreplitAI의 미션과 GKS2026 AI 준비 플랫폼 스토리를 확인하세요." : "Learn about PreplitAI, founded by Khan Muhammad Ahsan to revolutionize AI study tools and Global Korea Scholarship (GKS) preparation."}
        url={canonical}
        canonical={canonical}
        schemaMarkup={founderSchema}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-36 pb-12 sm:pb-20 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div className="w-[700px] h-[700px] rounded-full bg-[#630000]/6 dark:bg-[#630000]/12 blur-[140px] -translate-y-1/4" />
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#630000]/8 dark:bg-[#630000]/20 border border-[#630000]/20 dark:border-[#630000]/30 mb-8">
            <span className="text-[12.5px] font-semibold text-[#630000] dark:text-[#ffaaaa] tracking-wide">
              {isKo ? '회사 스토리' : 'Our Story'}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-black dark:text-white leading-[1.08] tracking-tight mb-7">
            {isKo ? '세계에서 가장 강력한 ' : "We're building the world's "}
            <br className="hidden sm:block" />
            <span className="text-[#630000] dark:text-[#ff9999]">
              {isKo ? 'AI 학업 파트너' : 'most powerful AI'}
            </span>
            <br className="hidden sm:block" />
            {isKo ? '를 만들어갑니다.' : 'study companion.'}
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {isKo
              ? 'PreplitAI는 강의 슬라이드, PDF, 전공 서적, 손글씨 노트, 유튜브 영상을 맞춤형 인터랙티브 학습 경험으로 전환합니다.'
              : 'PreplitAI transforms any study material — lecture slides, PDFs, textbooks, handwritten notes, YouTube videos — into personalized, interactive learning experiences.'}
          </p>
        </motion.div>
      </section>

      {/* ── Tagline Banner ────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={0}
        className="border-y border-gray-200 dark:border-white/10 bg-gray-950 text-white py-12 px-6 text-center"
      >
        <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight max-w-3xl mx-auto leading-snug">
          {isKo
            ? '"모든 학습 자료를 1대1 인터랙티브 학습 경험으로 변환합니다."'
            : '"Transform Any Study Material into an Interactive Learning Experience."'}
        </p>
        <p className="text-[#c84040] text-xs mt-3 font-semibold tracking-widest uppercase">PreplitAI Tagline</p>
      </motion.section>

      {/* ── Story / Timeline ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">
            {isKo ? 'PreplitAI가 걸어온 길' : 'How we got here'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-[16px] max-w-xl mx-auto">
            {isKo ? '학업에 대한 사소한 답답함에서 완성형 AI 학업 플랫폼으로.' : 'From a simple frustration to a complete AI learning platform.'}
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#630000]/40 via-[#630000]/20 to-transparent hidden sm:block" />

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i}
                className={`flex flex-col sm:flex-row gap-6 sm:gap-12 ${i % 2 === 1 ? 'sm:flex-row-reverse text-left sm:text-right' : ''}`}
              >
                <div className="flex-1">
                  <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#630000] dark:text-[#ff9999] mb-2 px-2.5 py-1 rounded-full bg-[#630000]/8 dark:bg-[#630000]/15">
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[15px]">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9 Pillars Grid ────────────────────────────────────────────── */}
      <section className="bg-gray-50/70 dark:bg-[#0d0d0d] py-28 px-6 border-y border-gray-200/60 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
              {isKo ? '9가지 핵심 AI 학습 도구' : 'The 9 Pillars of PreplitAI'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-[16px] max-w-xl mx-auto">
              {isKo ? '하나의 스터디 워크스페이스에 통합된 맞춤형 학습 도구 모음.' : 'A complete toolkit integrated inside every Study Space.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i % 3}
                  className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-xs hover:border-[#630000]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#630000]/8 dark:bg-[#630000]/25 text-[#630000] dark:text-[#ffaaaa] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">{p.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Founder Entity Section ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-b border-gray-200/60 dark:border-white/10">
        <div className="p-8 sm:p-10 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#630000] text-white flex items-center justify-center font-bold text-2xl tracking-wider shrink-0 shadow-lg border-2 border-white/20">
            KMA
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <div>
              <span className="text-xs font-bold text-[#630000] dark:text-[#c84040] uppercase tracking-wider block">
                {isKo ? '설립자 & 총괄 엔지니어' : 'Founder & Chief Executive Officer'}
              </span>
              <h3 className="text-2xl font-bold text-black dark:text-white">Khan Muhammad Ahsan</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {isKo
                ? 'Khan Muhammad Ahsan은 PreplitAI의 설립자이자 총괄 설계자입니다. AI 기술과 학업 워크스페이스를 결합하여 한국 대학생 및 Global Korea Scholarship (GKS) 지원자들을 위한 혁신적인 학습 및 서류 평가 플랫폼을 개발하고 있습니다.'
                : 'Khan Muhammad Ahsan is the Founder and Chief Executive Officer of PreplitAI. He leads the engineering and vision behind PreplitAI\'s RAG study engine and GKS2026 application review platform.'}
            </p>
            <div className="text-xs text-gray-500 font-medium">
              Khan Muhammad Ahsan is the founder of PreplitAI.
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
            {isKo ? 'PreplitAI의 핵심 가치' : 'What we stand for'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-[16px] max-w-xl mx-auto">
            {isKo ? '저희가 제품을 빌드할 때 지키는 4가지 원칙.' : 'The principles guiding every product decision we make.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-8 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#121212] flex gap-5 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA Banner (Consistent Dark Styling) ────────────────── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gray-950 text-white p-10 sm:p-14 text-center relative overflow-hidden border border-gray-800 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {isKo ? '스마트 학습을 시작할 준비가 되셨나요?' : 'Ready to study smarter?'}
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
            {isKo ? '강의 슬라이드나 PDF를 업로드하고 나만의 AI 스터디 튜터를 무료로 경험해보세요.' : 'Upload your first document and experience an interactive AI study companion today.'}
          </p>
          <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-gray-100 font-semibold text-base px-8 h-12">
            <a href="/preplitai-chat" className="flex items-center gap-2">
              <span>{isKo ? '워크스페이스 시작하기' : 'Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
