import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Sparkles, Building2, GraduationCap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = {
  free: [
    "Limited document & slide uploads",
    "Limited AI study chats per day",
    "Basic practice quizzes",
    "Korean ↔ English basic translation",
    "No credit card required",
  ],
  studentPro: [
    "Everything in Free",
    "Unlimited AI study chats & document uploads",
    "Interactive Learning Mode (simulations, drag-and-drop)",
    "AI Video Lecture Generator & Podcast Learning Mode",
    "Expected Exam Questions predictor (past paper analysis)",
    "Full AI Learning Analytics & weak spot tracking",
    "Korean Academic Assistant & professor lecture alignment",
  ],
  institution: [
    "Everything in Student Pro",
    "Bulk seat licensing for departments & universities",
    "Administrator dashboard & learning analytics",
    "LMS integration & SCIM user provisioning",
    "SAML SSO (Okta, Azure AD, Google Workspace)",
    "Dedicated customer success manager & SLA support",
    "Custom institution-wide security & FERPA compliance",
  ],
} as const;

const faqs = [
  {
    question: "Why is PreplitAI priced so affordably for students?",
    answer: "We built PreplitAI specifically for Korean university students and international students on a student budget. Rather than charging high international SaaS prices ($20+/mo), our Student Pro tier (₩9,900–₩12,900/mo) gives you an entire AI study companion for less than the cost of a single textbook."
  },
  {
    question: "How does the Semester Bundle work?",
    answer: "Tuition and campus services in Korea are budgeted by semester. Our Semester Bundle allows you to pay once per 4-month academic term at a discounted rate, giving you uninterrupted access through midterms and finals without monthly renewals."
  },
  {
    question: "What is included in the Korean Academic Assistant?",
    answer: "It is our core localization edge. It provides Korean ↔ English academic translation, explains technical jargon in context, and simplifies course material aligned with how Korean university professors actually structure their lectures."
  },
  {
    question: "Can I try PreplitAI for free before subscribing?",
    answer: "Yes! The Free plan costs ₩0/month and lets you try out document uploads, grounded AI chats, and basic quizzes with no credit card required."
  },
  {
    question: "How do Institution plans work for universities & academies?",
    answer: "Institution pricing is custom-scoped per university, department, or academy based on seat count and LMS integration requirements. Contact our sales team for a custom quote and demo."
  },
];

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "semester">("semester");

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/pricing`;
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <SEOHead
        title="PreplitAI Pricing — Built for Student Budgets"
        description="Simple 3-tier pricing for Korean and international university students. Free (₩0), Student Pro (₩9,900–₩12,900/mo), and Custom Institution plans."
        url={canonical}
        canonical={canonical}
      />
      
      {/* Hero */}
      <section className="pt-32 pb-14 px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#630000]/8 dark:bg-[#630000]/20 border border-[#630000]/20 dark:border-[#630000]/30 mb-6">
            <span className="text-[13px] font-medium text-[#630000] dark:text-[#ffaaaa]">Built for Student Budgets</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black dark:text-white mb-5">
            Simple, student-first pricing.
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Three simple tiers. Priced for Korean university students and international scholars — not expensive US SaaS rates.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-white dark:bg-[#222] text-black dark:text-white shadow-xs" 
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("semester")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                billingPeriod === "semester" 
                  ? "bg-white dark:bg-[#222] text-black dark:text-white shadow-xs" 
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Semester Bundle <span className="px-2 py-0.5 rounded text-[10px] bg-[#630000] text-white font-bold uppercase tracking-wider">Best Value</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards — 3 Tiers */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          
          {/* 1. Free Tier */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/20 transition-colors flex flex-col justify-between">
            <div>
              <div className="mb-2">
                <h3 className="text-xl font-bold text-black dark:text-white">Free</h3>
              </div>
              <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                Free forever. Try PreplitAI with basic chat &amp; quizzes with zero commitment.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight text-black dark:text-white">₩0</span>
                <span className="text-sm text-gray-500 dark:text-gray-400"> / month</span>
              </div>
              <Button asChild variant="outline" className="w-full mb-8 h-11 rounded-xl border-gray-200 dark:border-white/10 transition-all hover:scale-[0.98]">
                <a href="/preplitai-chat">Try Free Workspace</a>
              </Button>
              <div className="space-y-3.5">
                <p className="text-[13px] font-semibold text-black dark:text-white">Includes:</p>
                {features.free.map((f) => (
                  <div key={f} className="flex gap-3 items-start text-[14px] text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 2. Student Pro Tier (Popular) */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="relative p-8 rounded-3xl border-2 border-[#630000] bg-white dark:bg-[#111] flex flex-col justify-between shadow-xl shadow-[#630000]/10 dark:shadow-none">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#630000] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
              Most Popular for Students
            </div>
            <div>
              <div className="mb-2">
                <h3 className="text-xl font-bold text-black dark:text-white">Student Pro</h3>
              </div>
              <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                Full AI study companion: unlimited chats, interactive mode, exam prediction &amp; podcasts.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight text-black dark:text-white">
                  {billingPeriod === 'semester' ? '₩9,900' : '₩12,900'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400"> / month</span>
                {billingPeriod === 'semester' && (
                  <p className="text-xs text-[#630000] dark:text-[#ff9999] font-medium mt-1">Billed as discounted ₩39,600 semester pass</p>
                )}
              </div>
              <Button asChild className="w-full mb-8 h-11 rounded-xl bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold transition-all hover:scale-[0.98]">
                <a href="/preplitai-chat">Get Student Pro</a>
              </Button>
              <div className="space-y-3.5">
                <p className="text-[13px] font-semibold text-black dark:text-white">Everything in Free, plus:</p>
                {features.studentPro.map((f) => (
                  <div key={f} className="flex gap-3 items-start text-[14px] text-gray-700 dark:text-gray-200">
                    <Check className="w-4 h-4 text-[#630000] dark:text-[#ff9999] shrink-0 mt-0.5" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 3. Institution Tier */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/20 transition-colors flex flex-col justify-between">
            <div>
              <div className="mb-2">
                <h3 className="text-xl font-bold text-black dark:text-white">Institution</h3>
              </div>
              <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                For universities, departments, and private academies needing bulk licensing &amp; analytics.
              </p>
              <div className="mb-6 h-[40px] flex items-end">
                <span className="text-3xl font-bold tracking-tight text-black dark:text-white">Custom</span>
              </div>
              <Button asChild variant="outline" className="w-full mb-8 h-11 rounded-xl border-gray-200 dark:border-white/10 transition-all hover:scale-[0.98]">
                <a href="/sales">Contact Sales</a>
              </Button>
              <div className="space-y-3.5">
                <p className="text-[13px] font-semibold text-black dark:text-white">Everything in Student Pro, plus:</p>
                {features.institution.map((f) => (
                  <div key={f} className="flex gap-3 items-start text-[14px] text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-24 border-t border-gray-200 dark:border-white/10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Pricing FAQ</h2>
          <p className="text-gray-500 dark:text-gray-400">Everything you need to know about PreplitAI subscriptions.</p>
        </motion.div>
        <FAQSection />
      </section>
      
      <Footer />
    </div>
  );
};

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-white/10 last:border-0">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
          >
            <span className="text-[16px] font-semibold text-black dark:text-white">{faq.question}</span>
            <div className={`ml-6 shrink-0 w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center transition-transform duration-300 ${openIndex === index ? 'rotate-180 bg-gray-50 dark:bg-white/5' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="pb-5 text-gray-500 dark:text-gray-400 text-[14.5px] leading-relaxed pr-10">
                  {faq.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default Pricing;
