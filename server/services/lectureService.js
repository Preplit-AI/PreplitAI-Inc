'use strict';
const { callLLM } = require('./llmService');
const { NOTES_MODEL, NOTES_PART_CHARS } = require('../config/constants');

/**
 * Transcript in, notes and review cards out, in Korean.
 *
 * The rules in the prompt are the product's rules: only what was said, nothing
 * filled in where the transcript says [불명확], and exam flags only where the
 * lecturer actually flagged something. The output is then validated strictly;
 * anything malformed fails the lecture rather than being patched with invented
 * content, and the caller saves nothing.
 *
 * A long lecture is written in parts, in order. A 50-minute class is about 14,000
 * tokens, more than a lower-tier provider plan accepts in one request, so sending
 * it whole would fail every real lecture. Working through it part by part also
 * gives a long lecture more detail rather than one thin pass over all of it.
 */

const MAX_CARDS = 10;

const SYSTEM_PROMPT = `너는 대학 강의 녹취록을 학생용 노트로 정리한다. 반드시 지킬 규칙:
1. 녹취록에 있는 내용만 쓴다. 강의에 없던 설명, 예시, 사실을 추가하지 않는다.
2. 녹취록의 [불명확] 부분은 추측해서 채우지 않는다. 그 부분에 기대는 내용이면 "[불명확]"이라고 쓴다.
3. flagged에는 교수가 시험, 중간고사, 기말고사, 퀴즈에 나온다고 하거나 "꼭 알아야 한다"고 분명히 말한 내용만 넣는다. 그런 말이 없으면 빈 배열이다. 짐작으로 넣지 않는다.
4. 모든 문장은 한국어로 쓴다. 전문 용어는 처음 나올 때 원어를 괄호에 함께 쓴다. 예: 교착 상태(deadlock).
5. 카드는 5~10장. 각 카드는 노트만 보고 답할 수 있어야 하고, 앞면은 질문 하나, 뒷면은 짧은 답이다.
6. 노트는 자세하게 쓴다. 강의를 듣지 못한 학생이 이 노트만 읽고 강의를 따라갈 수 있어야 한다. 강의 순서대로 소제목을 나누고, 각 소제목에 교수가 말한 정의, 설명, 근거, 예시, 비교, 강조한 점을 빠짐없이 쓴다. 긴 강의일수록 소제목과 내용이 많아야 한다.
7. guide는 강의를 처음부터 끝까지 따라가는 자세한 해설이다. 교수가 말한 순서대로, "교수는 먼저 ...를 설명했다", "이어서 ...라고 강조했다", "예로 ...를 들었다"처럼 교수가 무엇을 말했는지 이야기하듯 쓴다. 한 문단은 한 흐름(4~8문장)이고, 강의에 나온 정의, 설명, 예시, 질문과 답을 빠뜨리지 않는다. 50분 강의면 10문단 이상이다.
8. terms의 english에는 반드시 영어 용어를 쓴다. 강의가 영어로 진행됐으면 term과 같아도 된다.
9. JSON만 출력한다.`;

const OUTPUT_SHAPE = `{
  "title": "강의 주제를 담은 짧은 제목 (40자 이내)",
  "summary": "두 문장 요약",
  "guide": ["교수가 말한 내용을 순서대로 풀어 쓴 문단", "..."],
  "sections": [ { "heading": "소제목", "points": ["핵심 내용", "..."] } ],
  "flagged": [ { "quote": "교수가 한 말을 짧게 인용", "at": "mm:ss 또는 빈 문자열", "note": "무엇이 시험에 나오는지" } ],
  "cards": [ { "front": "질문", "back": "답" } ],
  "terms": [ { "term": "강의에 나온 핵심 용어 (강의에서 쓴 원어 그대로)", "english": "영어 용어 (반드시 채운다)", "meaning": "강의에서 설명한 뜻, 한 문장" } ]
}`;

/**
 * For a student who asked for another language: the same rules, with rule 4
 * replaced. The lecture's own terms stay, since the exam uses them.
 */
function systemPromptFor(language) {
  if (!language || language === 'Korean') return SYSTEM_PROMPT;
  return SYSTEM_PROMPT.replace(
    /4\. .*/,
    `4. 학생은 유학생이다. 모든 문장(title, summary, guide, heading, points, note, 카드, terms의 meaning)을 ${language}로 쓴다. 강의에 나온 전문 용어는 강의에서 쓴 원어 그대로 쓰고, 처음 나올 때 괄호에 ${language} 뜻을 붙인다. 예: 교착 상태 (deadlock). flagged의 quote는 교수가 한 말 그대로, 번역하지 않는다.`
  );
}

