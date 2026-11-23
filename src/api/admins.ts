import type { Admin, AdminStatistics, AnalyticsGranularity } from '../types'
import { adminClient } from './client'
import { fileToBase64 } from './fileUtils'

export const adminsApi = {
	 getProfileByUsername: async (username: string): Promise<{ admin: Admin }> => {
			const res = await adminClient.get(`/api/v1/admins?username=${username}`);
			return res.data;
		},

		getProfileByUUID: async (uuid: string): Promise<{ admin: Admin }> => {
			const res = await adminClient.get(`/api/v1/admins?admin_id=${uuid}`);
			return res.data;
		},

		uploadAvatar: async (file: File): Promise<{ admin: Admin }> => {
			const base64 = await fileToBase64(file);
			const res = await adminClient.patch(`/api/v1/admins/me/uploadavatar`, {
				file_data: base64,
				content_type: file.type,
			});
			return res.data;
		},

		createAdmin: async (displayName: string, levelRights: number): Promise<{ admin: Admin }> => {
			const res = await adminClient.post('/api/v1/admins', {
				display_name: displayName,
				level_rights: levelRights,
			});
			return res.data;
		},

		getModeratedProducts: async (): Promise<{ products: any[] }> => {
			const res = await adminClient.get(`/api/v1/admins/me/moderatedproducts`);
			return res.data;
		},

		getStatistics: async (params?: { from?: string; to?: string; granularity?: AnalyticsGranularity }): Promise<AdminStatistics> => {
			const res = await adminClient.get(`/api/v1/admins/me/statistics`, { params });
			return res.data;
		}
}
