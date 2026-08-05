import { motion } from "framer-motion";
import { BookOpenCheck, FileText, Lightbulb, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

const suggestions = [
  { icon: BookOpenCheck, title: "Explain a topic", prompt: "Explain photosynthesis like I am preparing for an exam." },
  { icon: FileText, title: "Summarize notes", prompt: "Summarize my lecture notes into key points and flashcards." },
  { icon: Lightbulb, title: "Quiz me", prompt: "Create a 10-question quiz from this chapter." },
  { icon: Sparkles, title: "Study plan", prompt: "Build a 7-day study plan for my final exam." },
];

interface EmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-8 text-center"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="mb-5">
          <Logo compact={false} />
        </div>
        <h1 className="text-[44px] font-semibold tracking-[-0.06em] text-black leading-none">
          PreplitAI
        </h1>
        <p className="mt-3 text-[14px] font-medium text-gray-500">
          Your AI Tutor for Smarter Learning.
        </p>
      </div>

      <div className="mt-8 grid w-full gap-2 sm:grid-cols-1">
        <button
          type="button"
          onClick={() => onSuggestionClick("Summarize this topic and give me a study plan.")}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01232]/30"
        >
          <span className="text-sm font-semibold text-black">Try a study prompt</span>
          <div className="mt-1 text-sm text-gray-500">Get a concise summary + step-by-step plan.</div>
        </button>
      </div>
    </motion.section>
  );
}
