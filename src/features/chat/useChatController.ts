import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { generateAssistantMessage } from "./chat-api";
import { defaultModelId } from "./models";
import type { ChatAttachment, ChatMessage } from "./types";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const now = () => new Date().toISOString();

export function useChatController() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [modelId, setModelId] = useState(defaultModelId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const hasMessages = messages.length > 0;

  const sessionTitle = useMemo(() => {
    const firstUserMessage = messages.find((message) => message.role === "user");
    if (!firstUserMessage) return "New learning session";
    return firstUserMessage.content.length > 36
      ? `${firstUserMessage.content.slice(0, 36)}...`
      : firstUserMessage.content;
  }, [messages]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
    setMessages((current) =>
      current.map((message) =>
        message.status === "streaming" || message.status === "sending"
          ? { ...message, status: "aborted" }
          : message,
      ),
    );
  }, []);

  const submitPrompt = useCallback(
    async (content: string, attachments: ChatAttachment[] = []) => {
      const trimmed = content.trim();
      if (!trimmed || isGenerating) return;

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: now(),
        status: "complete",
        attachments,
      };

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: "",
        createdAt: now(),
        status: "streaming",
      };

      const nextMessages = [...messages, userMessage, assistantMessage];
      setMessages(nextMessages);
      setError(null);
      setIsGenerating(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const result = await generateAssistantMessage({
          messages: nextMessages,
          modelId,
          signal: abortController.signal,
          onToken: (token) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: `${message.content}${token}` }
                  : message,
              ),
            );
          },
        });

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: result.content, status: "complete" }
              : message,
          ),
        );
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id ? { ...message, status: "aborted" } : message,
            ),
          );
          return;
        }

        const message = caughtError instanceof Error ? caughtError.message : "Unable to generate a response.";
        setError(message);
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessage.id
              ? { ...item, content: message, status: "error", error: message }
              : item,
          ),
        );
        toast.error(message);
      } finally {
        abortControllerRef.current = null;
        setIsGenerating(false);
      }
    },
    [isGenerating, messages, modelId],
  );

  const retryLastPrompt = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) return;

    setMessages((current) => {
      let lastUserIndex = -1;
      for (let i = current.length - 1; i >= 0; i--) {
        if (current[i].id === lastUserMessage.id) {
          lastUserIndex = i;
          break;
        }
      }
      return lastUserIndex !== -1 ? current.slice(0, lastUserIndex) : current;
    });

    window.setTimeout(() => {
      void submitPrompt(lastUserMessage.content, lastUserMessage.attachments ?? []);
    }, 0);
  }, [messages, submitPrompt]);

  const startNewSession = useCallback(() => {
    stopGeneration();
    setMessages([]);
    setError(null);
  }, [stopGeneration]);

  return {
    messages,
    modelId,
    setModelId,
    isGenerating,
    error,
    hasMessages,
    sessionTitle,
    submitPrompt,
    stopGeneration,
    retryLastPrompt,
    startNewSession,
  };
}
