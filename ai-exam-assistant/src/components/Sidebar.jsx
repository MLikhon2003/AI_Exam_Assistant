import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/session/new', icon: '✏️', label: 'New Session' },
  { to: '/study-plan', icon: '📅', label: 'Study Plan' },
  { to: '/practice', icon: '💬', label: 'AI Chatbot' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

// showCountdown: renders the exam-countdown card at the bottom (dashboard only,
// matching the original UI/UX design).
export default function Sidebar({ showCountdown = false }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="dot" /> Exam Assistant
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'navitem' + (isActive ? ' active-nav' : '')}
          >
            <span>{item.icon}</span>&nbsp;{item.label}
          </NavLink>
        ))}
      </nav>

      {showCountdown && (
        <div style={{ padding: 14, background: 'rgba(251,248,242,.06)', borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)', marginBottom: 6 }}>
            EXAM COUNTDOWN
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600 }}>
            {user.examDaysLeft} days
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(251,248,242,.6)', marginTop: 2 }}>
            {user.examSubject} — {user.examDate}
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid rgba(251,248,242,.1)', paddingTop: 10, marginTop: showCountdown ? 0 : 'auto' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', marginBottom: 4 }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: '50%', background: 'var(--amber)', color: 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}
            >
              {user.initials}
            </div>
            <span style={{ fontSize: 12.5, color: 'rgba(251,248,242,.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
          </div>
        )}
        <div className="navitem" onClick={handleLogout} style={{ cursor: loggingOut ? 'default' : 'pointer', opacity: loggingOut ? 0.6 : 1 }}>
          <span>🚪</span>&nbsp;{loggingOut ? 'Logging out…' : 'Log out'}
        </div>
      </div>
    </aside>
  );
}
