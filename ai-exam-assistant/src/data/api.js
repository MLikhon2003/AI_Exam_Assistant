// API service layer — talks to the Node.js/Express backend when available,
// with direct Groq AI integration (when GROQ_API_KEY is configured)
// and seamless interactive local fallback.

import {
  mockUser as initialMockUser,
  mockStats,
  accuracyTrend as initialAccuracyTrend,
  weakTopics as initialWeakTopics,
  recentSessions as initialRecentSessions,
  sampleFeedback,
  initialChatMessages,
  studyPlan as initialStudyPlan,
  adminStats as initialAdminStats,
  adminAccounts as initialAdminAccounts,
  adminErrorLogs as initialAdminErrorLogs,
  notificationDefaults,
} from './mockData.js';

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const GROQ_API_KEY = import.meta.env?.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = import.meta.env?.VITE_GROQ_MODEL || 'openai/gpt-oss-20b';

// Remember backend offline state so console is not flooded with ERR_CONNECTION_REFUSED
let backendAvailable = localStorage.getItem('ai_exam_backend_offline') === 'true' ? false : null;

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  let data = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }
  if (!res.ok) {
    return { ok: false, error: data.error || `Request failed (${res.status}).` };
  }
  return { ok: true, ...data };
}

// Attempts network fetch to backend. Returns response or null if network error / offline.
async function safeFetch(url, options = {}) {
  if (backendAvailable === false && !options._force) {
    return null; // backend already known to be offline
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    backendAvailable = true;
    localStorage.removeItem('ai_exam_backend_offline');
    return res;
  } catch {
    if (backendAvailable !== false) {
      console.info(
        `%c[AI Exam Assistant]%c Backend offline. Operating in client mode with live Groq AI engine.`,
        'color: #e8a33d; font-weight: bold;',
        'color: inherit;'
      );
      backendAvailable = false;
      localStorage.setItem('ai_exam_backend_offline', 'true');
    }
    return null;
  }
}

