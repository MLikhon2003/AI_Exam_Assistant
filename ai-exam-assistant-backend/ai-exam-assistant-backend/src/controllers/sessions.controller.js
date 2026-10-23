import { asyncHandler } from '../utils/asyncHandler.js';
import { extractTextFromPdf, deleteUploadedFile } from '../services/pdfService.js';
import { generateQuestions as aiGenerateQuestions, evaluateAnswer } from '../services/aiService.js';
import { createSession, getSessionById, completeSession } from '../models/session.model.js';
import { insertQuestions, getQuestionById, getQuestionsBySession } from '../models/question.model.js';
import { insertAnswer, getAnswersBySession } from '../models/answer.model.js';
import { upsertTopicPerformance } from '../models/topicPerformance.model.js';
import { touchStreak } from '../models/streak.model.js';

export const generate = asyncHandler(async (req, res) => {
  const { topic, questionType, difficulty, count } = req.body;
  let sourceText = null;

  if (req.file) {
    sourceText = await extractTextFromPdf(req.file.path);
    await deleteUploadedFile(req.file.path);
  }

  if (!topic && !sourceText) {
    return res.status(400).json({ error: 'Provide a topic or upload notes.' });
  }

  const session = await createSession({
    userId: req.user.id,
    topic: topic || 'Uploaded notes',
    sourceText,
    questionType,
    difficulty,
    count: Number(count) || 8,
  });

  const generated = await aiGenerateQuestions({
    topic: session.topic,
    sourceText,
    questionType,
    difficulty,
    count: session.question_count,
  });

  const questions = await insertQuestions(session.id, generated);
  const safeQuestions = questions.map(({ correct_option_id, model_answer, ...q }) => q);

  res.status(201).json({ session, questions: safeQuestions });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await getSessionById(req.params.sessionId);
  if (!session || session.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  const questions = await getQuestionsBySession(session.id);
  const safeQuestions = questions.map(({ correct_option_id, model_answer, ...q }) => q);
  res.json({ session, questions: safeQuestions });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { submittedText } = req.body;

  const question = await getQuestionById(questionId);
  if (!question) return res.status(404).json({ error: 'Question not found.' });

  const session = await getSessionById(question.session_id);
  if (!session || session.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your session.' });
  }

  const result = await evaluateAnswer({ question, submittedText });

  const answer = await insertAnswer({
    questionId,
    userId: req.user.id,
    submittedText,
    isCorrect: result.isCorrect,
    score: result.score,
    feedback: { headline: result.headline, body: result.body, tip: result.tip },
  });

  await upsertTopicPerformance(req.user.id, session.topic, result.isCorrect);

  res.json({
    feedback: { correct: result.isCorrect, headline: result.headline, explanation: result.body, tip: result.tip },
    answer,
  });
});

export const completeSessionHandler = asyncHandler(async (req, res) => {
  const session = await getSessionById(req.params.sessionId);
  if (!session || session.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  const answers = await getAnswersBySession(session.id);
  const avgScore = answers.length
    ? answers.reduce((sum, a) => sum + Number(a.score), 0) / answers.length
    : 0;

  const updated = await completeSession(session.id, avgScore.toFixed(2));
  await touchStreak(req.user.id);

  res.json({ session: updated });
});
