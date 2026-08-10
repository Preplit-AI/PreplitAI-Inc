import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export type WorkspaceNavTab = "spaces" | "chat" | "practice" | "analytics" | "explore3d";

interface WorkspaceTopNavProps {
  activeTab: WorkspaceNavTab;
  onTabChange: (tab: WorkspaceNavTab) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

const TABS: { id: WorkspaceNavTab; label: string }[] = [
  { id: "spaces",    label: "Study Spaces" },
  { id: "chat",      label: "Chat" },
  { id: "practice",  label: "Practice" },
  { id: "analytics", label: "Analytics" },
  { id: "explore3d", label: "Explore 3D" },
];

export function WorkspaceTopNav({ activeTab, onTabChange, onOpenSearch, onOpenSettings }: WorkspaceTopNavProps) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AI";

  return (
    <header className="ws-topnav">
      <a href="/" className="flex items-center gap-2 shrink-0 group mr-6 hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="PreplitAI Logo" className="h-8 w-auto" />
        <span className="font-semibold text-[15px] text-[#111] tracking-tight">PreplitAI</span>
      </a>
      <nav className="hidden sm:flex items-center gap-0 flex-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`ws-nav-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3 ml-auto">
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-[#f0ede8] rounded-full px-3 py-1.5 w-52 border border-[#e0dbd4]">
            <Search className="w-3.5 h-3.5 text-[#888] shrink-0" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your course..."
              className="flex-1 text-[12.5px] bg-transparent focus:outline-none text-[#111] placeholder:text-[#aaa]"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
              <X className="w-3 h-3 text-[#999]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-[#f0ede8] hover:bg-[#e8e3dc] rounded-full px-3 py-1.5 w-44 border border-[#e0dbd4] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#888] shrink-0" />
            <span className="text-[12.5px] text-[#aaa]">Search your course...</span>
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-[#8B0000] flex items-center justify-center text-white text-[12px] font-bold shrink-0 hover:bg-[#6d0000] transition-colors"
          title="Account"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
