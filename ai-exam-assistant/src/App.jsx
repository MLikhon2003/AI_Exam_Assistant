import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SessionSetup from './pages/SessionSetup.jsx';
import Practice from './pages/Practice.jsx';
import StudyPlan from './pages/StudyPlan.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';

import StudentLayout from './components/StudentLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student area — protected by StudentLayout (role check + sidebar) */}
      <Route element={<StudentLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session/new" element={<SessionSetup />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin area — protected by AdminLayout (role check + admin sidebar) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
