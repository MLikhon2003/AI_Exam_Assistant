import { query } from '../db/pool.js';

export async function createSession({ userId, topic, sourceText, questionType, difficulty, count }) {
  const result = await query(
    `INSERT INTO practice_sessions (user_id, topic, source_text, question_type, difficulty, question_count)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, topic, sourceText || null, questionType, difficulty, count]
  );
  return result.rows[0];
}

export async function getSessionById(id) {
  const result = await query('SELECT * FROM practice_sessions WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function completeSession(id, scorePercent) {
  const result = await query(
    `UPDATE practice_sessions
     SET status = 'completed', score_percent = $2, completed_at = now()
     WHERE id = $1 RETURNING *`,
    [id, scorePercent]
  );
  return result.rows[0];
}

export async function getRecentSessions(userId, limit) {
  const lim = limit || 5;
  const result = await query(
    `SELECT id, topic, question_type, score_percent, completed_at, created_at
     FROM practice_sessions
     WHERE user_id = $1 AND status = 'completed'
     ORDER BY completed_at DESC LIMIT $2`,
    [userId, lim]
  );
  return result.rows;
}

export async function getAccuracyTrend(userId, limit) {
  const lim = limit || 8;
  const result = await query(
    `SELECT score_percent FROM (
       SELECT score_percent, completed_at FROM practice_sessions
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC LIMIT $2
     ) sub ORDER BY completed_at ASC`,
    [userId, lim]
  );
  return result.rows.map((r) => Number(r.score_percent));
}

export async function countCompletedSessions(userId) {
  const result = await query(
    `SELECT COUNT(*)::int AS total FROM practice_sessions WHERE user_id = $1 AND status = 'completed'`,
    [userId]
  );
  return result.rows[0].total;
}

export async function averageScore(userId) {
  const result = await query(
    `SELECT COALESCE(AVG(score_percent), 0) AS avg FROM practice_sessions WHERE user_id = $1 AND status = 'completed'`,
    [userId]
  );
  return Math.round(Number(result.rows[0].avg));
}

export async function countSessionsForUser(userId) {
  const result = await query('SELECT COUNT(*)::int AS total FROM practice_sessions WHERE user_id = $1', [userId]);
  return result.rows[0].total;
}
