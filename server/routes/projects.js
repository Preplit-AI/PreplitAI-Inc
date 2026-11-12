'use strict';
const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { getCourse } = require('../services/courseStore');
const { getProfile } = require('../services/profileStore');
const { isUuid, fail, cleanText, cleanList } = require('../utils/http');

/**
 * Projects the student builds, their milestones, and the skills that follow
 * from them, always scoped to one student.
 *
 * A skill is never claimed without the work behind it. Its evidence level is
 * worked out here, from the student's own records:
 *
 *   demonstrated  listed on a project that is done (which needs a link or a
 *                 written outcome before it can be marked done)
 *   developing    listed on a project that is under way
 *   wanted        the student said they want to develop it; nothing built yet
 */
const router = express.Router();
router.use(authMiddleware);

const STATUSES = ['idea', 'active', 'done'];
const MAX_PROJECTS = 40;
const MAX_MILESTONES = 30;

const toMilestone = (row) => ({ id: row.id, title: row.title, done: Boolean(row.done_at), doneAt: row.done_at });

function toProject(row, milestones) {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name || null,
    title: row.title,
    summary: row.summary || null,
    status: row.status,
    skills: row.skills || [],
    link: row.link || null,
    outcome: row.outcome || null,
    milestones,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listProjects(userId, id = null) {
  const projects = await db.query(
    `SELECT p.*, c.name AS course_name FROM projects p LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.user_id = $1 AND ($2::uuid IS NULL OR p.id = $2::uuid)
      ORDER BY (p.status = 'done'), p.created_at DESC`,
    [userId, id]
  );
  const milestones = await db.query(
    `SELECT id, project_id, title, done_at FROM project_milestones
      WHERE user_id = $1 AND ($2::uuid IS NULL OR project_id = $2::uuid)
      ORDER BY position, created_at`,
    [userId, id]
  );
  return projects.rows.map((row) =>
    toProject(row, milestones.rows.filter((m) => m.project_id === row.id).map(toMilestone))
  );
}

/** The student's skills with the evidence for each, strongest evidence first. */
function skillsFrom(projects, wanted) {
  const rank = { demonstrated: 0, developing: 1, wanted: 2 };
  const skills = new Map();
  const note = (name, evidence, project) => {
    const key = name.toLowerCase();
    const known = skills.get(key) || { name, evidence, projects: [] };
    if (rank[evidence] < rank[known.evidence]) known.evidence = evidence;
    if (project) known.projects.push({ id: project.id, title: project.title });
    skills.set(key, known);
  };
  for (const project of projects) {
    if (project.status === 'idea') continue;
    for (const name of project.skills) note(name, project.status === 'done' ? 'demonstrated' : 'developing', project);
  }
  for (const name of wanted) note(name, 'wanted', null);
  return [...skills.values()].sort((a, b) => rank[a.evidence] - rank[b.evidence] || a.name.localeCompare(b.name));
}

/** Reads the fields that were sent. @returns { fields } or { invalid: name }. */
async function read(userId, body, { creating }) {
  const fields = {};
  if (creating || body.title !== undefined) {
    fields.title = cleanText(body.title, 120);
    if (!fields.title) return { invalid: 'title' };
  }
  if (body.summary !== undefined) fields.summary = cleanText(body.summary, 800) || null;
  if (body.outcome !== undefined) fields.outcome = cleanText(body.outcome, 800) || null;
  if (body.link !== undefined) {
    const link = cleanText(body.link, 300);
    if (link && !/^https?:\/\/[^\s]+$/i.test(link)) return { invalid: 'link' };
    fields.link = link || null;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return { invalid: 'status' };
    fields.status = body.status;
  }
  if (body.skills !== undefined) {
    const skills = cleanList(body.skills, { maxItems: 10, maxChars: 40 });
    if (!skills) return { invalid: 'skills' };
    fields.skills = JSON.stringify(skills);
  }
  if (body.courseId !== undefined) {
    if (body.courseId === null) fields.course_id = null;
    else {
      if (!isUuid(body.courseId) || !(await getCourse(userId, body.courseId))) return { invalid: 'courseId' };
      fields.course_id = body.courseId;
    }
  }
  return { fields };
}

const notFound = (res) => fail(res, 404, 'NotFound', '프로젝트를 찾을 수 없어요.');
const invalidField = (res, field) => fail(res, 400, 'InvalidField', '입력한 내용을 다시 확인해 주세요.', { field });

// ── GET /api/projects ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const [projects, profile] = await Promise.all([listProjects(req.userId), getProfile(req.userId)]);
    res.json({ success: true, projects, skills: skillsFrom(projects, profile.skillsWanted) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/projects  { title, summary?, courseId?, skills?, milestones?: string[] } ──
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const { fields, invalid } = await read(req.userId, body, { creating: true });
    if (invalid) return invalidField(res, invalid);
    if (fields.status === 'done') return fail(res, 400, 'NeedsEvidence', '끝낸 프로젝트에는 링크나 결과를 적어 주세요.');
    const titles = cleanList(body.milestones ?? [], { maxItems: MAX_MILESTONES, maxChars: 160 });
    if (!titles) return invalidField(res, 'milestones');
    const count = await db.query('SELECT COUNT(*)::int AS n FROM projects WHERE user_id = $1', [req.userId]);
    if (count.rows[0].n >= MAX_PROJECTS) return fail(res, 400, 'TooManyProjects', `프로젝트는 ${MAX_PROJECTS}개까지 만들 수 있어요.`);

    const columns = Object.keys(fields);
    const id = await db.transaction(async (tx) => {
      const created = await tx.query(
        `INSERT INTO projects (user_id, ${columns.join(', ')}) VALUES ($1, ${columns.map((_, i) => `$${i + 2}`).join(', ')}) RETURNING id`,
        [req.userId, ...columns.map((c) => fields[c])]
      );
      for (let i = 0; i < titles.length; i += 1) {
        await tx.query(
          'INSERT INTO project_milestones (project_id, user_id, title, position) VALUES ($1, $2, $3, $4)',
          [created.rows[0].id, req.userId, titles[i], i]
        );
      }
      return created.rows[0].id;
    });
    res.status(201).json({ success: true, project: (await listProjects(req.userId, id))[0] });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/projects/:id ──────────────────────────────────────────────────
// Marking a project done needs a link or a written outcome: that is the evidence
// its skills are then shown with.
router.patch('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return notFound(res);
    const { fields, invalid } = await read(req.userId, req.body || {}, { creating: false });
    if (invalid) return invalidField(res, invalid);
    const current = (await listProjects(req.userId, req.params.id))[0];
    if (!current) return notFound(res);
    const after = { status: current.status, link: current.link, outcome: current.outcome, ...fields };
    if (after.status === 'done' && !after.link && !after.outcome) {
      return fail(res, 400, 'NeedsEvidence', '끝낸 프로젝트에는 링크나 결과를 적어 주세요.');
    }
    const columns = Object.keys(fields);
    if (columns.length) {
      await db.query(
        `UPDATE projects SET ${columns.map((c, i) => `${c} = $${i + 3}`).join(', ')}, updated_at = now() WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.userId, ...columns.map((c) => fields[c])]
      );
    }
    res.json({ success: true, project: (await listProjects(req.userId, req.params.id))[0] });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return notFound(res);
    const removed = await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!removed.rowCount) return notFound(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/projects/:id/milestones  { title } ─────────────────────────────
router.post('/:id/milestones', async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) return notFound(res);
    const title = cleanText(req.body && req.body.title, 160);
    if (!title) return invalidField(res, 'title');
    const project = (await listProjects(req.userId, req.params.id))[0];
    if (!project) return notFound(res);
    if (project.milestones.length >= MAX_MILESTONES) return fail(res, 400, 'TooManyMilestones', `단계는 ${MAX_MILESTONES}개까지 둘 수 있어요.`);
    await db.query(
      'INSERT INTO project_milestones (project_id, user_id, title, position) VALUES ($1, $2, $3, $4)',
      [project.id, req.userId, title, project.milestones.length]
    );
    res.status(201).json({ success: true, project: (await listProjects(req.userId, project.id))[0] });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/projects/:id/milestones/:milestoneId  { title?, done? } ───────
router.patch('/:id/milestones/:milestoneId', async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    if (!isUuid(id) || !isUuid(milestoneId)) return notFound(res);
    const body = req.body || {};
    const sets = [];
    const params = [milestoneId, id, req.userId];
    if (body.title !== undefined) {
      const title = cleanText(body.title, 160);
      if (!title) return invalidField(res, 'title');
      params.push(title);
      sets.push(`title = $${params.length}`);
    }
    if (body.done !== undefined) {
      if (typeof body.done !== 'boolean') return invalidField(res, 'done');
      sets.push(body.done ? 'done_at = COALESCE(done_at, now())' : 'done_at = NULL');
    }
    if (sets.length) {
      const updated = await db.query(
        `UPDATE project_milestones SET ${sets.join(', ')} WHERE id = $1 AND project_id = $2 AND user_id = $3`,
        params
      );
      if (!updated.rowCount) return notFound(res);
    }
    const project = (await listProjects(req.userId, id))[0];
    if (!project) return notFound(res);
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/projects/:id/milestones/:milestoneId ─────────────────────────
router.delete('/:id/milestones/:milestoneId', async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    if (!isUuid(id) || !isUuid(milestoneId)) return notFound(res);
    const removed = await db.query(
      'DELETE FROM project_milestones WHERE id = $1 AND project_id = $2 AND user_id = $3',
      [milestoneId, id, req.userId]
    );
    if (!removed.rowCount) return notFound(res);
    res.json({ success: true, project: (await listProjects(req.userId, id))[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.skillsFrom = skillsFrom;
