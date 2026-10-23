import { query } from '../db/pool.js';

export async function countRegisteredStudents() {
  const result = await query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'student'");
  return result.rows[0].total;
}

export async function countSessionsToday() {
  const result = await query(
    "SELECT COUNT(*)::int AS total FROM practice_sessions WHERE created_at::date = CURRENT_DATE"
  );
  return result.rows[0].total;
}

export async function listAccounts(limit) {
  const lim = limit || 20;
  const result = await query(
    `SELECT u.id, u.name, u.status,
            (SELECT COUNT(*) FROM practice_sessions ps WHERE ps.user_id = u.id) AS sessions
     FROM users u WHERE u.role = 'student'
     ORDER BY u.created_at DESC LIMIT $1`,
    [lim]
  );
  return result.rows;
}

export async function setAccountStatus(userId, status) {
  const result = await query(
    'UPDATE users SET status = $2 WHERE id = $1 RETURNING id, name, status',
    [userId, status]
  );
  return result.rows[0];
}

export async function deleteAccount(userId) {
  await query('DELETE FROM users WHERE id = $1', [userId]);
}
