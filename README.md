# AI Exam Assistant

An intelligent exam preparation and study assistant web application built with a modern React.js frontend, an Express/Node.js backend, and live AI integration powered by Groq (with support for OpenAI and Gemini).

---

## 🌟 Key Features

- **Topic-Based Practice**: Generate exam-grade practice questions on demand for any topic (MCQ, Short Answer, True/False, or Mixed).
- **Instant AI Feedback**: Real-time evaluation of answers with plain-English conceptual explanations and high-yield exam tips.
- **AI Study Tutor Chatbot**: Dedicated in-session chatbot providing contextual explanations and clarifying doubts.
- **Dynamic Study Plan**: Day-by-day exam schedule that adapts and re-weights toward weak topics.
- **Performance Analytics**: Visual tracking of accuracy trends, weak topic breakdown, and study streaks.
- **Admin Usage Dashboard**: Real-time platform health monitoring, account management, and error logging.

---

## 🏗️ Repository Architecture

```
AI_Exam_Assistant/
├── ai-exam-assistant/                # React.js + Vite Frontend
│   ├── src/
│   │   ├── components/              # Sidebar, StudentLayout, AdminLayout, Charts
│   │   ├── context/                 # AppContext (auth & user state)
│   │   ├── data/                    # API service layer (Groq AI engine + mock fallback)
│   │   ├── pages/                   # Landing, Login, Register, Dashboard, Practice, etc.
│   │   └── utils/                   # Data adapters and helpers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── ai-exam-assistant-backend/        # Node.js + Express Backend
    └── ai-exam-assistant-backend/
        ├── src/
        │   ├── config/              # Environment config
        │   ├── controllers/         # Business logic for auth, sessions, study plan, etc.
        │   ├── db/                  # PostgreSQL pool, schema, and migration runner
        │   ├── middleware/          # JWT authentication, error handling, file uploads
        │   ├── models/              # PostgreSQL data models
        │   ├── routes/              # Express API route declarations
        │   └── services/            # Groq, OpenAI, Gemini, and PDF parsing services
        ├── server.js
        └── package.json
```

---

## 🚀 Quick Start

### 1. Frontend (React + Vite)

```bash
cd ai-exam-assistant

# 1. Install dependencies
npm install

# 2. Configure environment (copy and edit)
cp .env.example .env
# Set VITE_GROQ_API_KEY=your_groq_api_key_here

# 3. Start development server
npm run dev
# Running on http://localhost:5173
```

### 2. Backend (Node.js + Express + PostgreSQL)

```bash
cd ai-exam-assistant-backend/ai-exam-assistant-backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, and GROQ_API_KEY

# 3. Run migrations (requires running PostgreSQL)
npm run db:migrate

# 4. Start the server
npm run dev
# Running on http://localhost:5000
```

---

## ⚡ AI Provider Configuration

The application uses Groq for ultra-fast, real-time question generation and tutoring:
- **Provider**: `groq`
- **Supported Models**: `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`, etc.
- Also compatible with OpenAI (`gpt-4o`) and Google Gemini (`gemini-1.5-pro`).