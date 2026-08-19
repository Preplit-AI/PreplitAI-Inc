import type { GenerateChatParams, GenerateChatResult } from "./types";

const API_NOT_CONNECTED_MESSAGE =
  "Preplit AI Chat is ready for backend integration. Connect an OpenAI-compatible streaming endpoint to enable assistant responses.";

export async function generateAssistantMessage({ signal }: GenerateChatParams): Promise<GenerateChatResult> {
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, 450);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Generation aborted", "AbortError"));
      },
      { once: true },
    );
  });

  throw new Error(API_NOT_CONNECTED_MESSAGE);
}
