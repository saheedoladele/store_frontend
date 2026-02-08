import { apiClient, ApiResponse } from '../api-client';
import { User, Tenant } from '@/types/tenant';

export interface LoginRequest {
  email: string;
  password: string;
  two_factor_code?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tenantName: string;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
  token: string;
}

export interface TwoFactorRequiredResponse {
  requiresTwoFactor: boolean;
  tempToken: string;
  user: User;
}

// Union type for login response
export type LoginResponse = AuthResponse | TwoFactorRequiredResponse;

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> => {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> => {
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
  },

  // Two-factor authentication
  enableTwoFactor: async (): Promise<ApiResponse<{ secret: string; qrCode: string; backupCodes: string[] }>> => {
    return apiClient.post('/auth/2fa/enable', {});
  },

  verifyTwoFactorSetup: async (code: string): Promise<ApiResponse<{ message: string; backupCodes: string[] }>> => {
    return apiClient.post('/auth/2fa/verify-setup', { code });
  },

  disableTwoFactor: async (password: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/2fa/disable', { password });
  },

  verifyTwoFactorLogin: async (code: string, tempToken: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post('/auth/2fa/verify-login', { code }, {
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
    });
  },
};
