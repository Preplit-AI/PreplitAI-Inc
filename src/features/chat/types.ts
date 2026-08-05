export type ChatRole = "user" | "assistant" | "system";

export type ChatMessageStatus = "sending" | "streaming" | "complete" | "error" | "aborted";

export interface ChatAttachment {
  id: string;
  name: string;
  type: "file" | "image" | "pdf";
  size?: number;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  status: ChatMessageStatus;
  attachments?: ChatAttachment[];
  error?: string;
  citations?: Array<{ id?: string; file_name?: string; page_number?: number }>;
}

export interface ChatModel {
  id: string;
  name: string;
  provider: "OpenAI" | "Anthropic" | "Google" | "xAI" | "Moonshot" | "PreplitAI";
  description: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface GenerateChatParams {
  messages: ChatMessage[];
  modelId: string;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
}

export interface GenerateChatResult {
  content: string;
}

export interface ChatError {
  message: string;
  code?: string;
}
