import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ShieldCheck, Sparkles, GraduationCap } from "lucide-react";

export const UnlockPotentialSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section className="py-6 sm:py-10 px-4 bg-white dark:bg-[#0a0a0a] text-center flex flex-col items-center justify-center border-t border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* 5 Gold Stars Rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 text-amber-400 mb-2"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </motion.div>

        {/* Rating Subtitle */}
        <p className="text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400 mb-5 italic">
          {isKo ? "차세대 학습자를 위해 설계된 AI 플랫폼" : "Designed for Next-Generation Learners"}
        </p>

        {/* Display Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.12] mb-4 max-w-2xl"
        >
          {isKo ? (
            <>
              학습 방식을 혁신할
              <br />
              준비가 되셨나요?
            </>
          ) : (
            <>
              Ready to transform
              <br />
              the way you study?
            </>
          )}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
          className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mb-10 font-normal leading-relaxed"
        >
          {isKo
            ? "학생들이 더 스마트하게 배우고, 체계적으로 정리하여 모든 시험에서 앞서갈 수 있도록 설계되었습니다."
            : "Designed for students to learn smarter, stay organized, and ace every exam."}
        </motion.p>

        {/* 3 Column Downloadable App Platform Launch Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
          className="w-full max-w-2xl border-y border-black/[0.06] dark:border-white/[0.08] py-7 sm:py-8 grid grid-cols-3 gap-4 text-center my-2"
        >
          {/* 1. Windows App */}
          <div className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 flex items-center justify-center text-neutral-900 dark:text-white shadow-2xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.801" />
              </svg>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                Windows
              </p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                {isKo ? "출시 예정" : "Coming Soon"}
              </span>
            </div>
          </div>

          {/* 2. Google Play Store */}
          <div className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 flex items-center justify-center text-neutral-900 dark:text-white shadow-2xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.609 1.814L13.792 12 3.61 22.186c-.361-.284-.61-.744-.61-1.306V3.12c0-.562.249-1.022.61-1.306zm11.242 9.127l2.433-2.433-11.45-6.61 9.017 9.043zm0 2.118l-9.017 9.043 11.45-6.61-2.433-2.433zm1.189-1.059l3.41 1.968c.954.551.954 1.448 0 2l-3.41 1.968-2.128-2.128 2.128-2.128z" />
              </svg>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                Google Play
              </p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                {isKo ? "출시 예정" : "Coming Soon"}
              </span>
            </div>
          </div>

          {/* 3. Apple App Store */}
          <div className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 flex items-center justify-center text-neutral-900 dark:text-white shadow-2xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.56.65-1.05 1.71-.92 2.74 1 .08 2.02-.49 2.63-1.24z" />
              </svg>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                App Store
              </p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                {isKo ? "출시 예정" : "Coming Soon"}
              </span>
            </div>
          </div>
        </motion.div>



        {/* Bottom Trust Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center mt-7 text-xs sm:text-[13px] font-medium text-neutral-700 dark:text-neutral-300"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-800 dark:text-white" />
            <span>Secure & Private</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
