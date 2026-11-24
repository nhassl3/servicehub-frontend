import type { User } from '../types'
import { notificationClient, userClient } from './client'
import { fileToBase64 } from './fileUtils'

export const userApi = {
	updatePassword: async(old_password: string, new_password: string): Promise<{user: User}> => {
		const res = await userClient.patch(`/api/v1/users/me/changepassword`, {old_password, new_password});
		return res.data;
	},

	resetEmail: async (data: {new_email: string;}): Promise<{ operation_id: string }> => {
			const res = await userClient.post('/api/v1/users/me/reset-email', data);
			return res.data
		},

	requestResetPassword: async (email: string): Promise<{ operation_id: string }> => {
			const res = await userClient.post('/api/v1/users/me/request-reset-password', { email });
			return res.data;
		},
	
		approveCode: async (code: string, operation_id: string, key?: number): Promise<{ reset_token: string }> => {
			const res = await notificationClient.post('/api/v1/notifications', { code, operation_id, key });
			return res.data;
		},
	
		resetPassword: async (password: string, reset_token: string): Promise<{ success: boolean }> => {
			const res = await userClient.post('/api/v1/users/me/reset-password', { password, reset_token });
			return res.data;
		},

	requestVerifyEmail: async (email: string): Promise<{ operation_id: string }> => {
    const res = await userClient.post('/api/v1/users/me/request-verify-email', { email });
    return res.data;
  },

  verifyEmail: async (verifyToken: string): Promise<{ success: boolean; access_token: string; refresh_token: string }> => {
    const res = await userClient.post('/api/v1/users/me/verify-email', { verify_token: verifyToken });
    return res.data;
  },
	
	uploadAvatar: async(file: File): Promise<{user: User}> => {
		const base64 = await fileToBase64(file);
		const res = await userClient.patch(`/api/v1/users/me/uploadavatar`, {
			file_data: base64,
			content_type: file.type,
		});
		return res.data;
	}
}