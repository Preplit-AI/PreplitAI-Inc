import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Laptop, Palette, BookOpen, FileText, BarChart2, CheckCircle2, Flame } from "lucide-react";

export const LiveFocusSessions = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const sessions = [
    {
      initials: "SD",
      bg: "bg-purple-600",
      name: "Samiran De",
      icon: Laptop,
      iconColor: "text-purple-500",
      activity: "React Frontend Coding",
      duration: "45 mins",
      streak: "14 days",
      time: "2m ago",
    },
    {
      initials: "AR",
      bg: "bg-sky-500",
      name: "Alex Rivera",
      icon: Palette,
      iconColor: "text-sky-500",
      activity: "UI/UX Figma Design",
      duration: "1h 30m",
      streak: "8 days",
      time: "12m ago",
    },
    {
      initials: "YT",
      bg: "bg-amber-600",
      name: "Yuki Tanaka",
      icon: BookOpen,
      iconColor: "text-amber-500",
      activity: "Japanese Kanji Practice",
      duration: "25 mins",
      streak: "32 days",
      time: "25m ago",
    },
    {
      initials: "SJ",
      bg: "bg-emerald-600",
      name: "Sarah Jenkins",
      icon: FileText,
      iconColor: "text-emerald-500",
      activity: "Technical Docs Writing",
      duration: "2h 10m",
      streak: "5 days",
      time: "1h ago",
    },
    {
      initials: "MC",
      bg: "bg-rose-500",
      name: "Michael Chen",
      icon: BarChart2,
      iconColor: "text-rose-500",
      activity: "Financial Modeling",
      duration: "50 mins",
      streak: "21 days",
      time: "3h ago",
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 bg-[#fbfbfb] dark:bg-[#0a0a0a] border-t border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-10 sm:mb-12 gap-3">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#111111] dark:text-white max-w-xl leading-tight"
          >
            {isKo ? "사용자 실시간 집중 세션 차트" : "Live Focus Sessions Charts with users"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-lg"
          >
            {isKo
              ? "학습자들의 딥워크, 연속 기록 스트릭, 과제 완료 현황을 실시간으로 업데이트합니다."
              : "Real-time updates of deep work, consistency streaks, and task completions from Users."}
          </motion.p>
        </div>

        {/* Live Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" as const, bounce: 0 }}
          className="w-full overflow-x-auto rounded-3xl border border-neutral-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141414] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-2 sm:p-5"
        >
          <table className="w-full text-left text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                <th className="py-3.5 pl-4 pr-3">User</th>
                <th className="py-3.5 px-3">Activity</th>
                <th className="py-3.5 px-3">Duration</th>
                <th className="py-3.5 px-3">Streak</th>
                <th className="py-3.5 px-3">Time</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {sessions.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User */}
                    <td className="py-4 pl-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${item.bg} text-white flex items-center justify-center text-[10.5px] font-bold shrink-0 shadow-xs`}
                        >
                          {item.initials}
                        </div>
                        <span className="font-semibold text-neutral-900 dark:text-white text-[13.5px]">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Activity */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium text-[13px]">
                        <IconComponent className={`w-4 h-4 ${item.iconColor} shrink-0`} />
                        <span>{item.activity}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-3 font-semibold text-neutral-800 dark:text-neutral-200 text-[13px]">
                      {item.duration}
                    </td>

                    {/* Streak */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200 text-[13px]">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        <span>{item.streak}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-3 text-neutral-400 text-[12.5px] font-normal">
                      {item.time}
                    </td>

                    {/* Status */}
                    <td className="py-4 pl-3 pr-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Completed</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};
