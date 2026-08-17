import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Radio,
  FileText,
  BookOpen,
  HelpCircle,
  Target,
  Box,
  BarChart2,
  Calendar,
  Folder,
  Settings,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export type WorkspaceTabId =
  | "workspace"
  | "chat"
  | "lecture-buddy"
  | "notes"
  | "flashcards"
  | "quizzes"
  | "expected"
  | "explore3d"
  | "analytics"
  | "calendar"
  | "resources"
  | "settings";

interface WorkspaceSidebarProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  onOpenManagePlan: () => void;
  onOpenSettings: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenManagePlan,
  onOpenSettings,
}) => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const navItems: Array<{ id: WorkspaceTabId; label: string; icon: React.ElementType }> = [
    { id: "workspace", label: isKo ? "워크스페이스" : "Workspace", icon: LayoutDashboard },
    { id: "chat", label: isKo ? "AI 챗" : "AI Chat", icon: MessageSquare },
    { id: "lecture-buddy", label: isKo ? "강의 녹음" : "Lecture Buddy", icon: Radio },
    { id: "notes", label: isKo ? "노트" : "Notes", icon: FileText },
    { id: "flashcards", label: isKo ? "플래시카드" : "Flashcards", icon: BookOpen },
    { id: "quizzes", label: isKo ? "퀴즈" : "Quizzes", icon: HelpCircle },
    { id: "expected", label: isKo ? "시험 예측" : "Exam Predictions", icon: Target },
    { id: "explore3d", label: isKo ? "3D 인터랙티브" : "3D Learning", icon: Box },
    { id: "analytics", label: isKo ? "성취도 분석" : "Analytics", icon: BarChart2 },
    { id: "calendar", label: isKo ? "캘린더" : "Calendar", icon: Calendar },
    { id: "resources", label: isKo ? "학업 자료함" : "Resources", icon: Folder },
    { id: "settings", label: isKo ? "설정" : "Settings", icon: Settings },
  ];

  const handleItemClick = (id: WorkspaceTabId) => {
    if (id === "settings") {
      onOpenSettings();
    } else {
      onTabChange(id);
    }
  };

  return (
    <aside className="w-60 bg-white dark:bg-[#0e0e0e] border-r border-slate-200/80 dark:border-white/10 flex flex-col justify-between h-full shrink-0 select-none">
      {/* Navigation List */}
      <div className="p-3.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-all ${
                isActive
                  ? "bg-[#550000]/10 dark:bg-[#550000]/25 text-[#550000] dark:text-[#fca5a5] shadow-2xs font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#550000] dark:text-[#fca5a5]" : "text-neutral-400"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Storage & Pro Plan Cards */}
      <div className="p-3 space-y-2.5 border-t border-slate-100 dark:border-neutral-800/80">
        {/* Storage Used Card */}
        <div className="bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-xl space-y-1.5 border border-slate-100 dark:border-neutral-800">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Storage Used</span>
            <span className="font-bold text-neutral-800 dark:text-white text-[10.5px]">2.4 GB / 10 GB</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-[24%]" />
          </div>
        </div>

        {/* Pro Plan Card */}
        <div className="space-y-1.5">
          <div className="text-xs">
            <p className="font-bold text-neutral-900 dark:text-white text-[11.5px]">Pro Plan</p>
            <p className="text-[10px] text-neutral-400">Renews on Aug 24, 2026</p>
          </div>
          <button
            onClick={onOpenManagePlan}
            className="w-full py-1.5 rounded-xl bg-[#550000] hover:bg-[#3d0000] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            Manage Plan
          </button>
        </div>
      </div>
    </aside>
  );
};
