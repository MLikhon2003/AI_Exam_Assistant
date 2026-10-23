// Mock data layer.
// In the real system (see SRS section 7 — AI Service Layer), this data would
// come from the Node.js/Express REST API, which itself talks to the
// OpenAI/Gemini AI service layer. Every exported value here is shaped the
// way the real API responses are expected to look, so swapping in real
// `fetch()` calls later is a drop-in replacement — see src/data/api.js.

export const mockUser = {
  name: 'Amara Khan',
  initials: 'AK',
  email: 'amara.k@nubt.edu.bd',
  joined: 'Mar 2026',
  examSubject: 'Data Structures',
  examDate: 'June 29, 2026',
  examDaysLeft: 9,
};

export const mockStats = {
  sessionsCompleted: 24,
  sessionsDeltaLabel: '↑ 4 this week',
  averageScore: 76,
  averageScoreDeltaLabel: '↑ 6% vs last week',
  studyStreak: 12,
  weakTopicsCount: 3,
};

// FR-19 — accuracy trend, last 8 sessions
export const accuracyTrend = [45, 53, 50, 63, 60, 72, 76, 80];

// FR-20 — weak areas identified from session history
export const weakTopics = [
  { topic: 'Dynamic Programming', score: 42 },
  { topic: 'Graph Traversal', score: 58 },
  { topic: 'Hash Tables', score: 61 },
  { topic: 'Binary Search', score: 91 },
];

// FR-18 — recent practice sessions
export const recentSessions = [
  { topic: 'Dynamic Programming — Knapsack', type: 'MCQ', score: 58, tone: 'clay', date: 'Jun 20' },
  { topic: 'Binary Search Trees', type: 'Short answer', score: 88, tone: 'sage', date: 'Jun 19' },
  { topic: 'Graph Traversal — BFS/DFS', type: 'Mixed', score: 61, tone: 'clay', date: 'Jun 18' },
  { topic: 'Hash Tables', type: 'True/False', score: 74, tone: 'amber', date: 'Jun 17' },
  { topic: 'Sorting Algorithms', type: 'MCQ', score: 92, tone: 'sage', date: 'Jun 15' },
];

// UC-02 — sample generated practice question (would come from POST /sessions/generate)
export const sampleQuestion = {
  index: 3,
  total: 8,
  topic: 'Dynamic Programming',
  difficulty: 'Medium',
  prompt:
    'Given the 0/1 Knapsack problem, what is the time complexity of the standard dynamic programming solution using a 2D table, where n is the number of items and W is the knapsack capacity?',
  options: [
    { id: 'a', label: 'O(n + W)' },
    { id: 'b', label: 'O(n log W)' },
    { id: 'c', label: 'O(n × W)' },
    { id: 'd', label: 'O(2ⁿ)' },
  ],
  correctOptionId: 'c',
};

// FR-16 — AI feedback returned after an incorrect submission
export const sampleFeedback = {
  correct: false,
  headline: "Not quite — here's why",
  explanation:
    'The DP table has n rows and W columns, and each of the n × W cells is filled in constant time. That makes the total work proportional to n × W — not n log W, which would suggest a sorting or binary-search step that is not part of this approach.',
  tip: 'Review tip: this is called pseudo-polynomial time, since it depends on the numeric value of W, not just the count of items.',
};

// UC-06 — AI study chatbot seed conversation
export const initialChatMessages = [
  { role: 'ai', text: "Hi Amara — I'm here if any of these DP questions need a second explanation. What's on your mind?" },
  { role: 'user', text: 'Why is it n×W and not just n?' },
  { role: 'ai', text: "Because the algorithm doesn't just look at items once — it builds a table checking every possible weight from 0 to W for every item. So both dimensions matter to the runtime." },
];

// UC-05 — personalized study plan, day-by-day
export const studyPlan = {
  examDate: 'Jun 29, 2026',
  focusTags: [
    { label: 'Dynamic Programming — heavy focus', tone: 'clay', icon: '🔴' },
    { label: 'Graph Traversal — heavy focus', tone: 'clay', icon: '🔴' },
    { label: 'Hash Tables — light review', tone: 'amber', icon: '🟡' },
  ],
  timeline: [
    { day: 1, status: 'done', date: 'TODAY · JUN 20', title: 'Dynamic Programming — Knapsack basics', meta: 'Completed · Scored 58%' },
    { day: 2, status: 'next', date: 'TOMORROW · JUN 21', title: 'Dynamic Programming — LCS & edit distance', meta: '12 questions · ~25 min · High priority' },
    { day: 3, status: 'upcoming', date: 'JUN 22', title: 'Graph Traversal — BFS & DFS', meta: '10 questions · ~20 min · High priority' },
    { day: 4, status: 'upcoming', date: 'JUN 23', title: 'Hash Tables — collision handling', meta: '6 questions · ~12 min · Light review' },
    { day: 5, status: 'upcoming', date: 'JUN 24 — JUN 28', title: 'Mixed review + full mock exam', meta: 'Auto-generated from all topics, weighted by latest scores' },
  ],
};

// UC-10/11/12 — admin panel data
export const adminStats = {
  registeredStudents: 1204,
  sessionsToday: 312,
  aiCallsLast24h: 5860,
  failedAiCalls: 7,
};

export const adminAccounts = [
  { name: 'Amara Khan', sessions: 24, status: 'Active' },
  { name: 'Rafiul Islam', sessions: 9, status: 'Active' },
  { name: 'Nusrat Jahan', sessions: 0, status: 'Suspended' },
];

export const adminErrorLogs = [
  { code: 503, message: 'OpenAI timeout — /sessions/generate' },
  { code: 503, message: 'Gemini fallback triggered — /chat' },
];

export const notificationDefaults = {
  studyReminders: true,
  examCountdownAlerts: true,
  streakAlerts: false,
};
