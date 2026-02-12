import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { IdleTimeoutModal } from "@/components/auth/IdleTimeoutModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Categories from "@/pages/Categories";
import POS from "@/pages/POS";
import Customers from "@/pages/Customers";
import Staff from "@/pages/Staff";
import Reports from "@/pages/Reports";
import Billing from "@/pages/Billing";
import Settings from "@/pages/Settings";
import Logs from "@/pages/Logs";
import Returns from "@/pages/Returns";
import Transactions from "@/pages/Transactions";
import Permissions from "@/pages/Permissions";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
    const { user, isLoading, logout } = useAuth();
    const navigate = useNavigate();
  
    // Idle timeout configuration
    const {
      showWarning,
      timeRemaining,
      handleStayLoggedIn,
      handleLogout,
    } = useIdleTimeout({
      warningTime: 2 * 60 * 1000, // 2 minutes
      logoutTime: 3 * 60 * 1000, // 3 minutes
      onLogout: () => {
        logout();
        navigate("/login");
      },
      enabled: !!user, // Only enable when user is logged in
    });
  
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
  
    return (
      <>
        <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={user ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns"
          element={
            <ProtectedRoute>
              <Returns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permissions"
          element={
            <ProtectedRoute requiredPermission="staff:manage_permissions">
              <Permissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
        <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Idle Timeout Modal - only show when user is logged in */}
        {user && (
          <IdleTimeoutModal
            open={showWarning}
            timeRemaining={timeRemaining}
            onStayLoggedIn={handleStayLoggedIn}
            onLogout={handleLogout}
          />
        )}
      </>
    );
  };
  export default AppRoutes;