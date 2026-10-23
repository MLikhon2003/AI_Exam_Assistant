# AI Exam Assistant — Backend API

Node.js + Express + PostgreSQL backend for the AI Exam Assistant (CSE4204-8B-T05),
implementing FR-01–FR-35 and the AI-provider abstraction from the SRS (NFR-17).

## Folder structure

```
ai-exam-assistant-backend/
├── package.json
├── .env.example        # copy to .env and fill in real values
├── .gitignore
├── server.js           # starts the HTTP server
├── uploads/             # temporary storage for uploaded PDFs (FR-08)
└── src/
    ├── app.js            # Express app: middleware + route mounting
    ├── config/
    │   └── env.js          # reads all environment variables in one place
    ├── db/
    │   ├── schema.sql       # every table (run via db:migrate)
    │   ├── pool.js          # PostgreSQL connection pool
    │   └── migrate.js       # applies schema.sql
    ├── utils/
    │   ├── jwt.js            # sign/verify tokens (NFR-08)
    │   ├── password.js       # bcrypt hash/compare (NFR-07)
    │   └── asyncHandler.js   # wraps async routes so errors reach errorHandler
    ├── middleware/
    │   ├── auth.js           # requireAuth / requireAdmin
    │   ├── errorHandler.js   # central error + 404 handling (NFR-12)
    │   └── upload.js         # multer config for PDF uploads (FR-08)
    ├── services/
    │   ├── aiService.js       # OpenAI/Gemini abstraction (NFR-17) — the AI "brain"
    │   ├── pdfService.js      # pdf-parse text extraction
    │   └── studyPlanService.js # day-by-day schedule builder (FR-24, FR-25)
    ├── models/               # one file per DB table — raw SQL queries only
    │   ├── user.model.js
    │   ├── session.model.js
    │   ├── question.model.js
    │   ├── answer.model.js
    │   ├── topicPerformance.model.js
    │   ├── studyPlan.model.js
    │   ├── chat.model.js
    │   ├── notification.model.js
    │   ├── streak.model.js
    │   ├── aiErrorLog.model.js
    │   └── admin.model.js
    ├── controllers/          # business logic — calls models + services
    │   ├── auth.controller.js
    │   ├── sessions.controller.js
    │   ├── dashboard.controller.js
    │   ├── studyPlan.controller.js
    │   ├── chat.controller.js
    │   ├── profile.controller.js
    │   └── admin.controller.js
    └── routes/                # URL → controller mapping
        ├── index.js             # mounts every router under /api
        ├── auth.routes.js
        ├── sessions.routes.js
        ├── dashboard.routes.js
        ├── studyPlan.routes.js
        ├── chat.routes.js
        ├── profile.routes.js
        └── admin.routes.js
```

**Request flow, top to bottom:**
`server.js` → `src/app.js` (Express + CORS + JSON parsing) → `src/routes/*`
(matches the URL) → `src/middleware/auth.js` (checks the JWT) →
`src/controllers/*` (the actual logic) → `src/models/*` (SQL) and/or
`src/services/*` (AI calls, PDF parsing, plan-building).

## Where each thing lives — quick answers

- **Change a table's columns?** → `src/db/schema.sql`, then re-run `npm run db:migrate`.
- **Change how a query works?** → the matching file in `src/models/`.
- **Change what an endpoint does?** → the matching file in `src/controllers/`.
- **Add a new URL?** → add it in the right `src/routes/*.routes.js` file, and make
  sure it's mounted in `src/routes/index.js`.
- **Switch AI providers (OpenAI ↔ Gemini)?** → change `AI_PROVIDER` in `.env`.
  Nothing else needs to change — every controller only calls
  `generateQuestions()`, `evaluateAnswer()`, `chatReply()` from `aiService.js`.
- **Add a new environment variable?** → add it to `.env.example`, read it in
  `src/config/env.js`, then use `env.yourNewValue` anywhere else.

## Endpoints (all mounted under `/api`)

