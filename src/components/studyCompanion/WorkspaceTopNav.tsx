import React, { useState } from "react";
import { Search, X, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export type WorkspaceNavTab = "spaces" | "chat" | "practice" | "analytics" | "explore3d" | "lecture-buddy";

interface WorkspaceTopNavProps {
  activeTab: WorkspaceNavTab;
  onTabChange: (tab: WorkspaceNavTab) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar?: () => void;
}

export function WorkspaceTopNav({ activeTab, onTabChange, onOpenSearch, onOpenSettings, onToggleMobileSidebar }: WorkspaceTopNavProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isKo = language === "ko";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { id: WorkspaceNavTab; label: string }[] = [
    { id: "spaces",    label: isKo ? "스터디 공간" : "Study Spaces" },
    { id: "chat",      label: isKo ? "AI 채팅" : "Chat" },
    { id: "practice",  label: isKo ? "연습 문제" : "Practice" },
    { id: "lecture-buddy", label: isKo ? "강의 녹음" : "Lecture Buddy" },
    { id: "analytics", label: isKo ? "학습 분석" : "Analytics" },
    { id: "explore3d", label: isKo ? "3D 탐색" : "Explore 3D" },
  ];

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AI";

  return (
    <header className="ws-topnav px-3 sm:px-6">
      {onToggleMobileSidebar && (
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-[#555] hover:bg-[#f0ede8] transition-colors mr-2 shrink-0"
          aria-label={isKo ? "메뉴 열기" : "Open menu"}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <a href="/" className="flex items-center gap-2 shrink-0 group mr-2 sm:mr-6 hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="PreplitAI Logo" className="h-7 sm:h-8 w-auto" />
        <span className="font-semibold text-[14px] sm:text-[15px] text-[#111] tracking-tight">PreplitAI</span>
      </a>

      <nav className="hidden sm:flex items-center gap-0 flex-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`ws-nav-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-[#f0ede8] rounded-full px-3 py-1.5 w-40 sm:w-52 border border-[#e0dbd4]">
            <Search className="w-3.5 h-3.5 text-[#888] shrink-0" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKo ? "강의 자료 검색..." : "Search..."}
              className="flex-1 text-[12px] sm:text-[12.5px] bg-transparent focus:outline-none text-[#111] placeholder:text-[#aaa]"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
              <X className="w-3 h-3 text-[#999]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-[#f0ede8] hover:bg-[#e8e3dc] rounded-full p-2 sm:px-3 sm:py-1.5 sm:w-44 border border-[#e0dbd4] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#888] shrink-0" />
            <span className="hidden sm:inline text-[12.5px] text-[#aaa]">{isKo ? "강의 자료 검색..." : "Search your course..."}</span>
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8B0000] flex items-center justify-center text-white text-[11px] sm:text-[12px] font-bold shrink-0 hover:bg-[#6d0000] transition-colors"
          title={isKo ? "계정 설정" : "Account"}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
