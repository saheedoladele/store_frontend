export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category_id?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  variants: ProductVariant[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: { [key: string]: string };
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  children?: Category[];
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reference: string;
  notes?: string;
  created_by: string;
  created_at: string;
}
