import axiosInstance from './axiosConfig';

export interface RegisterData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  sponsorCode?: string;
  placement?: 'LEFT' | 'RIGHT';
}

export interface LoginData {
  emailOrMobile: string;
  password: string;
}

export interface VerifyOtpData {
  emailOrMobile: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    token: string;
    refreshToken?: string;
  };
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Verify OTP
   */
  verifyOtp: async (data: VerifyOtpData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/verify-otp', data);
    return response.data;
  },

  /**
   * Resend OTP
   */
  resendOtp: async (emailOrMobile: string): Promise<OtpResponse> => {
    const response = await axiosInstance.post<OtpResponse>('/auth/resend-otp', { emailOrMobile });
    return response.data;
  },

  /**
   * Forgot password - send reset link
   */
  forgotPassword: async (email: string): Promise<OtpResponse> => {
    const response = await axiosInstance.post<OtpResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordData): Promise<OtpResponse> => {
    const response = await axiosInstance.post<OtpResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<OtpResponse> => {
    const response = await axiosInstance.post<OtpResponse>('/auth/logout');
    return response.data;
  },
};

export default authApi;
