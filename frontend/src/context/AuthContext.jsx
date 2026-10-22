import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/accounts/profile/');
          const userData = res.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/accounts/login/', { email, password });
    const { access, refresh } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const profileRes = await api.get('/accounts/profile/');
    const userData = profileRes.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/accounts/register/', formData);
    return res.data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/accounts/logout/', { refresh });
      }
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUserProfile = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('user', JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isProvider: user?.role === 'provider',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
