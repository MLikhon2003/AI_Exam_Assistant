import { query } from '../db/pool.js';

export async function upsertTopicPerformance(userId, topic, isCorrect) {
  await query(
    `INSERT INTO topic_performance (user_id, topic, attempts, correct_count, accuracy_percent)
     VALUES ($1, $2, 1, $3, $3 * 100)
     ON CONFLICT (user_id, topic) DO UPDATE SET
       attempts = topic_performance.attempts + 1,
       correct_count = topic_performance.correct_count + $3,
       accuracy_percent = ROUND(
         (topic_performance.correct_count + $3)::numeric /
         (topic_performance.attempts + 1) * 100, 2
       ),
       updated_at = now()`,
    [userId, topic, isCorrect ? 1 : 0]
  );
}

export async function getWeakTopics(userId, limit) {
  const lim = limit || 5;
  const result = await query(
    `SELECT topic, accuracy_percent FROM topic_performance
     WHERE user_id = $1 ORDER BY accuracy_percent ASC LIMIT $2`,
    [userId, lim]
  );
  return result.rows;
}

export async function getAllTopicPerformance(userId) {
  const result = await query(
    'SELECT topic, accuracy_percent FROM topic_performance WHERE user_id = $1',
    [userId]
  );
  return result.rows;
}
