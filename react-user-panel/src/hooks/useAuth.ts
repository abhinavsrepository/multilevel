/**
 * useAuth Hook
 * Custom hook for authentication and user management
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuthToken,
  getUser,
  setAuthToken,
  setUser,
  setRefreshToken,
  clearAuthData,
  StoredUser,
} from '../utils/storage';
import { ROUTES } from '../utils/constants';

export interface AuthUser extends StoredUser {
  // Additional user properties can be added here
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  checkAuth: () => boolean;
  clearError: () => void;
}

/**
 * Custom hook for authentication
 */
export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getAuthToken();
        const user = getUser();

        if (token && user) {
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Replace with actual API call
      // const response = await authAPI.login(credentials);

      // Simulated API response
      const response = {
        user: {
          id: '1',
          email: credentials.email,
          name: 'John Doe',
          mobile: '9876543210',
          avatar: '',
          role: 'user',
          status: 'active',
          referralCode: 'REF123456',
        },
        token: 'mock_auth_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };

      // Store auth data
      setAuthToken(response.token);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Login error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed. Please try again.',
      }));
      throw error;
    }
  }, [navigate]);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Replace with actual API call
      // const response = await authAPI.register(data);

      // Simulated API response
      const response = {
        user: {
          id: '1',
          email: data.email,
          name: data.name,
          mobile: data.mobile,
          avatar: '',
          role: 'user',
          status: 'active',
          referralCode: 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        },
        token: 'mock_auth_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };

      // Store auth data
      setAuthToken(response.token);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Registration error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed. Please try again.',
      }));
      throw error;
    }
  }, [navigate]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    try {
      // TODO: Call logout API if needed
      // await authAPI.logout();

      // Clear auth data
      clearAuthData();

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Navigate to login
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      clearAuthData();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  /**
   * Update user data
   */
  const updateUser = useCallback((userData: Partial<AuthUser>) => {
    setState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };
      setUser(updatedUser);

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback((): boolean => {
    const token = getAuthToken();
    const user = getUser();
    return !!(token && user);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    clearError,
  };
};

export default useAuth;
