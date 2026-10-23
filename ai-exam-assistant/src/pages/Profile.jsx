import React, { useEffect, useState } from 'react';
import { fetchProfile, saveProfile, saveNotificationPreferences } from '../data/api';
import { normalizeUser, normalizeNotifications } from '../utils/adapters.js';
import { useApp } from '../context/AppContext.jsx';

const TOGGLE_COPY = {
  studyReminders: { title: 'Study reminders', body: 'Daily nudge based on your study plan' },
  examCountdownAlerts: { title: 'Exam countdown alerts', body: 'Get notified as your exam date approaches' },
  streakAlerts: { title: 'Streak alerts', body: "A nudge if you're about to break a streak" },
};

export default function Profile() {
  const { setUser } = useApp();
  const [displayUser, setDisplayUser] = useState(null);
  const [form, setForm] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile().then((res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const normalized = normalizeUser(res.user);
      setDisplayUser(normalized);
      setForm({
        name: res.user.name,
        email: res.user.email,
        examDate: res.user.exam_date || '',
        examSubject: res.user.exam_subject || '',
      });
      setNotifications(normalizeNotifications(res.notifications));
    });
  }, []);

  if (error) {
    return (
      <main style={{ padding: '40px 48px' }}>
        <p style={{ color: 'var(--clay-deep)' }}>{error}</p>
      </main>
    );
  }

  if (!form || !notifications || !displayUser) {
    return (
      <main style={{ padding: '40px 48px' }}>
        <p style={{ color: 'var(--ink-soft)' }}>Loading profile…</p>
      </main>
    );
  }

  // FR-04 — update profile information
  const handleSave = async () => {
    const res = await saveProfile(form);
    if (res.ok) {
      const normalized = normalizeUser(res.user);
      setDisplayUser(normalized);
      setUser(normalized);
      setSavedMessage('Changes saved.');
      setTimeout(() => setSavedMessage(''), 2500);
    }
  };

  // FR-35 — configure notification preferences
  const handleToggle = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    await saveNotificationPreferences(next);
  };

  return (
    <main style={{ padding: '40px 48px', maxWidth: 680 }}>
      <div className="eyebrow">FR-04 · Profile &amp; preferences</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, margin: '8px 0 28px' }}>Your profile</h1>

      <div className="card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>
          {displayUser.initials}
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{displayUser.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{displayUser.email} · Joined {displayUser.joined}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 18 }}>Account details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="field">
            <label>Display name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Upcoming exam date</label>
            <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Exam subject</label>
            <input type="text" value={form.examSubject} onChange={(e) => setForm({ ...form, examSubject: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save changes</button>
          {savedMessage && <span style={{ fontSize: 12.5, color: 'var(--sage-deep)' }}>{savedMessage}</span>}
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 6 }}>Notification preferences</h3>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 18 }}>FR-35 · Configure when the system reaches out.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(TOGGLE_COPY).map(([key, copy], i, arr) => (
            <div
              key={key}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: i < arr.length - 1 ? 14 : 0,
                borderBottom: i < arr.length - 1 ? '1px solid var(--line-soft)' : undefined,
              }}
            >
              <div>
                <strong style={{ fontSize: 13.5 }}>{copy.title}</strong>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{copy.body}</p>
              </div>
              <Toggle checked={notifications[key]} onClick={() => handleToggle(key)} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Toggle({ checked, onClick }) {
  return (
    <div
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      style={{
        width: 42, height: 24, background: checked ? 'var(--sage)' : 'var(--line)',
        borderRadius: 100, position: 'relative', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: checked ? 21 : 3, transition: 'left .15s ease' }} />
    </div>
  );
}
