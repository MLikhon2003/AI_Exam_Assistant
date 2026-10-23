// The backend returns raw PostgreSQL rows (snake_case columns, ISO dates).
// These helpers translate that shape into what the UI components expect,
// so pages don't need to know about the database's column names.

export function normalizeUser(u) {
  if (!u) return u;
  const initials = (u.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const examDateObj = u.exam_date ? new Date(u.exam_date) : null;
  const examDaysLeft = examDateObj
    ? Math.max(0, Math.ceil((examDateObj - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    ...u,
    initials: initials || 'ST',
    examSubject: u.exam_subject || 'Not set yet',
    examDate: examDateObj
      ? examDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Not set yet',
    examDateRaw: u.exam_date || '',
    examDaysLeft: examDaysLeft ?? null,
    joined: u.created_at
      ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '',
  };
}

export function normalizeNotifications(n) {
  if (!n) return { studyReminders: true, examCountdownAlerts: true, streakAlerts: false };
  return {
    studyReminders: n.study_reminders,
    examCountdownAlerts: n.exam_countdown_alerts,
    streakAlerts: n.streak_alerts,
  };
}
