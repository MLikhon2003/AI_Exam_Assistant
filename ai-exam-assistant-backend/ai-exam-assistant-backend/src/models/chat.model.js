import { query } from '../db/pool.js';

export async function insertChatMessage({ sessionId, userId, role, message }) {
  const result = await query(
    `INSERT INTO chat_messages (session_id, user_id, role, message)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [sessionId, userId, role, message]
  );
  return result.rows[0];
}

export async function getChatHistory(sessionId) {
  const result = await query(
    'SELECT role, message, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
    [sessionId]
  );
  return result.rows;
}
