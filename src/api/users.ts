import type { User } from '../types'
import { apiClient } from './client'

export const userApi = {
	updatePassword: async(old_password: string, new_password: string): Promise<{user: User}> => {
		const res = await apiClient.patch(`/api/v1/users/me/changepassword`, {old_password, new_password})
		return res.data;
	}
}