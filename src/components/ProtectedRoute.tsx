import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PAGE_PERMISSIONS } from "@/constants/permissions";
import { useLocation, Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ 
    children: React.ReactNode;
    requiredPermission?: string;
  }> = ({
    children,
    requiredPermission,
  }) => {
    const { user, isLoading } = useAuth();
    const { hasPermission, canAccessPage } = usePermissions();
    const location = useLocation();
  
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
  
    if (!user) {
      return <Navigate to="/login" replace />;
    }
  
    // Check page permission
    const pagePermission = requiredPermission || PAGE_PERMISSIONS[location.pathname];
    if (pagePermission && !hasPermission(pagePermission) && !canAccessPage(location.pathname)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  
    return <>{children}</>;
  };
  export default ProtectedRoute;