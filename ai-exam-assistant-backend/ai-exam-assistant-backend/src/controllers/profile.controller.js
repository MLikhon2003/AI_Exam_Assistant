import { asyncHandler } from '../utils/asyncHandler.js';
import { findUserById, updateUserProfile } from '../models/user.model.js';
import { getNotificationPreferences, updateNotificationPreferences } from '../models/notification.model.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  const notifications = await getNotificationPreferences(req.user.id);
  res.json({ user, notifications });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, examSubject, examDate } = req.body;
  const user = await updateUserProfile(req.user.id, { name, email, examSubject, examDate });
  res.json({ user });
});

export const updateNotifications = asyncHandler(async (req, res) => {
  const { studyReminders, examCountdownAlerts, streakAlerts } = req.body;
  const notifications = await updateNotificationPreferences(req.user.id, {
    studyReminders,
    examCountdownAlerts,
    streakAlerts,
  });
  res.json({ notifications });
});
