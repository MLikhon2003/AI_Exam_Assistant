import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getOverview, updateAccountStatus, removeAccount } from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/overview', getOverview);
adminRouter.put('/accounts/:userId/status', updateAccountStatus);
adminRouter.delete('/accounts/:userId', removeAccount);
