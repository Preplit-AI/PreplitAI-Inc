import React from "react";
import { Search, Flame, Bell, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkspaceTopHeaderProps {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export const WorkspaceTopHeader: React.FC<WorkspaceTopHeaderProps> = ({
  onOpenSearch,
  onToggleSidebar,
  onOpenSettings,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isKo = language === "ko";

  const userInitial = user?.email?.[0]?.toUpperCase() || "A";

  return (
    <header className="h-16 bg-white dark:bg-[#0e0e0e] border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Left: Mobile Toggle & Brand/Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="/" className="flex items-center gap-2 lg:hidden">
          <img src="/logo.png" alt="PreplitAI Logo" className="h-7 w-auto" />
        </a>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-auto">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-white/10 text-xs text-neutral-400 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-neutral-400" />
            <span className="font-normal text-neutral-500 dark:text-neutral-400">
              {isKo ? "강의 자료, 퀴즈, 노트 검색..." : "Search anything in your course..."}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-md">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Tools: Streak, Bell, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* Streak Pill in Maroon */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#550000]/5 dark:bg-[#550000]/20 border border-[#550000]/20 text-[#550000] dark:text-[#fca5a5] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-[#550000] text-[#550000] dark:fill-[#fca5a5] dark:text-[#fca5a5]" />
          <span>14 Day Streak</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#550000] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#0e0e0e]">
            3
          </span>
        </button>

        {/* User Avatar */}
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-[#550000] text-white font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-neutral-700 shadow-xs hover:ring-2 hover:ring-rose-200 transition-all"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
};
