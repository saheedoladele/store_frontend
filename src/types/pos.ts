export interface Product {
    id: string;
    product_name: string;
    sku: string;
    barcode?: string;
    price: number;
    cost: number;
    stock_quantity: number;
    category: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProductVariant {
    id: string;
    product_id: string;
    name: string;
    sku: string;
    barcode?: string;
    price: number;
    cost: number;
    stock_quantity: number;
    attributes: Record<string, string>;
    created_at: string;
    updated_at: string;
  }
  
  export interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }
  
  export interface Sale {
    id: string;
    customer_id?: string;
    customer?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
    items: SaleItem[];
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method: 'cash' | 'card' | 'digital_wallet' | 'store_credit';
    status: 'completed' | 'pending' | 'cancelled' | 'refunded';
    created_at: string;
    updated_at: string;
  }
  
  export interface SaleItem {
    id: string;
    sale_id: string;
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: {
      id: string;
      name: string;
      category?: {
        id: string;
        name: string;
      };
    };
    variant?: ProductVariant;
    created_at: string;
  }
  
  export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    total_purchases: number;
    loyalty_points: number;
    created_at: string;
    updated_at: string;
  }