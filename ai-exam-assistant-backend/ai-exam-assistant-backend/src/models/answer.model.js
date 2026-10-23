import { query } from '../db/pool.js';

export async function insertAnswer({ questionId, userId, submittedText, isCorrect, score, feedback }) {
  const result = await query(
    `INSERT INTO answers (question_id, user_id, submitted_text, is_correct, score,
                           ai_feedback_headline, ai_feedback_body, ai_feedback_tip)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      questionId,
      userId,
      submittedText,
      isCorrect,
      score,
      feedback.headline,
      feedback.body,
      feedback.tip,
    ]
  );
  return result.rows[0];
}

export async function getAnswersBySession(sessionId) {
  const result = await query(
    `SELECT a.* FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE q.session_id = $1`,
    [sessionId]
  );
  return result.rows;
}
