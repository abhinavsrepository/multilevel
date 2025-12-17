import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SponsorValidationResponse,
  OTPVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../../types/auth.types';

// Base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Auth API service
export const authService = createApi({
  reducerPath: 'authService',
  baseQuery,
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Register
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Logout
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Refresh token
    refreshToken: builder.mutation<{ data: { token: string; refreshToken: string } }, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify token
    verifyToken: builder.query<{ data: { user: any } }, void>({
      query: () => '/auth/verify-token',
      providesTags: ['Auth'],
    }),

    // Validate sponsor
    validateSponsor: builder.query<SponsorValidationResponse, string>({
      query: (sponsorId) => `/auth/validate-sponsor/${sponsorId}`,
    }),

    // Send OTP
    sendOTP: builder.mutation<{ success: boolean; message: string }, { emailOrMobile: string; type: string }>({
      query: (data) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify OTP
    verifyOTP: builder.mutation<{ success: boolean; message: string }, OTPVerificationRequest>({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation<{ success: boolean; message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<{ success: boolean; message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Change password
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify email
    verifyEmail: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Verify mobile
    verifyMobile: builder.mutation<{ success: boolean; message: string }, { otp: string }>({
      query: (data) => ({
        url: '/auth/verify-mobile',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Enable 2FA
    enable2FA: builder.mutation<{ success: boolean; data: { qrCode: string; secret: string } }, void>({
      query: () => ({
        url: '/auth/2fa/enable',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Verify 2FA
    verify2FA: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: (data) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Disable 2FA
    disable2FA: builder.mutation<{ success: boolean; message: string }, { password: string }>({
      query: (data) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Check email availability
    checkEmailAvailability: builder.query<{ available: boolean }, string>({
      query: (email) => `/auth/check-email/${email}`,
    }),

    // Check mobile availability
    checkMobileAvailability: builder.query<{ available: boolean }, string>({
      query: (mobile) => `/auth/check-mobile/${mobile}`,
    }),

    // Check userId availability
    checkUserIdAvailability: builder.query<{ available: boolean }, string>({
      query: (userId) => `/auth/check-userid/${userId}`,
    }),

    // Resend verification email
    resendVerificationEmail: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/resend-verification-email',
        method: 'POST',
      }),
    }),

    // Resend verification SMS
    resendVerificationSMS: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/resend-verification-sms',
        method: 'POST',
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyTokenQuery,
  useLazyVerifyTokenQuery,
  useValidateSponsorQuery,
  useLazyValidateSponsorQuery,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useVerifyMobileMutation,
  useEnable2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
  useCheckEmailAvailabilityQuery,
  useLazyCheckEmailAvailabilityQuery,
  useCheckMobileAvailabilityQuery,
  useLazyCheckMobileAvailabilityQuery,
  useCheckUserIdAvailabilityQuery,
  useLazyCheckUserIdAvailabilityQuery,
  useResendVerificationEmailMutation,
  useResendVerificationSMSMutation,
} = authService;

export default authService;
