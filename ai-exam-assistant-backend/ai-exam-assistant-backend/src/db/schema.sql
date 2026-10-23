-- ============================================================
-- AI Exam Assistant — PostgreSQL schema (covers FR-01–FR-35)
-- Run with: npm run db:migrate
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- FR-01, FR-04, FR-06
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20)  NOT NULL DEFAULT 'student',
  exam_subject    VARCHAR(120),
  exam_date       DATE,
  status          VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FR-35
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  study_reminders         BOOLEAN NOT NULL DEFAULT true,
  exam_countdown_alerts   BOOLEAN NOT NULL DEFAULT true,
  streak_alerts           BOOLEAN NOT NULL DEFAULT false,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FR-07–FR-12
CREATE TABLE IF NOT EXISTS practice_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic           VARCHAR(200) NOT NULL,
  source_text     TEXT,
  question_type   VARCHAR(30) NOT NULL,
  difficulty      VARCHAR(10) NOT NULL,
  question_count  INT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  score_percent   NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- FR-11, FR-12
CREATE TABLE IF NOT EXISTS questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  position          INT NOT NULL,
  prompt            TEXT NOT NULL,
  question_type     VARCHAR(30) NOT NULL,
  options           JSONB,
  correct_option_id VARCHAR(10),
  model_answer      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FR-13–FR-17
CREATE TABLE IF NOT EXISTS answers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id           UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitted_text        TEXT NOT NULL,
  is_correct            BOOLEAN,
  score                 NUMERIC(5,2),
  ai_feedback_headline  VARCHAR(200),
  ai_feedback_body      TEXT,
  ai_feedback_tip       TEXT,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FR-18–FR-22
CREATE TABLE IF NOT EXISTS topic_performance (
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic             VARCHAR(200) NOT NULL,
  attempts          INT NOT NULL DEFAULT 0,
  correct_count     INT NOT NULL DEFAULT 0,
  accuracy_percent  NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic)
);

-- FR-23–FR-27
CREATE TABLE IF NOT EXISTS study_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_date     DATE NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_plan_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  day_index       INT NOT NULL,
  scheduled_date  DATE NOT NULL,
  title           VARCHAR(200) NOT NULL,
  meta            VARCHAR(200),
  status          VARCHAR(20) NOT NULL DEFAULT 'upcoming'
);

-- FR-28–FR-31
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(10) NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FR-32–FR-34
CREATE TABLE IF NOT EXISTS study_streaks (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak    INT NOT NULL DEFAULT 0,
  longest_streak    INT NOT NULL DEFAULT 0,
  last_active_date  DATE
);

-- UC-12
CREATE TABLE IF NOT EXISTS ai_error_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    VARCHAR(20) NOT NULL,
  status_code INT,
  endpoint    VARCHAR(120),
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user     ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question  ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_topic_perf_user   ON topic_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_plan   ON study_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_chat_session      ON chat_messages(session_id);
