import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard } from '../data/api';
import { useApp } from '../context/AppContext.jsx';
import AccuracyChart from '../components/AccuracyChart.jsx';

const TYPE_LABELS = { mcq: 'MCQ', short_answer: 'Short answer', true_false: 'True/False', mixed: 'Mixed' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchDashboard().then((res) => {
      if (!active) return;
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res);
    });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main style={{ padding: '36px 44px' }}>
        <p style={{ color: 'var(--clay-deep)' }}>{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: '36px 44px' }}>
        <p style={{ color: 'var(--ink-soft)' }}>Loading your dashboard…</p>
      </main>
    );
  }

  const { stats, accuracyTrend, weakTopics, recentSessions } = data;
  const firstName = (user?.name || 'there').split(' ')[0];
  const hasTrend = accuracyTrend && accuracyTrend.length > 0;

  return (
    <main style={{ padding: '36px 44px', background: 'var(--paper)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
        <div>
          <div className="eyebrow">Welcome back</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 600, marginTop: 8 }}>Good to see you, {firstName}</h1>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('/session/new')}>+ New practice session</button>
      </div>

      {/* FR-21 stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Sessions completed" value={stats.sessionsCompleted} pill={stats.sessionsCompleted > 0 ? 'Keep it up' : 'Start your first one'} tone="sage" />
        <StatCard label="Average score" value={`${stats.averageScore}%`} pill={stats.averageScore >= 70 ? 'On track' : 'Room to grow'} tone="sage" />
        <StatCard label="Study streak" value={`${stats.studyStreak} 🔥`} pill={stats.studyStreak > 0 ? 'Keep the streak alive' : 'Start today'} tone="amber" />
        <StatCard label="Weak topics" value={stats.weakTopicsCount} pill="Needs review" tone="clay" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* FR-19 accuracy trend */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>Accuracy trend</h3>
            {hasTrend && <span className="field-hint">Last {accuracyTrend.length} sessions</span>}
          </div>
          {hasTrend ? (
            <>
              <AccuracyChart values={accuracyTrend} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 4 }}>
                {accuracyTrend.map((_, i) => (<span key={i}>S{i + 1}</span>))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Complete a practice session to see your trend here.</p>
          )}
        </div>

        {/* FR-20 weak areas */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 17, marginBottom: 18 }}>Weak areas</h3>
          {weakTopics.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No data yet — practice a few topics first.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {weakTopics.map((t) => {
              const score = Number(t.accuracy_percent);
              return (
                <div key={t.topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>{t.topic}</span>
                    <strong style={{ fontFamily: 'var(--mono)', color: score < 70 ? 'var(--clay-deep)' : 'var(--sage-deep)' }}>{score}%</strong>
                  </div>
                  <div style={{ height: 6, background: 'var(--line-soft)', borderRadius: 4 }}>
                    <div style={{ width: `${score}%`, height: '100%', background: score < 70 ? 'var(--clay)' : 'var(--sage)', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 18 }} onClick={() => navigate('/study-plan')}>
            Build a plan around these →
          </button>
        </div>
      </div>

      {/* FR-18 recent sessions */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 17, marginBottom: 16 }}>Recent sessions</h3>
        {recentSessions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No completed sessions yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--ink-soft)', fontSize: 11.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>Topic</th>
                <th style={{ fontWeight: 600 }}>Type</th>
                <th style={{ fontWeight: 600 }}>Score</th>
                <th style={{ fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s) => {
                const score = Math.round(Number(s.score_percent));
                const tone = score >= 80 ? 'sage' : score >= 60 ? 'amber' : 'clay';
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '11px 0', fontWeight: 500 }}>{s.topic}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{TYPE_LABELS[s.question_type] || s.question_type}</td>
                    <td><span className={`pill pill-${tone}`}>{score}%</span></td>
                    <td style={{ color: 'var(--ink-soft)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, pill, tone }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div className={`pill pill-${tone}`} style={{ marginTop: 8 }}>{pill}</div>
    </div>
  );
}
