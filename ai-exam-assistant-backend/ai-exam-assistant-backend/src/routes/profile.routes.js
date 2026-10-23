import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, updateNotifications } from '../controllers/profile.controller.js';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.put('/notifications', updateNotifications);
