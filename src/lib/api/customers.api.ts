import { apiClient, ApiResponse } from '../api-client';
import { Customer, CustomerFormData } from '@/types/customer';

export const customersApi = {
  getCustomers: async (search?: string): Promise<ApiResponse<Customer[]>> => {
    const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<Customer[]>(`/customers${queryParams}`);
  },

  getCustomer: async (id: string): Promise<ApiResponse<Customer>> => {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  createCustomer: async (customer: CustomerFormData): Promise<ApiResponse<Customer>> => {
    return apiClient.post<Customer>('/customers', customer);
  },

  updateCustomer: async (id: string, customer: Partial<CustomerFormData>): Promise<ApiResponse<Customer>> => {
    return apiClient.put<Customer>(`/customers/${id}`, customer);
  },

  deleteCustomer: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/customers/${id}`);
  },
};
