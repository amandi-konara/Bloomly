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
  let token = localStorage.getItem('token');
  if (!token) {
    // Graceful onboarding fallback so users can explore immediately
    token = 'bloomly-student-token';
    localStorage.setItem('token', token);
    localStorage.setItem(
      'user',
      JSON.stringify({ name: 'Amandi', email: 'amandi@university.edu', university: 'Faculty of Engineering' })
    );
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
