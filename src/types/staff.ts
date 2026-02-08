export interface Staff {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'manager' | 'cashier' | 'inventory_clerk' | 'sales_associate';
    department?: string;
    hire_date: string;
    salary?: number;
    commission_rate?: number;
    status: 'active' | 'inactive' | 'on_leave';
    permissions: string[];
    last_login?: string;
    emergency_contact?: EmergencyContact;
    address?: string;
    city?: string;
    postal_code?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Permission {
    id: string;
    name: string;
    description: string;
    module: 'pos' | 'inventory' | 'customers' | 'reports' | 'settings' | 'staff';
  }
  
  export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }
  
  export interface StaffFormData {
    name: string;
    email: string;
    phone?: string;
    role: 'manager' | 'cashier' | 'inventory_clerk' | 'sales_associate';
    department?: string;
    hire_date: string;
    salary?: number;
    commission_rate?: number;
    permissions: string[];
    emergency_contact?: EmergencyContact;
    address?: string;
    city?: string;
    postal_code?: string;
    create_user_account?: boolean;
    password?: string;
  }
  
  export interface StaffPerformance {
    staff_id: string;
    period: string;
    sales_count: number;
    sales_total: number;
    customer_satisfaction: number;
    attendance_rate: number;
    performance_score: number;
  }
  