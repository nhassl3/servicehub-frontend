import axios, { AxiosError } from 'axios'
import { tokenStorage } from '../store/tokenStorage'

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 → refresh → retry ──────────────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// These endpoints handle their own 401 — don't trigger token refresh for them
const SKIP_REFRESH_URLS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const url = originalRequest?.url ?? '';

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !SKIP_REFRESH_URLS.some(u => url.includes(u))
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest!.headers!.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest!));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Snapshot the refresh token we're about to use.
      // If a login happens concurrently it will overwrite localStorage with new tokens —
      // in that case we must NOT clear them after our (stale) refresh fails.
      const refreshTokenSnapshot = tokenStorage.getRefreshToken();

      try {
        if (!refreshTokenSnapshot) throw new Error('no refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshTokenSnapshot,
        });

        tokenStorage.setTokens(data.access_token, data.refresh_token);
        onTokenRefreshed(data.access_token);
        originalRequest!.headers!.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest!);
      } catch {
        // Only evict tokens if no concurrent login replaced them in the meantime
        const currentRefreshToken = tokenStorage.getRefreshToken();
        if (currentRefreshToken === refreshTokenSnapshot) {
          tokenStorage.clearTokens();
          window.dispatchEvent(new Event('auth:session-expired'));
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
