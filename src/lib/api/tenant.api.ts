import { apiClient, ApiResponse } from '../api-client';
import { Tenant } from '@/types/tenant';

export interface TenantSettings {
  // General Settings
  currency?: string;
  timezone?: string;
  date_format?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  operating_hours?: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  // POS Settings
  tax_rate?: number;
  receipt_footer?: string;
  auto_print_receipt?: boolean;
  require_customer_info?: boolean;
  default_payment_method?: "cash" | "card" | "digital_wallet";
  quick_sale_enabled?: boolean;
  // Inventory Settings
  low_stock_threshold?: number;
  auto_reorder?: boolean;
  reorder_point?: number;
  track_serial_numbers?: boolean;
  enable_barcode_scanning?: boolean;
  // Notification Settings
  email_notifications?: boolean;
  sms_notifications?: boolean;
  low_stock_alerts?: boolean;
  daily_sales_report?: boolean;
  invoice_reminders?: boolean;
  // Integration Settings
  stripe_enabled?: boolean;
  stripe_public_key?: string;
  email_service_enabled?: boolean;
  backup_enabled?: boolean;
  api_access_enabled?: boolean;
}

export const tenantApi = {
  getTenant: async (): Promise<ApiResponse<Tenant>> => {
    return apiClient.get<Tenant>('/tenants/me');
  },

  updateTenant: async (data: { name?: string; logo?: string | null }): Promise<ApiResponse<Tenant>> => {
    return apiClient.put<Tenant>('/tenants/me', data);
  },

  getSettings: async (): Promise<ApiResponse<TenantSettings>> => {
    return apiClient.get<TenantSettings>('/tenants/me/settings');
  },

  updateSettings: async (data: TenantSettings): Promise<ApiResponse<TenantSettings>> => {
    return apiClient.put<TenantSettings>('/tenants/me/settings', data);
  },

  uploadLogo: async (base64String: string): Promise<ApiResponse<{ logo: string }>> => {
    return apiClient.put<{ logo: string }>('/tenants/me/logo', { logo: base64String });
  },
};
