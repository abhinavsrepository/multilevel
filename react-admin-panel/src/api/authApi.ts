import { api } from './axiosConfig';
import {
  LoginRequest,
  LoginResponse,
  TwoFactorRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types/auth.types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  verify2FA: (data: TwoFactorRequest) => api.post('/auth/verify-2fa', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', {}, {
      headers: { 'Refresh-Token': refreshToken },
    }),

  forgotPassword: (data: ForgotPasswordRequest) => api.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) => api.post('/auth/reset-password', data),

  changePassword: (data: ChangePasswordRequest) => api.post('/auth/change-password', data),

  getProfile: () => api.get('/auth/me'),
};
