import React, { useEffect, useState } from 'react';
import { fetchStudyPlan, setExamDate } from '../data/api';

const STATUS_STYLES = {
  done: { bg: 'var(--sage)', color: 'white', border: undefined },
  next: { bg: 'var(--amber)', color: 'var(--ink)', border: 'var(--amber)' },
  upcoming: { bg: 'var(--paper-dim)', color: 'var(--ink-soft)', border: undefined },
};

export default function StudyPlan() {
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examDateInput, setExamDateInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetchStudyPlan().then((res) => {
      setLoading(false);
      if (!res.ok) return;
      setPlan(res.plan);
      setItems(res.items || []);
    });
  };

  useEffect(load, []);

  // FR-23, FR-24 — set an exam date and generate the plan
  const handleGenerate = async () => {
    if (!examDateInput) {
      setError('Pick a future exam date first.');
      return;
    }
    setError('');
    setGenerating(true);
    const res = await setExamDate(examDateInput);
    setGenerating(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    load(); // refresh with the newly generated plan
  };

  if (loading) {
    return (
      <main style={{ padding: '40px 48px' }}>
        <p style={{ color: 'var(--ink-soft)' }}>Loading your study plan…</p>
      </main>
    );
  }

  // FR-23 — no plan yet: let the student set an exam date to generate one
  if (!plan) {
    return (
      <main style={{ padding: '40px 48px', maxWidth: 560 }}>
        <div className="eyebrow">UC-05 · Personalized schedule</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, margin: '8px 0 16px' }}>Set your exam date</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 24 }}>
          Once you set a date, the system builds a day-by-day plan weighted toward your weak topics.
        </p>
        <div className="card" style={{ padding: 24 }}>
          <div className="field">
            <label>Exam date</label>
            <input type="date" value={examDateInput} onChange={(e) => setExamDateInput(e.target.value)} />
          </div>
          {error && <p style={{ fontSize: 12.5, color: 'var(--clay-deep)', marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-accent btn-block" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Building your plan…' : 'Generate study plan →'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="eyebrow">UC-05 · Personalized schedule</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, marginTop: 8 }}>Your study plan</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 6 }}>
            Weighted toward weak topics. Regenerate anytime to reflect new scores.
          </p>
        </div>
        <div className="card" style={{ padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--mono)' }}>EXAM DATE</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, marginTop: 2 }}>
            {new Date(plan.exam_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* FR-27 timeline / calendar view */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 24 }}>
        {items.map((item, i) => {
          const s = STATUS_STYLES[item.status] || STATUS_STYLES.upcoming;
          const isLast = i === items.length - 1;
          return (
            <div style={{ display: 'flex', gap: 20 }} key={item.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
                <div
                  style={{
                    width: 34, height: 34, borderRadius: '50%', background: s.bg, color: s.color,
                    border: s.border ? `2px solid ${s.border}` : undefined,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                  }}
                >
                  {item.status === 'done' ? '✓' : item.day_index}
                </div>
                {!isLast && <div style={{ width: 2, flex: 1, background: 'var(--line)', margin: '4px 0' }} />}
              </div>
              <div
                className="card"
                style={{ padding: '18px 20px', marginBottom: isLast ? 0 : 18, flex: 1, opacity: item.status === 'done' ? 0.6 : 1 }}
              >
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: item.status === 'next' ? 'var(--amber-deep)' : 'var(--ink-soft)' }}>
                  {new Date(item.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <h4 style={{ fontFamily: 'var(--serif)', fontSize: 16, margin: '4px 0' }}>{item.title}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{item.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
