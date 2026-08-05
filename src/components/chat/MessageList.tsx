import { useEffect, useMemo, useRef } from "react";
import type { ChatMessage } from "@/features/chat/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
}

export function MessageList({ messages, isGenerating }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isGenerating]);

  const rendered = useMemo(() => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={
          message.role === "user"
            ? "flex justify-end"
            : "flex justify-start"
        }
      >
        <div
          className={
            message.role === "user"
              ? "w-full max-w-[820px] rounded-3xl bg-[#B01232] px-4 py-3 text-[14px] leading-6 text-white shadow-sm"
              : "w-full max-w-[820px] rounded-3xl bg-white px-4 py-3 text-[14px] leading-6 text-black shadow-sm ring-1 ring-gray-200/60"
          }
          aria-label={message.role === "user" ? "User message" : "Assistant message"}
        >
          {message.status === "streaming" && message.role === "assistant" && (message.content || "").trim().length === 0 ? (
            <TypingIndicator />
          ) : (
            <MarkdownRenderer content={message.content || ""} />
          )}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-[#ebebeb] dark:border-white/[0.06] flex flex-wrap gap-1.5 items-center text-[11px] text-[#888] dark:text-[#666]">
              <span className="font-semibold text-[#aaa]">Sources:</span>
              {message.citations.map((c, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-white/[0.05] border border-[#e5e5e5] dark:border-white/[0.08] text-[#555] dark:text-[#aaa]">
                  📄 {c.file_name || 'Document'} {c.page_number ? `(p. ${c.page_number})` : ''}
                </span>
              ))}
            </div>
          )}
          {message.status === "error" && message.error ? (
            <div className="mt-2 text-[12px] text-red-700">{message.error}</div>
          ) : null}
        </div>
      </div>
    ));
  }, [messages]);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">{rendered}</div>
      <div ref={bottomRef} />
    </div>
  );
}
