import { BookOpen, CircleHelp, FileText, GraduationCap, Library, MessageSquarePlus, Settings, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const navItems = [
  { label: "New Chat", icon: MessageSquarePlus, active: true },
  { label: "My Sessions", icon: BookOpen },
  { label: "Study Tools", icon: GraduationCap },
  { label: "Resources", icon: Library },
  { label: "Profile", icon: UserRound },
];

const recentSessions = ["Biology exam review", "Summarize calculus notes", "Essay outline helper"];

interface ChatSidebarProps {
  className?: string;
  onNewChat: () => void;
}

export function ChatSidebar({ className, onNewChat }: ChatSidebarProps) {
  return (
<aside className={cn("flex h-full w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white", className)}>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <nav aria-label="Chat navigation" className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.label === "New Chat" ? onNewChat : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01232]/30",
                item.active && "bg-[#B01232]/8 text-[#B01232]",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Recent</p>
            <Sparkles className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            {recentSessions.map((session) => (
              <button
                key={session}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-500 transition hover:bg-gray-100 hover:text-black"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">{session}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-3">
        <Button variant="ghost" className="h-10 w-full justify-start rounded-xl text-gray-600 hover:bg-gray-100">
          <CircleHelp className="h-4 w-4" aria-hidden="true" />
          Help & Support
        </Button>
        <Button variant="ghost" className="h-10 w-full justify-start rounded-xl text-gray-600 hover:bg-gray-100">
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </Button>
      </div>
    </aside>
  );
}