// -------------------------------------------------------------
// Direct Groq AI Service Helper (Super-fast inference with Llama/GPT-OSS)
// -------------------------------------------------------------
async function callGroqDirect(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      console.warn('Groq API response status:', res.status);
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    try {
      return JSON.parse(rawContent);
    } catch {
      const stripped = rawContent.replace(/```json|```/g, '').trim();
      return JSON.parse(stripped);
    }
  } catch (err) {
    console.warn('Groq direct call error:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Interactive Mock Data Store (stored in localStorage for persistence)
// -------------------------------------------------------------
const STORAGE_PREFIX = 'ai_exam_';

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

function getMockUser() {
  return getStored('user', {
    id: 1,
    name: initialMockUser.name,
    email: initialMockUser.email,
    role: 'student',
    exam_subject: initialMockUser.examSubject,
    exam_date: '2026-06-29',
    created_at: new Date('2026-03-01').toISOString(),
  });
}

// ---------- Auth (FR-01, FR-02, FR-03) ----------
export async function login(email, password) {
  const res = await safeFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res) {
    const result = await handle(res);
    if (result.ok) localStorage.setItem('token', result.token);
    return result;
  }

  // Client Fallback
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  const isAdmin = email.toLowerCase().includes('admin');
  const user = {
    id: isAdmin ? 99 : 1,
    name: isAdmin ? 'Platform Administrator' : (email.split('@')[0] || 'Amara Khan'),
    email,
    role: isAdmin ? 'admin' : 'student',
    exam_subject: 'Data Structures',
    exam_date: '2026-06-29',
    created_at: new Date().toISOString(),
  };

  setStored('user', user);
  const token = 'mock-jwt-token-' + Date.now();
  localStorage.setItem('token', token);
  return { ok: true, token, user };
}

export async function register(name, email, password) {
  const res = await safeFetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (res) {
    const result = await handle(res);
    if (result.ok) localStorage.setItem('token', result.token);
    return result;
  }

  // Client Fallback
  if (!name || !email || !password) {
    return { ok: false, error: 'Name, email and password are required.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const isAdmin = email.toLowerCase().includes('admin');
  const user = {
    id: Date.now(),
    name,
    email,
    role: isAdmin ? 'admin' : 'student',
    exam_subject: 'Data Structures',
    exam_date: '2026-06-29',
    created_at: new Date().toISOString(),
  };

  setStored('user', user);
  const token = 'mock-jwt-token-' + Date.now();
  localStorage.setItem('token', token);
  return { ok: true, token, user };
}

// FR-05 — logout
export async function logoutClient() {
  await safeFetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
  });
  localStorage.removeItem('token');
}

// ---------- Dashboard (FR-18–FR-22) ----------
export async function fetchDashboard() {
  const res = await safeFetch(`${BASE_URL}/dashboard`, { headers: authHeaders() });
  if (res) return handle(res);

  // Client Fallback
  const sessions = getStored('recentSessions', [
    { id: '1', topic: 'Dynamic Programming — Knapsack', question_type: 'mcq', score_percent: 58, completed_at: '2026-06-20T10:00:00Z' },
    { id: '2', topic: 'Binary Search Trees', question_type: 'short_answer', score_percent: 88, completed_at: '2026-06-19T14:30:00Z' },
    { id: '3', topic: 'Graph Traversal — BFS/DFS', question_type: 'mixed', score_percent: 61, completed_at: '2026-06-18T09:15:00Z' },
    { id: '4', topic: 'Hash Tables', question_type: 'true_false', score_percent: 74, completed_at: '2026-06-17T16:00:00Z' },
    { id: '5', topic: 'Sorting Algorithms', question_type: 'mcq', score_percent: 92, completed_at: '2026-06-15T11:45:00Z' },
  ]);

  const streak = getStored('streak', mockStats.studyStreak);

  return {
    ok: true,
    stats: {
      sessionsCompleted: sessions.length,
      averageScore: Math.round(
        sessions.reduce((acc, s) => acc + Number(s.score_percent || 0), 0) / (sessions.length || 1)
      ),
      studyStreak: streak,
      weakTopicsCount: 3,
    },
    accuracyTrend: initialAccuracyTrend,
    weakTopics: [
      { topic: 'Dynamic Programming', accuracy_percent: 42 },
      { topic: 'Graph Traversal', accuracy_percent: 58 },
      { topic: 'Hash Tables', accuracy_percent: 61 },
      { topic: 'Binary Search', accuracy_percent: 91 },
    ],
    recentSessions: sessions,
  };
}

// ---------- Sessions / Question generation (FR-07–FR-12) ----------
export async function generateQuestions(config) {
  const formData = new FormData();
  formData.append('topic', config.topic || '');
  formData.append('questionType', config.questionType);
  formData.append('difficulty', config.difficulty);
  formData.append('count', config.count);
  if (config.file) formData.append('notes', config.file);

  const res = await safeFetch(`${BASE_URL}/sessions/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (res) return handle(res);

  const count = Number(config.count) || 5;
  const topic = config.topic || (config.file ? 'Uploaded Document Notes' : 'Computer Science');
  const sessionId = 'session_' + Date.now();
  const qType = config.questionType || 'mcq';
  const difficulty = config.difficulty || 'medium';

  // 1. Try Live Groq AI Generation
  let liveQuestions = null;
  if (GROQ_API_KEY) {
    const isShort = qType === 'short_answer';
    const systemPrompt =
      'You are a premier university exam creator. Generate realistic, challenging exam practice questions. ' +
      'Always respond strictly in valid JSON format matching this schema: ' +
      (isShort
        ? '{ "questions": [ { "prompt": string, "explanation": string, "model_answer": string } ] }'
        : '{ "questions": [ { "prompt": string, "options": [ { "id": "a", "label": string }, { "id": "b", "label": string }, { "id": "c", "label": string }, { "id": "d", "label": string } ], "correctOptionId": "a"|"b"|"c"|"d", "explanation": string } ] }');

    const userPrompt = `Generate ${count} ${difficulty} level questions for exam topic: "${topic}". Question format: ${qType}. Output JSON only.`;
    const groqResult = await callGroqDirect(systemPrompt, userPrompt);
    if (groqResult?.questions && Array.isArray(groqResult.questions) && groqResult.questions.length > 0) {
      liveQuestions = groqResult.questions.map((q, idx) => ({
        id: `q_${sessionId}_${idx + 1}`,
        session_id: sessionId,
        prompt: q.prompt,
        question_type: isShort ? 'short_answer' : (q.options?.length === 2 ? 'true_false' : 'mcq'),
        options: isShort ? undefined : q.options,
        correctOptionId: q.correctOptionId || 'b',
        explanation: q.explanation || q.model_answer || 'Correct solution based on course concepts.',
      }));
    }
  }

  // 2. Fallback template questions if Groq is offline or unavailable
  const generatedQuestions = liveQuestions || [
    {
      id: `q_${sessionId}_1`,
      session_id: sessionId,
      prompt: `In ${topic}, what is the primary computational benefit of memoization and dynamic programming?`,
      question_type: 'mcq',
      options: [
        { id: 'a', label: 'Guarantees O(1) space complexity across all executions' },
        { id: 'b', label: 'Eliminates redundant recalculations of overlapping subproblems' },
        { id: 'c', label: 'Transforms any recursive function directly into a greedy choice' },
        { id: 'd', label: 'Avoids the requirement for terminating base cases' },
      ],
      correctOptionId: 'b',
      explanation: 'Memoization stores computed results of overlapping subproblems to prevent exponential recomputations.',
    },
    {
      id: `q_${sessionId}_2`,
      session_id: sessionId,
      prompt: `When formulating a recurrence relation for ${topic}, what defines an optimal state representation?`,
      question_type: 'mcq',
      options: [
        { id: 'a', label: 'A state that stores the full history of all prior function calls' },
        { id: 'b', label: 'The minimal set of parameters that uniquely identify a subproblem' },
        { id: 'c', label: 'A global array initialized to infinity' },
        { id: 'd', label: 'An auxiliary stack used only during backtracking' },
      ],
      correctOptionId: 'b',
      explanation: 'A state must be minimal yet sufficient to make future decisions independently of past steps.',
    },
  ];

  setStored(`session_q_${sessionId}`, generatedQuestions);
  setStored(`active_session_topic_${sessionId}`, topic);

  return {
    ok: true,
    session: {
      id: sessionId,
      topic,
      question_count: generatedQuestions.length,
      difficulty,
    },
    questions: generatedQuestions.map(({ correctOptionId, ...q }) => q),
  };
}

// ---------- Answers / feedback (FR-13–FR-17) ----------
export async function submitAnswer(questionId, submittedText) {
  const res = await safeFetch(`${BASE_URL}/sessions/questions/${questionId}/answer`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ submittedText }),
  });

  if (res) {
    const result = await handle(res);
    if (!result.ok) return result;
    return {
      ok: true,
      feedback: {
        correct: result.feedback.correct,
        headline: result.feedback.headline,
        explanation: result.feedback.explanation,
        tip: result.feedback.tip,
      },
    };
  }

  // Find question in local storage
  let matchedQuestion = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX + 'session_q_')) {
      const qs = getStored(key.replace(STORAGE_PREFIX, ''), []);
      const found = qs.find((q) => q.id === questionId);
      if (found) {
        matchedQuestion = found;
        break;
      }
    }
  }

  // 1. Live Groq evaluation if available
  if (GROQ_API_KEY && matchedQuestion) {
    const isShort = matchedQuestion.question_type === 'short_answer';
    const systemPrompt =
      'You are a supportive, rigorous university grader. Evaluate the student response. ' +
      'Respond strictly in JSON: { "correct": boolean, "headline": string, "explanation": string, "tip": string }';
    const userPrompt = `Question: "${matchedQuestion.prompt}"
Expected Answer/Concept: "${matchedQuestion.explanation}"
Student Answer: "${submittedText}"
Evaluate whether the student's answer is correct or conceptually sound. Provide an encouraging headline, thorough explanation, and a high-yield exam tip.`;

    const groqEval = await callGroqDirect(systemPrompt, userPrompt);
    if (groqEval) {
      return { ok: true, feedback: groqEval };
    }
  }

  // 2. Fallback heuristic grading
  const isCorrect = matchedQuestion
    ? submittedText === matchedQuestion.correctOptionId || submittedText.length > 25
    : submittedText === 'b' || submittedText.length > 25;

  return {
    ok: true,
    feedback: isCorrect
      ? {
          correct: true,
          headline: 'Spot on! Excellent reasoning.',
          explanation:
            matchedQuestion?.explanation ||
            'You correctly identified the key concept and transition rule for this problem.',
          tip: 'Exam tip: Always state the boundary conditions clearly in written exam answers.',
        }
      : {
          correct: false,
          headline: "Not quite — here's why",
          explanation:
            matchedQuestion?.explanation ||
            'Review the state transitions and subproblem dependencies to see why this option fits best.',
          tip: 'Exam tip: Look out for pseudo-polynomial complexities when bounds depend on numerical inputs.',
        },
  };
}

export async function completeSession(sessionId) {
  const res = await safeFetch(`${BASE_URL}/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: authHeaders(),
  });

  if (res) return handle(res);

  const topic = getStored(`active_session_topic_${sessionId}`, 'Live Practice Session');
  const sessions = getStored('recentSessions', []);
  const newSession = {
    id: sessionId,
    topic,
    question_type: 'mcq',
    score_percent: 85,
    completed_at: new Date().toISOString(),
  };
  setStored('recentSessions', [newSession, ...sessions.slice(0, 9)]);
  const currentStreak = getStored('streak', mockStats.studyStreak);
  setStored('streak', currentStreak + 1);

  return { ok: true, session: newSession };
}

// ---------- AI Study Chatbot (FR-28–FR-31, UC-06) ----------
export async function fetchChatHistory(sessionId) {
  const res = await safeFetch(`${BASE_URL}/chat/${sessionId}`, { headers: authHeaders() });
  if (res) {
    const result = await handle(res);
    if (!result.ok) return [];
    return result.messages.map((m) => ({ role: m.role, text: m.message }));
  }

  return getStored(`chat_${sessionId}`, initialChatMessages);
}

export async function sendChatMessage(sessionId, message) {
  const res = await safeFetch(`${BASE_URL}/chat/${sessionId}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message }),
  });

  if (res) {
    const result = await handle(res);
    if (!result.ok) return { role: 'ai', text: "Sorry, I couldn't reach the AI service just now." };
    return { role: 'ai', text: result.reply.message };
  }

  const history = getStored(`chat_${sessionId}`, initialChatMessages);

  // 1. Live Groq response if available
  if (GROQ_API_KEY) {
    const topic = getStored(`active_session_topic_${sessionId}`, 'Computer Science & Algorithms');
    const systemPrompt =
      `You are an interactive, encouraging AI exam tutor helping a student study "${topic}". ` +
      'Explain concepts intuitively with crisp examples. Respond strictly in JSON: { "reply": string }';
    const conversation = history.map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n');
    const userPrompt = `${conversation}\nStudent: ${message}\nTutor:`;

    const groqReply = await callGroqDirect(systemPrompt, userPrompt);
    if (groqReply?.reply) {
      const updated = [
        ...history,
        { role: 'user', text: message },
        { role: 'ai', text: groqReply.reply },
      ];
      setStored(`chat_${sessionId}`, updated);
      return { role: 'ai', text: groqReply.reply };
    }
  }

  // 2. Fallback chatbot logic
  let replyText = `Great question! In this context, focusing on the boundary conditions and state transitions clarifies why the solution holds.`;
  if (/why|how|explain/i.test(message)) {
    replyText = `Because each subproblem depends strictly on previously solved smaller instances. When we tabulate them systematically, we turn what would be exponential recursive recomputations into efficient O(1) table lookups.`;
  } else if (/formula|complexity|runtime/i.test(message)) {
    replyText = `The time complexity is determined by multiplying the total number of states by the work done per state transition.`;
  }

  const updated = [
    ...history,
    { role: 'user', text: message },
    { role: 'ai', text: replyText },
  ];
  setStored(`chat_${sessionId}`, updated);

  return { role: 'ai', text: replyText };
}

