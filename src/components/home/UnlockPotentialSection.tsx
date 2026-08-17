import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ArrowUpRight } from "lucide-react";

export const UnlockPotentialSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section className="py-20 sm:py-28 px-4 bg-white dark:bg-[#0a0a0a] text-center flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* 5 Gold Stars Rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1 text-amber-400 mb-2"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </motion.div>

        {/* Rating Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-6 italic">
          {isKo ? "전 세계 620+명의 빌더 및 학습자들의 선택" : "Loved by 620+ builders worldwide"}
        </p>

        {/* Display Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4"
        >
          {isKo ? (
            <>
              잠재력을 최대로
              <br />
              발휘할 준비가 되셨나요?
            </>
          ) : (
            <>
              Are Ready to unlock
              <br />
              your full potential?
            </>
          )}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
          className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-lg mb-8 font-normal leading-relaxed"
        >
          {isKo
            ? "수천 명의 개발자 및 학생들과 함께 일일 기록 스트릭을 쌓고, 리더보드를 정복하세요."
            : "Join thousands of developers, and students building daily tracking streaks, and conquering the leaderboard."}
        </motion.p>

        {/* 3 Column Stats with Top/Bottom Dividers (Matching Image 2 exactly) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
          className="my-3 flex flex-col sm:flex-row items-center gap-6 sm:gap-14 border-y border-neutral-200/80 dark:border-neutral-800 py-6 w-full max-w-xl justify-center"
        >
          {/* Stat 1 */}
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white font-mono">
              620+
            </p>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase mt-1">
              {isKo ? "가입 사용자" : "Registered Users"}
            </p>
          </div>

          {/* Stat 2 */}
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white font-mono">
              1,463+
            </p>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase mt-1">
              {isKo ? "완료된 세션" : "Sessions Logged"}
            </p>
          </div>

          {/* Stat 3 */}
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white font-mono">
              365 Days
            </p>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase mt-1">
              {isKo ? "지속성 히트맵" : "Consistency Heatmap"}
            </p>
          </div>
        </motion.div>

        {/* Dual Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" as const, bounce: 0 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 mt-8"
        >
          <Button
            asChild
            className="h-11 px-8 rounded-full bg-neutral-950 text-white font-semibold text-sm hover:bg-neutral-800 shadow-md transition-all active:scale-95"
          >
            <a href="/preplitai-chat">
              {isKo ? "무료로 시작하기" : "Get started free"}
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 px-7 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95"
          >
            <a href="/pricing">
              {isKo ? "리더보드 보기" : "View leaderboard"}
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
