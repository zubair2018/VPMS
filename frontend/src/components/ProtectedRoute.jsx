import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component protects pages from unauthorized users
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();

  // If no user is logged in, send to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are provided, check if user's role is allowed
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If user is allowed, show the page
  return children;
};

export default ProtectedRoute;