import { query } from '../db/pool.js';

export async function getStreak(userId) {
  const result = await query('SELECT * FROM study_streaks WHERE user_id = $1', [userId]);
  return result.rows[0];
}

export async function touchStreak(userId) {
  const current = await getStreak(userId);
  const today = new Date().toISOString().slice(0, 10);

  if (!current.last_active_date) {
    return updateStreak(userId, 1, 1, today);
  }

  const last = new Date(current.last_active_date);
  const diffDays = Math.round((new Date(today) - last) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return current;
  if (diffDays === 1) {
    const next = current.current_streak + 1;
    return updateStreak(userId, next, Math.max(next, current.longest_streak), today);
  }
  return updateStreak(userId, 1, current.longest_streak, today);
}

async function updateStreak(userId, current, longest, lastActiveDate) {
  const result = await query(
    `UPDATE study_streaks SET current_streak = $2, longest_streak = $3, last_active_date = $4
     WHERE user_id = $1 RETURNING *`,
    [userId, current, longest, lastActiveDate]
  );
  return result.rows[0];
}