const SUMMARY_SYSTEM_PROMPT = `너는 강의 노트의 제목과 요약을 쓴다. 주어진 소제목과 내용에 있는 것만 쓴다. 한국어로 쓴다. JSON만 출력한다: { "title": "강의 주제를 담은 짧은 제목 (40자 이내)", "summary": "두 문장 요약" }`;

const str = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error('Notes output was not JSON');
  }
}

/** Keeps what is well formed and drops the rest. */
function clean(data) {
  const sections = (Array.isArray(data.sections) ? data.sections : [])
    .map((s) => ({
      heading: str(s && s.heading, 120),
      points: (Array.isArray(s && s.points) ? s.points : []).map((p) => str(p, 800)).filter(Boolean).slice(0, 20),
    }))
    .filter((s) => s.heading && s.points.length)
    .slice(0, 30);

  const flagged = (Array.isArray(data.flagged) ? data.flagged : [])
    .map((f) => ({ quote: str(f && f.quote, 300), at: str(f && f.at, 8), note: str(f && f.note, 300) }))
    .filter((f) => f.quote || f.note)
    .slice(0, 20);

  const cards = (Array.isArray(data.cards) ? data.cards : [])
    .map((c) => ({ front: str(c && c.front, 300), back: str(c && c.back, 600) }))
    .filter((c) => c.front && c.back)
    .slice(0, MAX_CARDS);

  // Key terms in the lecture's own language, at most 20. Optional: older notes have none.
  const seen = new Set();
  const terms = (Array.isArray(data.terms) ? data.terms : [])
    .map((t) => ({ term: str(t && t.term, 80), english: str(t && t.english, 80), meaning: str(t && t.meaning, 300) }))
    .filter((t) => t.term && t.meaning && !seen.has(t.term.toLowerCase()) && seen.add(t.term.toLowerCase()))
    .slice(0, 20);

  // The class told in order, paragraph by paragraph. Older notes have none.
  const guide = (Array.isArray(data.guide) ? data.guide : []).map((g) => str(g, 3000)).filter(Boolean).slice(0, 60);

  return { title: str(data.title, 120), summary: str(data.summary, 600), guide, sections, flagged, cards, terms };
}

function validate(data) {
  const notes = clean(data);
  if (notes.sections.length === 0) {
    const err = new Error('Notes had no usable sections');
    err.code = 'NOTES_INVALID';
    throw err;
  }
  return notes;
}

