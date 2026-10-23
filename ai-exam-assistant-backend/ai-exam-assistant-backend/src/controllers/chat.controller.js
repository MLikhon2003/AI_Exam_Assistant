import { asyncHandler } from '../utils/asyncHandler.js';
import { chatReply } from '../services/aiService.js';
import { insertChatMessage, getChatHistory } from '../models/chat.model.js';
import { getSessionById } from '../models/session.model.js';

export const getHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const messages = await getChatHistory(sessionId);
  res.json({ messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const session = await getSessionById(sessionId);
  if (!session || session.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  await insertChatMessage({ sessionId, userId: req.user.id, role: 'user', message });

  const history = await getChatHistory(sessionId);
  const reply = await chatReply({ topic: session.topic, history, message });

  const saved = await insertChatMessage({ sessionId, userId: req.user.id, role: 'ai', message: reply });

  res.json({ reply: saved });
});
