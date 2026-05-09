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
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/visitor/register" element={<VisitorRegisterPage />} />
      <Route path="/visitor/pass" element={<VisitorPassLookupPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />

        <Route
          path="passes"
          element={
            <ProtectedRoute roles={['admin', 'security']}>
              <PassesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="scan"
          element={
            <ProtectedRoute roles={['admin', 'security']}>
              <ScanPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;