import React, { createContext, useState, useEffect } from 'react';
import { refreshToken } from '../server/server';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';

    if (accessToken) {
      setIsLoggedIn(true);
      setIsAdmin(adminStatus);
    }
  }, []);
  useEffect(() => {
    const refreshAccessToken = async () => {
      const refreshTokenFromStorage = localStorage.getItem('refresh_token');
      if (refreshTokenFromStorage) {
        try {
          const response = await refreshToken(refreshTokenFromStorage);
          localStorage.setItem('access_token', response.access_token);
          setIsAuthenticated(true);
          setUser(response.data); // Update user data after token refresh
        } catch (error) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    refreshAccessToken();
  }, []);

  return (
    
    <AuthContext.Provider value={{ isAuthenticated, user,isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
