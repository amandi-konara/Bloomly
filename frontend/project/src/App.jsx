import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import LogForm from './pages/LogForm';
import Login from './pages/Login';
import Signup from './pages/Signup';

function PrivateRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return Boolean(token && !token.startsWith('demo-jwt-token-'));
  });

  useEffect(() => {
    const handleAuthExpired = () => setAuthenticated(false);
    window.addEventListener('bloomly_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('bloomly_auth_expired', handleAuthExpired);
  }, []);

  if (!authenticated) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Wellness Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/habits" element={<PrivateRoute><Habits /></PrivateRoute>} />
        <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/goals" element={<Navigate to="/progress" replace />} />
        <Route path="/insights" element={<Navigate to="/progress" replace />} />
        <Route path="/calendar" element={<Navigate to="/journal" replace />} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/log" element={<PrivateRoute><LogForm /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
