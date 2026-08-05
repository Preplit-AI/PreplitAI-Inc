import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
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
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

/* ─── Data ───────────────────────────────────────────────────────────── */
const pillars = [
  { icon: MessageSquare, label: "AI Study Chat",           desc: "Grounded RAG chat with exact page citations — no hallucinations." },
  { icon: Zap,           label: "Interactive Learning",    desc: "Visual simulations, concept maps & drag-and-drop exercises." },
  { icon: Video,         label: "AI Video Lectures",       desc: "Generate micro-lecture videos directly from your study material." },
  { icon: Headphones,    label: "Podcast Learning Mode",   desc: "Turn any PDF or slides into a conversational audio podcast." },
  { icon: BookOpen,      label: "Smart Flashcards",        desc: "Spaced-repetition decks auto-generated from your content." },
  { icon: HelpCircle,    label: "Smart Quiz Generator",    desc: "MCQ, short-answer & fill-in-the-blank quizzes on demand." },
  { icon: Target,        label: "Expected Exam Questions", desc: "AI-predicted exam questions based on past papers & syllabi." },
  { icon: BarChart2,     label: "Learning Analytics",      desc: "Track weak spots and time-on-task to study smarter every session." },
  { icon: Globe,         label: "Korean Academic Assist.", desc: "Bilingual support for Korean domestic & international students." },
];

const values = [
  {
    icon: Lightbulb,
    title: "Understanding over memorising",
    body:  "We design every feature to build genuine comprehension — not to help students cram and forget.",
  },
  {
    icon: Heart,
    title: "Student-first, always",
    body:  "Every decision starts with a single question: does this make a real student's study session better?",
  },
  {
    icon: Users,
    title: "Accessible globally",
    body:  "Language should never be a barrier to learning. Multilingual support is built into the core of PreplitAI.",
  },
  {
    icon: Sparkles,
    title: "Honest AI",
    body:  "Our Grounded RAG engine cites sources. If PreplitAI doesn't know, it says so — no fabrications.",
  },
];

const timeline = [
  {
    year: "The Problem",
    title: "Students were studying harder, not smarter.",
    body:  "University students were drowning in PDFs, textbook chapters, and recorded lectures — with no intelligent way to engage with the material. Passive reading wasn't working.",
  },
  {
    year: "The Insight",
    title: "AI could transform any material into a tutor.",
    body:  "What if any document — a slide deck, a textbook chapter, a YouTube lecture — could become an interactive teacher that quizzes you, explains concepts visually, and predicts what will appear on your exam?",
  },
  {
    year: "The Build",
    title: "PreplitAI: One complete study workspace.",
    body:  "We combined Grounded RAG chat, adaptive quizzes, smart flashcards, AI-generated podcasts, video lectures, and predicted exam questions into a single seamless platform — your complete AI study companion.",
  },
  {
    year: "Today",
    title: "Focused on Korean higher education first.",
    body:  "Our initial market is Korean university students and international students studying in Korea — a fast-growing, tech-forward community demanding AI-native learning tools.",
  },
];

