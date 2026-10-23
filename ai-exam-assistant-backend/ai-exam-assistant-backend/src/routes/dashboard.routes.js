import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', requireAuth, getDashboard);
