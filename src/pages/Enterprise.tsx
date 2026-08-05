import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, MessageSquare, BookOpen, Target, Sparkles, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const bullets = {
  knowledge: [
    "Centralized course hubs for departments, programs, and courses",
    "Support for PDFs, lecture slides, textbooks, YouTube & audio recordings",
    "Granular permissions and role-based access for educators and students",
  ],
  search: [
    "Grounded RAG search across all course materials & transcripts",
    "AI-generated answers with exact page citations",
    "Instant Q&A for lectures, syllabi, and technical reference notes",
  ],
  ai: [
    "Interactive Learning Mode with visual simulations & exercises",
    "Auto-generated practice quizzes, flashcard decks & podcasts",
    "Expected Exam Question predictor based on past paper analytics",
  ],
  security: [
    "SAML SSO integration (Okta, Azure AD, Google Workspace)",
    "SCIM automated student & faculty provisioning",
    "Comprehensive audit logs and administrator usage analytics",
    "AES-256 encryption in transit and at rest",
  ],
};

const showcase = [
  {
    key: 'interactive-learning',
    eyebrow: 'Interactive & Adaptive',
    title: 'Transform static course materials into interactive classrooms.',
    copy: 'Enable students and educators to study actively with adaptive visual exercises, interactive simulations, and instant concept explorations built directly from uploaded course syllabi.',
    bullets: [
      'Interactive visual simulations and concept demonstrations',
      'Adaptive practice quizzes (MCQ, short answer, fill-in-the-blank)',
      'Smart flashcard decks with active recall repetition',
    ],
    icon: Sparkles
  },
  {
    key: 'grounded-search',
    eyebrow: 'Grounded & Accurate',
    title: 'Instant answers with source citations back to trusted course documents.',
    copy: 'Eliminate AI hallucinations with PreplitAI\'s Grounded RAG engine. Every answer provides precise citations linking directly to textbook pages, slides, and lecture notes.',
    bullets: [
      'Grounded RAG search across PDFs, slides, and transcripts',
      'Exact page-number and document section citations',
      'Departmental study space management and sharing',
    ],
    icon: MessageSquare
  },
  {
    key: 'korean-assistant',
    eyebrow: 'Global & Multilingual',
    title: 'Korean Academic Assistant for domestic and international students.',
    copy: 'Break language and learning barriers in Korean higher education with academic Korean ↔ English translation, technical jargon simplification, and contextual course notes support.',
    bullets: [
      'Korean ↔ English academic translation and terminology guide',
      'Tailored for Korean university lecture materials & textbooks',
      'Supports GKS scholars, exchange students, and international cohorts',
    ],
    icon: Globe
  },
] as const;

const Enterprise = () => {
  const [emailInput, setEmailInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/enterprise`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubmitted(true);
      toast.success("Thank you! Our enterprise team will get in touch within 1 business day.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <SEOHead
        title="PreplitAI for Enterprise & Universities"
        description="Secure AI learning workspace for universities, academies, and educational organizations. Grounded RAG chat, quizzes, flashcards, predicted exams, and Korean Academic Assistant."
        url={canonical}
        canonical={canonical}
      />
      
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#630000]/8 dark:bg-[#630000]/20 border border-[#630000]/20 dark:border-[#630000]/30 mb-8">
              <span className="text-[13px] font-medium text-[#630000] dark:text-[#ffaaaa]">PreplitAI Enterprise &amp; Education</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight leading-[1.1]">
              The AI Learning Workspace
              <br />
              <span className="text-[#630000] dark:text-[#ff9999]">For Higher Education.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Transform static course slides, textbooks, and lectures into interactive learning spaces, adaptive quizzes, predicted exams, and multilingual academic support.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg px-8 h-12 text-[15px] font-medium shadow-sm transition-all hover:scale-[0.98]">
                <a href="#contact">Request a Demo</a>
              </Button>
              <Button asChild variant="outline" className="border-gray-200 dark:border-white/10 rounded-lg px-8 h-12 text-[15px] font-medium bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-white transition-all hover:scale-[0.98]">
                <a href="/preplitai-chat">Explore Workspace</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value blocks */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6 pb-24">
        {[
          { title: "Course & Department Hubs", desc: "Centralized study spaces for courses, departments, and programs.", items: bullets.knowledge },
          { title: "Grounded RAG Search", desc: "Instantly surface answers across course notes with page citations.", items: bullets.search },
          { title: "Interactive AI Tools", desc: "Simulations, adaptive quizzes, flashcard decks & predicted exams.", items: bullets.ai },
          { title: "Enterprise Security & SSO", desc: "FERPA-compliant security, SAML SSO, and SCIM provisioning.", items: bullets.security },
        ].map((block, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            custom={i}
            className="p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-[#630000]/30 dark:hover:border-[#630000]/40 transition-colors group"
          >
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mb-2">{block.title}</h2>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-6">{block.desc}</p>
            <ul className="space-y-3">
              {block.items.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[14px] text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#630000] dark:text-[#ff9999] mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      {/* Showcase */}
      <section className="border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-28 space-y-28">
          {showcase.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div 
                key={s.key}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                custom={0}
                className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
              >
                <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="aspect-[4/3] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] shadow-sm overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#630000]/10 dark:bg-[#ff9999]/10 text-[#630000] dark:text-[#ff9999] flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">{s.title}</h3>
                    <p className="text-xs text-gray-400 max-w-xs">{s.eyebrow} module designed for university deployment</p>
                  </div>
                </div>
                <div className={idx % 2 === 1 ? 'md:order-1' : ''}>
                  <p className="text-[13px] font-semibold text-[#630000] dark:text-[#ff9999] uppercase tracking-wider mb-3">{s.eyebrow}</p>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4 leading-tight">{s.title}</h2>
                  <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{s.copy}</p>
                  <ul className="space-y-4">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[14.5px] text-gray-600 dark:text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-[#630000] dark:text-[#ff9999] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="border-t border-gray-200 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-28 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4">Request an Enterprise Demo</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Provide your institutional email and our educational partners team will reach out within 1 business day.
            </p>
            
            {submitted ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-300 max-w-lg mx-auto font-medium text-sm">
                ✓ Demo request received! We will contact you at <strong>{emailInput}</strong> shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <Input 
                  type="email" 
                  placeholder="name@university.edu" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-12 flex-1 rounded-lg bg-white dark:bg-black border-gray-200 dark:border-white/10 focus-visible:ring-[#630000] text-[15px]"
                  required 
                />
                <Button type="submit" className="h-12 px-8 rounded-lg bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium transition-all hover:scale-[0.98]">
                  Submit
                </Button>
              </form>
            )}
            <p className="mt-4 text-[13px] text-gray-400">By submitting, you agree to be contacted regarding PreplitAI Enterprise &amp; University plans.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Enterprise;