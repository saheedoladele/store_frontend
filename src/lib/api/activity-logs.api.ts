import { apiClient, ApiResponse } from '../api-client';
import { ActivityLog, ActivityLogFilters, ActivityLogResponse } from '@/types/activity-log';

export const activityLogsApi = {
  getLogs: async (filters?: ActivityLogFilters): Promise<ApiResponse<ActivityLogResponse>> => {
    const queryParams = filters
      ? `?${new URLSearchParams(
          Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()}`
      : '';
    return apiClient.get<ActivityLogResponse>(`/activity-logs${queryParams}`);
  },

  getLog: async (id: string): Promise<ApiResponse<ActivityLog>> => {
    return apiClient.get<ActivityLog>(`/activity-logs/${id}`);
  },
};
