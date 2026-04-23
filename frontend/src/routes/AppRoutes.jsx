import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authApi } from '../lib/api';
import { AppShell } from '../layout/AppShell';
import { AuthPage } from '../pages/AuthPage';

export function AppRoutes() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    authApi('/auth/me')
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-100">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/rfqs" replace /> : <AuthPage mode="login" onSuccess={setUser} />} />
      <Route path="/signup" element={user ? <Navigate to="/rfqs" replace /> : <AuthPage mode="signup" onSuccess={setUser} />} />
      <Route path="/*" element={user ? <AppShell user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
