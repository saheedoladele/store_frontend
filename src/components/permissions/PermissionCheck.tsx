import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionCheckProps {
  permission: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on permissions
 */
export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  permission,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
