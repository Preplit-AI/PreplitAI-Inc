import { ArrowUp, FilePlus2, ImagePlus, Mic, Paperclip, Square } from "lucide-react";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModelSelector } from "./ModelSelector";

interface ChatInputProps {
  modelId: string;
  onModelChange: (value: string) => void;
  isGenerating: boolean;
  onSubmit: (value: string) => void;
  onStop: () => void;
  placeholder?: string;
}

export function ChatInput({
  modelId,
  onModelChange,
  isGenerating,
  onSubmit,
  onStop,
  placeholder = "Ask me anything...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isGenerating) return;
    onSubmit(trimmed);
    setValue("");
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setValue("");
      textareaRef.current?.focus();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl px-4 pb-5">
      <div className="rounded-[28px] border border-gray-200 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-shadow focus-within:shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
        <div className="px-2 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            aria-label="Chat prompt"
            className="max-h-[220px] min-h-[56px] w-full resize-none bg-transparent px-2 py-3 text-[15px] leading-7 text-black outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Attach file">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Upload image">
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Upload PDF">
              <FilePlus2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Voice input">
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <ModelSelector value={modelId} onChange={onModelChange} />
            <Button
              type={isGenerating ? "button" : "submit"}
              onClick={isGenerating ? onStop : undefined}
              disabled={!isGenerating && value.trim().length === 0}
              className={cn(
                "h-10 w-10 rounded-full bg-[#B01232] p-0 text-white shadow-sm shadow-[#B01232]/25 hover:bg-[#930f2a] disabled:bg-gray-200 disabled:text-gray-400",
                isGenerating && "bg-black hover:bg-gray-800",
              )}
              aria-label={isGenerating ? "Stop generation" : "Send message"}
            >
              {isGenerating ? <Square className="h-4 w-4 fill-current" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">Preplit AI can make mistakes. Check important information.</p>
    </form>
  );
}
