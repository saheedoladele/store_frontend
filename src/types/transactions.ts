export type TransactionType = 'sale' | 'return' | 'refund';

export interface Transaction {
  id: string;
  type: TransactionType;
  transaction_id: string; // sale_id or return_id
  customer_id?: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  amount: number; // positive for sales, negative for returns
  payment_method: 'cash' | 'card' | 'digital_wallet' | 'store_credit';
  status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  // Additional data based on type
  sale?: {
    id: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    items: any[];
  };
  return?: {
    id: string;
    sale_id: string;
    type: 'full_return' | 'partial_return' | 'exchange';
    refund_amount: number;
    items: any[];
  };
}
