import { query } from '../db/pool.js';

export async function logAiError({ provider, statusCode, endpoint, message }) {
  await query(
    'INSERT INTO ai_error_logs (provider, status_code, endpoint, message) VALUES ($1, $2, $3, $4)',
    [provider, statusCode, endpoint, message]
  );
}

export async function getRecentAiErrors(limit) {
  const lim = limit || 20;
  const result = await query(
    'SELECT status_code AS code, message, endpoint, created_at FROM ai_error_logs ORDER BY created_at DESC LIMIT $1',
    [lim]
  );
  return result.rows;
}

export async function countAiCallsLast24h() {
  const sql =
    "SELECT " +
    "(SELECT COUNT(*) FROM practice_sessions WHERE created_at > now() - interval '24 hours') + " +
    "(SELECT COUNT(*) FROM answers WHERE submitted_at > now() - interval '24 hours') + " +
    "(SELECT COUNT(*) FROM chat_messages WHERE role = 'ai' AND created_at > now() - interval '24 hours') AS total";
  const result = await query(sql);
  return Number(result.rows[0].total);
}

export async function countFailedAiCallsLast24h() {
  const result = await query(
    "SELECT COUNT(*)::int AS total FROM ai_error_logs WHERE created_at > now() - interval '24 hours'"
  );
  return result.rows[0].total;
}
