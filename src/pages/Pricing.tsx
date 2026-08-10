import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Sparkles, Building2, GraduationCap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "semester">("semester");
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const features = {
    free: isKo ? [
      "제한된 문서 및 슬라이드 업로드",
      "일일 제한된 AI 스터디 챗답변",
      "기본 연습 퀴즈 및 플래시카드",
      "한국어 ↔ 영어 기본 학업 번역 지원",
      "신용카드 등록 없이 무료 시작",
    ] : [
      "Limited document & slide uploads",
      "Limited AI study chats per day",
      "Basic practice quizzes",
      "Korean ↔ English basic translation",
      "No credit card required",
    ],
    studentPro: isKo ? [
      "무료 플랜의 모든 기능 포함",
      "무제한 AI 스터디 챗 & 문서 무제한 업로드",
      "인터랙티브 학습 모드 (시뮬레이션, 드래그앤드롭)",
      "AI 비디오 강의 생성기 & 팟캐스트 학습 모드",
      "출제 예상 문제 예측기 (기출 및 족보 분석)",
      "전체 AI 학습 분석 & 취약 개념 자동 추적",
      "한국 대학 학업 어시스턴트 & 교수님 강의 정렬 지원",
    ] : [
      "Everything in Free",
      "Unlimited AI study chats & document uploads",
      "Interactive Learning Mode (simulations, drag-and-drop)",
      "AI Video Lecture Generator & Podcast Learning Mode",
      "Expected Exam Questions predictor (past paper analysis)",
      "Full AI Learning Analytics & weak spot tracking",
      "Korean Academic Assistant & professor lecture alignment",
    ],
    institution: isKo ? [
      "학생 프로의 모든 기능 포함",
      "학과 및 대학/학원 전용 대량 시트 라이선스",
      "관리자 대시보드 및 학습 성과 분석 리포트",
      "LMS 연동 & SCIM 사용자 프로비저닝",
      "SAML SSO (Okta, Azure AD, Google Workspace)",
      "전담 고객 성공 매니저 & SLA 지원",
      "맞춤형 대학 보안 및 FERPA 준수",
    ] : [
      "Everything in Student Pro",
      "Bulk seat licensing for departments & universities",
      "Administrator dashboard & learning analytics",
      "LMS integration & SCIM user provisioning",
      "SAML SSO (Okta, Azure AD, Google Workspace)",
      "Dedicated customer success manager & SLA support",
      "Custom institution-wide security & FERPA compliance",
    ],
  };

  const faqs = [
    {
      question: isKo ? "PreplitAI는 왜 학생들에게 저렴하게 제공되나요?" : "Why is PreplitAI priced so affordably for students?",
      answer: isKo
        ? "PreplitAI는 한국 대학생과 외국인 유학생의 주머니 사정에 맞춰 특별히 설계되었습니다. 비싼 해외 SaaS 요금($20+/월) 대신 학생 프로 요금제(월 ₩9,900~₩12,900)로 전공 서적 한 권 값보다 저렴하게 전체 AI 스터디 튜터를 이용하실 수 있습니다."
        : "We built PreplitAI specifically for Korean university students and international students on a student budget. Rather than charging high international SaaS prices ($20+/mo), our Student Pro tier (₩9,900–₩12,900/mo) gives you an entire AI study companion for less than the cost of a single textbook."
    },
    {
      question: isKo ? "학기 패스(Semester Bundle)는 어떻게 작동하나요?" : "How does the Semester Bundle work?",
      answer: isKo
        ? "한국 대학 학사 일정에 맞춰 4개월 한 학기 동안 할인가로 한 번에 결제하는 플랜입니다. 월별 자동 갱신 부담 없이 중간고사부터 기말고사까지 끊김 없이 학습하실 수 있습니다."
        : "Tuition and campus services in Korea are budgeted by semester. Our Semester Bundle allows you to pay once per 4-month academic term at a discounted rate, giving you uninterrupted access through midterms and finals without monthly renewals."
    },
    {
      question: isKo ? "한국 대학 학업 어시스턴트에는 무엇이 포함되나요?" : "What is included in the Korean Academic Assistant?",
      answer: isKo
        ? "한국어 ↔ 영어 전공 용어 쌍방향 번역, 맥락 기반 전문 용어 해설, 그리고 실제 한국 대학 교수님의 강의 구성 방식에 맞춘 학습 요약 및 문제 예측을 제공합니다."
        : "It is our core localization edge. It provides Korean ↔ English academic translation, explains technical jargon in context, and simplifies course material aligned with how Korean university professors actually structure their lectures."
    },
    {
      question: isKo ? "구독 전에 무료로 체험해 볼 수 있나요?" : "Can I try PreplitAI for free before subscribing?",
      answer: isKo
        ? "네! 무료 플랜(월 ₩0)은 카드 등록 없이 바로 문서 업로드, 출처 인용 AI 챗, 기본 퀴즈 기능을 체험해 보실 수 있습니다."
        : "Yes! The Free plan costs ₩0/month and lets you try out document uploads, grounded AI chats, and basic quizzes with no credit card required."
    },
    {
      question: isKo ? "대학 및 학원 전용 플랜은 어떻게 이용하나요?" : "How do Institution plans work for universities & academies?",
      answer: isKo
        ? "기관 플랜은 학생 수 및 LMS 연동 요구사항에 따라 맞춤 견적으로 제공됩니다. 영업 팀에 문의하시면 전용 데모와 함께 안내해 드립니다."
        : "Institution pricing is custom-scoped per university, department, or academy based on seat count and LMS integration requirements. Contact our sales team for a custom quote and demo."
    },
  ];

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/pricing`;
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <SEOHead
        title={isKo ? "PreplitAI 요금제 — 학생 맞춤형 플랜" : "PreplitAI Pricing — Built for Student Budgets"}
        description={isKo ? "한국 대학생 및 유학생을 위한 3단계 투명 요금제. 무료(₩0), 학생 프로(월 ₩9,900~₩12,900), 학기 패스 및 기업/대학 플랜." : "Simple 3-tier pricing for Korean and international university students."}
        url={canonical}
        canonical={canonical}
      />
      
      {/* Hero */}
      <section className="pt-16 sm:pt-32 pb-12 sm:pb-14 px-4 sm:px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#630000]/8 dark:bg-[#630000]/20 border border-[#630000]/20 dark:border-[#630000]/30 mb-6">
            <span className="text-[13px] font-medium text-[#630000] dark:text-[#ffaaaa]">
              {isKo ? '대학생 맞춤형 요금제' : 'Built for Student Budgets'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black dark:text-white mb-5">
            {isKo ? '투명하고 부담 없는 학업 요금제.' : 'Simple, student-first pricing.'}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {isKo
              ? '한국 대학생과 외국인 유학생을 위한 합리적인 가격. 비싼 글로벌 SaaS 요금 대신 주머니 사정에 맞췄습니다.'
              : 'Three simple tiers. Priced for Korean university students and international scholars — not expensive US SaaS rates.'}
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {isKo ? '월간 결제' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingPeriod("semester")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingPeriod === "semester"
                  ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#630000] dark:text-[#ffaaaa]" />
              <span>{isKo ? '학기 패스 (4개월 할인)' : 'Semester Pass (4 Months)'}</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#630000] text-white rounded-full">
                {isKo ? '25% 할인' : 'Save 25%'}
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          
          {/* Free Tier */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-col">
            <div className="flex-1 p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{isKo ? '무료 플랜' : 'Free'}</h3>
                </div>
                <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                  {isKo ? '기본 AI 스터디 워크스페이스를 즉시 체험하려는 가벼운 학습자용.' : 'For casual learners trying out the basic AI study workspace.'}
                </p>
                <div className="mb-6 h-[40px] flex items-end">
                  <span className="text-4xl font-bold tracking-tight text-black dark:text-white">₩0</span>
                  <span className="text-sm text-gray-400 ml-2 mb-1">{isKo ? '/평생 무료' : '/forever'}</span>
                </div>
                <Button asChild variant="outline" className="w-full mb-8 h-11 rounded-xl border-gray-200 dark:border-white/10 transition-all hover:scale-[0.98]">
                  <a href="/preplitai-chat">{isKo ? '무료로 시작하기' : 'Start Free'}</a>
                </Button>
                <div className="space-y-3.5">
                  <p className="text-[13px] font-semibold text-black dark:text-white">{isKo ? '기능 포함 사항:' : 'Includes:'}</p>
                  {features.free.map((f) => (
                    <div key={f} className="flex gap-3 items-start text-[14px] text-gray-600 dark:text-gray-300">
                      <Check className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Student Pro Tier (Featured) */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex flex-col relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
              <span className="px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#630000] text-white rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {isKo ? '인기 추천' : 'Most Popular'}
              </span>
            </div>
            
            <div className="flex-1 p-8 rounded-3xl border-2 border-[#630000] dark:border-[#990000] bg-white dark:bg-[#141111] flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{isKo ? '학생 프로' : 'Student Pro'}</h3>
                </div>
                <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                  {isKo ? '학업 성취도 향상과 시험 A+를 목표로 하는 대학생 및 유학생용.' : 'For university scholars aiming for top grades and stress-free exams.'}
                </p>
                <div className="mb-6 h-[40px] flex items-end">
                  {billingPeriod === "monthly" ? (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-black dark:text-white">₩12,900</span>
                      <span className="text-sm text-gray-400 ml-2 mb-1">{isKo ? '/월' : '/month'}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-black dark:text-white">₩39,900</span>
                      <span className="text-sm text-gray-400 ml-2 mb-1">{isKo ? '/학기 (월 ₩9,975 상당)' : '/semester'}</span>
                    </>
                  )}
                </div>
                <Button asChild className="w-full mb-8 h-11 rounded-xl bg-[#630000] hover:bg-[#7a0000] text-white font-semibold shadow-md transition-all hover:scale-[0.98]">
                  <a href="/preplitai-chat">{isKo ? '학생 프로 시작하기' : 'Get Student Pro'}</a>
                </Button>
                <div className="space-y-3.5">
                  <p className="text-[13px] font-semibold text-black dark:text-white">{isKo ? '무료 플랜의 모든 기능 +' : 'Everything in Free, plus:'}</p>
                  {features.studentPro.map((f) => (
                    <div key={f} className="flex gap-3 items-start text-[14px] text-gray-700 dark:text-gray-200">
                      <Check className="w-4 h-4 text-[#630000] dark:text-[#ffaaaa] shrink-0 mt-0.5" />
                      <span className="font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Institution Tier */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-col">
            <div className="flex-1 p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{isKo ? '대학 / 기관' : 'Institution'}</h3>
                </div>
                <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                  {isKo ? '대량 라이선스와 성과 분석이 필요한 대학 학과, 연구실 및 전문 학원용.' : 'For universities, departments, and private academies needing bulk licensing & analytics.'}
                </p>
                <div className="mb-6 h-[40px] flex items-end">
                  <span className="text-3xl font-bold tracking-tight text-black dark:text-white">{isKo ? '맞춤 문의' : 'Custom'}</span>
                </div>
                <Button asChild variant="outline" className="w-full mb-8 h-11 rounded-xl border-gray-200 dark:border-white/10 transition-all hover:scale-[0.98]">
                  <a href="/sales">{isKo ? '영업팀 문의' : 'Contact Sales'}</a>
                </Button>
                <div className="space-y-3.5">
                  <p className="text-[13px] font-semibold text-black dark:text-white">{isKo ? '학생 프로의 모든 기능 +' : 'Everything in Student Pro, plus:'}</p>
                  {features.institution.map((f) => (
                    <div key={f} className="flex gap-3 items-start text-[14px] text-gray-600 dark:text-gray-300">
                      <Check className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#0e0e0e]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              {isKo ? '자주 묻는 질문 (FAQ)' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isKo ? '요금제 및 서비스 이용에 대해 궁금한 점을 확인해보세요.' : 'Everything you need to know about PreplitAI plans and billing.'}
            </p>
          </div>

          <div className="space-y-4">
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
    <div className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#141414] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-black dark:text-white text-base hover:opacity-80 transition-opacity"
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
            <p className="px-6 pb-6 pt-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
