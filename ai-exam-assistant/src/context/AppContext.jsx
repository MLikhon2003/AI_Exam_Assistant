import React, { createContext, useContext, useMemo, useState } from 'react';
import { normalizeUser } from '../utils/adapters.js';
import { logoutClient } from '../data/api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // role: 'student' | 'admin' | null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const loginAsStudent = (backendUser) => {
    setUser(normalizeUser(backendUser));
    setRole('student');
    setIsAuthenticated(true);
  };

  // Called after a real /auth/login response where user.role === 'admin'.
  const loginAsAdmin = (backendUser) => {
    setUser(normalizeUser(backendUser));
    setRole('admin');
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await logoutClient(); // best-effort backend call, then clears the JWT from localStorage
    setRole(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = useMemo(
    () => ({ isAuthenticated, role, user, setUser, loginAsStudent, loginAsAdmin, logout }),
    [isAuthenticated, role, user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
