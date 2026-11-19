import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kaamsetu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('kaamsetu_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('kaamsetu_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('kaamsetu_token', jwtToken);
    localStorage.setItem('kaamsetu_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.auth.register(formData);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('kaamsetu_token', jwtToken);
    localStorage.setItem('kaamsetu_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('kaamsetu_token');
    localStorage.removeItem('kaamsetu_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('kaamsetu_user', JSON.stringify(updatedUser));
  };

  // Quick Demo Login helper for presentation/evaluation
  const demoLogin = async (roleType) => {
    let email = '';
    let password = '';
    if (roleType === 'customer') {
      email = 'rahul@gmail.com';
      password = 'customer123';
    } else if (roleType === 'worker') {
      email = 'rajesh.plumber@kaamsetu.com';
      password = 'worker123';
    } else if (roleType === 'admin') {
      email = 'admin@kaamsetu.com';
      password = 'admin123';
    }
    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user ? user.role : null,
        isCustomer: user?.role === 'ROLE_CUSTOMER',
        isWorker: user?.role === 'ROLE_WORKER',
        isAdmin: user?.role === 'ROLE_ADMIN',
        login,
        register,
        logout,
        updateUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

