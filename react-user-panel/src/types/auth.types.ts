// Authentication Types
export interface LoginRequest {
  emailOrMobile: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      userId: string;
      fullName: string;
      email: string;
      mobile: string;
      profilePicture?: string;
      rank: string;
      kycStatus: string;
    };
  };
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  sponsorId: string;
  placement: 'LEFT' | 'RIGHT' | 'AUTO';
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface SponsorValidationResponse {
  success: boolean;
  data?: {
    sponsorId: string;
    name: string;
    rank: string;
    contact: string;
    isValid: boolean;
  };
}

export interface OTPVerificationRequest {
  emailOrMobile: string;
  otp: string;
  verificationType: 'EMAIL' | 'MOBILE' | 'REGISTRATION';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface AuthUser {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  profilePicture?: string;
  rank: string;
  kycStatus: string;
}
