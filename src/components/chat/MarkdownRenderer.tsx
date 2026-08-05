import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

const parseInline = (text: string) => {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.92em] text-[#B01232]">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = content.split(/```/g);

  return (
    <div className="prose prose-sm max-w-none prose-p:my-3 prose-ul:my-3 prose-li:my-1 prose-strong:text-black">
      {blocks.map((block, index) => {
        if (index % 2 === 1) {
          const [languageLine, ...codeLines] = block.split("\n");
          const language = languageLine.trim() || "text";
          const code = codeLines.join("\n").trim();
          return <CodeBlock key={index} code={code} language={language} />;
        }

        return block
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line, lineIndex) => {
            const trimmed = line.trim();

            if (trimmed.startsWith("### ")) {
              return (
                <h3 key={`${index}-${lineIndex}`} className="mb-2 mt-5 text-base font-semibold text-black">
                  {parseInline(trimmed.slice(4))}
                </h3>
              );
            }

            if (trimmed.startsWith("## ")) {
              return (
                <h2 key={`${index}-${lineIndex}`} className="mb-2 mt-6 text-lg font-semibold text-black">
                  {parseInline(trimmed.slice(3))}
                </h2>
              );
            }

            if (trimmed.startsWith("# ")) {
              return (
                <h1 key={`${index}-${lineIndex}`} className="mb-3 mt-6 text-xl font-semibold text-black">
                  {parseInline(trimmed.slice(2))}
                </h1>
              );
            }

            if (trimmed.startsWith("- ")) {
              return (
                <div key={`${index}-${lineIndex}`} className="my-1 flex gap-2 text-[15px] leading-7 text-gray-800">
                  <span className="mt-0.5 text-gray-400">•</span>
                  <span>{parseInline(trimmed.slice(2))}</span>
                </div>
              );
            }

            return (
              <p key={`${index}-${lineIndex}`} className="text-[15px] leading-7 text-gray-800">
                {parseInline(trimmed)}
              </p>
            );
          });
      })}
    </div>
  );
}