/** Cuts a transcript between lines, and inside a line only when one line alone is too long, as pasted text can be. */
function splitTranscript(transcript, maxChars = NOTES_PART_CHARS) {
  const pieces = [];
  for (const line of transcript.split('\n')) {
    if (line.length <= maxChars) {
      pieces.push(line);
      continue;
    }
    let rest = line;
    while (rest.length > maxChars) {
      const window = rest.slice(0, maxChars);
      const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('다 '));
      const cut = sentenceEnd > maxChars / 2 ? sentenceEnd + 1 : maxChars;
      pieces.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    if (rest) pieces.push(rest);
  }

  const parts = [];
  let current = '';
  for (const piece of pieces) {
    if (current && current.length + piece.length + 1 > maxChars) {
      parts.push(current);
      current = '';
    }
    current = current ? `${current}\n${piece}` : piece;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Cards from across the whole lecture, not just its opening. */
function pickEvenly(items, max) {
  if (items.length <= max) return items;
  const step = items.length / max;
  return Array.from({ length: max }, (_, i) => items[Math.floor(i * step)]);
}

async function generate(userPrompt, language) {
  try {
    return await callLLM({ systemPrompt: systemPromptFor(language), userPrompt, primaryModel: NOTES_MODEL, jsonMode: true, patient: true });
  } catch (err) {
    err.code = err.code || 'LLM_UNAVAILABLE';
    throw err;
  }
}

async function writePart({ part, index, total, courseName, title, language }) {
  const cardsHere = Math.min(4, Math.max(2, Math.ceil(MAX_CARDS / total)));
  const userPrompt = `과목: ${courseName}
학생이 붙인 제목: ${title || '(없음)'}

이 녹취록은 긴 강의를 나눈 ${total}부분 중 ${index + 1}번째다. 이 부분에 있는 내용만 빠짐없이 자세하게 정리하고, 앞뒤 내용을 짐작하지 않는다. title과 summary는 빈 문자열로 둔다. guide는 이 부분의 내용만 순서대로 쓴다. 이 부분의 카드는 ${cardsHere}장만 만든다.

출력 형식:
${OUTPUT_SHAPE}

녹취록 ([mm:ss]는 녹음 시작부터의 시간):
${part}`;

  // A malformed answer is usually a one-off. A part is cheap to ask for again,
  // and a whole lecture is a lot to lose over one bad reply.
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const raw = await generate(userPrompt, language);
    try {
      return clean(parseJson(raw));
    } catch (err) {
      lastError = err;
    }
  }
  lastError.code = lastError.code || 'NOTES_INVALID';
  throw lastError;
}

/** The title and summary of a long lecture, read from its finished notes. Without them the notes are still complete. */
async function titleAndSummary({ sections, courseName, title, language }) {
  const outline = sections.map((s) => `- ${s.heading}: ${s.points[0]}`).join('\n').slice(0, 6000);
  try {
    const raw = await callLLM({
      systemPrompt: language && language !== 'Korean' ? SUMMARY_SYSTEM_PROMPT.replace('한국어로 쓴다.', `${language}로 쓴다.`) : SUMMARY_SYSTEM_PROMPT,
      userPrompt: `과목: ${courseName}\n학생이 붙인 제목: ${title || '(없음)'}\n\n소제목과 내용:\n${outline}`,
      primaryModel: NOTES_MODEL,
      jsonMode: true,
      patient: true,
    });
    const data = parseJson(raw);
    return { title: str(data.title, 120), summary: str(data.summary, 600) };
  } catch (err) {
    console.warn('[notes] no title or summary for a long lecture:', err.message);
    return { title: '', summary: '' };
  }
}

/**
 * @returns {Promise<{ title: string, summary: string, guide: string[], sections: {heading:string,points:string[]}[], flagged: {quote:string,at:string,note:string}[], cards: {front:string,back:string}[] }>}
 */
async function buildNotes({ transcript, courseName, title, language = null }) {
  const parts = splitTranscript(transcript);

  if (parts.length <= 1) {
    const raw = await generate(`과목: ${courseName}
학생이 붙인 제목: ${title || '(없음)'}

출력 형식:
${OUTPUT_SHAPE}

녹취록 ([mm:ss]는 녹음 시작부터의 시간):
${transcript}`, language);
    try {
      return validate(parseJson(raw));
    } catch (err) {
      err.code = err.code || 'NOTES_INVALID';
      throw err;
    }
  }

  // In order, one at a time: a part that fails fails the lecture, so nothing is
  // saved with a hole in it, and a provider limit is waited out rather than hit harder.
  const written = [];
  for (let index = 0; index < parts.length; index += 1) {
    written.push(await writePart({ part: parts[index], index, total: parts.length, courseName, title, language }));
  }

  const sections = written.flatMap((p) => p.sections);
  if (!sections.length) {
    const err = new Error('Notes had no usable sections');
    err.code = 'NOTES_INVALID';
    throw err;
  }
  const { title: noteTitle, summary } = await titleAndSummary({ sections, courseName, title, language });
  return {
    title: noteTitle,
    summary,
    guide: written.flatMap((p) => p.guide).slice(0, 60),
    sections,
    flagged: written.flatMap((p) => p.flagged),
    cards: pickEvenly(written.flatMap((p) => p.cards), MAX_CARDS),
    terms: written.flatMap((p) => p.terms).filter((t, i, all) => all.findIndex((o) => o.term.toLowerCase() === t.term.toLowerCase()) === i).slice(0, 20),
  };
}

const TRANSLATE_PROMPT = `You translate a university lecture transcript into English.
Translate everything that was said, in order, sentence by sentence. Do not summarise, shorten, explain or add anything.
Leave out the [mm:ss] time marks. Where the transcript says [불명확], write [unclear].
Keep technical terms accurate; where the professor used a Korean term, give the English term.
Write plain paragraphs, a new paragraph where the topic moves on. Output only the translation.`;

const TRANSLATE_PART_CHARS = 20000;

/**
 * The whole transcript in English, for when the transcription service gave
 * none (the language-model fallback). A class taught in English is returned
 * as it is, without its time marks. Without a translation the notes are still
 * complete, so a failure here gives null, not a failed lecture.
 * @returns {Promise<string|null>}
 */
async function translateTranscript(transcript) {
  const plain = (transcript || '').replace(/^\[\d{2}:\d{2}(?::\d{2})?\]\s*/gm, '').trim();
  if (!plain) return null;
  const hangul = (plain.match(/[가-힣]/g) || []).length;
  if (hangul < plain.length * 0.05) return plain.replace(/\[불명확\]/g, '[unclear]');
  try {
    const parts = splitTranscript(transcript, TRANSLATE_PART_CHARS);
    const out = [];
    for (const part of parts) {
      out.push(await callLLM({ systemPrompt: TRANSLATE_PROMPT, userPrompt: part, primaryModel: NOTES_MODEL, patient: true }));
    }
    return out.join('\n\n').trim() || null;
  } catch (err) {
    console.warn('[notes] no English transcript:', err.message);
    return null;
  }
}

module.exports = { buildNotes, translateTranscript, validate, splitTranscript, pickEvenly, systemPromptFor };
