import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('airfoot_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('airfoot_token');
    if (!token) { setLoading(false); return; }
    authService.getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('airfoot_token');
        localStorage.removeItem('airfoot_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem('airfoot_token', data.token);
    localStorage.setItem('airfoot_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem('airfoot_token', data.token);
    localStorage.setItem('airfoot_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('airfoot_token');
    localStorage.removeItem('airfoot_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);