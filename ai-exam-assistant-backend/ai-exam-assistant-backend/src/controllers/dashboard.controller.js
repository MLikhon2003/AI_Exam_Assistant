import { asyncHandler } from '../utils/asyncHandler.js';
import { getRecentSessions, getAccuracyTrend, countCompletedSessions, averageScore } from '../models/session.model.js';
import { getWeakTopics } from '../models/topicPerformance.model.js';
import { getStreak } from '../models/streak.model.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [sessionsCompleted, avgScore, accuracyTrend, weakTopics, recentSessions, streak] = await Promise.all([
    countCompletedSessions(userId),
    averageScore(userId),
    getAccuracyTrend(userId, 8),
    getWeakTopics(userId, 4),
    getRecentSessions(userId, 5),
    getStreak(userId),
  ]);

  res.json({
    stats: {
      sessionsCompleted,
      averageScore: avgScore,
      studyStreak: streak?.current_streak || 0,
      weakTopicsCount: weakTopics.filter((t) => t.accuracy_percent < 70).length,
    },
    accuracyTrend,
    weakTopics,
    recentSessions,
  });
});
