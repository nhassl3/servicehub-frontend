import type { Admin } from '../types'
import { apiClient } from './client'

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
			const buffer = await file.arrayBuffer();
			const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
			const res = await apiClient.patch(`/api/v1/admins/me/uploadavatar`, {
				file_data: base64,
				content_type: file.type,
			});
			return res.data;
		}
}