// ---------- Study plan (FR-23–FR-27) ----------
export async function fetchStudyPlan() {
  const res = await safeFetch(`${BASE_URL}/study-plan`, { headers: authHeaders() });
  if (res) return handle(res);

  const storedPlan = getStored('studyPlan', {
    plan: {
      exam_date: '2026-06-29T00:00:00Z',
    },
    items: initialStudyPlan.timeline.map((item, idx) => ({
      id: 'plan_item_' + idx,
      status: item.status,
      day_index: item.day,
      scheduled_date: new Date(Date.now() + idx * 86400000).toISOString(),
      title: item.title,
      meta: item.meta,
    })),
  });

  return { ok: true, ...storedPlan };
}

export async function setExamDate(date) {
  const res = await safeFetch(`${BASE_URL}/study-plan/generate`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ examDate: date }),
  });

  if (res) return handle(res);

  const days = [
    { title: 'Dynamic Programming — Core Fundamentals', meta: '10 questions · ~20 min · High priority' },
    { title: 'Graph Traversal — BFS, DFS & Cycles', meta: '12 questions · ~25 min · High priority' },
    { title: 'Binary Search Trees & Balancing', meta: '8 questions · ~15 min · Medium priority' },
    { title: 'Hash Tables & Collision Resolution', meta: '6 questions · ~12 min · Review' },
    { title: 'Comprehensive Mock Exam (Mixed Topics)', meta: 'Full test simulation · 25 questions' },
  ];

  const items = days.map((d, i) => ({
    id: 'item_' + (i + 1),
    status: i === 0 ? 'next' : 'upcoming',
    day_index: i + 1,
    scheduled_date: new Date(Date.now() + i * 86400000).toISOString(),
    title: d.title,
    meta: d.meta,
  }));

  const newPlan = {
    plan: { exam_date: new Date(date).toISOString() },
    items,
  };
  setStored('studyPlan', newPlan);

  const u = getMockUser();
  u.exam_date = new Date(date).toISOString();
  setStored('user', u);

  return { ok: true, ...newPlan };
}

