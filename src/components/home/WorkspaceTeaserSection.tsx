import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Flame, Clock, Zap, Trophy, Globe } from "lucide-react";

export const WorkspaceTeaserSection = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  // Interactive Countdown Timer State
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [secs, setSecs] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(hours * 3600 + mins * 60 + secs);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(hours * 3600 + mins * 60 + secs);
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <section id="features" className="py-20 sm:py-28 px-4 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-14 sm:mb-16 gap-3">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" as const, bounce: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#111111] dark:text-white leading-tight"
          >
            {isKo ? "학업과 집중을 위한 모든 도구" : "Everything for your"}
            <br />
            {isKo ? "" : "work and focus"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal max-w-xl"
          >
            {isKo ? "대학생의 몰입 학습을 위해 정교하게 설계된 통합 툴킷." : "A beautiful, integrated toolkit designed for deep work."}
          </motion.p>
        </div>

        {/* Row 1: 2 Cards (14 Days Consistency & Timer Clock) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Card 1: 14 Days Consistency (Lavender / Soft Purple Tint #f2eeff) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="lg:col-span-4 bg-[#f2eeff] dark:bg-[#1a1429] rounded-[28px] p-8 sm:p-9 border border-[#e4d9ff]/70 dark:border-purple-900/30 flex flex-col justify-between"
          >
            {/* Visual 3D Flame Icon */}
            <div className="h-44 sm:h-48 flex items-center justify-center relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#9333ea]/20 to-[#c084fc]/30 flex items-center justify-center relative">
                <motion.div
                  animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9333ea] to-[#a855f7] flex items-center justify-center shadow-lg shadow-purple-500/30 text-white"
                >
                  <Flame className="w-9 h-9 fill-white text-white" />
                </motion.div>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="mt-6">
              <div className="text-[1.85rem] font-bold text-[#7e22ce] dark:text-[#c084fc] leading-tight mb-1">
                14 days
              </div>
              <div className="text-[1.85rem] font-bold text-neutral-950 dark:text-white leading-tight mb-3">
                consistency
              </div>
              <p className="text-[13.5px] text-neutral-600 dark:text-purple-200/70 leading-relaxed font-normal">
                {isKo ? "매일 완성하는 학습 블록으로 꾸준한 연속 학습 기록을 쌓으세요." : "Build daily momentum and see your focus streak grow with every completed session."}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Timer Clock Interactive Countdown (Ice Blue Tint #eff7ff) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="lg:col-span-8 bg-[#eff7ff] dark:bg-[#0c1a29] rounded-[28px] p-8 sm:p-10 border border-[#cfe6ff]/70 dark:border-sky-900/30 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* Left Texts */}
            <div className="flex-1 max-w-sm">
              <span className="text-sm font-bold text-[#0284c7] dark:text-[#38bdf8] tracking-wide">
                {isKo ? "타이머 클락" : "Timer Clock"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight mt-1 mb-3">
                {isKo ? "나만의 카운트다운 설정." : "Build your own countdown."}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-sky-200/70 leading-relaxed font-normal">
                {isKo ? "시간, 분, 초를 선택하고 집중 학습 타이머를 시작하세요." : "Choose hours, minutes, and seconds, then start the timer."}
              </p>
            </div>

            {/* Right Wheel Picker Widget */}
            <div className="flex flex-col items-center bg-white/90 dark:bg-[#132238] rounded-3xl p-6 border border-sky-100 dark:border-sky-900/40 shadow-sm w-full max-w-[320px]">
              {/* Wheel Columns */}
              <div className="flex items-center justify-center gap-3 w-full mb-5">
                {/* Hours Column */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">HOURS</span>
                  <div className="bg-[#f8fafc] dark:bg-[#0c1827] rounded-xl px-3 py-2 text-center border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block">00</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white block">
                      {String(hours).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-slate-400 block">01</span>
                  </div>
                </div>

                <span className="text-slate-400 font-bold mt-5">:</span>

                {/* Mins Column */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">MIN</span>
                  <div className="bg-[#f8fafc] dark:bg-[#0c1827] rounded-xl px-3 py-2 text-center border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block">00</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white block">
                      {String(mins).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-slate-400 block">01</span>
                  </div>
                </div>

                <span className="text-slate-400 font-bold mt-5">:</span>

                {/* Secs Column */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">SEC</span>
                  <div className="bg-[#f8fafc] dark:bg-[#0c1827] rounded-xl px-3 py-2 text-center border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block">09</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white block">
                      {String(secs).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-slate-400 block">11</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full mb-3">
                <button
                  onClick={handleStart}
                  className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all ${
                    isRunning
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm"
                  }`}
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  onClick={handleReset}
                  className="py-2 px-4 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Readout */}
              <div className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                {isRunning ? "Focusing: " : "Ready: "}
                <span className="font-mono text-slate-900 dark:text-white font-bold">{formatTimer(timeLeft)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 2: 3 Cards (Heatmap, Activity Feed, Global Community) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Heatmap of your consistency (Warm Peach #fff2df) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" as const, bounce: 0 }}
            className="bg-[#fff2df] dark:bg-[#1f160e] rounded-[28px] p-7 sm:p-8 border border-[#f5d9b8]/70 dark:border-amber-900/30 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#ea580c] dark:text-[#fb923c] tracking-tight mb-2">
                {isKo ? "학습 지속성 히트맵" : "Heatmap of your consistency"}
              </h3>
              <p className="text-[13.5px] text-[#7c2d12]/80 dark:text-[#fdba74]/80 leading-relaxed mb-6 font-normal">
                {isKo ? "깃허브 스타일 기여도 잔디 그래프로 1년간의 학습 몰입도를 한눈에 시각화하세요." : "Visualize your dedication over the entire year with a GitHub-style activity contribution map."}
              </p>
            </div>

            {/* Interactive Heatmap Widget */}
            <div className="bg-white/90 dark:bg-[#2b1f14] p-4 rounded-2xl border border-orange-200/50 dark:border-amber-900/40 overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                <div className="flex flex-col justify-between text-[9px] text-neutral-400 font-semibold pr-1">
                  <span>M</span>
                  <span>W</span>
                  <span>F</span>
                </div>
                <div className="flex-1 flex gap-1.5 justify-between">
                  {Array.from({ length: 10 }).map((_, col) => (
                    <div key={col} className="flex flex-col gap-1.5">
                      {Array.from({ length: 5 }).map((_, row) => {
                        const intensities = [
                          "bg-[#ffedd5] dark:bg-amber-950",
                          "bg-[#fdba74] dark:bg-amber-700",
                          "bg-[#fb923c] dark:bg-amber-600",
                          "bg-[#ea580c] dark:bg-orange-600",
                          "bg-[#c2410c] dark:bg-orange-500",
                        ];
                        const val = (col * 2 + row * 3) % 5;
                        return (
                          <div
                            key={row}
                            className={`w-3.5 h-3.5 rounded-[4px] ${intensities[val]} transition-transform hover:scale-125 cursor-pointer`}
                            title={`Activity: ${val * 1.5 + 1}h studied`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-3 pt-2 border-t border-orange-100 dark:border-amber-950">
                <span>Less</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-[2px] bg-[#ffedd5]"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-[#fb923c]"></span>
                  <span className="w-2 h-2 rounded-[2px] bg-[#ea580c]"></span>
                </div>
                <span>More</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Real-time Activity Feed (Mint Green #eeffe8) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, bounce: 0 }}
            className="bg-[#eeffe8] dark:bg-[#0d1f14] rounded-[28px] p-7 sm:p-8 border border-[#cfe9c8]/80 dark:border-emerald-900/30 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#16a34a] dark:text-[#4ade80] tracking-tight mb-2">
                {isKo ? "실시간 학습 활동 피드" : "Real-time activity feed"}
              </h3>
              <p className="text-[13.5px] text-[#14532d]/80 dark:text-[#86efac]/80 leading-relaxed mb-6 font-normal">
                {isKo ? "완료된 세션, 스트릭 달성, 리더보드 순위 상승을 실시간 알림으로 확인하세요." : "Get instant feedback on session completions, streak milestones, and leaderboard progress."}
              </p>
            </div>

            {/* Notification Stack Widget */}
            <div className="space-y-2">
              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">Timer finished</p>
                    <span className="text-[10px] text-neutral-400">1h ago</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 truncate">Pomodoro cycle complete</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">New personal best</p>
                    <span className="text-[10px] text-neutral-400">32m ago</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 truncate">Longest focus block today</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#14291c] p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">Leaderboard climb</p>
                    <span className="text-[10px] text-neutral-400">16m ago</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 truncate">You moved up to #3</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Global Focus Community (Soft Purple #f5f3ff) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" as const, bounce: 0 }}
            className="bg-[#f5f3ff] dark:bg-[#181126] rounded-[28px] p-7 sm:p-8 border border-[#ddd0ff]/70 dark:border-purple-900/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#7e22ce] dark:text-[#c084fc] tracking-tight mb-2">
                {isKo ? "글로벌 학업 네트워크" : "Global focus community"}
              </h3>
              <p className="text-[13.5px] text-[#581c87]/80 dark:text-[#d8b4fe]/80 leading-relaxed mb-6 font-normal">
                {isKo ? "전 세계 대학생 및 개발자들과 함께 실시간으로 학습 세션을 추적하세요." : "Join students and developers worldwide tracking focus sessions in real time."}
              </p>
            </div>

            {/* Dotted Globe Graphic (Matching Image exactly) */}
            <div className="h-40 flex items-center justify-center relative">
              <div className="w-36 h-36 rounded-full bg-gradient-to-b from-[#e9d5ff] to-white dark:from-[#3b1f6a] dark:to-[#181126] border border-purple-200 dark:border-purple-800/50 flex items-center justify-center relative shadow-inner overflow-hidden">
                {/* Dotted lines & pings */}
                <div className="absolute inset-0 border border-purple-300/40 rounded-full scale-75"></div>
                <div className="absolute inset-0 border-t border-b border-purple-300/40 my-auto h-12"></div>
                <span className="absolute top-8 left-10 w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
                <span className="absolute top-8 left-10 w-2.5 h-2.5 rounded-full bg-purple-600 shadow-md"></span>
                <span className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-indigo-600 shadow-md"></span>
                <span className="absolute top-14 right-8 w-2 h-2 rounded-full bg-purple-500 shadow-md"></span>
                <Globe className="w-12 h-12 text-purple-600/30 dark:text-purple-400/20" strokeWidth={1} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
