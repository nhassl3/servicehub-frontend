import type { Admin } from '../types'
import { apiClient } from './client'
import { fileToBase64 } from './fileUtils'

export const adminsApi = {
	 getProfileByUsername: async (username: string): Promise<{ admin: Admin }> => {
			const res = await apiClient.get(`/api/v1/admins?username=${username}`);
			return res.data;
		},

		getProfileByUUID: async (uuid: string): Promise<{ admin: Admin }> => {
			const res = await apiClient.get(`/api/v1/admins?admin_id=${uuid}`);
			return res.data;
		},

		uploadAvatar: async (file: File): Promise<{ admin: Admin }> => {
			const base64 = await fileToBase64(file);
			const res = await apiClient.patch(`/api/v1/admins/me/uploadavatar`, {
				file_data: base64,
				content_type: file.type,
			});
			return res.data;
		},

		createAdmin: async (displayName: string, levelRights: number): Promise<{ admin: Admin }> => {
			const res = await apiClient.post('/api/v1/admins', {
				display_name: displayName,
				level_rights: levelRights,
			});
			return res.data;
		},

		getModeratedProducts: async (): Promise<{ products: any[] }> => {
			const res = await apiClient.get(`/api/v1/admins/me/moderatedproducts`);
			return res.data;
		}
}
