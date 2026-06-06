import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  let initialData = null;

  try {
    const storedData = localStorage.getItem('vpms_auth');
    initialData = storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    initialData = null;
  }

  const [auth, setAuth] = useState(initialData);

  const login = (data) => {
    setAuth(data);
    localStorage.setItem('vpms_auth', JSON.stringify(data));
  };

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

export const useAuth = () => useContext(AuthContext);