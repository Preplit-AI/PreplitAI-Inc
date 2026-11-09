import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, streamChat } from "@/lib/api";
import type { ChatMessage, Conversation, ConversationSummary } from "@/lib/types";
import { chatKeys } from "./queries";

/** The question being answered right now. Nothing here is saved until the answer completes. */
export type Pending = { question: string; answer: string; tool: string | null };

const INTERRUPTED = "답변이 중간에 끊겼어요. 저장된 건 없습니다.";

type Options = {
  conversationId: string | null;
  courseId: string | null;
  /** The lecture the student has open, so "this lecture" means something. */
  lectureId?: string | null;
  /** The question is handed back whenever it was not answered, so it never has to be retyped. */
  onUnanswered: (question: string) => void;
  onSaved: (conversation: ConversationSummary) => void;
};

export function useChat({ conversationId, courseId, lectureId = null, onUnanswered, onSaved }: Options) {
  const client = useQueryClient();
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const stop = useCallback(() => controller.current?.abort(), []);
  useEffect(() => stop, [stop]);

  const send = useCallback(
    async (question: string) => {
      if (controller.current) return;
      const abort = new AbortController();
      controller.current = abort;
      setError(null);
      setPending({ question, answer: "", tool: null });

      let saved: { conversation: ConversationSummary; messages: ChatMessage[] } | null = null;
      let failure: string | null = null;
      try {
        await streamChat(
          { question, conversationId, courseId, lectureId },
          (event) => {
            if (event.event === "status") setPending((p) => (p ? { ...p, tool: event.data.tool } : p));
            else if (event.event === "delta") setPending((p) => (p ? { ...p, answer: p.answer + event.data.text, tool: null } : p));
            else if (event.event === "reset") setPending((p) => (p ? { ...p, answer: "" } : p));
            else if (event.event === "done") saved = event.data;
            else if (event.event === "error") failure = event.data.message;
          },
          abort.signal,
        );
        if (!saved && !failure) failure = INTERRUPTED;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          failure = err instanceof ApiError ? err.message : INTERRUPTED;
        }
      } finally {
        controller.current = null;
      }

      if (saved) {
        const { conversation, messages } = saved as { conversation: ConversationSummary; messages: ChatMessage[] };
        client.setQueryData<Conversation>(chatKeys.conversation(conversation.id), (old) => ({
          ...conversation,
          messages: [...(old?.messages ?? []), ...messages],
        }));
        client.invalidateQueries({ queryKey: chatKeys.conversations });
        setPending(null);
        onSaved(conversation);
      } else {
        setPending(null);
        setError(failure);
        onUnanswered(question);
      }
    },
    [client, conversationId, courseId, lectureId, onSaved, onUnanswered],
  );

  return { pending, error, setError, send, stop };
}
