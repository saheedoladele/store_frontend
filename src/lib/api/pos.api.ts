import { apiClient, ApiResponse } from '../api-client';
import { Sale } from '@/types/pos';

export interface CreateSaleRequest {
  customer_id?: string;
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }>;
  payment_method: "cash" | "card" | "digital_wallet" | "store_credit";
  discount_amount?: number;
}

export const posApi = {
  createSale: async (sale: CreateSaleRequest): Promise<ApiResponse<Sale>> => {
    return apiClient.post<Sale>('/sales', sale);
  },

  getSales: async (): Promise<ApiResponse<Sale[]>> => {
    return apiClient.get<Sale[]>('/sales');
  },

  getSale: async (id: string): Promise<ApiResponse<Sale>> => {
    return apiClient.get<Sale>(`/sales/${id}`);
  },
};
