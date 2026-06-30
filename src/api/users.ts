import type { User } from '../types'
import { apiClient } from './client'
import { fileToBase64 } from './fileUtils'

export const userApi = {
	updatePassword: async(old_password: string, new_password: string): Promise<{user: User}> => {
		const res = await apiClient.patch(`/api/v1/users/me/changepassword`, {old_password, new_password});
		return res.data;
	},
	
	uploadAvatar: async(file: File): Promise<{user: User}> => {
		const base64 = await fileToBase64(file);
		const res = await apiClient.patch(`/api/v1/users/me/uploadavatar`, {
			file_data: base64,
			content_type: file.type,
		});
		return res.data;
	}
}