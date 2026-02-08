// Permission definitions for the application
// Format: module:page:action or module:action

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // Point of Sale
  POS_VIEW: "pos:view",
  POS_CREATE_SALE: "pos:create_sale",
  POS_VIEW_SALES: "pos:view_sales",
  POS_CANCEL_SALE: "pos:cancel_sale",
  POS_REFUND: "pos:refund",

  // Inventory
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_CREATE_PRODUCT: "inventory:create_product",
  INVENTORY_EDIT_PRODUCT: "inventory:edit_product",
  INVENTORY_DELETE_PRODUCT: "inventory:delete_product",
  INVENTORY_VIEW_PRODUCTS: "inventory:view_products",
  INVENTORY_MANAGE_STOCK: "inventory:manage_stock",

  // Categories
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_EDIT: "categories:edit",
  CATEGORIES_DELETE: "categories:delete",

  // Customers
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_EDIT: "customers:edit",
  CUSTOMERS_DELETE: "customers:delete",
  CUSTOMERS_VIEW_DETAILS: "customers:view_details",

  // Staff
  STAFF_VIEW: "staff:view",
  STAFF_CREATE: "staff:create",
  STAFF_EDIT: "staff:edit",
  STAFF_DELETE: "staff:delete",
  STAFF_VIEW_DETAILS: "staff:view_details",
  STAFF_MANAGE_PERMISSIONS: "staff:manage_permissions",

  // Reports
  REPORTS_VIEW: "reports:view",
  REPORTS_EXPORT: "reports:export",
  REPORTS_VIEW_SALES: "reports:view_sales",
  REPORTS_VIEW_ANALYTICS: "reports:view_analytics",

  // Billing
  BILLING_VIEW: "billing:view",
  BILLING_VIEW_INVOICES: "billing:view_invoices",
  BILLING_DOWNLOAD_INVOICES: "billing:download_invoices",

  // Returns
  RETURNS_VIEW: "returns:view",
  RETURNS_CREATE: "returns:create",
  RETURNS_APPROVE: "returns:approve",
  RETURNS_REJECT: "returns:reject",

  // Transactions
  TRANSACTIONS_VIEW: "transactions:view",
  TRANSACTIONS_EXPORT: "transactions:export",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT_GENERAL: "settings:edit_general",
  SETTINGS_EDIT_POS: "settings:edit_pos",
  SETTINGS_EDIT_INVENTORY: "settings:edit_inventory",
  SETTINGS_EDIT_NOTIFICATIONS: "settings:edit_notifications",
  SETTINGS_EDIT_INTEGRATIONS: "settings:edit_integrations",

  // Activity Logs
  LOGS_VIEW: "logs:view",
  LOGS_EXPORT: "logs:export",
} as const;

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  dashboard: {
    label: "Dashboard",
    permissions: [PERMISSIONS.DASHBOARD_VIEW],
  },
  pos: {
    label: "Point of Sale",
    permissions: [
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_CREATE_SALE,
      PERMISSIONS.POS_VIEW_SALES,
      PERMISSIONS.POS_CANCEL_SALE,
      PERMISSIONS.POS_REFUND,
    ],
  },
  inventory: {
    label: "Inventory",
    permissions: [
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_VIEW_PRODUCTS,
      PERMISSIONS.INVENTORY_CREATE_PRODUCT,
      PERMISSIONS.INVENTORY_EDIT_PRODUCT,
      PERMISSIONS.INVENTORY_DELETE_PRODUCT,
      PERMISSIONS.INVENTORY_MANAGE_STOCK,
    ],
  },
  categories: {
    label: "Categories",
    permissions: [
      PERMISSIONS.CATEGORIES_VIEW,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_EDIT,
      PERMISSIONS.CATEGORIES_DELETE,
    ],
  },
  customers: {
    label: "Customers",
    permissions: [
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_EDIT,
      PERMISSIONS.CUSTOMERS_DELETE,
      PERMISSIONS.CUSTOMERS_VIEW_DETAILS,
    ],
  },
  staff: {
    label: "Staff",
    permissions: [
      PERMISSIONS.STAFF_VIEW,
      PERMISSIONS.STAFF_CREATE,
      PERMISSIONS.STAFF_EDIT,
      PERMISSIONS.STAFF_DELETE,
      PERMISSIONS.STAFF_VIEW_DETAILS,
      PERMISSIONS.STAFF_MANAGE_PERMISSIONS,
    ],
  },
  reports: {
    label: "Sales Reports",
    permissions: [
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_VIEW_SALES,
      PERMISSIONS.REPORTS_VIEW_ANALYTICS,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },
  billing: {
    label: "Billing",
    permissions: [
      PERMISSIONS.BILLING_VIEW,
      PERMISSIONS.BILLING_VIEW_INVOICES,
      PERMISSIONS.BILLING_DOWNLOAD_INVOICES,
    ],
  },
  returns: {
    label: "Returns",
    permissions: [
      PERMISSIONS.RETURNS_VIEW,
      PERMISSIONS.RETURNS_CREATE,
      PERMISSIONS.RETURNS_APPROVE,
      PERMISSIONS.RETURNS_REJECT,
    ],
  },
  transactions: {
    label: "Transactions",
    permissions: [
      PERMISSIONS.TRANSACTIONS_VIEW,
      PERMISSIONS.TRANSACTIONS_EXPORT,
    ],
  },
  settings: {
    label: "Settings",
    permissions: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT_GENERAL,
      PERMISSIONS.SETTINGS_EDIT_POS,
      PERMISSIONS.SETTINGS_EDIT_INVENTORY,
      PERMISSIONS.SETTINGS_EDIT_NOTIFICATIONS,
      PERMISSIONS.SETTINGS_EDIT_INTEGRATIONS,
    ],
  },
  logs: {
    label: "Activity Logs",
    permissions: [PERMISSIONS.LOGS_VIEW, PERMISSIONS.LOGS_EXPORT],
  },
} as const;

// Page to permission mapping
export const PAGE_PERMISSIONS: Record<string, string> = {
  "/dashboard": PERMISSIONS.DASHBOARD_VIEW,
  "/pos": PERMISSIONS.POS_VIEW,
  "/inventory": PERMISSIONS.INVENTORY_VIEW,
  "/categories": PERMISSIONS.CATEGORIES_VIEW,
  "/customers": PERMISSIONS.CUSTOMERS_VIEW,
  "/staff": PERMISSIONS.STAFF_VIEW,
  "/reports": PERMISSIONS.REPORTS_VIEW,
  "/billing": PERMISSIONS.BILLING_VIEW,
  "/returns": PERMISSIONS.RETURNS_VIEW,
  "/transactions": PERMISSIONS.TRANSACTIONS_VIEW,
  "/settings": PERMISSIONS.SETTINGS_VIEW,
  "/logs": PERMISSIONS.LOGS_VIEW,
  "/permissions": PERMISSIONS.STAFF_MANAGE_PERMISSIONS,
};

// Helper function to get all permissions
export const getAllPermissions = (): string[] => {
  return Object.values(PERMISSIONS);
};

// Helper function to get permissions by group
export const getPermissionsByGroup = (group: string): string[] => {
  return PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS]?.permissions || [];
};
