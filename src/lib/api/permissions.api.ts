import { apiClient } from "../api-client";

export interface UpdatePermissionsRequest {
  permissions: string[];
}

export const permissionsApi = {
  /**
   * Update staff permissions
   */
  updateStaffPermissions: async (
    staffId: string,
    data: UpdatePermissionsRequest
  ) => {
    return apiClient.put(`/staff/${staffId}/permissions`, data);
  },

  /**
   * Get staff permissions
   */
  getStaffPermissions: async (staffId: string) => {
    return apiClient.get(`/staff/${staffId}/permissions`);
  },

  /**
   * Update user permissions
   */
  updateUserPermissions: async (
    userId: string,
    data: UpdatePermissionsRequest
  ) => {
    return apiClient.put(`/users/${userId}/permissions`, data);
  },

  /**
   * Get user permissions
   */
  getUserPermissions: async (userId: string) => {
    return apiClient.get(`/users/${userId}/permissions`);
  },
};
