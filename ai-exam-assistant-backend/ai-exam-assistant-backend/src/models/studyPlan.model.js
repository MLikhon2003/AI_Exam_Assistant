import { query } from '../db/pool.js';

export async function createStudyPlan(userId, examDate) {
  const result = await query(
    'INSERT INTO study_plans (user_id, exam_date) VALUES ($1, $2) RETURNING *',
    [userId, examDate]
  );
  return result.rows[0];
}

export async function insertPlanItems(planId, items) {
  const inserted = [];
  for (const item of items) {
    const result = await query(
      `INSERT INTO study_plan_items (plan_id, day_index, scheduled_date, title, meta, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [planId, item.dayIndex, item.scheduledDate, item.title, item.meta, item.status]
    );
    inserted.push(result.rows[0]);
  }
  return inserted;
}

export async function getLatestPlan(userId) {
  const result = await query(
    'SELECT * FROM study_plans WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function getPlanItems(planId) {
  const result = await query(
    'SELECT * FROM study_plan_items WHERE plan_id = $1 ORDER BY day_index ASC',
    [planId]
  );
  return result.rows;
}

export async function deletePlan(planId) {
  await query('DELETE FROM study_plans WHERE id = $1', [planId]);
}
