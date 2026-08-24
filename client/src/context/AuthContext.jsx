import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authService from '../services/auth';
import { clearToken, getToken, setToken } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const existing = getToken();
      if (!existing) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await authService.me();
        if (!cancelled) {
          setUser(profile);
          setTokenState(existing);
        }
      } catch {
        clearToken();
        if (!cancelled) {
          setUser(null);
          setTokenState(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = await authService.login({ email, password });
    setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const result = await authService.register({ name, email, password });
    setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
