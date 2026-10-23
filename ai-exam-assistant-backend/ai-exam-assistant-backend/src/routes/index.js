import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { sessionsRouter } from './sessions.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { studyPlanRouter } from './studyPlan.routes.js';
import { chatRouter } from './chat.routes.js';
import { profileRouter } from './profile.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/study-plan', studyPlanRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/admin', adminRouter);
