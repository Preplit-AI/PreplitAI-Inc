import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  Target,
  BookOpen,
  MoreVertical,
  HelpCircle,
  Upload,
  MessageSquare,
  Radio,
  Layers,
  Box,
  Calendar as CalendarIcon,
  Circle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkspaceDashboardProps {
  onToolSelect: (tool: string) => void;
  onUploadClick: () => void;
  onOpenSearch: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  onToolSelect,
  onUploadClick,
  onOpenSearch,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isKo = language === "ko";

  const userName = (user as any)?.user_metadata?.full_name || (user as any)?.name || user?.email?.split("@")[0] || "Ahsan";

  // Focus Timer state (Pomodoro 25:00)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusActive && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev - 1);
      }, 1000);
    } else if (focusSeconds === 0) {
      setIsFocusActive(false);
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusSeconds]);

  const toggleFocus = () => {
    if (focusSeconds === 0) setFocusSeconds(25 * 60);
    setIsFocusActive(!isFocusActive);
  };

  const resetFocus = () => {
    setIsFocusActive(false);
    setFocusSeconds(25 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Interactive Checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: isKo ? "12강 강의 슬라이드 복습" : "Review Lecture 12", done: true },
    { id: 2, text: isKo ? "이진 탐색 트리 연습 문제" : "Practice Trees", done: true },
    { id: 3, text: isKo ? "그래프 알고리즘 퀴즈 풀기" : "Quiz: Graph Algorithms", done: false },
    { id: 4, text: isKo ? "자료구조 플래시카드 (20분)" : "Flashcards (20 min)", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Recent files
  const recentItems = [
    {
      id: "1",
      title: "Lecture 12 - Trees & Graphs",
      type: "PDF",
      size: "12.4 MB",
      time: isKo ? "방금 전 열람" : "Opened just now",
      badgeColor: "bg-red-50 text-[#550000] border-red-200",
      action: () => onToolSelect("chat"),
    },
    {
      id: "2",
      title: "DSA_Handwritten_Notes",
      type: "PDF",
      size: "8.7 MB",
      time: isKo ? "1시간 전 열람" : "Opened 1h ago",
      badgeColor: "bg-red-50 text-[#550000] border-red-200",
      action: () => onToolSelect("notes"),
    },
    {
      id: "3",
      title: "Past_Paper_2023",
      type: "PDF",
      size: "2.1 MB",
      time: isKo ? "어제 열람" : "Opened yesterday",
      badgeColor: "bg-red-50 text-[#550000] border-red-200",
      action: () => onToolSelect("expected"),
    },
    {
      id: "4",
      title: "Quizzes - Sorting Algorithms",
      type: "QUIZ",
      size: "12 Questions",
      time: isKo ? "어제 열람" : "Opened yesterday",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
      action: () => onToolSelect("quizzes"),
    },
  ];

  // Quick access tools
  const quickTools = [
    {
      id: "upload",
      title: isKo ? "자료 업로드" : "Upload Material",
      desc: "PDF, PPT, Notes...",
      icon: Upload,
      color: "bg-rose-50 text-[#550000]",
      action: onUploadClick,
    },
    {
      id: "chat",
      title: isKo ? "AI 챗" : "AI Chat",
      desc: isKo ? "노트 기반 질문" : "Ask anything",
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600",
      action: () => onToolSelect("chat"),
    },
    {
      id: "lecture-buddy",
      title: isKo ? "강의 녹음" : "Lecture Buddy",
      desc: isKo ? "스마트 요약 노트" : "Smart notes",
      icon: Radio,
      color: "bg-blue-50 text-blue-600",
      action: () => onToolSelect("lecture-buddy"),
    },
    {
      id: "expected",
      title: isKo ? "시험 예측" : "Exam Predictions",
      desc: isKo ? "기출 족보 AI" : "Past papers AI",
      icon: Target,
      color: "bg-amber-50 text-amber-600",
      action: () => onToolSelect("expected"),
    },
    {
      id: "quizzes",
      title: isKo ? "스마트 퀴즈" : "Quizzes",
      desc: isKo ? "실전 문제 풀이" : "Practice now",
      icon: HelpCircle,
      color: "bg-orange-50 text-orange-600",
      action: () => onToolSelect("quizzes"),
    },
    {
      id: "flashcards",
      title: isKo ? "플래시카드" : "Flashcards",
      desc: isKo ? "간격 반복 학습" : "Spaced repetition",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600",
      action: () => onToolSelect("flashcards"),
    },
    {
      id: "explore3d",
      title: isKo ? "3D 인터랙티브" : "3D Learning",
      desc: isKo ? "개념 입체 시각화" : "Visualize concepts",
      icon: Box,
      color: "bg-indigo-50 text-indigo-600",
      action: () => onToolSelect("explore3d"),
    },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-white h-full">
      {/* Main Left/Center Content - Compact & Clean to fit on 1 screen */}
      <div className="flex-1 p-4 sm:p-5 lg:p-6 space-y-4 max-w-5xl flex flex-col justify-between overflow-y-auto">
        {/* Top Header / Greeting Bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {isKo ? `좋은 아침입니다, ${userName}` : `Good morning, ${userName}`}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
              {isKo ? "오늘도 목표를 향해 학업을 이어가 볼까요?" : "Let's continue your learning journey."}
            </p>
          </div>

          {/* Add New Action Button in Maroon */}
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#550000] hover:bg-[#3d0000] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isKo ? "새 자료 추가" : "Add New"}</span>
          </button>
        </div>

        {/* 1. Active Course Banner Card */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left Course Info */}
            <div className="lg:col-span-6 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#550000] dark:text-[#f87171] block mb-0.5">
                  ACTIVE COURSE
                </span>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                  Data Structures & Algorithms
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Spring 2024 · Computer Science
                </p>
              </div>

              {/* Course Progress */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-600 dark:text-neutral-300 text-[11px]">Course Progress</span>
                  <span className="text-neutral-900 dark:text-white font-bold text-[11.5px]">78%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#550000] rounded-full w-[78%]" />
                </div>
              </div>
            </div>

            {/* Right 2x2 Metric Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-neutral-800 pt-3 lg:pt-0 lg:pl-5">
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-neutral-800/30">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-400 leading-none">Study Time</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">28h 34m</p>
                  <p className="text-[9.5px] text-neutral-400 leading-none">This Course</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-neutral-800/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-400 leading-none">Topics Mastered</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">18 / 24</p>
                  <p className="text-[9.5px] text-emerald-600 font-semibold leading-none">+3 this week</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-neutral-800/30">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-[#550000] flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-400 leading-none">Practice Score</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">87%</p>
                  <p className="text-[9.5px] text-emerald-600 font-semibold leading-none">▲ 10%</p>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-neutral-800/30">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-400 leading-none">Flashcards</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">243</p>
                  <p className="text-[9.5px] text-emerald-600 font-semibold leading-none">▲ 32</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Recently Opened Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {isKo ? "최근 열어본 자료" : "Recently Opened"}
            </h3>
            <button
              onClick={onUploadClick}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {isKo ? "전체 보기" : "View All"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={item.action}
                className="group relative bg-white dark:bg-[#121212] rounded-xl border border-slate-200/80 dark:border-white/10 p-3 hover:shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                    >
                      {item.type}
                    </span>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-400 hover:text-neutral-700 p-0.5"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-[12.5px] font-bold text-neutral-900 dark:text-white group-hover:text-[#550000] dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-1">{item.size}</p>
                </div>
                <p className="text-[9.5px] text-neutral-400 mt-2.5 border-t border-slate-100 dark:border-neutral-800/80 pt-1.5">
                  {item.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Quick Access Tool Row */}
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2.5">
            {isKo ? "빠른 실행 도구" : "Quick Access"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {quickTools.map((tool) => {
              const IconComp = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-white/10 hover:shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center mb-1.5 shadow-2xs`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[11.5px] font-bold text-neutral-800 dark:text-white truncate w-full group-hover:text-[#550000]">
                    {tool.title}
                  </span>
                  <span className="text-[9px] text-neutral-400 truncate w-full mt-0.5">
                    {tool.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar Column - Clean, Compact & Scaled in Maroon */}
      <div className="w-full lg:w-[280px] xl:w-[300px] bg-white dark:bg-[#0e0e0e] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 p-4 sm:p-5 space-y-4 shrink-0 flex flex-col justify-between overflow-y-auto">
        {/* Widget 1: Focus Session (Maroon Timer Gauge) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-white dark:bg-[#121212] text-center shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Focus Session
            </h4>
            <button
              onClick={resetFocus}
              className="text-neutral-400 hover:text-neutral-700 p-0.5"
              title="Reset Timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Circular Progress Gauge */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100 dark:stroke-neutral-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-[#550000]"
                strokeWidth="6"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * focusSeconds) / (25 * 60)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {formatTime(focusSeconds)}
              </span>
              <span className="text-[9.5px] text-neutral-400 font-medium">Deep Focus</span>
            </div>
          </div>

          {/* Button in Maroon */}
          <button
            onClick={toggleFocus}
            className={`w-full py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2.5 ${
              isFocusActive
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-[#550000] hover:bg-[#3d0000] text-white"
            }`}
          >
            {isFocusActive ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Start Focus Session</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-neutral-400 mt-1.5 font-normal">
            Work with focus. Achieve more.
          </p>
        </div>

        {/* Widget 2: Today's Plan */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Today's Plan
          </h4>
          <div className="space-y-1.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
              >
                {task.done ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#550000] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 shrink-0" />
                )}
                <span
                  className={`text-[11.5px] truncate ${
                    task.done
                      ? "line-through text-neutral-400"
                      : "text-neutral-800 dark:text-neutral-200 font-medium"
                  }`}
                >
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Upcoming */}
        <div className="space-y-2 border-t border-slate-100 dark:border-neutral-800/80 pt-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Upcoming
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white text-[11.5px] leading-tight">DSA Quiz</p>
                <p className="text-[10px] text-neutral-400">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white text-[11.5px] leading-tight">Lecture 13</p>
                <p className="text-[10px] text-neutral-400">Tomorrow, 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white text-[11.5px] leading-tight">Office Hours</p>
                <p className="text-[10px] text-neutral-400">Fri, 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 4: Motivational Quote Card in Maroon tint */}
        <div className="rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3">
          <span className="text-xl font-serif text-[#550000] dark:text-rose-400 leading-none block mb-0.5">“</span>
          <p className="text-[11.5px] font-bold text-neutral-900 dark:text-white leading-snug">
            Consistent today, exceptional tomorrow.
          </p>
          <p className="text-[10.5px] text-[#550000] dark:text-rose-400 font-semibold mt-1.5">
            Keep going.
          </p>
        </div>
      </div>
    </div>
  );
};
