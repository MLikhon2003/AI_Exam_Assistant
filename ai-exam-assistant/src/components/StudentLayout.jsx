import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function StudentLayout() {
  const { isAuthenticated, role } = useApp();
  const location = useLocation();

  if (!isAuthenticated || role !== 'student') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const showCountdown = location.pathname === '/dashboard';

  return (
    <div className="app-shell">
      <Sidebar showCountdown={showCountdown} />
      <Outlet />
    </div>
  );
}
