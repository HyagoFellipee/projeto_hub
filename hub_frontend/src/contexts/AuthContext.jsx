/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('username'); // Limpar username também
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    
    if (token) {
      setIsAuthenticated(true);
      setUser({ 
        authenticated: true,
        username: username || 'Usuário'
      });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    
    // Salvar o username
    localStorage.setItem('username', credentials.username);
    
    setUser({ 
      authenticated: true,
      username: credentials.username
    });
    setIsAuthenticated(true);
    return response;
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}