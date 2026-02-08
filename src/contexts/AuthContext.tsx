import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Tenant } from "@/types/tenant";
import { authApi } from "@/lib/api/auth.api";
import { tenantApi } from "@/lib/api/tenant.api";

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean; tempToken?: string } | void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    tenantName: string
  ) => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth data
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        const savedTenant = localStorage.getItem("tenant");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedTenant && savedToken) {
          setUser(JSON.parse(savedUser));
          setTenant(JSON.parse(savedTenant));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("tenant");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<{ requiresTwoFactor?: boolean; tempToken?: string } | void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting login for:', email);
    try {
      const response = await authApi.login({ email, password, two_factor_code: twoFactorCode });
      console.log('[Auth] Login response:', response);

      if (!response.success || !response.data) {
        console.error('[Auth] Login failed:', response.error);
        throw new Error(response.error?.message || "Login failed");
      }

      // Check if 2FA is required
      if ((response.data as any).requiresTwoFactor) {
        const { tempToken } = (response.data as any);
        return {
          requiresTwoFactor: true,
          tempToken,
        };
      }

      const { user, tenant, token } = response.data as AuthResponse;
      console.log('[Auth] Login successful, setting user state');

      setUser(user);
      setTenant(tenant);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tenant", JSON.stringify(tenant));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error('[Auth] Login error:', error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    tenantName: string
  ) => {
    setIsLoading(true);
    console.log('[Auth] Attempting registration for:', email, 'Store:', tenantName);
    try {
      const response = await authApi.register({
        email,
        password,
        name,
        tenantName,
      });
      console.log('[Auth] Registration response:', response);

      // Only set user state if registration is successful
      if (!response.success || !response.data) {
        console.error('[Auth] Registration failed:', response.error);
        throw new Error(response.error?.message || "Registration failed");
      }

      // Registration successful - set user state (this will trigger redirect)
      const { user, tenant, token } = response.data;
      console.log('[Auth] Registration successful, setting user state');

      setUser(user);
      setTenant(tenant);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tenant", JSON.stringify(tenant));
      localStorage.setItem("token", token);
    } catch (error) {
      // Registration failed - do NOT set user state, stay on register form
      // User state remains null, so no redirect will occur
      console.error('[Auth] Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    localStorage.removeItem("user");
    localStorage.removeItem("tenant");
    localStorage.removeItem("token");
  };

  const refreshTenant = async () => {
    try {
      const response = await tenantApi.getTenant();
      if (response.success && response.data) {
        setTenant(response.data);
        localStorage.setItem("tenant", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to refresh tenant:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, tenant, isLoading, login, logout, register, refreshTenant }}
    >
      {children}
    </AuthContext.Provider>
  );
};
