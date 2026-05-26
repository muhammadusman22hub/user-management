import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

// ✅ If logged in → block access to login/signup → redirect to dashboard
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// ✅ If NOT logged in → block access to dashboard → redirect to login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// ✅ If NOT admin → block access to admin dashboard → redirect to dashboard
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    // Decode JWT payload (middle part) to check role
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin'
      ? children
      : <Navigate to="/dashboard" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public only — logged in users can't access these */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Private — must be logged in */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Admin only — must be logged in AND have role: admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}