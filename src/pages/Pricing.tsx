import { useState } from "react";
import { Check, ChevronDown, ArrowUpRight, ArrowDown } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp: any = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

export const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "semester">("monthly");
  const { language } = useLanguage();
  const isKo = language === "ko";

  const tiers = [
    {
      id: "free",
      name: isKo ? "무료 플랜" : "Free",
      subtitle: isKo ? "처음 시작하는 학생을 위한 기본 플랜" : "For learners exploring the AI study workspace",
      priceMonthly: isKo ? "₩0" : "$ 0",
      priceSemester: isKo ? "₩0" : "$ 0",
      periodLabel: isKo ? "/평생 무료" : "/forever",
      metric: isKo ? "월 5개 강의자료 업로드 & 기본 AI 챗" : "5 monthly course uploads & basic AI chat",
      isHighlighted: false,
      ctaText: isKo ? "무료로 시작하기" : "Start Free",
      ctaHref: "/workspace",
      features: isKo
        ? [
            "출처 인용 AI 스터디 챗봇",
            "강의 슬라이드 & PDF 교재 업로드",
            "기본 플래시카드 & 복습 모드",
            "한국어 ↔ 영어 학업 번역",
            "신용카드 등록 없이 즉시 시작",
          ]
        : [
            "Grounded AI study chat & citations",
            "Lecture slide & PDF uploads",
            "Basic flashcards & spaced review",
            "Korean ↔ English academic translation",
            "No credit card required",
          ],
    },
    {
      id: "studentPro",
      name: isKo ? "학생 프로" : "Student Pro",
      subtitle: isKo ? "학업 성취도 향상과 시험 만점을 위한 올인원 솔루션" : "For students aiming for top grades and stress-free exams",
      priceMonthly: isKo ? "₩12,900" : "$ 9.99",
      priceSemester: isKo ? "₩9,975" : "$ 7.49",
      periodLabel: isKo ? "/월" : "/mo",
      metric: isKo ? "무제한 교재 업로드 & 전체 AI 도구" : "Unlimited course uploads & all AI study tools",
      isHighlighted: true, // Warm orange/terracotta accent card from mockup!
      ctaText: isKo ? "학생 프로 시작하기" : "Get Student Pro",
      ctaHref: "/workspace",
      features: isKo
        ? [
            "무료 플랜의 모든 기능 포함",
            "출제 예상 문제 예측기 (족보 & 기출 분석)",
            "AI 렉처 버디 (실시간 강의 녹음 & 노트 변환)",
            "AI 실전 연습 퀴즈 & 맞춤형 플래시카드 생성기",
            "3D 인터랙티브 개념 학습 엔진",
            "AI 보이스 모드 실시간 대화 튜터",
            "학업 취약 개념 정밀 분석 & 대시보드",
            "우선 순위 GPU 가속 처리 & 전담 지원",
          ]
        : [
            "Everything in Free, plus:",
            "Exam predictions & past paper analysis",
            "AI Lecture Buddy (real-time audio-to-notes)",
            "AI practice quiz & custom flashcards generator",
            "Interactive 3D concept learning engine",
            "Voice Mode conversational AI tutor",
            "Weak-spot diagnostic learning analytics",
            "Priority GPU processing & dedicated support",
          ],
    },
  ];

  const faqs = [
    {
      question: isKo ? "Preplit AI는 왜 학생들에게 합리적으로 제공되나요?" : "Why is Preplit AI priced so affordably for students?",
      answer: isKo
        ? "Preplit AI는 대학생과 외국인 유학생의 현실적인 학업 환경에 맞춰 설계되었습니다. 비싼 해외 구독료 대신 학생 전용 요금제로 전공 서적 한 권 값보다 저렴하게 전체 AI 스터디 튜터를 이용하실 수 있습니다."
        : "We built Preplit AI specifically for university students on a student budget. Our plans give you an entire AI study workspace for less than the cost of a single textbook."
    },
    {
      question: isKo ? "학기 패스(Semester Pass)는 어떻게 작동하나요?" : "How does the Semester Pass discount work?",
      answer: isKo
        ? "대학 학사 일정에 맞춰 4개월 한 학기 동안 25% 할인가로 한 번에 이용하는 플랜입니다. 매월 결제 신경 쓸 필요 없이 중간고사부터 기말고사까지 끊김 없이 학습하실 수 있습니다."
        : "Our Semester Pass allows you to pay once per 4-month academic term with a 25% discount, giving you uninterrupted access through midterms and finals without monthly renewals."
    },
    {
      question: isKo ? "무료 플랜(Free)으로 무엇을 할 수 있나요?" : "What can I do with the Free plan?",
      answer: isKo
        ? "신용카드 등록 없이 바로 문서 업로드, 출처 인용 AI 챗봇, 기본 퀴즈 및 플래시카드 기능을 평생 무료로 이용하실 수 있습니다."
        : "You can upload course notes, chat with your documents using grounded AI citations, and practice with flashcards completely free with no credit card required."
    },
    {
      question: isKo ? "언제든지 요금제를 변경하거나 취소할 수 있나요?" : "Can I upgrade, downgrade, or cancel anytime?",
      answer: isKo
        ? "네, 언제든지 워크스페이스 설정에서 원하는 플랜으로 즉시 업그레이드하거나 취소하실 수 있으며 숨겨진 수수료가 없습니다."
        : "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your workspace settings with zero hidden fees."
    },
  ];

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://preplitai.com";
  const canonical = `${siteUrl}/pricing`;

  const pricingSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Preplit AI Student Pro",
      "description": "AI study companion and exam prediction workspace subscription for university students.",
      "brand": {
        "@type": "Brand",
        "name": "Preplit AI"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": isKo ? "KRW" : "USD",
        "lowPrice": isKo ? "0" : "0",
        "highPrice": isKo ? "36000" : "29.99",
        "offerCount": "3"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfb] dark:bg-[#0a0a0c] text-[#111111] dark:text-neutral-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      <SEOHead
        title={isKo ? "Preplit AI 요금제 — 학생 맞춤형 플랜" : "Preplit AI Pricing — Free & Student Pro"}
        description={isKo ? "대학생을 위한 투명하고 합리적인 요금제. Free(₩0) 및 Student Pro(학기 패스 할인가)." : "Simple, student-first pricing tailored to your academic needs."}
        canonical={canonical}
        schemaMarkup={pricingSchema}
      />

      {/* Background Decorative Organic Shapes (Aesthetic match to mockup) */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-rose-300/25 dark:bg-rose-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-amber-200/30 dark:bg-amber-950/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-teal-200/25 dark:bg-teal-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 relative z-10">
        
        {/* ─── Hero Section: Large Headline (Left) & Artistic Doodle Illustration (Right) ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          
          {/* Left: Headline & Subtitle */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#111111] dark:text-white leading-[1.1]"
            >
              {isKo ? (
                <>
                  나의 학업에 꼭 맞는<br />
                  <span className="text-[#111111] dark:text-white">최적의 요금제.</span>
                </>
              ) : (
                <>
                  The right plan<br />
                  for your needs.
                </>
              )}
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-normal max-w-xl leading-relaxed"
            >
              {isKo
                ? "학습, 연습, 시험 대비까지 — 나에게 꼭 맞는 투명하고 합리적인 학생 맞춤 요금제입니다."
                : "Simple, transparent, student-first pricing built for your academic journey."}
            </motion.p>

            {/* Compact Billing Toggle */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="pt-2 flex flex-wrap items-center gap-3"
            >
              <div className="inline-flex items-center p-1 bg-neutral-200/70 dark:bg-white/10 rounded-xl shadow-2xs border border-neutral-300/60 dark:border-white/10">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {isKo ? "월간 결제" : "Monthly"}
                </button>
                <button
                  onClick={() => setBillingPeriod("semester")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    billingPeriod === "semester"
                      ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <span>{isKo ? "학기 패스 (4개월)" : "Semester Pass"}</span>
                  <span className="px-1.5 py-0.5 text-[9.5px] font-extrabold bg-[#e76f51] text-white rounded-md">
                    {isKo ? "25% 할인" : "-25%"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Editorial Line-Art Illustration (Matching Mockup Art Style) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] h-[220px] sm:h-[260px] flex items-center justify-center select-none pointer-events-none"
            >
              {/* Organic Color Spots */}
              <div className="absolute right-6 top-8 w-28 h-28 bg-[#f28482]/80 rounded-full blur-xs mix-blend-multiply dark:mix-blend-screen opacity-90" />
              <div className="absolute right-0 bottom-2 w-36 h-36 bg-[#f4a261]/85 rounded-full blur-xs mix-blend-multiply dark:mix-blend-screen opacity-90" />
              <div className="absolute left-6 top-4 w-20 h-14 bg-[#84dcc6]/80 rounded-xl blur-xs mix-blend-multiply dark:mix-blend-screen opacity-80" />

              {/* Vector Doodle Line Art */}
              <svg
                viewBox="0 0 360 260"
                className="w-full h-full stroke-neutral-900 dark:stroke-neutral-100 fill-none z-10"
                style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
              >
                {/* Upper Chat Bubble (Mint) */}
                <rect x="70" y="24" width="90" height="42" rx="4" strokeWidth="1.6" className="fill-white/80 dark:fill-[#121214]/90" />
                <path d="M85 45 Q115 35, 145 45" strokeWidth="1.6" />
                <polygon points="70,55 58,62 70,62" strokeWidth="1.6" className="fill-white/80 dark:fill-[#121214]/90" />

                {/* Lower Chat Bubble (White) */}
                <rect x="42" y="76" width="105" height="48" rx="4" strokeWidth="1.6" className="fill-white/90 dark:fill-[#121214]/95" />
                <path d="M58 98 Q90 90, 120 102" strokeWidth="1.6" />
                <polygon points="42,110 32,118 42,118" strokeWidth="1.6" className="fill-white/90 dark:fill-[#121214]/95" />

                {/* Globe with Contours */}
                <circle cx="260" cy="140" r="70" strokeWidth="1.8" className="fill-white/40 dark:fill-transparent" />
                {/* Globe Topographic / Latitudinal Curves */}
                <path d="M220 85 C250 110, 270 170, 260 205" strokeWidth="1.6" />
                <path d="M260 70 C290 100, 310 150, 300 200" strokeWidth="1.6" />
                <path d="M200 120 Q240 140, 320 110" strokeWidth="1.6" />
                <path d="M205 160 Q260 175, 315 150" strokeWidth="1.6" />
                <path d="M285 75 Q325 105, 330 140" strokeWidth="1.6" />

                {/* Orbiting Ring (Saturn-like) */}
                <ellipse cx="140" cy="180" rx="35" ry="12" strokeWidth="1.6" transform="rotate(-25 140 180)" />
                <circle cx="140" cy="180" r="14" strokeWidth="1.6" className="fill-white/90 dark:fill-[#121214]" />
                
                {/* Dotted Accent Details */}
                <circle cx="115" cy="165" r="2" fill="currentColor" />
                <circle cx="160" cy="148" r="2.5" fill="currentColor" />
                <circle cx="270" cy="55" r="2" fill="currentColor" />
              </svg>
            </motion.div>
          </div>
        </section>

        {/* ─── 2-Card Pricing Grid (Free & Student Pro) ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch mb-16">
          {tiers.map((tier, index) => {
            const price = billingPeriod === "monthly" ? tier.priceMonthly : tier.priceSemester;
            const isHighlight = tier.isHighlighted;

            return (
              <motion.div
                key={tier.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={index + 1}
                className="flex flex-col justify-between h-full group"
              >
                {/* Top Plan Title & Subtitle (Positioned directly above the box, matching mockup) */}
                <div className="mb-3 px-1">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 min-h-[32px] leading-relaxed">
                    {tier.subtitle}
                  </p>
                </div>

                {/* Main Card Box */}
                <div
                  className={`flex-1 rounded-2xl flex flex-col justify-between p-6 sm:p-6 transition-all duration-300 ${
                    isHighlight
                      ? "bg-[#f4a261] text-[#111111] shadow-lg shadow-[#f4a261]/25 border border-[#e79854] hover:shadow-xl hover:-translate-y-1"
                      : "bg-white dark:bg-[#121214] text-[#111111] dark:text-white border border-neutral-300/80 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-neutral-400 dark:hover:border-neutral-700 hover:-translate-y-1"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Price Header */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        {price}
                      </span>
                      <span className={`text-xs font-semibold ${isHighlight ? "text-neutral-800" : "text-neutral-500 dark:text-neutral-400"}`}>
                        {tier.periodLabel}
                      </span>
                    </div>

                    {/* Metric Line */}
                    <p className={`text-xs font-medium pb-4 border-b ${
                      isHighlight
                        ? "text-neutral-900 border-neutral-900/15"
                        : "text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-800"
                    }`}>
                      {tier.metric}
                    </p>

                    {/* Feature List with Solid Check Icons */}
                    <ul className="space-y-2.5 pt-1">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs leading-snug">
                          <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isHighlight
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span className={`${isHighlight ? "text-neutral-900 font-medium" : "text-neutral-700 dark:text-neutral-300 font-normal"}`}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Boxed CTA Button with Arrow (Matching Mockup Box Style) */}
                  <div className="pt-8">
                    <a
                      href={tier.ctaHref}
                      className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                        isHighlight
                          ? "border border-dashed border-neutral-900/40 bg-white/20 hover:bg-white/30 text-neutral-950 font-bold"
                          : "border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                      }`}
                    >
                      <span className="text-xs">{tier.ctaText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Quick FAQ Scroll Link */}
        <div className="flex justify-center mb-12">
          <a
            href="#faq"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
          >
            <span>{isKo ? "자주 묻는 질문(FAQ) 살펴보기" : "Frequently Asked Questions"}</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>

        {/* ─── FAQ Section ─── */}
        <section id="faq" className="pt-12 sm:pt-14 pb-4 border-t border-neutral-200/80 dark:border-neutral-800 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              {isKo ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
              {isKo ? "Preplit AI 요금제 및 서비스 이용에 대해 확인해보세요." : "Everything you need to know about Preplit AI plans and billing."}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] overflow-hidden transition-all shadow-2xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm hover:opacity-80 transition-opacity"
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
            <p className="px-4 pb-4 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;