// ---------- Profile / notifications (FR-04, FR-35) ----------
export async function fetchProfile() {
  const res = await safeFetch(`${BASE_URL}/profile`, { headers: authHeaders() });
  if (res) return handle(res);

  return {
    ok: true,
    user: getMockUser(),
    notifications: getStored('notifications', {
      study_reminders: true,
      exam_countdown_alerts: true,
      streak_alerts: false,
    }),
  };
}

export async function saveProfile(fields) {
  const res = await safeFetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(fields),
  });

  if (res) return handle(res);

  const u = getMockUser();
  const updated = {
    ...u,
    name: fields.name || u.name,
    email: fields.email || u.email,
    exam_subject: fields.examSubject || u.exam_subject,
    exam_date: fields.examDate || u.exam_date,
  };
  setStored('user', updated);
  return { ok: true, user: updated };
}

export async function saveNotificationPreferences(prefs) {
  const res = await safeFetch(`${BASE_URL}/profile/notifications`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(prefs),
  });

  if (res) return handle(res);

  const stored = {
    study_reminders: !!prefs.studyReminders,
    exam_countdown_alerts: !!prefs.examCountdownAlerts,
    streak_alerts: !!prefs.streakAlerts,
  };
  setStored('notifications', stored);
  return { ok: true, notifications: stored };
}

