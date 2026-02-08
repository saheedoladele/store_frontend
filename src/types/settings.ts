export interface AppSettings {
    general: GeneralSettings;
    pos: POSSettings;
    inventory: InventorySettings;
    notifications: NotificationSettings;
    integrations: IntegrationSettings;
  }
  
  export interface GeneralSettings {
    business_name: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    currency: string;
    timezone: string;
    date_format: string;
    logo_url?: string;
  }
  
  export interface POSSettings {
    tax_rate: number;
    receipt_footer: string;
    auto_print_receipt: boolean;
    require_customer_info: boolean;
    default_payment_method: 'cash' | 'card' | 'digital_wallet';
    quick_sale_enabled: boolean;
  }
  
  export interface InventorySettings {
    low_stock_threshold: number;
    auto_reorder: boolean;
    reorder_point: number;
    track_serial_numbers: boolean;
    enable_barcode_scanning: boolean;
  }
  
  export interface NotificationSettings {
    email_notifications: boolean;
    sms_notifications: boolean;
    low_stock_alerts: boolean;
    daily_sales_report: boolean;
    invoice_reminders: boolean;
  }
  
  export interface IntegrationSettings {
    stripe_enabled: boolean;
    stripe_public_key?: string;
    email_service_enabled: boolean;
    backup_enabled: boolean;
    api_access_enabled: boolean;
  }