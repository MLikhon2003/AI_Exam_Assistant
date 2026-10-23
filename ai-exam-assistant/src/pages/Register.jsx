import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../data/api';
import { useApp } from '../context/AppContext.jsx';

const PERKS = [
  { icon: '🎯', title: 'Adaptive questions', body: 'Fresh every time — no repeated bank.' },
  { icon: '💬', title: 'Real explanations', body: 'Know why an answer is wrong, not just that it is.' },
  { icon: '📅', title: 'A plan that adapts', body: 'Weighted toward your weak topics automatically.' },
];

export default function Register() {
  const navigate = useNavigate();
  const { loginAsStudent } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // FR-01 — register a new account
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    loginAsStudent(result.user);
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ background: 'var(--paper-dim)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, borderRight: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 380 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>What you get on day one</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {PERKS.map((p) => (
              <div className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }} key={p.title}>
                <div style={{ fontSize: 20 }}>{p.icon}</div>
                <div>
                  <strong style={{ fontSize: 14 }}>{p.title}</strong>
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 19, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} /> AI Exam Assistant
          </div>
          <div className="eyebrow">Create your account</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 600, margin: '12px 0 24px' }}>
            Start your first session in under 2 minutes
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amara Khan" />
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>

            {error && <p style={{ fontSize: 12.5, color: 'var(--clay-deep)', marginBottom: 12 }}>{error}</p>}

            <button type="submit" className="btn btn-accent btn-block" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 14, lineHeight: 1.5 }}>
            By continuing you agree this is a student-project prototype. Passwords are stored as bcrypt hashes — never in plain text.
          </p>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 24 }}>
            Already have an account?{' '}
            <span
              style={{ color: 'var(--ink)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--amber)', textUnderlineOffset: 3 }}
              onClick={() => navigate('/login')}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
