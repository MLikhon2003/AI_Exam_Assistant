import { asyncHandler } from '../utils/asyncHandler.js';
import { countRegisteredStudents, countSessionsToday, listAccounts, setAccountStatus, deleteAccount } from '../models/admin.model.js';
import { getRecentAiErrors, countAiCallsLast24h, countFailedAiCallsLast24h } from '../models/aiErrorLog.model.js';

export const getOverview = asyncHandler(async (req, res) => {
  const [registeredStudents, sessionsToday, aiCallsLast24h, failedAiCalls, accounts, errorLogs] = await Promise.all([
    countRegisteredStudents(),
    countSessionsToday(),
    countAiCallsLast24h(),
    countFailedAiCallsLast24h(),
    listAccounts(20),
    getRecentAiErrors(10),
  ]);

  res.json({
    stats: { registeredStudents, sessionsToday, aiCallsLast24h, failedAiCalls },
    accounts,
    errorLogs,
  });
});

export const updateAccountStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "active" or "suspended".' });
  }
  const account = await setAccountStatus(userId, status);
  res.json({ account });
});

export const removeAccount = asyncHandler(async (req, res) => {
  await deleteAccount(req.params.userId);
  res.status(204).send();
});
