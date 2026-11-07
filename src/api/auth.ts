import type { AuthTokens, oAuthResponse, User } from '../types'
import { apiClient, BASE_OAUTH_URL, oauthClient } from './client'
import { generateStrongPassword } from './common/strongPass'

async function _getUserData(access_token: string): Promise<oAuthResponse> {
  try {
    const response = await oauthClient.get('/userinfo', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
    const userData = response.data as oAuthResponse
    return userData
  } catch (error: any) {
    if (error?.response?.status === 403) throw new Error('Forbidden')
    if (error?.response?.status === 401) throw new Error('Not Authenticated')
    throw new Error(`OAuth userinfo failed: ${error?.message || error}`)
  }
}

export const oauthApi = {
  getUserData: async (access_token: string): Promise<oAuthResponse | null> => {
    try {
      return await _getUserData(access_token)
    } catch {
      return null
    }
  },
  doLogin: async (): Promise<void> => {
    window.sessionStorage.setItem('autoLogin', 'true')
    window.location.href = `${BASE_OAUTH_URL}/oauth`
  },
}

export const authApi = {
  oAuthLogin: async (access_token: string): Promise<AuthTokens> => {
    const { email } = await _getUserData(access_token);
    const username = email.split("@")[0];
    const password = generateStrongPassword(32);
    try {
      const res = await apiClient.post('/api/v1/oauth/login', { username, email, password });
      return res.data;
    } catch (error: any) {
      throw new Error('OAuth login failed', {cause: error});
    }
  },
  register: async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }): Promise<AuthTokens> => {
    const res = await apiClient.post('/api/v1/auth/register', data);
    return res.data;
  },

  resetEmail: async (data: {new_email: string;}): Promise<{ operation_id: string }> => {
    const res = await apiClient.post('/api/v1/auth/reset-email', data);
    return res.data
  },

  login: async (data: { username: string; password: string }): Promise<AuthTokens> => {
    const res = await apiClient.post('/api/v1/auth/login', data);
    return res.data;
  },

  requestResetPassword: async (email: string): Promise<{ operation_id: string }> => {
    const res = await apiClient.post('/api/v1/auth/request-reset-password', { email });
    return res.data;
  },

  approveCode: async (code: string, operation_id: string, key?: number): Promise<{ reset_token: string }> => {
    const res = await apiClient.post('/api/v1/notifications', { code, operation_id, key });
    return res.data;
  },

  resetPassword: async (password: string, reset_token: string): Promise<{ success: boolean }> => {
    const res = await apiClient.post('/api/v1/auth/reset-password', { password, reset_token });
    return res.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> => {
    const res = await apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get('/api/v1/auth/me');
    return res.data;
  },

  requestVerifyEmail: async (email: string): Promise<{ operation_id: string }> => {
    const res = await apiClient.post('/api/v1/auth/request-verify-email', { email });
    return res.data;
  },

  verifyEmail: async (verifyToken: string): Promise<{ success: boolean; access_token: string; refresh_token: string }> => {
    const res = await apiClient.post('/api/v1/auth/verify-email', { verify_token: verifyToken });
    return res.data;
  },

};