/* ─── Component ─────────────────────────────────────────────────────── */
const About = () => {
  const siteUrl   = (import.meta as any).env?.VITE_SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/about`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] overflow-x-hidden">
      <SEOHead
        title="About PreplitAI — AI Study Companion for University Students"
        description="PreplitAI transforms any study material into an interactive learning experience. Learn about our mission, our 9-pillar AI study platform, and our focus on Korean higher education."
        url={canonical}
        canonical={canonical}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-36 pb-20 text-center">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div className="w-[700px] h-[700px] rounded-full bg-[#630000]/6 dark:bg-[#630000]/12 blur-[140px] -translate-y-1/4" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#630000]/8 dark:bg-[#630000]/20 border border-[#630000]/20 dark:border-[#630000]/30 mb-8">
            <Star className="w-3.5 h-3.5 text-[#630000] dark:text-[#ffaaaa]" />
            <span className="text-[12.5px] font-semibold text-[#630000] dark:text-[#ffaaaa] tracking-wide">Our Story</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-black dark:text-white leading-[1.08] tracking-tight mb-7">
            We're building the world's
            <br className="hidden sm:block" />
            <span className="text-[#630000] dark:text-[#ff9999]"> most powerful AI</span>
            <br className="hidden sm:block" />
            study companion.
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            PreplitAI transforms any study material — lecture slides, PDFs, textbooks, handwritten notes,
            YouTube videos — into personalized, interactive learning experiences designed to help students
            understand, retain, and excel.
          </p>
        </motion.div>
      </section>

      {/* ── Tagline Banner ─────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={0}
        className="border-y border-gray-100 dark:border-white/[0.06] bg-[#630000] dark:bg-[#630000]/90 py-10 px-6 text-center"
      >
        <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight max-w-3xl mx-auto leading-snug">
          "Transform Any Study Material into an Interactive Learning Experience."
        </p>
        <p className="text-white/60 text-sm mt-3 font-medium tracking-widest uppercase">PreplitAI Tagline</p>
      </motion.section>

      {/* ── Story / Timeline ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">How we got here</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-[16px] max-w-xl mx-auto">
            From a simple frustration to a complete AI learning platform.
          </p>
        </motion.div>

        <div className="relative">
          {/* vertical line */}
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
                {/* content */}
                <div className="flex-1">
                  <div className={`inline-block text-[11px] font-bold uppercase tracking-widest text-[#630000] dark:text-[#ff9999] mb-2 px-2.5 py-1 rounded-full bg-[#630000]/8 dark:bg-[#630000]/15`}>
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[15px]">{item.body}</p>
                </div>

                {/* dot */}
                <div className="hidden sm:flex items-start justify-center w-6 shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-[#630000] ring-4 ring-white dark:ring-[#0a0a0a] mt-1.5" />
                </div>

                {/* spacer */}
                <div className="flex-1 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ───────────────────────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10">
          {[
            {
              eyebrow: "Our Mission",
              title: "Make high-quality, personalized learning accessible to every student on earth.",
              body: "University students deserve more than a chatbot. PreplitAI combines tutoring, exam preparation, interactive simulations, video generation, quizzes, podcasts, flashcards, and adaptive analytics into a single AI-powered workspace — so every student can study the way their brain actually learns.",
            },
            {
              eyebrow: "Our Vision",
              title: "A world where no student is left behind because of how they learn.",
              body: "Not everyone learns the same way. Some students need visual diagrams. Others need audio explanations. Some need relentless quiz practice. PreplitAI adapts to every learner — regardless of language, background, or learning style — starting with Korean university students and international students studying in Korea.",
            },
          ].map((block, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 md:p-10 hover:border-[#630000]/30 dark:hover:border-[#630000]/40 transition-colors"
            >
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#630000] dark:text-[#ff9999] mb-3">{block.eyebrow}</p>
              <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-4 leading-snug">{block.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">{block.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 9 Pillars ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
            9 pillars. One workspace.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[16px] max-w-xl mx-auto">
            Every tool in PreplitAI exists to turn passive study material into active, engaging learning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeUp}
                custom={i}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#111] p-6 hover:border-[#630000]/40 dark:hover:border-[#630000]/50 hover:shadow-lg transition-all duration-300"
              >
                {/* hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#630000]/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#630000]/8 dark:bg-[#630000]/15 text-[#630000] dark:text-[#ff9999] flex items-center justify-center mb-4 group-hover:bg-[#630000]/15 dark:group-hover:bg-[#630000]/25 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[15px] text-black dark:text-white mb-1.5">{p.label}</h3>
                  <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
              What we believe in
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[16px] max-w-xl mx-auto">
              The principles that guide every product decision at PreplitAI.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
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
                  className="flex gap-5 p-7 bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/[0.08] hover:border-[#630000]/30 dark:hover:border-[#630000]/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#630000]/8 dark:bg-[#630000]/15 text-[#630000] dark:text-[#ff9999] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] text-black dark:text-white mb-2">{v.title}</h3>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">{v.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Market Focus ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="grid md:grid-cols-5 gap-10 items-center"
        >
          <div className="md:col-span-3">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#630000] dark:text-[#ff9999] mb-3">Where we're focused</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight mb-5 leading-tight">
              Starting with Korean university students — and going global.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[15.5px] leading-relaxed mb-5">
              Korea's higher education landscape is one of the world's most competitive. With over 600,000 international students expected by 2027 and a surging demand for AI-powered learning tools, Korea is the ideal launchpad for PreplitAI.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-[15.5px] leading-relaxed">
              Our Korean Academic Assistant bridges the language gap for GKS scholars and exchange students studying in Korean, while our adaptive AI tools help domestic students excel in high-stakes exams.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[
              { value: "600K+", label: "Int'l students in Korea by 2027" },
              { value: "9",     label: "AI study pillars in one workspace" },
              { value: "1",     label: "Focused market, global potential" },
              { value: "∞",     label: "Learning styles supported" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/[0.08] rounded-2xl text-center hover:border-[#630000]/30 dark:hover:border-[#630000]/40 transition-colors"
              >
                <div className="text-3xl font-bold text-[#630000] dark:text-[#ff9999] mb-1">{s.value}</div>
                <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-tight">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-white/[0.06] bg-[#630000] dark:bg-[#630000]/90">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
              Ready to transform how you study?
            </h2>
            <p className="text-white/70 text-[17px] mb-10 max-w-xl mx-auto leading-relaxed">
              Join students turning their lecture slides, PDFs, and textbooks into interactive learning experiences with PreplitAI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-13 px-8 rounded-xl bg-white hover:bg-gray-100 text-[#630000] font-semibold text-[15px] shadow-lg transition-all hover:scale-[0.98]"
              >
                <a href="/preplitai-chat">
                  Open the Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 px-8 rounded-xl border-white/30 text-white hover:bg-white/10 font-medium text-[15px] transition-all hover:scale-[0.98] bg-transparent"
              >
                <a href="/enterprise">Enterprise &amp; Universities</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
