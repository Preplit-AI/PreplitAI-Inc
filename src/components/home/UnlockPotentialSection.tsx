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
          {isKo ? "전 세계 대학생들의 신뢰와 선택" : "Loved by students worldwide"}
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
            ? "수천 명의 학생들과 함께 Preplit AI로 더 스마트하게 배우고, 체계적으로 정리하여 모든 시험에서 앞서가세요."
            : "Join thousands of students using Preplit AI to learn smarter, stay organized, and ace every exam."}
        </motion.p>

        {/* 3 Column Stats with Top/Bottom Dividers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
          className="w-full max-w-2xl border-y border-black/[0.06] dark:border-white/[0.08] py-8 sm:py-9 grid grid-cols-3 gap-4 text-center my-2"
        >
          {/* Stat 1 */}
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-white tracking-tight">
              850+
            </p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mt-1">
              {isKo ? "가입 학생 수" : "STUDENTS JOINED"}
            </p>
          </div>

          {/* Stat 2 */}
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-white tracking-tight">
              2,345+
            </p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mt-1">
              {isKo ? "업로드된 강좌" : "COURSES UPLOADED"}
            </p>
          </div>

          {/* Stat 3 */}
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-white tracking-tight">
              98%
            </p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mt-1">
              {isKo ? "학습 효율 향상 보고" : "STUDY BOOST REPORTED"}
            </p>
          </div>
        </motion.div>

        {/* Dual Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" as const, bounce: 0 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 mt-9"
        >
          <a
            href="/preplitai-chat"
            className="h-11 px-8 rounded-full bg-neutral-950 text-white font-semibold text-sm hover:bg-neutral-800 shadow-sm transition-all active:scale-95 flex items-center justify-center"
          >
            {isKo ? "무료로 학습 시작하기" : "Start studying free"}
          </a>

          <a
            href="#features"
            className="h-11 px-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center"
          >
            {isKo ? "Preplit 둘러보기" : "Explore Preplit"}
          </a>
        </motion.div>

        {/* Bottom Trust Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center mt-12 text-xs sm:text-[13px] font-medium text-neutral-700 dark:text-neutral-300"
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
