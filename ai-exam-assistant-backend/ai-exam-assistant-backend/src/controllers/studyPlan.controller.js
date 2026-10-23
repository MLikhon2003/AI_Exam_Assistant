import { asyncHandler } from '../utils/asyncHandler.js';
import { buildStudyPlanItems } from '../services/studyPlanService.js';
import { createStudyPlan, insertPlanItems, getLatestPlan, getPlanItems, deletePlan } from '../models/studyPlan.model.js';
import { getAllTopicPerformance } from '../models/topicPerformance.model.js';
import { updateUserProfile, findUserById } from '../models/user.model.js';

export const setExamDateAndGenerate = asyncHandler(async (req, res) => {
  const { examDate } = req.body;
  if (!examDate || new Date(examDate) < new Date().setHours(0, 0, 0, 0)) {
    return res.status(400).json({ error: 'Please provide a valid future exam date.' });
  }

  const user = await findUserById(req.user.id);
  await updateUserProfile(req.user.id, {
    name: user.name,
    email: user.email,
    examSubject: user.exam_subject,
    examDate,
  });

  const weakTopics = await getAllTopicPerformance(req.user.id);

  const existing = await getLatestPlan(req.user.id);
  if (existing) await deletePlan(existing.id);

  const items = buildStudyPlanItems({ examDate, weakTopics });
  const plan = await createStudyPlan(req.user.id, examDate);
  const savedItems = await insertPlanItems(plan.id, items);

  res.status(201).json({ plan, items: savedItems });
});

export const getPlan = asyncHandler(async (req, res) => {
  const plan = await getLatestPlan(req.user.id);
  if (!plan) {
    return res.json({ plan: null, items: [] });
  }
  const items = await getPlanItems(plan.id);
  res.json({ plan, items });
});
