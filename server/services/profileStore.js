'use strict';
const db = require('../db/database');
const { cleanText, cleanList } = require('../utils/http');

/**
 * The Student Intelligence Profile: what the student told Juno about where they
 * study and what they want, always scoped to one student. Shared by the HTTP
 * route and Juno's chat, so both read the same thing.
 *
 * Every field is optional and is exactly what the student entered. `null`
 * means "not said", and Juno treats it that way.
 */

const DEGREE_LEVELS = ['language', 'exchange', 'bachelor', 'master', 'doctorate', 'other'];
const STAGES = ['preparing', 'new', 'continuing', 'graduating'];
const KOREAN_LEVELS = ['none', 'beginner', 'intermediate', 'advanced', 'fluent'];
const UI_LANGUAGES = ['en', 'ko'];

/** The languages Juno can be asked to explain in, by their English names (what the model is told). */
const LANGUAGE_NAMES = {
  en: 'English', ko: 'Korean', zh: 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)', vi: 'Vietnamese',
  ur: 'Urdu', ja: 'Japanese', mn: 'Mongolian', uz: 'Uzbek', ru: 'Russian', id: 'Indonesian', th: 'Thai',
  hi: 'Hindi', bn: 'Bengali', ne: 'Nepali', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German',
  pt: 'Portuguese', tr: 'Turkish', kk: 'Kazakh', my: 'Burmese', km: 'Khmer', ms: 'Malay', fa: 'Persian',
};

const text = (max) => (value) => (value === null || value === '' ? null : cleanText(value, max) || undefined);
const oneOf = (list) => (value) => (value === null ? null : list.includes(value) ? value : undefined);
const int = (min, max) => (value) => (Number.isInteger(value) && value >= min && value <= max ? value : undefined);
const optionalInt = (min, max) => (value) => (value === null ? null : int(min, max)(value));
const list = (options) => (value) => {
  const cleaned = cleanList(value, options);
  return cleaned ? JSON.stringify(cleaned) : undefined;
};
const matching = (pattern, max = 64) => (value) =>
  value === null || value === '' ? null : typeof value === 'string' && value.length <= max && pattern.test(value) ? value : undefined;

/** field → [column, reader]. A reader returns the value to store, or undefined when the input is not valid. */
const FIELDS = {
  country: ['country', matching(/^[A-Z]{2}$/)],
  university: ['university', text(120)],
  campus: ['campus', text(80)],
  department: ['department', text(120)],
  degreeLevel: ['degree_level', oneOf(DEGREE_LEVELS)],
  stage: ['stage', oneOf(STAGES)],
  academicYear: ['academic_year', optionalInt(1, 8)],
  expectedGraduation: ['expected_graduation', matching(/^\d{4}-(0[1-9]|1[0-2])$/)],
  timezone: ['timezone', matching(/^(UTC|[A-Za-z_]+(\/[A-Za-z0-9_+-]+)+)$/)],
  uiLanguage: ['ui_language', oneOf(UI_LANGUAGES)],
  explainLanguage: ['explain_language', (v) => (v === null ? null : LANGUAGE_NAMES[v] ? v : undefined)],
  languages: ['languages', (v) => {
    if (!Array.isArray(v) || v.length > 10 || v.some((code) => !LANGUAGE_NAMES[code])) return undefined;
    return JSON.stringify([...new Set(v)]);
  }],
  koreanLevel: ['korean_level', oneOf(KOREAN_LEVELS)],
  academicGoal: ['academic_goal', text(300)],
  careerInterests: ['career_interests', list({ maxItems: 8, maxChars: 40 })],
  targetRole: ['target_role', text(120)],
  skillsWanted: ['skills_wanted', list({ maxItems: 12, maxChars: 40 })],
  dailyQuiz: ['daily_quiz', (v) => (typeof v === 'boolean' ? v : undefined)],
  quietFrom: ['quiet_from', int(0, 23)],
  quietUntil: ['quiet_until', int(0, 23)],
  onboardingStep: ['onboarding_step', int(0, 20)],
};

function toProfile(row) {
  const r = row || {};
  return {
    country: r.country || null,
    university: r.university || null,
    campus: r.campus || null,
    department: r.department || null,
    degreeLevel: r.degree_level || null,
    stage: r.stage || null,
    academicYear: r.academic_year ?? null,
    expectedGraduation: r.expected_graduation || null,
    timezone: r.timezone || null,
    uiLanguage: r.ui_language || null,
    explainLanguage: r.explain_language || null,
    languages: r.languages || [],
    koreanLevel: r.korean_level || null,
    academicGoal: r.academic_goal || null,
    careerInterests: r.career_interests || [],
    targetRole: r.target_role || null,
    skillsWanted: r.skills_wanted || [],
    dailyQuiz: r.daily_quiz ?? true,
    quietFrom: r.quiet_from ?? 22,
    quietUntil: r.quiet_until ?? 8,
    onboardingStep: r.onboarding_step ?? 0,
    onboarded: Boolean(r.onboarded_at),
  };
}

async function getProfile(userId) {
  const result = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
  return toProfile(result.rows[0]);
}

/**
 * Saves only the fields given; the rest stay as they are.
 * @returns {{ profile } | { invalid: string }} the saved profile, or the first field that was not valid.
 */
async function saveProfile(userId, changes) {
  const columns = [];
  const params = [userId];
  for (const [field, [column, read]] of Object.entries(FIELDS)) {
    if (changes[field] === undefined) continue;
    const value = read(changes[field]);
    if (value === undefined) return { invalid: field };
    params.push(value);
    columns.push([column, `$${params.length}`]);
  }
  const updates = columns.map(([column, placeholder]) => `${column} = ${placeholder}`);
  if (changes.onboarded === true) {
    columns.push(['onboarded_at', 'now()']);
    updates.push('onboarded_at = COALESCE(student_profiles.onboarded_at, now())');
  }
  const result = await db.query(
    `INSERT INTO student_profiles (user_id${columns.map(([c]) => `, ${c}`).join('')})
     VALUES ($1${columns.map(([, p]) => `, ${p}`).join('')})
     ON CONFLICT (user_id) DO UPDATE SET ${[...updates, 'updated_at = now()'].join(', ')}
     RETURNING *`,
    params
  );
  return { profile: toProfile(result.rows[0]) };
}

module.exports = { getProfile, saveProfile, LANGUAGE_NAMES, DEGREE_LEVELS, STAGES, KOREAN_LEVELS };
