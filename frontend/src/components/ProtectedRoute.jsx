import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component blocks pages if user is not logged in
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();

  // If user is not logged in, send to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are given, check role permission
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;