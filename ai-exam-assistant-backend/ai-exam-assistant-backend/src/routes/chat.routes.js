import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getHistory, sendMessage } from '../controllers/chat.controller.js';

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.get('/:sessionId', getHistory);
chatRouter.post('/:sessionId', sendMessage);
