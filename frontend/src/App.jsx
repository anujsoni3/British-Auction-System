import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || API_BASE_URL.replace(/\/api\/?$/, '');

function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExternalRedirect to={BACKEND_ORIGIN} />} />
        <Route path="/auctions" element={<ExternalRedirect to={`${BACKEND_ORIGIN}/rfqs`} />} />
        <Route path="/auctions/:id" element={<ExternalRedirect to={BACKEND_ORIGIN} />} />
        <Route path="/create" element={<ExternalRedirect to={`${BACKEND_ORIGIN}/rfqs/new`} />} />
        {/* Redirect to server-rendered pages hosted on backend */}
        <Route path="/rfqs" element={<ExternalRedirect to={`${BACKEND_ORIGIN}/rfqs`} />} />
        <Route path="/rfqs/new" element={<ExternalRedirect to={`${BACKEND_ORIGIN}/rfqs/new`} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
