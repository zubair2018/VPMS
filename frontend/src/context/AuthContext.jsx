import { createContext, useContext, useState } from 'react';

// Create a context for authentication
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  // Function to safely read saved login data from localStorage
  const getSavedAuth = () => {
    try {
      const saved = localStorage.getItem('vpms_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to read auth from localStorage:', error);
      localStorage.removeItem('vpms_auth');
      return null;
    }
  };

  // Store auth data in state
  const [auth, setAuth] = useState(getSavedAuth());

  // Save login or register response
  const login = (data) => {
    setAuth(data);
    localStorage.setItem('vpms_auth', JSON.stringify(data));
  };

  // Remove auth data when user logs out
  const logout = () => {
    setAuth(null);
    localStorage.removeItem('vpms_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        auth,                 // full auth response
        user: auth?.user || null,   // logged-in user
        token: auth?.token || null, // jwt token
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context easily
export const useAuth = () => useContext(AuthContext);