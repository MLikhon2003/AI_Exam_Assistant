import { query } from '../db/pool.js';

export async function createUser({ name, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, exam_subject, exam_date, created_at`,
    [name, email, passwordHash]
  );
  const user = result.rows[0];

  await query('INSERT INTO notification_preferences (user_id) VALUES ($1)', [user.id]);
  await query('INSERT INTO study_streaks (user_id) VALUES ($1)', [user.id]);

  return user;
}

export async function findUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, name, email, role, exam_subject, exam_date, status, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateUserProfile(id, { name, email, examSubject, examDate }) {
  const result = await query(
    `UPDATE users SET name = $2, email = $3, exam_subject = $4, exam_date = $5
     WHERE id = $1
     RETURNING id, name, email, role, exam_subject, exam_date, created_at`,
    [id, name, email, examSubject, examDate]
  );
  return result.rows[0];
}
