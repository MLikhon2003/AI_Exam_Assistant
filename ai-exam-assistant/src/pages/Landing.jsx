import React from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { step: 'Step 1', title: 'Give it a topic', body: 'Type a subject or upload your lecture notes as a PDF.' },
  { step: 'Step 2', title: 'Practice live', body: 'Answer fresh AI-generated questions, one at a time.' },
  { step: 'Step 3', title: 'Get real feedback', body: 'Not just right or wrong — a plain-English explanation why.' },
  { step: 'Step 4', title: 'Follow your plan', body: 'A day-by-day schedule that re-weights toward your weak spots.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '26px 48px',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
          AI Exam Assistant
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>
          <span>How it works</span>
          <span>Features</span>
          <span>For Students</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log in</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get started</button>
        </div>
      </nav>

      <header
        style={{
          padding: '80px 48px 60px',
          display: 'grid',
          gridTemplateColumns: '1.1fr .9fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        <div>
          <div className="eyebrow">Built for the night before — and the month before</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 54, lineHeight: 1.06, fontWeight: 600, margin: '18px 0 22px', letterSpacing: '-.01em' }}>
            Study what you
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              {' '}actually
              <svg width="100%" height="14" viewBox="0 0 200 14" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: -2, width: '100%' }}>
                <path d="M2 9 C 50 2, 150 2, 198 9" stroke="var(--amber)" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.55" />
              </svg>
            </span>{' '}
            don't know yet.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: 460, marginBottom: 34 }}>
            Generate fresh practice questions from any topic or PDF, get explanations that actually teach you
            something, and follow a study plan built around your weak spots — not a generic checklist.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button className="btn btn-accent" onClick={() => navigate('/register')}>Start practicing — it's free</button>
            <button className="btn btn-ghost" onClick={() => navigate('/session/new')}>See a sample session →</button>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 38, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
            <div><strong style={{ color: 'var(--ink)', fontSize: 15 }}>3</strong> question types</div>
            <div><strong style={{ color: 'var(--ink)', fontSize: 15 }}>&lt;5s</strong> generation time</div>
            <div><strong style={{ color: 'var(--ink)', fontSize: 15 }}>24/7</strong> AI chatbot</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: -22, right: 18, transform: 'rotate(3deg)', zIndex: 0,
              width: '88%', height: '100%', background: 'var(--paper-dim)', borderRadius: 18, border: '1px solid var(--line)',
            }}
          />
          <div className="card" style={{ position: 'relative', zIndex: 1, padding: 28, borderRadius: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span className="pill pill-amber">Question 3 of 8</span>
              <span className="pill pill-sage">Medium</span>
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.5, marginBottom: 20 }}>
              What is the time complexity of binary search on a sorted array of n elements?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ padding: '12px 14px', border: '1.5px solid var(--line)', borderRadius: 9, fontSize: 14 }}>O(n)</div>
              <div style={{ padding: '12px 14px', border: '1.5px solid var(--sage)', background: 'rgba(124,154,130,.08)', borderRadius: 9, fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                O(log n) <span style={{ color: 'var(--sage-deep)' }}>✓</span>
              </div>
              <div style={{ padding: '12px 14px', border: '1.5px solid var(--line)', borderRadius: 9, fontSize: 14 }}>O(n log n)</div>
            </div>
            <div className="margin-note" style={{ marginTop: 18 }}>
              Correct — each step halves the search space, so growth is logarithmic.
            </div>
          </div>
        </div>
      </header>

      <section style={{ padding: '50px 48px 70px', borderTop: '1px solid var(--line-soft)', background: 'var(--paper-dim)' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>The loop</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 600, marginBottom: 40 }}>
          From topic to mastery, one session at a time
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {STEPS.map((s) => (
            <div className="card" style={{ padding: 24 }} key={s.step}>
              <div style={{ fontFamily: 'var(--mono)', color: 'var(--amber-deep)', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>
                {s.step}
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '28px 48px', display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)' }}>
        <span>AI Exam Assistant — CSE4204-8B-T05</span>
        <span>Northern University of Business and Technology, Khulna</span>
      </footer>
    </div>
  );
}
