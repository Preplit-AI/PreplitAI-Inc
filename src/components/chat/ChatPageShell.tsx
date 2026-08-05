import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";
import { useChatController } from "@/features/chat/useChatController";
import { ModelSelector } from "./ModelSelector";
import { Button } from "@/components/ui/button";

interface ChatPageShellProps {
  title?: string;
  subtitle?: string;
}

export function ChatPageShell({
  title = "PreplitAI",
  subtitle = "Your AI Tutor for Smarter Learning.",
}: ChatPageShellProps) {
  const controller = useChatController();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const headerModel = useMemo(() => {
    return (
      <div className="hidden lg:flex items-center gap-3">
        <ModelSelector value={controller.modelId} onChange={controller.setModelId} />
      </div>
    );
  }, [controller.modelId, controller.setModelId]);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA]">
      <div className="flex h-[100dvh]">
        <div className="hidden md:block">
          <AnimatePresence>
            {isSidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <ChatSidebar onNewChat={() => controller.startNewSession()} />
                  <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute -right-3 top-5 rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01232]/30"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-[0px]" />
            )}
          </AnimatePresence>
        </div>
        <main className="flex flex-1 flex-col min-h-0">
          <header className="z-10 flex items-center justify-end border-b border-gray-200/60 bg-[#FAFAFA]/80 backdrop-blur">
            <div className="px-4 py-3">{headerModel}</div>
          </header>

          {controller.hasMessages ? (
            <div className="flex flex-col flex-1">
              <MessageList messages={controller.messages} isGenerating={controller.isGenerating} />
              <div className="border-t border-gray-200/60 bg-[#FAFAFA]">
                <ChatInput
                  modelId={controller.modelId}
                  onModelChange={controller.setModelId}
                  isGenerating={controller.isGenerating}
                  onSubmit={(content) => controller.submitPrompt(content)}
                  onStop={controller.stopGeneration}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <EmptyState
                onSuggestionClick={(prompt) => controller.submitPrompt(prompt)}
              />
              <div className="border-t border-gray-200/60 bg-[#FAFAFA]">
                <ChatInput
                  modelId={controller.modelId}
                  onModelChange={controller.setModelId}
                  isGenerating={controller.isGenerating}
                  onSubmit={(content) => controller.submitPrompt(content)}
                  onStop={controller.stopGeneration}
                  placeholder="Ask me anything..."
                />
              </div>
            </div>
          )}

          {controller.error ? (
            <div className="px-4 pb-6">
              <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-sm">
                <div className="font-semibold">Something went wrong</div>
                <div className="text-red-700/90">{controller.error}</div>
                <div className="mt-3 flex gap-2">
                  <Button onClick={controller.retryLastPrompt} className="bg-[#B01232] hover:bg-[#930f2a] text-white">
                    Regenerate
                  </Button>
                  <Button variant="outline" onClick={controller.startNewSession}>
                    Start new chat
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </main>

      </div>
    </div>
  );
}
