import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { tokenStorage } from '../store/tokenStorage'

const AUTH_URL = (import.meta.env.VITE_AUTH_URL as string) ?? 'http://localhost:8082';
const ADMIN_URL = (import.meta.env.VITE_ADMIN_URL as string) ?? 'http://localhost:8083';
const PRODUCT_URL = (import.meta.env.VITE_PRODUCT_URL as string) ?? 'http://localhost:8084';
const USER_URL = (import.meta.env.VITE_USER_URL as string) ?? 'http://localhost:8085';
const SELLER_URL = (import.meta.env.VITE_SELLER_URL as string) ?? 'http://localhost:8086';
const NOTIFICATION_URL = (import.meta.env.VITE_NOTIFICATION_URL as string) ?? 'http://localhost:8087';
export const BASE_OAUTH_URL = (import.meta.env.VITE_OAUTH_URL as string) || 'http://openig.servicehub.org'; // to proxy domain

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

// ─── Shared 401 → refresh → retry coordination ───────────────────────────────
// A single refresh happens for the whole app, even if several clients receive
// 401 responses at the same time.
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

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

function attachResponseInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest | undefined;
      const url = originalRequest?.url ?? '';

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !SKIP_REFRESH_URLS.some(u => url.includes(u))
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
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

          const { data } = await axios.post(`${AUTH_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshTokenSnapshot,
          });

          tokenStorage.setTokens(data.access_token, data.refresh_token);
          onTokenRefreshed(data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return client(originalRequest);
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
}

// ─── GET request deduplication ────────────────────────────────────────────────
// If the exact same GET request (URL + serialised params) is already in-flight,
// return the existing promise instead of opening a second network connection.
//
// This makes React StrictMode's intentional double-firing of useEffect harmless
// for every component in the app without any per-component boilerplate.
function attachGetDeduplication(client: AxiosInstance) {
  const pending = new Map<string, Promise<unknown>>();
  const originalGet = client.get.bind(client);

  client.get = ((url: string, config?: AxiosRequestConfig) => {
    const key = config?.params
      ? `${url}\0${JSON.stringify(config.params)}`
      : url;

    const hit = pending.get(key);
    if (hit) return hit;

    const req = originalGet(url, config).finally(() => pending.delete(key));
    pending.set(key, req);
    return req;
  }) as AxiosInstance['get'];
}

function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(requestInterceptor);
  attachResponseInterceptor(client);
  attachGetDeduplication(client);

  return client;
}

// ─── One client per backend service ──────────────────────────────────────────
export const authClient = createApiClient(AUTH_URL);
export const adminClient = createApiClient(ADMIN_URL);
export const productClient = createApiClient(PRODUCT_URL);
export const userClient = createApiClient(USER_URL);
export const sellerClient = createApiClient(SELLER_URL);
export const notificationClient = createApiClient(NOTIFICATION_URL);

// OAuth provider (OpenIG) — uses its own bearer token and must not participate
// in the app's refresh flow.
export const oauthClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});