| Method | Path | Auth | Maps to |
|---|---|---|---|
| POST | `/auth/register` | – | FR-01 |
| POST | `/auth/login` | – | FR-02, FR-03 |
| GET | `/auth/me` | ✔ | current user |
| POST | `/auth/logout` | ✔ | logout (see note below) |
| POST | `/sessions/generate` | ✔ | FR-07–FR-12 (multipart form, field `notes` for PDF) |
| GET | `/sessions/:sessionId` | ✔ | fetch a session + its questions |
| POST | `/sessions/questions/:questionId/answer` | ✔ | FR-13–FR-17 |
| POST | `/sessions/:sessionId/complete` | ✔ | close out a session, update streak |
| GET | `/dashboard` | ✔ | FR-18–FR-22 |
| GET | `/study-plan` | ✔ | FR-27 |
| POST | `/study-plan/generate` | ✔ | FR-23–FR-26 |
| GET | `/chat/:sessionId` | ✔ | FR-31 |
| POST | `/chat/:sessionId` | ✔ | FR-28–FR-30, UC-06 |
| GET | `/profile` | ✔ | FR-04 |
| PUT | `/profile` | ✔ | FR-04 |
| PUT | `/profile/notifications` | ✔ | FR-35 |
| GET | `/admin/overview` | ✔ (admin) | UC-10 |
| PUT | `/admin/accounts/:userId/status` | ✔ (admin) | UC-11 |
| DELETE | `/admin/accounts/:userId` | ✔ (admin) | UC-11 |

`✔` = send `Authorization: Bearer <token>` header, using the token returned
from `/auth/login` or `/auth/register`.

## Running it

```bash
# 1. Create the database (PostgreSQL must be installed and running)
createdb ai_exam_assistant

# 2. Install dependencies
npm install

# 3. Set up your environment
cp .env.example .env
# then edit .env — set DATABASE_URL, JWT_SECRET, and OPENAI_API_KEY (or GEMINI_API_KEY)

# 4. Create the tables
npm run db:migrate

# 5. Start the server
npm run dev
# → http://localhost:5000  (health check: GET /health)
```

## Connecting the React frontend

In the frontend project, open `src/data/api.js` and replace each mock
function's body with a real `fetch()` call to `http://localhost:5000/api/...`.
The function names and what they return are already designed to match this
backend's responses, so no page or component code needs to change — for
example:

```js
// src/data/api.js (frontend)
const BASE_URL = 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error };
  localStorage.setItem('token', data.token);
  return { ok: true, user: data.user };
}

export async function fetchDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`, { headers: authHeaders() });
  return res.json();
}
```

Do this for every function in `api.js` (`register`, `generateQuestions`,
`submitAnswer`, `fetchChatHistory`, `sendChatMessage`, `fetchStudyPlan`,
`setExamDate`, `fetchProfile`, `saveProfile`, `saveNotificationPreferences`,
`fetchAdminOverview`), matching them to the endpoint table above.

Also set `CORS_ORIGIN` in the backend's `.env` to match wherever the React
dev server runs (default `http://localhost:5173`).

## Logout

`POST /auth/logout` exists mainly for symmetry with `login`/`register` — since
auth uses stateless JWTs, there's no server-side session to destroy. The real
logout work happens on the frontend (deleting the stored token from
`localStorage`, in `src/data/api.js` -> `logoutClient()`), which is what
actually prevents the browser from making further authenticated requests.
This endpoint is a natural place to add token revocation/blacklisting later
if that's ever needed, without changing how the frontend calls it.

## Notes on what's real vs. simplified

- **Real**: JWT auth, bcrypt password hashing, PostgreSQL schema and queries,
  PDF text extraction, the OpenAI/Gemini provider abstraction, MCQ/true-false
  auto-grading, weak-topic tracking, streak logic, admin account management.
- **Simplified for a one-semester course project**: no email verification or
  password-reset flow, no rate limiting, no background job/cron for sending
  actual push notifications (FR-32–FR-34 store preferences and update the
  streak, but don't send emails/SMS — wiring that up would mean adding a job
  scheduler like `node-cron` plus an email/SMS provider).
