import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { tokenStorage } from '../store/tokenStorage';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { user } = await authApi.getMe();
      setUser(user);
    } catch {
      // Only evict tokens if no concurrent login/register replaced them while
      // the getMe() request was in-flight. This mirrors the same guard in
      // client.ts so we don't wipe freshly-issued tokens on a stale-refresh race.
      if (tokenStorage.getAccessToken() === token) {
        tokenStorage.clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // When the token refresh interceptor fails, it dispatches this event instead
  // of doing a hard window.location redirect that would race with in-flight logins
  useEffect(() => {
    const handleExpired = () => {
      tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authApi.login({ username, password });
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }) => {
    const result = await authApi.register(data);
    tokenStorage.setTokens(result.access_token, result.refresh_token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    tokenStorage.clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
