export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  settings: TenantSettings;
  subscription: Subscription;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  currency: string;
  tax_rate: number;
  business_address: string;
  business_phone: string;
  business_email: string;
  operating_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
}

export interface Subscription {
  plan: "free" | "basic" | "premium";
  status: "active" | "cancelled" | "past_due";
  current_period_end: string;
  stripe_subscription_id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "staff";
  tenant_id: string;
  permissions: string[];
  two_factor_enabled?: boolean;
  created_at: string;
}
