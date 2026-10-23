import { query } from '../db/pool.js';

export async function getNotificationPreferences(userId) {
  const result = await query('SELECT * FROM notification_preferences WHERE user_id = $1', [userId]);
  return result.rows[0];
}

export async function updateNotificationPreferences(userId, prefs) {
  const result = await query(
    `UPDATE notification_preferences SET
       study_reminders = $2,
       exam_countdown_alerts = $3,
       streak_alerts = $4,
       updated_at = now()
     WHERE user_id = $1 RETURNING *`,
    [userId, prefs.studyReminders, prefs.examCountdownAlerts, prefs.streakAlerts]
  );
  return result.rows[0];
}
