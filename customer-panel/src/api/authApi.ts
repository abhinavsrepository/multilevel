import api from './axiosConfig';
import type { LoginCredentials, RegisterInput, AuthResponse } from '@/types/auth.types';
import type { UserProfile } from '@/types/user.types';

export const authApi = {
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterInput) => api.post<AuthResponse>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get<UserProfile>('/users/profile'),

  updateProfile: (data: Partial<UserProfile>) => api.put('/users/update-profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
