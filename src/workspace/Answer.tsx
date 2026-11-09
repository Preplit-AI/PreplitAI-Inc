import { Children, memo, useMemo, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Marked } from "@/app/ui";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";
import type { Citation } from "@/lib/types";
import { CITE_HREF, citationNumbers, prepareAnswer } from "./citations";

/*
 * A source mark: a small gold disc with the source's number, as on the landing
 * page's chat. White with a gold ring while its source is open.
 */
export function SourceMark({
  number,
  active = false,
  onClick,
  label,
}: {
  number: number;
  active?: boolean;
  onClick?: () => void;
  label: string;
}) {
  const shape = cn(
    "mx-0.5 inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 align-[0.1em] font-sans text-[0.7rem] font-semibold leading-none tabular-nums transition-colors duration-150",
    active ? "bg-white text-ink ring-2 ring-gold" : "bg-gold text-ink",
  );
  if (!onClick) {
    return <span className={shape} role="img" aria-label={label}>{number}</span>;
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={active} className={cn(shape, "hover:ring-2 hover:ring-gold/60")}>
      {number}
    </button>
  );
}

/** Applies the [불명확] mark to the plain text inside a block, leaving its other children alone. */
function withMarks(children: ReactNode) {
  return Children.map(children, (child) => (typeof child === "string" ? <Marked text={child} /> : child));
}

type Props = {
  content: string;
  citations?: Citation[];
  streaming?: boolean;
  activeLabel?: string | null;
  onOpenCitation?: (citation: Citation) => void;
};

/** Juno's answer, set for the dark panel. */
export const Answer = memo(function Answer({ content, citations = [], streaming = false, activeLabel, onOpenCitation }: Props) {
  const numbers = useMemo(() => citationNumbers(content), [content]);
  const en = useLang().lang === "en";

  const components = useMemo<Components>(
    () => ({
      p: ({ children }) => <p className="mt-3 first:mt-0">{withMarks(children)}</p>,
      li: ({ children }) => <li className="mt-1.5">{withMarks(children)}</li>,
      ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5 marker:text-night-muted">{children}</ul>,
      ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5 marker:text-night-muted">{children}</ol>,
      h1: ({ children }) => <h3 className="mt-5 text-base font-semibold text-white first:mt-0">{children}</h3>,
      h2: ({ children }) => <h3 className="mt-5 text-base font-semibold text-white first:mt-0">{children}</h3>,
      h3: ({ children }) => <h4 className="mt-4 font-semibold text-white first:mt-0">{children}</h4>,
      h4: ({ children }) => <h4 className="mt-4 font-semibold text-white first:mt-0">{children}</h4>,
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      blockquote: ({ children }) => <blockquote className="mt-3 border-l-2 border-night-line pl-4 text-night-text/80">{children}</blockquote>,
      code: ({ children, className }) =>
        className ? (
          <code className="font-mono text-[0.8125rem]">{children}</code>
        ) : (
          <code className="rounded bg-night-3 px-1 py-0.5 font-mono text-[0.85em] text-white">{children}</code>
        ),
      pre: ({ children }) => <pre className="mt-3 overflow-x-auto rounded-xl border border-night-line bg-night-2 p-4 leading-relaxed">{children}</pre>,
      table: ({ children }) => (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      th: ({ children }) => <th className="border-b border-night-line px-3 py-2 text-left font-semibold text-white">{children}</th>,
      td: ({ children }) => <td className="border-b border-night-line/70 px-3 py-2 align-top">{withMarks(children)}</td>,
      // Only citations become links. Nothing in an answer can send a student off
      // to an address the model wrote, whatever a transcript told it to say.
      a: ({ href, children }) => {
        if (!href?.startsWith(CITE_HREF)) return <>{children}</>;
        const label = href.slice(CITE_HREF.length);
        const number = numbers.get(label);
        if (!number) return null;
        const citation = citations.find((c) => c.label === label);
        return (
          <SourceMark
            number={number}
            active={activeLabel === label}
            label={en ? `Source ${number}` : `출처 ${number}`}
            onClick={citation && onOpenCitation ? () => onOpenCitation(citation) : undefined}
          />
        );
      },
    }),
    [numbers, citations, activeLabel, onOpenCitation, en],
  );

  return (
    <div className="text-sm leading-[1.7] text-night-text">
      <Markdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={["img"]}
        unwrapDisallowed
        components={components}
      >
        {prepareAnswer(content, streaming)}
      </Markdown>
    </div>
  );
});
