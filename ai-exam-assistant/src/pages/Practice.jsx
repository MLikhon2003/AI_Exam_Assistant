import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitAnswer, completeSession, fetchChatHistory, sendChatMessage } from '../data/api';

export default function Practice() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handed off from SessionSetup.jsx via navigate('/practice', { state: {...} })
  const session = location.state?.session;
  const questions = location.state?.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (session?.id) {
      fetchChatHistory(session.id).then(setChatMessages);
    }
  }, [session?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // No active session (e.g. the user navigated here directly) — send them
  // to set one up instead of showing a broken page.
  if (!session || !questions || questions.length === 0) {
    return (
      <main style={{ padding: '60px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 20 }}>
          No active practice session. Start one to begin.
        </p>
        <button className="btn btn-accent" onClick={() => navigate('/session/new')}>+ New practice session</button>
      </main>
    );
  }

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const isShortAnswer = question.question_type === 'short_answer';

  // FR-13 / FR-14 — submit an answer, get a score + explanation
  const handleSelect = async (optionId) => {
    if (submitted) return;
    setSelectedOptionId(optionId);
    await submitAnswerAndGetFeedback(optionId);
  };

  const handleSubmitShortAnswer = async () => {
    if (submitted || !shortAnswerText.trim()) return;
    await submitAnswerAndGetFeedback(shortAnswerText.trim());
  };

  const submitAnswerAndGetFeedback = async (submittedText) => {
    setSubmitting(true);
    const res = await submitAnswer(question.id, submittedText);
    setSubmitting(false);
    if (!res.ok) {
      setFeedback({ correct: false, headline: 'Something went wrong', explanation: res.error, tip: null });
      setSubmitted(true);
      return;
    }
    setSubmitted(true);
    setFeedback(res.feedback);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setFinishing(true);
      await completeSession(session.id); // FR-32 — updates the study streak too
      setFinishing(false);
      navigate('/dashboard');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOptionId(null);
    setShortAnswerText('');
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { role: 'user', text }]);
    setChatInput('');
    setChatSending(true);
    const reply = await sendChatMessage(session.id, text); // UC-06
    setChatSending(false);
    setChatMessages((prev) => [...prev, reply]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px' }}>
      <main style={{ padding: '40px 48px', borderRight: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span className="pill pill-amber">Question {currentIndex + 1} of {questions.length}</span>
          <span className="pill pill-neutral">{session.topic}</span>
        </div>
        <div style={{ height: 5, background: 'var(--line-soft)', borderRadius: 4, marginBottom: 32 }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--amber)', borderRadius: 4 }} />
        </div>

        <p style={{ fontFamily: 'var(--serif)', fontSize: 23, lineHeight: 1.5, marginBottom: 28 }}>{question.prompt}</p>

        {/* FR-13 — MCQ / true-false options */}
        {!isShortAnswer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {question.options?.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const border = submitted && isSelected ? (feedback?.correct ? 'var(--sage)' : 'var(--clay)') : 'var(--line)';
              const bg = submitted && isSelected ? (feedback?.correct ? 'rgba(124,154,130,.08)' : 'rgba(199,93,77,.06)') : 'transparent';

              return (
                <label
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    padding: '14px 16px', border: `1.5px solid ${border}`, background: bg, borderRadius: 10,
                    fontSize: 14.5, cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <input type="radio" name="answer" checked={isSelected} readOnly /> {opt.label}
                </label>
              );
            })}
          </div>
        )}

        {/* FR-13 — short-answer text input */}
        {isShortAnswer && (
          <div style={{ marginBottom: 24 }}>
            <textarea
              rows={4}
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer…"
              style={{
                width: '100%', padding: 14, borderRadius: 10, border: '1.5px solid var(--line)',
                fontFamily: 'var(--sans)', fontSize: 14, resize: 'vertical',
              }}
            />
            {!submitted && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={handleSubmitShortAnswer} disabled={submitting || !shortAnswerText.trim()}>
                {submitting ? 'Submitting…' : 'Submit answer'}
              </button>
            )}
          </div>
        )}

        {submitting && !isShortAnswer && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Evaluating your answer…</p>}

        {/* FR-15 / FR-16 — AI feedback */}
        {submitted && feedback && (
          <div
            className="card"
            style={{ padding: 20, borderLeft: `4px solid ${feedback.correct ? 'var(--sage)' : 'var(--clay)'}`, marginBottom: 24 }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6, color: feedback.correct ? 'var(--sage-deep)' : 'var(--clay-deep)' }}>
                  {feedback.headline}
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>{feedback.explanation}</p>
                {feedback.tip && <div className="margin-note" style={{ marginTop: 10 }}>{feedback.tip}</div>}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>Exit session</button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!submitted || finishing}>
            {finishing ? 'Finishing…' : isLastQuestion ? 'Finish session →' : 'Next question →'}
          </button>
        </div>
      </main>

      {/* UC-06 AI chatbot panel */}
      <aside style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', background: 'var(--paper-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>Study chatbot</h3>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 18 }}>
          Ask about this topic anytime — it won't leave the session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
          {chatMessages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
          ))}
          {chatSending && <div className="chat-bubble ai" style={{ opacity: 0.6 }}>Thinking…</div>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input
            type="text"
            placeholder="Ask a follow-up question…"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={{ flex: 1, padding: '11px 14px', borderRadius: 9, border: '1.5px solid var(--line)', fontSize: 13, fontFamily: 'var(--sans)', outline: 'none' }}
          />
          <button type="submit" className="btn btn-accent btn-sm" style={{ padding: '11px 16px' }}>→</button>
        </form>
      </aside>
    </div>
  );
}
