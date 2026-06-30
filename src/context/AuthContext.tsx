import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { authApi } from '../api/auth'
import { tokenStorage } from '../store/tokenStorage'
import type { User } from '../types'

const CACHED_USER_KEY = 'sh_cached_user';

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return atob(base64);
}

function decodeUserFromToken(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return {
      uid: payload.sub || payload.uid || '',
      username: payload.username || '',
      email: payload.email || '',
      full_name: payload.full_name || '',
      avatar_url: payload.avatar_url || '',
      role: payload.role || 'buyer',
      is_active: payload.is_active ?? true,
      created_at: payload.created_at || '',
      updated_at: payload.updated_at || '',
    };
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (username: string, password: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!tokenStorage.getAccessToken()) return null;
    const cached = localStorage.getItem(CACHED_USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const cacheUser = useCallback((u: User | null) => {
    if (u) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      cacheUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { user } = await authApi.getMe();
      setUser(user);
      cacheUser(user);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr?.response?.status;
      const isEmailBlocked =
        status === 403 &&
        axiosErr?.response?.data?.message?.toLowerCase().includes('email not verified');

      if (isEmailBlocked) {
        const cached = localStorage.getItem(CACHED_USER_KEY);
        let fallback: User | null = cached ? JSON.parse(cached) : null;
        if (!fallback) fallback = decodeUserFromToken(token);
        if (fallback) {
          fallback.is_active = false;
          setUser(fallback);
          cacheUser(fallback);
        } else if (tokenStorage.getAccessToken() === token) {
          tokenStorage.clearTokens();
          setUser(null);
          cacheUser(null);
        }
      } else if (tokenStorage.getAccessToken() === token) {
        tokenStorage.clearTokens();
        setUser(null);
        cacheUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cacheUser]);

  useEffect(() => {
    let cancelled = false;
    const token = tokenStorage.getAccessToken();
    if (!token) { setIsLoading(false); return; }
    authApi.getMe()
      .then(({ user }) => { if (!cancelled) { setUser(user); cacheUser(user); } })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (cancelled) return;
        const status = err?.response?.status;
        const isEmailBlocked =
          status === 403 &&
          err?.response?.data?.message?.toLowerCase().includes('email not verified');

        if (isEmailBlocked) {
          const cached = localStorage.getItem(CACHED_USER_KEY);
          let fallback: User | null = cached ? JSON.parse(cached) : null;
          if (!fallback) fallback = decodeUserFromToken(token);
          if (fallback) {
            fallback.is_active = false;
            if (!cancelled) { setUser(fallback); cacheUser(fallback); }
          } else if (tokenStorage.getAccessToken() === token) {
            tokenStorage.clearTokens();
            setUser(null);
            cacheUser(null);
          }
        } else if (tokenStorage.getAccessToken() === token) {
          tokenStorage.clearTokens();
          setUser(null);
          cacheUser(null);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [cacheUser]);

  useEffect(() => {
    const handleExpired = () => {
      tokenStorage.clearTokens();
      setUser(null);
      cacheUser(null);
      setIsLoading(false);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, [cacheUser]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authApi.login({ username, password });
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    cacheUser(data.user);
  }, [cacheUser]);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    await authApi.resetPassword(newPassword, resetToken);
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
    cacheUser(result.user);
  }, [cacheUser]);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Best effort
      }
    }
    tokenStorage.clearTokens();
    setUser(null);
    cacheUser(null);
  }, [cacheUser]);

  const isEmailVerified = user ? user.is_active : true;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isEmailVerified,
      login,
      resetPassword,
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