// ---------- Admin (UC-10, UC-11, UC-12) ----------
export async function fetchAdminOverview() {
  const res = await safeFetch(`${BASE_URL}/admin/overview`, { headers: authHeaders() });
  if (res) return handle(res);

  const accounts = getStored('adminAccounts', [
    { id: 1, name: 'Amara Khan', sessions: 24, status: 'active' },
    { id: 2, name: 'Rafiul Islam', sessions: 9, status: 'active' },
    { id: 3, name: 'Nusrat Jahan', sessions: 0, status: 'suspended' },
    { id: 4, name: 'Tariq Ahmed', sessions: 15, status: 'active' },
  ]);

  return {
    ok: true,
    stats: initialAdminStats,
    accounts,
    errorLogs: [
      { code: 503, endpoint: '/sessions/generate', message: 'OpenAI timeout (fallback used)' },
      { code: 503, endpoint: '/chat/session_482', message: 'Gemini rate-limit fallback triggered' },
    ],
  };
}

export async function setAccountStatus(userId, status) {
  const res = await safeFetch(`${BASE_URL}/admin/accounts/${userId}/status`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status }),
  });

  if (res) return handle(res);

  const accounts = getStored('adminAccounts', [
    { id: 1, name: 'Amara Khan', sessions: 24, status: 'active' },
    { id: 2, name: 'Rafiul Islam', sessions: 9, status: 'active' },
    { id: 3, name: 'Nusrat Jahan', sessions: 0, status: 'suspended' },
    { id: 4, name: 'Tariq Ahmed', sessions: 15, status: 'active' },
  ]);

  const updated = accounts.map((a) => (a.id === userId ? { ...a, status } : a));
  setStored('adminAccounts', updated);
  return { ok: true };
}
