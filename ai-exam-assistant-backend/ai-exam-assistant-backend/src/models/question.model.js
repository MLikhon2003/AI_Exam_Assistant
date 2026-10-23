import { query } from '../db/pool.js';

export async function insertQuestions(sessionId, questions) {
  const inserted = [];
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    const result = await query(
      `INSERT INTO questions (session_id, position, prompt, question_type, options, correct_option_id, model_answer)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        sessionId,
        i + 1,
        q.prompt,
        q.type,
        q.options ? JSON.stringify(q.options) : null,
        q.correctOptionId || null,
        q.modelAnswer || null,
      ]
    );
    inserted.push(result.rows[0]);
  }
  return inserted;
}

export async function getQuestionById(id) {
  const result = await query('SELECT * FROM questions WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getQuestionsBySession(sessionId) {
  const result = await query(
    'SELECT * FROM questions WHERE session_id = $1 ORDER BY position ASC',
    [sessionId]
  );
  return result.rows;
}
