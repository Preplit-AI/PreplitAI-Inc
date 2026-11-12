'use strict';
/**
 * What the mobile app adds to the API: the student's profile, timetable
 * details on a course, tasks, projects with the skills they are evidence for,
 * lectures made from a document, and Juno answering in the student's language.
 * Real routes over a real Postgres (PGlite); the notes generator is a stand-in.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preplit-student-'));
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_DRIVER: 'pglite',
  PGLITE_DIR: dataDir,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check-0123456789',
});

// The notes generator, standing in for the model: it records the language it was asked for.
const asked = [];
const lectureServicePath = require.resolve('../services/lectureService');
const realLectureService = require('../services/lectureService');
require.cache[lectureServicePath].exports = {
  ...realLectureService,
  buildNotes: async ({ language, transcript }) => {
    asked.push({ language, transcript });
    return {
      title: 'Deadlock',
      summary: 'What deadlock is.',
      sections: [{ heading: 'Definition', points: ['Processes wait on each other for ever.'] }],
      flagged: [],
      cards: [{ front: 'What is 교착 상태 (deadlock)?', back: 'Processes waiting on each other.' }],
      terms: [{ term: '교착 상태', english: 'deadlock', meaning: 'Processes wait on each other for ever.' }],
    };
  },
};

const app = require('../app');
const db = require('../db/database');
const { systemPrompt } = require('../services/chatAgent');
const { systemPromptFor } = realLectureService;

let server;
let base;

before(async () => {
  await db.ready;
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

async function call(method, url, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + url, { method, headers, body: payload });
  return { status: res.status, json: await res.json().catch(() => null) };
}

async function student(email) {
  const res = await call('POST', '/auth/signup', { body: { email, password: 'correct horse battery', name: 'Test' } });
  assert.equal(res.status, 201);
  return res.json.accessToken;
}

async function waitUntilReady(token, id) {
  for (let i = 0; i < 100; i += 1) {
    const res = await call('GET', `/lectures/${id}`, { token });
    if (res.json.lecture && res.json.lecture.status === 'ready') return res.json.lecture;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('lecture did not finish');
}

test('the profile starts empty, is saved a step at a time, and refuses what is not valid', async () => {
  const token = await student('profile@example.com');
  const empty = await call('GET', '/profile', { token });
  assert.equal(empty.json.profile.university, null);
  assert.equal(empty.json.profile.onboarded, false);
  assert.equal(empty.json.languages.vi, 'Vietnamese');

  const first = await call('PATCH', '/profile', { token, body: { uiLanguage: 'en', explainLanguage: 'vi', languages: ['vi', 'en'], koreanLevel: 'beginner', onboardingStep: 1 } });
  assert.equal(first.status, 200);
  const second = await call('PATCH', '/profile', {
    token,
    body: { country: 'KR', university: ' Hanyang University ', department: 'Computer Science', degreeLevel: 'bachelor', academicYear: 2, stage: 'continuing', skillsWanted: ['SQL', 'sql', ' Python '], onboardingStep: 2 },
  });
  assert.equal(second.json.profile.university, 'Hanyang University');
  assert.deepEqual(second.json.profile.skillsWanted, ['SQL', 'Python']);
  assert.equal(second.json.profile.explainLanguage, 'vi', 'earlier steps are kept');
  assert.equal(second.json.profile.onboarded, false);

  for (const body of [{ explainLanguage: 'xx' }, { academicYear: 40 }, { degreeLevel: 'wizard' }, { country: 'Korea' }, { skillsWanted: 'SQL' }]) {
    const bad = await call('PATCH', '/profile', { token, body });
    assert.equal(bad.status, 400, JSON.stringify(body));
    assert.equal(bad.json.field, Object.keys(body)[0]);
  }

  const done = await call('PATCH', '/profile', { token, body: { onboarded: true } });
  assert.equal(done.json.profile.onboarded, true);
  assert.equal((await call('GET', '/profile')).status, 401);
});

test('a course keeps its timetable details', async () => {
  const token = await student('course@example.com');
  const made = await call('POST', '/courses', {
    token,
    body: { name: '운영체제', classDays: [1, 3], code: 'CSE3008', instructor: 'Prof. Kim', credits: 3, location: 'IT/BT 507', startsAt: '10:30', endsAt: '12:00', language: 'ko' },
  });
  assert.equal(made.status, 201);
  assert.equal(made.json.course.code, 'CSE3008');
  assert.equal(made.json.course.startsAt, '10:30');
  assert.equal(made.json.course.lectureCount, 0);

  const changed = await call('PATCH', `/courses/${made.json.course.id}`, { token, body: { location: null, endsAt: '11:45' } });
  assert.equal(changed.json.course.location, null);
  assert.equal(changed.json.course.endsAt, '11:45');
  assert.equal(changed.json.course.name, '운영체제');

  assert.equal((await call('PATCH', `/courses/${made.json.course.id}`, { token, body: { startsAt: '25:00' } })).status, 400);
  const listed = await call('GET', '/courses', { token });
  assert.equal(listed.json.courses[0].instructor, 'Prof. Kim');
});

test('tasks belong to their student and their course, and can be done and undone', async () => {
  const token = await student('tasks@example.com');
  const other = await student('tasks-other@example.com');
  const course = (await call('POST', '/courses', { token, body: { name: 'Databases' } })).json.course;
  const theirs = (await call('POST', '/courses', { token: other, body: { name: 'Not mine' } })).json.course;

  const due = new Date(Date.now() + 3 * 86400000).toISOString();
  const made = await call('POST', '/tasks', { token, body: { title: ' ER diagram homework ', courseId: course.id, kind: 'assignment', dueAt: due, priority: 1, remindMinutes: 1440 } });
  assert.equal(made.status, 201);
  assert.equal(made.json.task.title, 'ER diagram homework');
  assert.equal(made.json.task.courseName, 'Databases');
  assert.equal(made.json.task.remindMinutes, 1440);
  await call('POST', '/tasks', { token, body: { title: 'Buy a notebook' } });

  assert.equal((await call('POST', '/tasks', { token, body: { title: '' } })).status, 400);
  assert.equal((await call('POST', '/tasks', { token, body: { title: 'x', courseId: theirs.id } })).json.field, 'courseId');
  assert.equal((await call('POST', '/tasks', { token, body: { title: 'x', dueAt: 'next week' } })).json.field, 'dueAt');

  const open = await call('GET', '/tasks', { token });
  assert.deepEqual(open.json.tasks.map((t) => t.title), ['ER diagram homework', 'Buy a notebook'], 'a dated task comes before an undated one');
  assert.equal((await call('GET', `/tasks?courseId=${course.id}`, { token })).json.tasks.length, 1);

  const id = made.json.task.id;
  assert.equal((await call('PATCH', `/tasks/${id}`, { token: other, body: { done: true } })).status, 404);
  assert.equal((await call('DELETE', `/tasks/${id}`, { token: other })).status, 404);
  assert.equal((await call('PATCH', `/tasks/${id}`, { token, body: { done: true } })).json.task.done, true);
  assert.equal((await call('GET', '/tasks', { token })).json.tasks.length, 1);
  assert.equal((await call('GET', '/tasks?state=done', { token })).json.tasks.length, 1);
  assert.equal((await call('PATCH', `/tasks/${id}`, { token, body: { done: false } })).json.task.done, false);

  // Deleting the course keeps the task and frees it from the course.
  await call('DELETE', `/courses/${course.id}`, { token });
  const kept = (await call('GET', '/tasks?state=all', { token })).json.tasks.find((t) => t.id === id);
  assert.equal(kept.courseId, null);
  assert.equal((await call('DELETE', `/tasks/${id}`, { token })).status, 200);
});

test('a skill is only "demonstrated" by a finished project that shows its work', async () => {
  const token = await student('projects@example.com');
  const other = await student('projects-other@example.com');
  await call('PATCH', '/profile', { token, body: { skillsWanted: ['SQL', 'Docker'] } });

  const made = await call('POST', '/projects', { token, body: { title: 'Library database', summary: 'A small schema and queries.', skills: ['SQL', 'Data modeling'], milestones: ['Draw the ER diagram', 'Write the queries'] } });
  assert.equal(made.status, 201);
  const project = made.json.project;
  assert.equal(project.status, 'idea');
  assert.deepEqual(project.milestones.map((m) => m.title), ['Draw the ER diagram', 'Write the queries']);

  // An idea is not evidence of anything yet.
  let skills = (await call('GET', '/projects', { token })).json.skills;
  assert.deepEqual(skills.map((s) => [s.name, s.evidence]), [['Docker', 'wanted'], ['SQL', 'wanted']]);

  await call('PATCH', `/projects/${project.id}`, { token, body: { status: 'active' } });
  skills = (await call('GET', '/projects', { token })).json.skills;
  assert.deepEqual(skills.map((s) => [s.name, s.evidence]), [['Data modeling', 'developing'], ['SQL', 'developing'], ['Docker', 'wanted']]);

  const noEvidence = await call('PATCH', `/projects/${project.id}`, { token, body: { status: 'done' } });
  assert.equal(noEvidence.json.error, 'NeedsEvidence');
  assert.equal((await call('PATCH', `/projects/${project.id}`, { token, body: { link: 'javascript:alert(1)' } })).json.field, 'link');
  const done = await call('PATCH', `/projects/${project.id}`, { token, body: { status: 'done', link: 'https://github.com/example/library-db' } });
  assert.equal(done.json.project.status, 'done');
  skills = (await call('GET', '/projects', { token })).json.skills;
  assert.deepEqual(skills.find((s) => s.name === 'SQL'), { name: 'SQL', evidence: 'demonstrated', projects: [{ id: project.id, title: 'Library database' }] });

  // Milestones.
  const first = project.milestones[0].id;
  const ticked = await call('PATCH', `/projects/${project.id}/milestones/${first}`, { token, body: { done: true } });
  assert.equal(ticked.json.project.milestones[0].done, true);
  const added = await call('POST', `/projects/${project.id}/milestones`, { token, body: { title: 'Write the README' } });
  assert.equal(added.json.project.milestones.length, 3);
  assert.equal((await call('DELETE', `/projects/${project.id}/milestones/${first}`, { token })).json.project.milestones.length, 2);

  // Another student sees and touches none of it.
  assert.equal((await call('GET', '/projects', { token: other })).json.projects.length, 0);
  assert.equal((await call('PATCH', `/projects/${project.id}`, { token: other, body: { title: 'Mine now' } })).status, 404);
  assert.equal((await call('POST', `/projects/${project.id}/milestones`, { token: other, body: { title: 'x' } })).status, 404);
  assert.equal((await call('DELETE', `/projects/${project.id}`, { token: other })).status, 404);
  assert.equal((await call('DELETE', `/projects/${project.id}`, { token })).status, 200);
});

test('a text document becomes a lecture, with notes in the language the student chose', async () => {
  const token = await student('document@example.com');
  await call('PATCH', '/profile', { token, body: { explainLanguage: 'vi' } });
  const course = (await call('POST', '/courses', { token, body: { name: '운영체제' } })).json.course;

  const words = Array.from({ length: 80 }, (_, i) => `교착 상태는 프로세스가 자원을 기다리는 상태입니다 ${i}.`).join('\n');
  const form = new FormData();
  form.append('courseId', course.id);
  form.append('title', 'Week 9 slides');
  form.append('document', new Blob([words], { type: 'text/plain' }), 'week9.txt');
  const made = await call('POST', '/lectures', { token, form });
  assert.equal(made.status, 202);
  assert.equal(made.json.lecture.material, 'text');

  const lecture = await waitUntilReady(token, made.json.lecture.id);
  assert.equal(asked.at(-1).language, 'Vietnamese');
  assert.match(asked.at(-1).transcript, /교착 상태/);
  assert.deepEqual(lecture.notes.terms, [{ term: '교착 상태', english: 'deadlock', meaning: 'Processes wait on each other for ever.' }]);
  assert.equal(lecture.cards.length, 1);

  // A file with almost nothing to read is refused before anything is made.
  const thin = new FormData();
  thin.append('courseId', course.id);
  thin.append('document', new Blob(['only a few words'], { type: 'text/plain' }), 'empty.txt');
  assert.equal((await call('POST', '/lectures', { token, form: thin })).json.error, 'NoTextInDocument');

  const wrong = new FormData();
  wrong.append('courseId', course.id);
  wrong.append('document', new Blob(['MZ'], { type: 'application/octet-stream' }), 'virus.exe');
  assert.equal((await call('POST', '/lectures', { token, form: wrong })).status, 415);
});

test('Juno is told who the student is and which language to explain in, and keeps his rules', () => {
  const profile = {
    university: 'Hanyang University', campus: 'Seoul', department: 'Computer Science', degreeLevel: 'bachelor', academicYear: 2,
    koreanLevel: 'beginner', academicGoal: null, targetRole: 'Backend engineer', careerInterests: ['Fintech'], skillsWanted: ['SQL'],
    explainLanguage: 'vi',
  };
  const prompt = systemPrompt({ courseName: null, viewing: null, profile });
  assert.match(prompt, /^너는 Juno다/);
  assert.match(prompt, /도구 결과의 text에 실제로 있는 내용만 쓴다/, 'the grounding rule is still there');
  assert.match(prompt, /대학: Hanyang University \(Seoul\)/);
  assert.match(prompt, /희망 직무: Backend engineer/);
  assert.match(prompt, /모든 답변을 Vietnamese로 쓴다/);
  assert.match(prompt, /원어 그대로/);
  assert.doesNotMatch(prompt, /진로와 프로젝트 상담/);

  const korean = systemPrompt({ courseName: null, viewing: null, profile: { ...profile, explainLanguage: 'ko' } });
  assert.doesNotMatch(korean, /답변 언어/);
  assert.match(systemPrompt({ courseName: null, viewing: null, profile, mode: 'career' }), /진로와 프로젝트 상담/);
  assert.doesNotMatch(systemPrompt({ courseName: null, viewing: null }), /학생이 직접 알려 준 정보/);
});

test('notes are asked for in the student\'s language with the lecture\'s terms kept', () => {
  assert.match(systemPromptFor(null), /4\. 모든 문장은 한국어로 쓴다/);
  assert.equal(systemPromptFor('Korean'), systemPromptFor(null));
  const english = systemPromptFor('English');
  assert.match(english, /4\. 학생은 유학생이다\. 모든 문장.*English로 쓴다/);
  assert.match(english, /원어 그대로/);
  assert.doesNotMatch(english, /모든 문장은 한국어로 쓴다/);
  assert.match(english, /1\. 녹취록에 있는 내용만 쓴다/, 'the other rules are unchanged');
});
