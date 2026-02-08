import { apiClient, ApiResponse } from '../api-client';
import { Product, Category } from '@/types/inventory';

export const inventoryApi = {
  // Products
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    return apiClient.get<Product[]>('/products');
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.get<Product>(`/products/${id}`);
  },

  createProduct: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiClient.post<Product>('/products', product);
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiClient.put<Product>(`/products/${id}`, product);
  },

  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/products/${id}`);
  },

  getLowStockProducts: async (): Promise<ApiResponse<Product[]>> => {
    return apiClient.get<Product[]>('/products/low-stock');
  },

  // Categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiClient.get<Category[]>('/categories');
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  createCategory: async (category: Partial<Category>): Promise<ApiResponse<Category>> => {
    return apiClient.post<Category>('/categories', category);
  },

  updateCategory: async (id: string, category: Partial<Category>): Promise<ApiResponse<Category>> => {
    return apiClient.put<Category>(`/categories/${id}`, category);
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/categories/${id}`);
  },
};
