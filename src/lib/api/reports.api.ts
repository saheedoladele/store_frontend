import { apiClient, ApiResponse } from '../api-client';
import { DashboardStats, TopProduct } from '@/types/reports';
import { Sale } from '@/types/pos';

export const reportsApi = {
  getDashboardStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<DashboardStats>> => {
    const queryParams = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    return apiClient.get<DashboardStats>(`/dashboard/stats${queryParams}`);
  },

  getSalesReport: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Sale[]>> => {
    const queryParams = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    return apiClient.get<Sale[]>(`/sales${queryParams}`);
  },

  getTopProducts: async (limit?: number): Promise<ApiResponse<TopProduct[]>> => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiClient.get<TopProduct[]>(`/top-products${queryParams}`);
  },
};
