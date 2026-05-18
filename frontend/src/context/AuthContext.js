import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('visitor-pass-auth');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (formData) => {
    const response = await api.post('/auth/login', formData);
    setUser(response.data);
    localStorage.setItem('visitor-pass-auth', JSON.stringify(response.data));
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    setUser(response.data);
    localStorage.setItem('visitor-pass-auth', JSON.stringify(response.data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('visitor-pass-auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };