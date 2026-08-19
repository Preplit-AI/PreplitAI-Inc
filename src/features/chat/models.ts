import type { ChatModel } from "./types";

export const chatModels: ChatModel[] = [
  {
    id: "preplitai-auto",
    name: "Preplit AI Auto",
    provider: "Preplit AI",
    description: "Best model automatically selected for tutoring and study workflows.",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description: "Strong general reasoning and coding support.",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Balanced writing, analysis, and study assistance.",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Multimodal-ready model for future files, images, and PDFs.",
  },
  {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    description: "Fast conversational reasoning for broad questions.",
  },
  {
    id: "kimi",
    name: "Kimi",
    provider: "Moonshot",
    description: "Long-context model placeholder for large notes and documents.",
  },
];

export const defaultModelId = chatModels[0].id;
