import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadPdf } from '../middleware/upload.js';
import { generate, getSession, submitAnswer, completeSessionHandler } from '../controllers/sessions.controller.js';

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

sessionsRouter.post('/generate', uploadPdf.single('notes'), generate);
sessionsRouter.get('/:sessionId', getSession);
sessionsRouter.post('/questions/:questionId/answer', submitAnswer);
sessionsRouter.post('/:sessionId/complete', completeSessionHandler);
