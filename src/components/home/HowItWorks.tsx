import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export const HowItWorks = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section id="how-it-works" className="bg-[#f8f9fa] dark:bg-[#0c0c0c] py-20 sm:py-28 px-4 border-t border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header (Matching Timmo 'Our Numbers Speak for Themselves') */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-14 sm:mb-16 gap-3">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#111111] dark:text-white max-w-lg leading-tight"
          >
            {isKo ? "숫자로 증명하는 학습 성과" : "Our Numbers Speak for Themselves"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal"
          >
            {isKo ? "국내외 대학생과 장학생들이 매일 함께하고 있습니다." : "Powered by our growing community."}
          </motion.p>
        </div>

        {/* Exactly 3 Clean White Cards (Grid Cols 1 on mobile, 3 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Users / Profiles Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="rounded-2xl bg-white dark:bg-[#141414] p-3 shadow-md shadow-black/[0.03] border border-neutral-200/80 dark:border-white/[0.08] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Custom High-Fidelity Vector Illustration Container (Matching Image 1 Card 1) */}
            <div className="w-full rounded-xl bg-[#fafafa] dark:bg-neutral-900 h-[220px] sm:h-[240px] flex items-center justify-center p-4 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
              <svg viewBox="0 0 300 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Card */}
                <g opacity="0.85" transform="translate(15, 30)">
                  <rect width="80" height="130" rx="10" fill="white" stroke="#111" strokeWidth="1.5" />
                  <circle cx="40" cy="40" r="18" fill="#e0e7ff" stroke="#111" strokeWidth="1.5" />
                  {/* Head */}
                  <circle cx="40" cy="36" r="8" fill="#111" />
                  <path d="M28 52 C28 44, 52 44, 52 52" fill="#4f46e5" stroke="#111" strokeWidth="1.2" />
                  {/* Info lines */}
                  <circle cx="22" cy="72" r="3" fill="#3b82f6" />
                  <rect x="30" y="70" width="35" height="4" rx="2" fill="#e2e8f0" />
                  <circle cx="22" cy="85" r="3" fill="#3b82f6" />
                  <rect x="30" y="83" width="30" height="4" rx="2" fill="#e2e8f0" />
                  <circle cx="22" cy="98" r="3" fill="#3b82f6" />
                  <rect x="30" y="96" width="38" height="4" rx="2" fill="#e2e8f0" />
                </g>

                {/* Right Card */}
                <g opacity="0.85" transform="translate(205, 30)">
                  <rect width="80" height="130" rx="10" fill="white" stroke="#111" strokeWidth="1.5" />
                  <circle cx="40" cy="40" r="18" fill="#fef3c7" stroke="#111" strokeWidth="1.5" />
                  {/* Head */}
                  <circle cx="40" cy="36" r="8" fill="#111" />
                  <path d="M28 52 C28 44, 52 44, 52 52" fill="#111" stroke="#111" strokeWidth="1.2" />
                  {/* Info lines */}
                  <rect x="20" y="70" width="45" height="4" rx="2" fill="#e2e8f0" />
                  <rect x="20" y="83" width="35" height="4" rx="2" fill="#e2e8f0" />
                  <rect x="20" y="96" width="40" height="4" rx="2" fill="#e2e8f0" />
                </g>

                {/* Center Prominent Card */}
                <g transform="translate(100, 10)">
                  <rect width="100" height="160" rx="12" fill="white" stroke="#111" strokeWidth="2" />
                  {/* Notch */}
                  <rect x="35" y="6" width="30" height="3" rx="1.5" fill="#111" />
                  {/* Main Avatar */}
                  <circle cx="50" cy="55" r="24" fill="#d1fae5" stroke="#111" strokeWidth="2" />
                  <circle cx="50" cy="50" r="11" fill="#111" />
                  <path d="M34 72 C34 62, 66 62, 66 72" fill="#059669" stroke="#111" strokeWidth="1.8" />
                  {/* Info dots & lines */}
                  <circle cx="28" cy="95" r="4" fill="#3b82f6" />
                  <rect x="38" y="93" width="42" height="5" rx="2.5" fill="#e2e8f0" />
                  <circle cx="28" cy="112" r="4" fill="#3b82f6" />
                  <rect x="38" y="110" width="36" height="5" rx="2.5" fill="#e2e8f0" />
                  <circle cx="28" cy="129" r="4" fill="#3b82f6" />
                  <rect x="38" y="127" width="48" height="5" rx="2.5" fill="#e2e8f0" />
                </g>
              </svg>
            </div>

            {/* Bottom Content */}
            <div className="px-4 py-3.5">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                620+
              </h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isKo ? "가입된 대학생 및 사용자" : "Register User"}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Focus Tools Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="rounded-2xl bg-white dark:bg-[#141414] p-3 shadow-md shadow-black/[0.03] border border-neutral-200/80 dark:border-white/[0.08] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Custom High-Fidelity Vector Illustration Container (Matching Image 1 Card 2) */}
            <div className="w-full rounded-xl bg-[#fafafa] dark:bg-neutral-900 h-[220px] sm:h-[240px] flex items-center justify-center p-4 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
              <svg viewBox="0 0 300 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Center Phone Device */}
                <g transform="translate(105, 10)">
                  <rect width="90" height="175" rx="14" fill="white" stroke="#111" strokeWidth="2" />
                  {/* Screen Header Bar */}
                  <rect x="20" y="10" width="50" height="7" rx="3.5" fill="#bef264" stroke="#111" strokeWidth="1" />
                  {/* Grid of Tool Chips on Phone */}
                  <rect x="15" y="28" width="26" height="26" rx="6" fill="#bef264" stroke="#111" strokeWidth="1.2" />
                  <rect x="49" y="28" width="26" height="26" rx="6" fill="#111" />
                  <rect x="15" y="60" width="26" height="26" rx="6" fill="#111" />
                  <rect x="49" y="60" width="26" height="26" rx="6" fill="#bef264" stroke="#111" strokeWidth="1.2" />
                  <rect x="15" y="92" width="26" height="26" rx="6" fill="#bef264" stroke="#111" strokeWidth="1.2" />
                  <rect x="49" y="92" width="26" height="26" rx="6" fill="#111" />
                  {/* Bottom widget */}
                  <rect x="12" y="128" width="66" height="36" rx="8" fill="#facc15" stroke="#111" strokeWidth="1.2" />
                  <rect x="20" y="136" width="30" height="5" rx="2.5" fill="#111" />
                  <rect x="20" y="146" width="48" height="4" rx="2" fill="#111" opacity="0.6" />
                </g>

                {/* Left Character with Magnifying Glass */}
                <g transform="translate(20, 80)">
                  {/* Speech bubble */}
                  <path d="M50 0 C60 0, 68 8, 68 18 C68 28, 60 36, 50 36 L44 42 L46 36 C40 36, 32 28, 32 18 C32 8, 40 0, 50 0 Z" fill="white" stroke="#111" strokeWidth="1.2" />
                  <circle cx="45" cy="18" r="1.5" fill="#111" />
                  <circle cx="50" cy="18" r="1.5" fill="#111" />
                  <circle cx="55" cy="18" r="1.5" fill="#111" />
                  {/* Person Body */}
                  <circle cx="65" cy="45" r="9" fill="white" stroke="#111" strokeWidth="1.5" />
                  <path d="M65 54 L60 85 L75 85" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  {/* Arm holding magnifying glass */}
                  <path d="M60 62 L85 58" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="92" cy="56" r="11" fill="none" stroke="#111" strokeWidth="2" />
                  <line x1="100" y1="64" x2="108" y2="72" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* Right Character with Telescope */}
                <g transform="translate(210, 80)">
                  <circle cx="20" cy="40" r="9" fill="white" stroke="#111" strokeWidth="1.5" />
                  <path d="M20 49 L20 85 L26 85" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  {/* Telescope */}
                  <path d="M12 45 L-15 25" stroke="#111" strokeWidth="3" strokeLinecap="round" fill="#111" />
                </g>
              </svg>
            </div>

            {/* Bottom Content */}
            <div className="px-4 py-3.5">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                9
              </h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isKo ? "통합 AI 학업 도구 포함" : "focus tools included"}
              </p>
            </div>
          </motion.div>

          {/* Card 3: 365 Days Activity Heatmap Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" as const, bounce: 0 }}
            className="rounded-2xl bg-white dark:bg-[#141414] p-3 shadow-md shadow-black/[0.03] border border-neutral-200/80 dark:border-white/[0.08] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Custom High-Fidelity Vector Illustration Container (Matching Image 1 Card 3) */}
            <div className="w-full rounded-xl bg-[#fafafa] dark:bg-neutral-900 h-[220px] sm:h-[240px] flex items-center justify-center p-4 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
              <svg viewBox="0 0 300 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendar Grid Frame */}
                <g transform="translate(30, 25)">
                  {/* Spiral rings on top */}
                  <circle cx="20" cy="0" r="4" fill="none" stroke="#111" strokeWidth="2" />
                  <circle cx="50" cy="0" r="4" fill="none" stroke="#111" strokeWidth="2" />
                  <circle cx="80" cy="0" r="4" fill="none" stroke="#111" strokeWidth="2" />
                  <circle cx="110" cy="0" r="4" fill="none" stroke="#111" strokeWidth="2" />
                  <circle cx="140" cy="0" r="4" fill="none" stroke="#111" strokeWidth="2" />

                  {/* Main Grid Frame */}
                  <rect y="8" width="160" height="135" rx="6" fill="white" stroke="#111" strokeWidth="1.8" />

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="42" x2="160" y2="42" stroke="#111" strokeWidth="1.2" />
                  <line x1="0" y1="76" x2="160" y2="76" stroke="#111" strokeWidth="1.2" />
                  <line x1="0" y1="110" x2="160" y2="110" stroke="#111" strokeWidth="1.2" />

                  {/* Vertical grid lines */}
                  <line x1="40" y1="8" x2="40" y2="143" stroke="#111" strokeWidth="1.2" />
                  <line x1="80" y1="8" x2="80" y2="143" stroke="#111" strokeWidth="1.2" />
                  <line x1="120" y1="8" x2="120" y2="143" stroke="#111" strokeWidth="1.2" />

                  {/* Cross marks on completed days */}
                  <path d="M8 16 L32 34 M32 16 L8 34" stroke="#111" strokeWidth="1.5" />
                  <path d="M48 50 L72 68 M72 50 L48 68" stroke="#111" strokeWidth="1.5" />
                  <path d="M88 84 L112 102 M112 84 L88 102" stroke="#111" strokeWidth="1.5" />
                  <path d="M8 84 L32 102 M32 84 L8 102" stroke="#111" strokeWidth="1.5" />

                  {/* Blue sticky note on calendar */}
                  <rect x="10" y="50" width="22" height="22" rx="3" fill="#2563eb" stroke="#111" strokeWidth="1.2" />
                  <path d="M14 61 L18 66 L28 54" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* Person Sitting Next to Calendar */}
                <g transform="translate(185, 75)">
                  {/* Person with blue pants leaning */}
                  <circle cx="45" cy="20" r="10" fill="white" stroke="#111" strokeWidth="1.6" />
                  <path d="M40 30 C30 45, 20 60, 10 75" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  {/* Blue Pants */}
                  <path d="M10 75 C15 50, 45 45, 55 75 Z" fill="#2563eb" stroke="#111" strokeWidth="1.8" />
                  {/* Leg extended */}
                  <path d="M10 75 L-15 88" stroke="#2563eb" strokeWidth="12" strokeLinecap="round" />
                  <path d="M10 75 L-15 88" stroke="#111" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            {/* Bottom Content */}
            <div className="px-4 py-3.5">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                365
              </h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isKo ? "연간 일일 학습 기록 히트맵" : "days of activity heatmap"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
