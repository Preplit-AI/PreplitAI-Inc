import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, BookOpen, FileText, Radio, Target, ArrowRight, Sparkles } from "lucide-react";

export const WorkspaceTeaserSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Grounded RAG Chat",
      desc: "Ask questions and get instant answers backed directly by your course PDFs and lecture notes with page citations.",
      accent: "from-blue-500/10 to-indigo-500/10 border-blue-500/20"
    },
    {
      icon: HelpCircle,
      title: "AI Quiz Generator",
      desc: "Auto-generate practice exams with multiple choice, fill-in-the-blank, and short answers matching your syllabus.",
      accent: "from-purple-500/10 to-pink-500/10 border-purple-500/20"
    },
    {
      icon: BookOpen,
      title: "Smart Flashcards",
      desc: "Master key terms with active recall flashcard decks extracted directly from your study documents.",
      accent: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
    },
    {
      icon: FileText,
      title: "Dense Summaries",
      desc: "Convert lengthy textbooks and slide decks into crisp, structured bullet-point executive summaries.",
      accent: "from-amber-500/10 to-orange-500/10 border-amber-500/20"
    },
    {
      icon: Radio,
      title: "Audio Podcast Generator",
      desc: "Listen on the go with two-speaker AI conversational podcast episodes discussing your course topics.",
      accent: "from-rose-500/10 to-red-500/10 border-rose-500/20"
    },
    {
      icon: Target,
      title: "Predicted Exam Questions",
      desc: "Generate target exam items with step-by-step model answers and probability ratings.",
      accent: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20"
    }
  ];

  return (
    <section id="workspace-teaser" className="py-24 px-6 bg-[#faf9f7] dark:bg-[#111]">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-semibold uppercase tracking-wider text-[#630000] dark:text-red-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Study Companion Playground</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-4 leading-tight">
            Explore PreplitAI Workspace
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Upload your course materials and unlock an all-in-one AI learning suite tailored directly to your syllabus.
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-4 text-black dark:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-black dark:bg-white text-white dark:text-black flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to start learning with PreplitAI?
            </h3>
            <p className="text-sm opacity-80">
              Open the interactive AI Chat Playground now — no setup required.
            </p>
          </div>
          <Button
            asChild
            className="px-7 py-3 h-12 text-[14px] font-semibold bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all shrink-0"
          >
            <a href="/preplitai-chat" className="flex items-center gap-2">
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
};
