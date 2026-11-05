'use strict';
const { callLLM } = require('./llmService');
const { NOTES_MODEL } = require('../config/constants');

/**
 * Transcript in, notes and review cards out, in Korean.
 *
 * The rules in the prompt are the product's rules: only what was said, nothing
 * filled in where the transcript says [불명확], and exam flags only where the
 * lecturer actually flagged something. The output is then validated strictly;
 * anything malformed fails the lecture rather than being patched with invented
 * content, and the caller saves nothing.
 */

const SYSTEM_PROMPT = `너는 대학 강의 녹취록을 학생용 노트로 정리한다. 반드시 지킬 규칙:
1. 녹취록에 있는 내용만 쓴다. 강의에 없던 설명, 예시, 사실을 추가하지 않는다.
2. 녹취록의 [불명확] 부분은 추측해서 채우지 않는다. 그 부분에 기대는 내용이면 "[불명확]"이라고 쓴다.
3. flagged에는 교수가 시험, 중간고사, 기말고사, 퀴즈에 나온다고 하거나 "꼭 알아야 한다"고 분명히 말한 내용만 넣는다. 그런 말이 없으면 빈 배열이다. 짐작으로 넣지 않는다.
4. 모든 문장은 한국어로 쓴다. 전문 용어는 처음 나올 때 원어를 괄호에 함께 쓴다. 예: 교착 상태(deadlock).
5. 카드는 5~10장. 각 카드는 노트만 보고 답할 수 있어야 하고, 앞면은 질문 하나, 뒷면은 짧은 답이다.
6. JSON만 출력한다.`;

const OUTPUT_SHAPE = `{
  "title": "강의 주제를 담은 짧은 제목 (40자 이내)",
  "summary": "두 문장 요약",
  "sections": [ { "heading": "소제목", "points": ["핵심 내용", "..."] } ],
  "flagged": [ { "quote": "교수가 한 말을 짧게 인용", "at": "mm:ss 또는 빈 문자열", "note": "무엇이 시험에 나오는지" } ],
  "cards": [ { "front": "질문", "back": "답" } ]
}`;

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

function validate(data) {
  const sections = (Array.isArray(data.sections) ? data.sections : [])
    .map((s) => ({
      heading: str(s && s.heading, 120),
      points: (Array.isArray(s && s.points) ? s.points : []).map((p) => str(p, 600)).filter(Boolean).slice(0, 12),
    }))
    .filter((s) => s.heading && s.points.length)
    .slice(0, 12);

  const flagged = (Array.isArray(data.flagged) ? data.flagged : [])
    .map((f) => ({ quote: str(f && f.quote, 300), at: str(f && f.at, 8), note: str(f && f.note, 300) }))
    .filter((f) => f.quote || f.note)
    .slice(0, 8);

  const cards = (Array.isArray(data.cards) ? data.cards : [])
    .map((c) => ({ front: str(c && c.front, 300), back: str(c && c.back, 600) }))
    .filter((c) => c.front && c.back)
    .slice(0, 10);

  if (sections.length === 0) {
    const err = new Error('Notes had no usable sections');
    err.code = 'NOTES_INVALID';
    throw err;
  }

  return { title: str(data.title, 120), summary: str(data.summary, 600), sections, flagged, cards };
}

/**
 * @returns {Promise<{ title: string, summary: string, sections: {heading:string,points:string[]}[], flagged: {quote:string,at:string,note:string}[], cards: {front:string,back:string}[] }>}
 */
async function buildNotes({ transcript, courseName, title }) {
  const userPrompt = `과목: ${courseName}
학생이 붙인 제목: ${title || '(없음)'}

출력 형식:
${OUTPUT_SHAPE}

녹취록 ([mm:ss]는 녹음 시작부터의 시간):
${transcript}`;

  let raw;
  try {
    raw = await callLLM({ systemPrompt: SYSTEM_PROMPT, userPrompt, primaryModel: NOTES_MODEL, jsonMode: true });
  } catch (err) {
    err.code = err.code || 'LLM_UNAVAILABLE';
    throw err;
  }

  try {
    return validate(parseJson(raw));
  } catch (err) {
    err.code = err.code || 'NOTES_INVALID';
    throw err;
  }
}

module.exports = { buildNotes, validate };
