import React from "react";
import { Plus, TrendingUp, MessageSquare, Zap, Sparkles, BookOpen, HelpCircle, Globe, Radio, BarChart2 } from "lucide-react";

interface Space { id: string; name: string; }
interface WorkspaceHomeProps {
  onCreateSpace: () => void;
  onSelectSpace: (spaceId: string) => void;
  onUploadContent: () => void;
  spaces: Space[];
  activeSpaceId: string;
  onToolSelect: (tool: string) => void;
}

const TOOLS = [
  { id: "chat",       icon: MessageSquare, label: "AI Study Chat",           desc: "Ask anything, grounded in your notes",    flagship: false },
  { id: "explore3d",  icon: Zap,           label: "3D Interactive Learning", desc: "Turn any diagram into a 3D model",        flagship: true  },
  { id: "expected",   icon: Sparkles,      label: "Exam Predictor",          desc: "Predicted questions from your uploads",   flagship: false },
  { id: "flashcards", icon: BookOpen,      label: "Flashcards",              desc: "Spaced repetition, tuned to you",         flagship: false },
  { id: "quizzes",    icon: HelpCircle,    label: "Smart Quiz",              desc: "Unlimited quizzes, graded conceptually", flagship: false },
  { id: "chat",       icon: Globe,         label: "Korean Assistant",        desc: "Bilingual, tuned to your professor",      flagship: false },
  { id: "podcast",    icon: Radio,         label: "Podcast Mode",            desc: "Study on your commute",                   flagship: false },
  { id: "analytics",  icon: BarChart2,     label: "Analytics",               desc: "See exactly what to review next",         flagship: false },
];

export function WorkspaceHome({ onCreateSpace, spaces, activeSpaceId, onToolSelect }: WorkspaceHomeProps) {
  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f4f1] px-5 md:px-8 pt-5 pb-4 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11.5px] text-[#888]">{greeting}</p>
          <h1 className="text-[22px] font-bold text-[#111] tracking-tight leading-tight">
            {activeSpace ? activeSpace.name : "Your Workspace"}
          </h1>
          <p className="text-[12px] text-[#888] mt-0.5">Midterm in 6 days · Upload notes to get started</p>
        </div>
        <div className="bg-[#8B0000] text-white rounded-xl px-4 py-2.5 text-right shrink-0 hidden sm:block">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Exam Readiness</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[20px] font-bold">78%</span>
            <TrendingUp className="w-3.5 h-3.5 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 shrink-0">
        {[
          { icon: "🔥", title: "12-day streak",    sub: "Keep it up!" },
          { icon: "🃏", title: "24 cards due",      sub: "Ready today" },
          { icon: "📝", title: "3 exams analyzed", sub: "Exam predictor fed" },
        ].map((stat, i) => (
          <div key={i} className="ws-card flex items-center gap-2.5 px-3 py-2.5">
            <span className="text-xl">{stat.icon}</span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[#111] truncate">{stat.title}</p>
              <p className="text-[11px] text-[#888] truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <p className="text-[11.5px] font-bold text-[#888] uppercase tracking-wider mb-2 shrink-0">Your tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-h-0 auto-rows-fr">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <button key={i} onClick={() => onToolSelect(tool.id)}
                className="ws-card text-left px-3 py-3 hover:shadow-md hover:border-[#d0cbc4] transition-all group relative flex flex-col justify-between min-h-0">
                {tool.flagship && (
                  <span className="absolute top-2 right-2 bg-[#8B0000] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Flagship</span>
                )}
                <div className="w-8 h-8 rounded-xl border border-[#e8e5e0] bg-[#f7f4f0] flex items-center justify-center mb-2 group-hover:border-[#8B0000]/30 transition-colors shrink-0">
                  <Icon className="w-4 h-4 text-[#8B0000]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold text-[#111] leading-snug">{tool.label}</p>
                  <p className="text-[11px] text-[#888] mt-0.5 leading-snug line-clamp-2">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {spaces.length === 0 && (
        <div className="border border-dashed border-[#d5d0c8] rounded-2xl p-5 text-center bg-white/60 shrink-0">
          <p className="text-[13px] font-semibold text-[#666]">No study spaces yet</p>
          <p className="text-[12px] text-[#999] mt-0.5 mb-3">Create a space for each course</p>
          <button onClick={onCreateSpace} className="ws-btn-primary text-[12.5px] px-4 py-1.5 inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create first space
          </button>
        </div>
      )}
    </div>
  );
}
