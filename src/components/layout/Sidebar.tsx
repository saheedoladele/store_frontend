import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  CreditCard,
  BarChart3,
  UserCheck,
  Shield,
  ArrowLeftRight,
  Store,
  Receipt,
  Key,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PAGE_PERMISSIONS } from "@/constants/permissions";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: PAGE_PERMISSIONS["/dashboard"],
  },
  {
    title: "Point of Sale",
    href: "/pos",
    icon: ShoppingCart,
    permission: PAGE_PERMISSIONS["/pos"],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    permission: PAGE_PERMISSIONS["/inventory"],
  },
  {
    title: "Categories",
    href: "/categories",
    icon: FileText,
    permission: PAGE_PERMISSIONS["/categories"],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    permission: PAGE_PERMISSIONS["/customers"],
  },
  {
    title: "Staff",
    href: "/staff",
    icon: UserCheck,
    permission: PAGE_PERMISSIONS["/staff"],
  },
  {
    title: "Sales Reports",
    href: "/reports",
    icon: BarChart3,
    permission: PAGE_PERMISSIONS["/reports"],
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
    permission: PAGE_PERMISSIONS["/billing"],
  },
  {
    title: "Returns",
    href: "/returns",
    icon: ArrowLeftRight,
    permission: PAGE_PERMISSIONS["/returns"],
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: Receipt,
    permission: PAGE_PERMISSIONS["/transactions"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    permission: PAGE_PERMISSIONS["/settings"],
  },
  {
    title: "Activity Logs",
    href: "/logs",
    icon: Shield,
    permission: PAGE_PERMISSIONS["/logs"],
  },
  {
    title: "Permissions",
    href: "/permissions",
    icon: Key,
    permission: PAGE_PERMISSIONS["/permissions"],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { tenant } = useAuth();
  const { hasPermission, canAccessPage } = usePermissions();

  // Filter sidebar items based on permissions
  const visibleItems = sidebarItems.filter((item) => {
    if (!item.permission) return true; // No permission required
    return hasPermission(item.permission) || canAccessPage(item.href);
  });

  return (
    <div className="pb-12 w-64 hidden lg:block border-r bg-white dark:bg-gray-900">
      <div className="space-y-4 py-4">
        {/* Store Logo and Name */}
        <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            {tenant?.logo ? (
              <div className="flex-shrink-0">
                <img
                  src={tenant.logo}
                  alt={tenant.name || "Store Logo"}
                  className="h-10 w-10 rounded-lg object-contain bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold tracking-tight truncate text-gray-900 dark:text-gray-100">
                {tenant?.name || "Store Manager"}
              </h2>
              {tenant?.subscription && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {tenant.subscription.plan} Plan
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="space-y-1">
            {visibleItems.map((item) => (
              <Button
                key={item.href}
                variant={
                  location.pathname === item.href ? "secondary" : "ghost"
                }
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.href && "bg-muted font-medium"
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span className="hidden xl:inline">{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
