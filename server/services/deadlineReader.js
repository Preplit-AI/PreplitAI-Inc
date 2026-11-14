'use strict';
const { getClient } = require('./llmService');
const { parseDue } = require('./companionTools');
const { cleanText } = require('../utils/http');
const { VISION_MODEL } = require('../config/constants');

/**
 * Reads a screenshot of a learning-management page (or a photo of a syllabus,
 * or a message from a classmate) and lists the deadlines that can be seen in
 * it. Nothing is saved here: the student is shown the list and chooses.
 *
 * A date that is not in the picture is left empty, never guessed.
 */

const KINDS = ['assignment', 'exam', 'task'];
const MAX_ITEMS = 20;

const instructions = (today) => `This picture is a screenshot from a university learning-management system, a syllabus, or a message about coursework.
Today is ${today} (Korea time).
List every assignment, quiz, exam or deadline that is visible in the picture.
Answer with JSON only, in this shape:
{"items":[{"title":"...","course":"... or null","due_at":"YYYY-MM-DDTHH:mm or YYYY-MM-DD or null","kind":"assignment|exam|task"}]}
Rules:
- Copy each title as it is written, in its own language.
- "course" is the course name shown with the item, or null.
- Write a date only if it is visible. If the year is not shown, use the nearest such date on or after today. If no date is visible, use null. Never invent a date.
- Skip items the picture marks as submitted or completed.
- If nothing of the kind is visible, answer {"items":[]}.`;

/** The first JSON object in what the model wrote. */
function jsonIn(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** The student's own course that an item names, if one clearly matches. */
function matchCourse(name, courses) {
  if (!name) return null;
  const wanted = name.toLowerCase().replace(/\s+/g, '');
  if (wanted.length < 2) return null;
  return courses.find((c) => {
    const own = c.name.toLowerCase().replace(/\s+/g, '');
    return own === wanted || own.includes(wanted) || wanted.includes(own) || (c.code && wanted.includes(String(c.code).toLowerCase().replace(/\s+/g, '')));
  }) || null;
}

/**
 * @param {Buffer} image
 * @param {string} mimetype image/png, image/jpeg or image/webp
 * @param {{ courses: {id:string,name:string,code?:string}[] }} context
 * @returns {Promise<{ title: string, kind: string, dueAt: string|null, courseId: string|null, courseName: string|null }[]>}
 */
async function readDeadlines(image, mimetype, { courses = [] } = {}) {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const groq = getClient();
  const completion = await groq.chat.completions.create({
    model: VISION_MODEL,
    temperature: 0,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: instructions(today) },
        { type: 'image_url', image_url: { url: `data:${mimetype};base64,${image.toString('base64')}` } },
      ],
    }],
  });
  const parsed = jsonIn(completion.choices?.[0]?.message?.content || '');
  if (!parsed || !Array.isArray(parsed.items)) {
    const err = new Error('The model did not answer with a list');
    err.code = 'UNREADABLE_IMAGE';
    throw err;
  }
  const items = [];
  for (const raw of parsed.items.slice(0, MAX_ITEMS)) {
    const title = cleanText(raw && raw.title, 160);
    if (!title) continue;
    const due = raw.due_at ? parseDue(String(raw.due_at)) : null;
    const course = matchCourse(cleanText(raw.course, 120), courses);
    items.push({
      title,
      kind: KINDS.includes(raw.kind) ? raw.kind : 'assignment',
      dueAt: due ? due.toISOString() : null,
      courseId: course ? course.id : null,
      courseName: course ? course.name : cleanText(raw.course, 120) || null,
    });
  }
  return items;
}

module.exports = { readDeadlines, jsonIn, matchCourse };
