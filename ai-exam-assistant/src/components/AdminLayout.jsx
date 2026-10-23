import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function AdminLayout() {
  const { isAuthenticated, role, logout } = useApp();
  const navigate = useNavigate();

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleExit = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span
            className="dot"
            style={{ background: 'var(--clay)' }}
          />{' '}
          Exam Assistant
        </div>
        <div className="pill pill-clay" style={{ margin: '0 6px 28px', width: 'fit-content' }}>
          ADMIN MODE
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <div className="navitem active-nav">📈 &nbsp;Usage Reports</div>
          <div className="navitem">👥 &nbsp;Manage Accounts</div>
          <div className="navitem">⚠️ &nbsp;Error Logs</div>
        </nav>
        <div className="navitem" onClick={handleExit} style={{ marginTop: 'auto', cursor: 'pointer' }}>
          🚪 &nbsp;Log out
        </div>
      </aside>
      <Outlet />
    </div>
  );
}
