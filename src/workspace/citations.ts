/*
 * The model marks its sources as [S3]. On screen they are numbered from 1 in
 * reading order, which stays stable as an answer streams in, since new text
 * only ever adds to the end.
 */

const CITATION = /\[(S\d+)\]/g;
/** Told to mark sources, a model sometimes marks the lack of one. The label under the answer already says so. */
const NO_SOURCE_MARK = /[[(（【]\s*출처\s*(없음|없어요)\s*[\])）】]/g;

/** Models write citations as [S1, S2], [ S2 ] or 【S2】. One form is simpler to show. */
function normalize(text: string) {
  return text.replace(/[[【]\s*((?:S\s*\d+\s*[,，]?\s*)+)[\]】]/gi, (_, list: string) =>
    (list.match(/\d+/g) ?? []).map((n) => `[S${n}]`).join(""),
  );
}

/** Each source label in the text, mapped to its number on screen. */
export function citationNumbers(text: string): Map<string, number> {
  const numbers = new Map<string, number>();
  for (const match of normalize(text).matchAll(CITATION)) {
    if (!numbers.has(match[1])) numbers.set(match[1], numbers.size + 1);
  }
  return numbers;
}

export const CITE_HREF = "#cite-";

/**
 * Turns an answer into markdown with its citations as links, which the renderer
 * draws as comb cells. While streaming, a citation still arriving at the very
 * end ("[S", "[S1") is held back so it does not flash up as raw text.
 */
export function prepareAnswer(text: string, streaming = false): string {
  const held = streaming ? text.replace(/[[【]\s*(S\s*\d*(\s*[,，]\s*S?\s*\d*)*\s*)?$/i, "") : text;
  return normalize(held)
    .replace(NO_SOURCE_MARK, "")
    .replace(CITATION, (_, label: string) => `[${label}](${CITE_HREF}${label})`);
}
