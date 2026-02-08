import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/permissions";

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Owner and admin have all permissions
    if (user.role === "owner" || user.role === "admin") {
      return true;
    }

    // Check if user has the specific permission
    return user.permissions?.includes(permission) || false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;

    if (user.role === "owner" || user.role === "admin") {
      return true;
    }

    return permissions.some((permission) => user.permissions?.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;

    if (user.role === "owner" || user.role === "admin") {
      return true;
    }

    return permissions.every((permission) => user.permissions?.includes(permission));
  };

  /**
   * Check if user can access a page
   */
  const canAccessPage = (pagePath: string): boolean => {
    if (!user) return false;

    if (user.role === "owner" || user.role === "admin") {
      return true;
    }

    // Map page paths to permissions
    const pagePermissionMap: Record<string, string> = {
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

    const requiredPermission = pagePermissionMap[pagePath];
    if (!requiredPermission) {
      // If page doesn't have a permission requirement, allow access
      return true;
    }

    return user.permissions?.includes(requiredPermission) || false;
  };

  /**
   * Check if user can manage permissions
   */
  const canManagePermissions = (): boolean => {
    if (!user) return false;
    return user.role === "owner" || user.role === "admin";
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
    canManagePermissions,
    userRole: user?.role,
    userPermissions: user?.permissions || [],
  };
};
