import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../data/api';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { loginAsStudent, loginAsAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // FR-02 / FR-03 — validate credentials on login attempt.
  // The backend decides the role; students land on /dashboard,
  // admin accounts (role='admin' in the database) land on /admin.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.user.role === 'admin') {
      loginAsAdmin(result.user);
      navigate('/admin');
    } else {
      loginAsStudent(result.user);
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 19, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} /> AI Exam Assistant
          </div>
          <div className="eyebrow">Welcome back</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 600, margin: '12px 0 8px' }}>Log in to continue</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 32 }}>Your sessions and study plan are waiting.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && (
              <p style={{ fontSize: 12.5, color: 'var(--clay-deep)', marginBottom: 12 }}>{error}</p>
            )}

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 18, lineHeight: 1.5 }}>
            Admin accounts log in with the same form — the backend routes you to the
            admin panel automatically if your account's role is set to "admin".
          </p>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 24 }}>
            New here?{' '}
            <span
              style={{ color: 'var(--ink)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--amber)', textUnderlineOffset: 3 }}
              onClick={() => navigate('/register')}
            >
              Create an account
            </span>
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--ink)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.5,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(232,163,61,.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(124,154,130,.2), transparent 45%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, color: 'var(--paper)', maxWidth: 380 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--amber)', letterSpacing: '.1em', marginBottom: 18 }}>
            SESSION STREAK
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 46, fontWeight: 600, marginBottom: 10 }}>Keep it going</div>
          <p style={{ fontSize: 14.5, color: 'rgba(251,248,242,.7)', lineHeight: 1.6 }}>
            Students who log in daily improve their weak-topic scores 2.3× faster on average.
          </p>
        </div>
      </div>
    </div>
  );
}
