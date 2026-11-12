'use strict';
const db = require('../db/database');

/**
 * Courses, always scoped to one student. Shared by the HTTP routes and the
 * chat's tools, so both go through the same ownership checks.
 */

const COLUMNS = `c.id, c.name, c.created_at, c.class_days,
  c.code, c.instructor, c.credits, c.location, c.starts_at, c.ends_at, c.language,
  to_char(c.midterm_on, 'YYYY-MM-DD') AS midterm_on,
  to_char(c.final_on, 'YYYY-MM-DD') AS final_on`;

function toCourse(row) {
  return {
    id: row.id,
    name: row.name,
    lectureCount: row.lecture_count,
    createdAt: row.created_at,
    classDays: row.class_days || [],
    midtermOn: row.midterm_on || null,
    finalOn: row.final_on || null,
    code: row.code || null,
    instructor: row.instructor || null,
    credits: row.credits ?? null,
    location: row.location || null,
    startsAt: row.starts_at || null,
    endsAt: row.ends_at || null,
    language: row.language || null,
  };
}

async function listCourses(userId) {
  const result = await db.query(
    `SELECT ${COLUMNS},
            COUNT(l.id) FILTER (WHERE l.status = 'ready')::int AS lecture_count
       FROM courses c
       LEFT JOIN lectures l ON l.course_id = c.id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.created_at ASC`,
    [userId]
  );
  return result.rows.map(toCourse);
}

async function getCourse(userId, id) {
  const result = await db.query(`SELECT ${COLUMNS} FROM courses c WHERE c.id = $1 AND c.user_id = $2`, [id, userId]);
  return result.rows[0] ? toCourse(result.rows[0]) : null;
}

async function countCourses(userId) {
  const result = await db.query('SELECT COUNT(*)::int AS n FROM courses WHERE user_id = $1', [userId]);
  return result.rows[0].n;
}

/** The optional timetable details, by their column names. */
const DETAILS = { code: 'code', instructor: 'instructor', credits: 'credits', location: 'location', startsAt: 'starts_at', endsAt: 'ends_at', language: 'language' };

async function createCourse(userId, name, { classDays = [], midtermOn = null, finalOn = null, ...details } = {}) {
  const result = await db.query(
    `INSERT INTO courses AS c (user_id, name, class_days, midterm_on, final_on)
     VALUES ($1, $2, $3, $4::date, $5::date) RETURNING ${COLUMNS}`,
    [userId, name, JSON.stringify(classDays), midtermOn, finalOn]
  );
  const course = toCourse({ ...result.rows[0], lecture_count: 0 });
  const given = Object.keys(DETAILS).some((key) => details[key] !== undefined && details[key] !== null);
  return given ? { ...(await updateCourse(userId, course.id, details)), lectureCount: 0 } : course;
}

/**
 * Changes only the fields given.
 * @returns the updated course, or null if this student has no such course.
 */
async function updateCourse(userId, id, changes) {
  const sets = [];
  const params = [id, userId];
  const set = (column, value, cast = '') => {
    params.push(value);
    sets.push(`${column} = $${params.length}${cast}`);
  };
  if (changes.name !== undefined) set('name', changes.name);
  if (changes.classDays !== undefined) set('class_days', JSON.stringify(changes.classDays));
  if (changes.midtermOn !== undefined) set('midterm_on', changes.midtermOn, '::date');
  if (changes.finalOn !== undefined) set('final_on', changes.finalOn, '::date');
  for (const [key, column] of Object.entries(DETAILS)) if (changes[key] !== undefined) set(column, changes[key]);
  if (!sets.length) return getCourse(userId, id);
  const result = await db.query(
    `UPDATE courses AS c SET ${sets.join(', ')} WHERE c.id = $1 AND c.user_id = $2 RETURNING ${COLUMNS}`,
    params
  );
  return result.rows[0] ? toCourse({ ...result.rows[0], lecture_count: null }) : null;
}

/** Removes the course with its lectures, notes and cards. @returns whether one was removed. */
async function deleteCourse(userId, id) {
  const result = await db.query('DELETE FROM courses WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
}

module.exports = { listCourses, getCourse, countCourses, createCourse, updateCourse, deleteCourse };
