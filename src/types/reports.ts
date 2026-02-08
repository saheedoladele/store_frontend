export interface SalesReport {
  id: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string;
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  top_products: ProductSales[];
  sales_by_category: CategorySales[];
  created_at: string;
}

export interface ProductSales {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface CategorySales {
  category: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface SalesMetrics {
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  this_month: number;
  last_month: number;
  this_year: number;
  last_year: number;
}

export interface ReportFilters {
  start_date: string;
  end_date: string;
  category?: string;
  staff_member?: string;
  payment_method?: string;
}

export interface DashboardStats {
  total_revenue?: number;
  total_orders?: number;
  total_products?: number;
  total_customers?: number;
  revenue_change?: number;
  orders_change?: number;
  products_change?: number;
  customers_change?: number;
  low_stock_count?: number;
  total_inventory_value?: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}