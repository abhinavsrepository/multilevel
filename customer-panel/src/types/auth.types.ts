export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'ASSOCIATE' | 'CUSTOMER';
  companyName?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ASSOCIATE' | 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  associateCode?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken?: string;
    user: AuthUser;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
