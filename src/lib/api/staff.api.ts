import { apiClient, ApiResponse } from '../api-client';
import { Staff } from '@/types/staff';

export const staffApi = {
  getStaff: async (): Promise<ApiResponse<Staff[]>> => {
    return apiClient.get<Staff[]>('/staff');
  },

  getStaffMember: async (id: string): Promise<ApiResponse<Staff>> => {
    return apiClient.get<Staff>(`/staff/${id}`);
  },

  createStaff: async (staff: Partial<Staff>): Promise<ApiResponse<Staff>> => {
    return apiClient.post<Staff>('/staff', staff);
  },

  updateStaff: async (id: string, staff: Partial<Staff>): Promise<ApiResponse<Staff>> => {
    return apiClient.put<Staff>(`/staff/${id}`, staff);
  },

  deleteStaff: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/staff/${id}`);
  },
};
