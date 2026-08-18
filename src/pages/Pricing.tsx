import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ArrowDown } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp: any = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
  }),
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "semester">("semester");
  const { language } = useLanguage();
  const isKo = language === "ko";

  const features = {
    free: isKo ? [
      "문서 & 슬라이드 업로드 (기본)",
      "출처 인용 AI 스터디 챗봇",
      "기본 연습 퀴즈 & 플래시카드",
      "한국어 ↔ 영어 학업 번역",
      "신용카드 등록 없이 무료 시작",
    ] : [
      "Document & slide uploads",
      "Grounded AI study chat",
      "Basic practice quizzes & flashcards",
      "Korean ↔ English academic translation",
      "No credit card required",
    ],
    studentPro: isKo ? [
      "무료 플랜의 모든 기능 포함",
      "무제한 AI 스터디 챗 & 문서 무제한 업로드",
      "출제 예상 문제 예측기 (족보 & 기출 분석)",
      "AI 렉처 버디 (실시간 강의 녹음 & 노트)",
      "3D 입체 학습 & 대화형 팟캐스트 모드",
      "AI 비디오 강의 생성 & 취약 개념 분석",
    ] : [
      "Everything in Free, plus:",
      "Unlimited AI chats & document uploads",
      "Exam Predictions (past paper analysis)",
      "AI Lecture Buddy (real-time recording & notes)",
      "3D Interactive Learning & Podcast mode",
      "AI Video Lectures & weak spot tracking",
    ],
  };

  const faqs = [
    {
      question: isKo ? "PreplitAI는 왜 학생들에게 저렴하게 제공되나요?" : "Why is PreplitAI priced so affordably for students?",
      answer: isKo
        ? "PreplitAI는 대학생과 외국인 유학생의 주머니 사정에 맞춰 설계되었습니다. 비싼 해외 구독료 대신 학생 프로 요금제(월 ₩9,975 상당)로 전공 서적 한 권 값보다 저렴하게 전체 AI 스터디 튜터를 이용하실 수 있습니다."
        : "We built PreplitAI specifically for university students on a student budget. Our Student Pro tier gives you an entire AI study workspace for less than the cost of a single textbook."
    },
    {
      question: isKo ? "학기 패스(Semester Pass)는 어떻게 작동하나요?" : "How does the Semester Pass work?",
      answer: isKo
        ? "대학 학사 일정에 맞춰 4개월 한 학기 동안 할인가로 한 번에 결제하는 플랜입니다. 월별 자동 갱신 부담 없이 중간고사부터 기말고사까지 끊김 없이 학습하실 수 있습니다."
        : "Our Semester Pass allows you to pay once per 4-month academic term at a discounted rate, giving you uninterrupted access through midterms and finals without monthly renewals."
    },
    {
      question: isKo ? "한국 대학 학업 어시스턴트에는 무엇이 포함되나요?" : "What is included in the Korean Academic Assistant?",
      answer: isKo
        ? "한국어 ↔ 영어 전공 용어 쌍방향 번역, 맥락 기반 전문 용어 해설, 그리고 실제 대학 교수님의 강의 구성 방식에 맞춘 학습 요약 및 문제 예측을 제공합니다."
        : "It provides Korean ↔ English academic translation, explains technical jargon in context, and aligns study summaries with how professors structure their courses."
    },
    {
      question: isKo ? "구독 전에 무료로 체험해 볼 수 있나요?" : "Can I try PreplitAI for free before subscribing?",
      answer: isKo
        ? "네! 무료 플랜(₩0)은 카드 등록 없이 바로 문서 업로드, 출처 인용 AI 챗, 기본 퀴즈 기능을 체험해 보실 수 있습니다."
        : "Yes! The Free plan costs ₩0 and lets you try out document uploads, grounded AI chats, and basic quizzes with no credit card required."
    },
  ];

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://preplitai.com";
  const canonical = `${siteUrl}/pricing`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white flex flex-col justify-between">
      <SEOHead
        title={isKo ? "PreplitAI 요금제 — 학생 맞춤형 플랜" : "PreplitAI Pricing — Built for Student Budgets"}
        description={isKo ? "한국 대학생 및 유학생을 위한 투명 요금제. 무료(₩0), 학생 프로(월 ₩9,975~₩12,900) 및 학기 패스." : "Simple pricing for university students."}
        url={canonical}
        canonical={canonical}
      />

      {/* ─── Top 1-Page Main Pricing Section ─── */}
      <div className="w-full">
        {/* Header Hero */}
        <section className="pt-24 sm:pt-28 pb-4 sm:pb-6 px-4 text-center max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              {isKo ? "투명하고 부담 없는 학업 요금제" : "Simple, Student-First Pricing"}
            </h1>

            {/* Compact Minimal Billing Toggle (No emoticons/icons) */}
            <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-white/[0.06] rounded-xl mt-6 shadow-xs border border-neutral-200/60 dark:border-white/5">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900"
                }`}
              >
                {isKo ? "월간 결제" : "Monthly"}
              </button>
              <button
                onClick={() => setBillingPeriod("semester")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billingPeriod === "semester"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <span>{isKo ? "학기 패스 (4개월)" : "Semester Pass (4 mo)"}</span>
                <span className="px-1.5 py-0.5 text-[9.5px] font-bold bg-[#550000] text-white rounded-md">
                  {isKo ? "25% 할인" : "Save 25%"}
                </span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* 2 Clean Pricing Cards Grid (Free & Student Pro) */}
        <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* 1. Free Tier */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {isKo ? "무료 플랜" : "Free"}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 min-h-[34px]">
                  {isKo ? "기본 AI 스터디 워크스페이스를 체험하려는 학습자용." : "For learners trying out the AI study workspace."}
                </p>

                {/* Price */}
                <div className="mb-5 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">₩0</span>
                  <span className="text-xs text-neutral-400 ml-1.5">{isKo ? "/평생 무료" : "/forever"}</span>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full mb-6 h-10 rounded-xl border-neutral-200 dark:border-white/10 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <a href="/workspace">{isKo ? "무료로 시작하기" : "Start Free"}</a>
                </Button>

                {/* Features List */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {isKo ? "포함 기능" : "Includes"}
                  </p>
                  {features.free.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[12.5px] text-neutral-600 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 2. Student Pro Tier (Featured) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="rounded-2xl border-2 border-[#550000] dark:border-rose-900 bg-white dark:bg-[#151111] p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all relative"
            >
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#550000] text-white rounded-full shadow-xs">
                  {isKo ? "가장 인기 있는 선택" : "Most Popular"}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {isKo ? "학생 프로" : "Student Pro"}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 min-h-[34px]">
                  {isKo ? "학업 성취도 향상과 A+를 목표로 하는 대학생용." : "For students aiming for top grades and stress-free exams."}
                </p>

                {/* Price */}
                <div className="mb-5 flex items-baseline">
                  {billingPeriod === "monthly" ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">₩12,900</span>
                      <span className="text-xs text-neutral-400 ml-1.5">{isKo ? "/월" : "/month"}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">₩39,900</span>
                      <span className="text-xs text-neutral-400 ml-1.5">{isKo ? "/학기 (월 ₩9,975)" : "/semester"}</span>
                    </>
                  )}
                </div>

                <Button
                  asChild
                  className="w-full mb-6 h-10 rounded-xl bg-[#550000] hover:bg-[#3d0000] text-white text-xs font-semibold shadow-xs"
                >
                  <a href="/workspace">{isKo ? "학생 프로 시작하기" : "Get Student Pro"}</a>
                </Button>

                {/* Features List */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
                  <p className="text-[11px] font-bold text-[#550000] dark:text-rose-400 uppercase tracking-wider">
                    {isKo ? "무료 플랜의 모든 기능 +" : "Everything in Free, plus"}
                  </p>
                  {features.studentPro.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[12.5px] text-neutral-800 dark:text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-[#550000] dark:text-rose-400 shrink-0 font-bold" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>

          {/* Quick Scroll Indicator to FAQ */}
          <div className="flex justify-center mt-8">
            <a
              href="#faq"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
            >
              <span>{isKo ? "자주 묻는 질문(FAQ) 둘러보기" : "Frequently Asked Questions"}</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </a>
          </div>
        </section>
      </div>

      {/* ─── FAQ Section (Scroll Down) ─── */}
      <section id="faq" className="py-14 sm:py-16 px-4 sm:px-6 border-t border-neutral-200/60 dark:border-white/10 bg-neutral-50/60 dark:bg-[#0c0c0e]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
              {isKo ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
              {isKo ? "요금제 및 서비스 이용에 대해 궁금한 점을 확인해보세요." : "Everything you need to know about PreplitAI plans and billing."}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-neutral-200/80 dark:border-white/10 rounded-xl bg-white dark:bg-[#141414] overflow-hidden transition-all shadow-2xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 font-semibold text-neutral-900 dark:text-white text-sm hover:opacity-80 transition-opacity"
      >
        <span>{question}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-white/5 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
