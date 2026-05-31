import { createContext, useContext, useState } from 'react';

// Create auth context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  // Read saved auth data safely
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

  // Save login/register response
  const login = (data) => {
    setAuth(data);
    localStorage.setItem('vpms_auth', JSON.stringify(data));
  };

  // Logout user
  const logout = () => {
    setAuth(null);
    localStorage.removeItem('vpms_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth?.user || null,
        token: auth?.token || null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);