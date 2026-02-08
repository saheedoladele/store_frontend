export interface Invoice {
    id: string;
    invoice_number: string;
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    due_date: string;
    issue_date: string;
    payment_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface InvoiceItem {
    id: string;
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }
  
  export interface PaymentRecord {
    id: string;
    invoice_id?: string;
    amount: number;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
    reference_number?: string;
    payment_date: string;
    notes?: string;
    created_at: string;
  }
  
  export interface BillingSettings {
    company_name: string;
    company_address: string;
    tax_rate: number;
    currency: string;
    invoice_prefix: string;
    payment_terms: number; // days
    late_fee_rate: number;
  }