import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { setExamDateAndGenerate, getPlan } from '../controllers/studyPlan.controller.js';

export const studyPlanRouter = Router();

studyPlanRouter.use(requireAuth);

studyPlanRouter.get('/', getPlan);
studyPlanRouter.post('/generate', setExamDateAndGenerate);
