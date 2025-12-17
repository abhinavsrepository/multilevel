import { apiGet, apiPost } from './config/axiosConfig';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SponsorValidationResponse,
  OTPVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types';

// ==================== Authentication APIs ====================

/**
 * Login with email/mobile and password
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse['data']>> => {
  return apiPost<ApiResponse<LoginResponse['data']>>('/auth/login', data);
};

/**
 * Register new user account
 */
export const register = async (data: RegisterRequest): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/register', data);
};

/**
 * Validate sponsor ID
 */
export const validateSponsor = async (sponsorId: string): Promise<SponsorValidationResponse> => {
  return apiGet<SponsorValidationResponse>(`/auth/validate-sponsor/${sponsorId}`);
};

/**
 * Logout current user
 */
export const logout = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/logout');
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
  return apiPost<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken });
};

// ==================== OTP APIs ====================

/**
 * Send OTP to email
 */
export const sendEmailOTP = async (email: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/send-otp/email', { email });
};

/**
 * Send OTP to mobile
 */
export const sendMobileOTP = async (mobile: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/send-otp/mobile', { mobile });
};

/**
 * Verify OTP
 */
export const verifyOTP = async (data: OTPVerificationRequest): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/verify-otp', data);
};

/**
 * Resend OTP
 */
export const resendOTP = async (emailOrMobile: string, type: 'EMAIL' | 'MOBILE'): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/resend-otp', { emailOrMobile, type });
};

// ==================== Password Management APIs ====================

/**
 * Forgot password - Send reset link/OTP to email
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/forgot-password', data);
};

/**
 * Reset password using token/OTP
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/reset-password', data);
};

/**
 * Change password (logged-in user)
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/change-password', data);
};

/**
 * Validate reset password token
 */
export const validateResetToken = async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
  return apiGet<ApiResponse<{ valid: boolean }>>(`/auth/validate-reset-token/${token}`);
};

// ==================== Email/Mobile Verification APIs ====================

/**
 * Send email verification link
 */
export const sendEmailVerification = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/send-email-verification');
};

/**
 * Verify email using token
 */
export const verifyEmail = async (token: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/verify-email', { token });
};

/**
 * Send mobile verification OTP
 */
export const sendMobileVerification = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/send-mobile-verification');
};

/**
 * Verify mobile using OTP
 */
export const verifyMobile = async (otp: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/verify-mobile', { otp });
};

// ==================== Two-Factor Authentication APIs ====================

/**
 * Enable Two-Factor Authentication
 */
export const enableTwoFactor = async (): Promise<ApiResponse<{ qrCode: string; secret: string }>> => {
  return apiPost<ApiResponse<{ qrCode: string; secret: string }>>('/auth/2fa/enable');
};

/**
 * Verify and activate 2FA
 */
export const verifyTwoFactor = async (code: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/2fa/verify', { code });
};

/**
 * Disable Two-Factor Authentication
 */
export const disableTwoFactor = async (password: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/2fa/disable', { password });
};

/**
 * Verify 2FA code during login
 */
export const verifyTwoFactorLogin = async (code: string, tempToken: string): Promise<ApiResponse<LoginResponse['data']>> => {
  return apiPost<ApiResponse<LoginResponse['data']>>('/auth/2fa/verify-login', { code, tempToken });
};

// ==================== Session Management APIs ====================

/**
 * Get active sessions
 */
export const getActiveSessions = async (): Promise<ApiResponse<any[]>> => {
  return apiGet<ApiResponse<any[]>>('/auth/sessions');
};

/**
 * Terminate specific session
 */
export const terminateSession = async (sessionId: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/auth/sessions/${sessionId}/terminate`);
};

/**
 * Terminate all other sessions
 */
export const terminateAllSessions = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/auth/sessions/terminate-all');
};

// ==================== Account Status APIs ====================

/**
 * Check if email exists
 */
export const checkEmailExists = async (email: string): Promise<ApiResponse<{ exists: boolean }>> => {
  return apiGet<ApiResponse<{ exists: boolean }>>(`/auth/check-email/${email}`);
};

/**
 * Check if mobile exists
 */
export const checkMobileExists = async (mobile: string): Promise<ApiResponse<{ exists: boolean }>> => {
  return apiGet<ApiResponse<{ exists: boolean }>>(`/auth/check-mobile/${mobile}`);
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>('/auth/me');
};
