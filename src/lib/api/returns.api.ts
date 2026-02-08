import { apiClient, ApiResponse } from '../api-client';

export interface ReturnItem {
  id: string;
  return_id: string;
  sale_item_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  refund_amount: number;
  exchange_product_id?: string;
  exchange_variant_id?: string;
  exchange_quantity?: number;
  product?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  exchange_product?: {
    id: string;
    name: string;
  };
  exchange_variant?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export interface Return {
  id: string;
  sale_id: string;
  customer_id?: string;
  created_by: string;
  type: 'full_return' | 'partial_return' | 'exchange';
  refund_amount: number;
  refund_method: 'cash' | 'card' | 'digital_wallet' | 'store_credit';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  sale?: {
    id: string;
    invoice_number?: string;
    total_amount: number;
    created_at: string;
    customer?: {
      id: string;
      name: string;
      email?: string;
    };
  };
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  items: ReturnItem[];
}

export interface CreateReturnRequest {
  sale_id: string;
  type: 'full_return' | 'partial_return' | 'exchange';
  items: Array<{
    sale_item_id: string;
    quantity: number;
    exchange_product_id?: string;
    exchange_variant_id?: string;
    exchange_quantity?: number;
  }>;
  refund_method?: 'cash' | 'card' | 'digital_wallet' | 'store_credit';
  reason?: string;
  notes?: string;
}

export interface UpdateReturnStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
}

export const returnsApi = {
  createReturn: async (data: CreateReturnRequest): Promise<ApiResponse<Return>> => {
    return apiClient.post<Return>('/returns', data);
  },

  getReturns: async (startDate?: string, endDate?: string): Promise<ApiResponse<Return[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiClient.get<Return[]>(`/returns${query ? `?${query}` : ''}`);
  },

  getReturn: async (id: string): Promise<ApiResponse<Return>> => {
    return apiClient.get<Return>(`/returns/${id}`);
  },

  approveReturn: async (id: string): Promise<ApiResponse<Return>> => {
    return apiClient.post<Return>(`/returns/${id}/approve`, {});
  },

  updateReturnStatus: async (id: string, data: UpdateReturnStatusRequest): Promise<ApiResponse<Return>> => {
    return apiClient.patch<Return>(`/returns/${id}/status`, data);
  },
};
