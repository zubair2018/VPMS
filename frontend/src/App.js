import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardLayout from './layouts/DashboardLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DashboardPage from './pages/admin/DashboardPage';
import VisitorsPage from './pages/admin/VisitorsPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import PassesPage from './pages/admin/PassesPage';

import ScanPage from './pages/security/ScanPage';

import VisitorRegisterPage from './pages/public/VisitorRegisterPage';
import VisitorPassLookupPage from './pages/public/VisitorPassLookupPage';

function App() {
  // Get logged-in user data from AuthContext
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public visitor routes */}
      <Route path="/visitor/register" element={<VisitorRegisterPage />} />
      <Route path="/visitor/pass" element={<VisitorPassLookupPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default page after login */}
        <Route index element={<DashboardPage />} />

        {/* Normal protected pages */}
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />

        {/* Only admin and security can open passes page */}
        <Route
          path="passes"
          element={
            <ProtectedRoute roles={['admin', 'security']}>
              <PassesPage />
            </ProtectedRoute>
          }
        />

        {/* Only admin and security can open scan page */}
        <Route
          path="scan"
          element={
            <ProtectedRoute roles={['admin', 'security']}>
              <ScanPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* If user types wrong URL, redirect */}
      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;