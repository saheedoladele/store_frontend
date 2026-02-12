export interface Customer {
    id: string;
    tenant_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    total_purchases: number;
    total_spent: number;
    loyalty_points: number;
    membership_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    last_visit?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface CustomerFormData {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    notes?: string;
  }
  