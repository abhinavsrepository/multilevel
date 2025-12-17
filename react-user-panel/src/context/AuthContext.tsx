import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectToken,
  login,
  register,
  logout,
  refreshToken,
  verifyToken,
  setUser,
  updateUser,
  clearError,
  resetAuth,
} from '../redux/slices/authSlice';
import { AuthUser, LoginRequest, RegisterRequest } from '../types/auth.types';

/**
 * Auth Context Type Definition
 */
interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (registrationData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyToken: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  clearError: () => void;
  resetAuth: () => void;

  // Utility functions
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isKYCVerified: () => boolean;
  isEmailVerified: () => boolean;
  isMobileVerified: () => boolean;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Context Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Context Provider Component
 *
 * Wraps Redux auth state and actions for easy consumption throughout the app.
 * Provides authentication state, actions, and utility functions.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Select auth state from Redux
  const auth = useAppSelector(selectAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const token = useAppSelector(selectToken);

  /**
   * Login Action
   */
  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await dispatch(login(credentials)).unwrap();
      } catch (error) {
        // Error is already stored in Redux state
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Register Action
   */
  const handleRegister = useCallback(
    async (registrationData: RegisterRequest) => {
      try {
        await dispatch(register(registrationData)).unwrap();
      } catch (error) {
        // Error is already stored in Redux state
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Logout Action
   */
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      // Even if logout fails, we still clear the local state
      console.error('Logout error:', error);
    }
  }, [dispatch]);

  /**
   * Refresh Token Action
   */
  const handleRefreshToken = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
    } catch (error) {
      // If token refresh fails, logout the user
      await handleLogout();
      throw error;
    }
  }, [dispatch, handleLogout]);

  /**
   * Verify Token Action
   */
  const handleVerifyToken = useCallback(async () => {
    try {
      await dispatch(verifyToken()).unwrap();
    } catch (error) {
      // If token verification fails, logout the user
      await handleLogout();
      throw error;
    }
  }, [dispatch, handleLogout]);

  /**
   * Set User Action
   */
  const handleSetUser = useCallback(
    (userData: AuthUser) => {
      dispatch(setUser(userData));
    },
    [dispatch]
  );

  /**
   * Update User Action
   */
  const handleUpdateUser = useCallback(
    (userData: Partial<AuthUser>) => {
      dispatch(updateUser(userData));
    },
    [dispatch]
  );

  /**
   * Clear Error Action
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Reset Auth Action
   */
  const handleResetAuth = useCallback(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.rank.toLowerCase() === role.toLowerCase();
    },
    [user]
  );

  /**
   * Check if user has a specific permission
   * Note: This is a placeholder. Implement based on your permission system.
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // Implement permission checking logic based on your system
      // For now, return true if user is authenticated
      return true;
    },
    [user]
  );

  /**
   * Check if user's KYC is verified
   */
  const isKYCVerified = useCallback((): boolean => {
    if (!user) return false;
    return user.kycStatus === 'APPROVED' || user.kycStatus === 'VERIFIED';
  }, [user]);

  /**
   * Check if user's email is verified
   * Note: This assumes email verification status is part of the user object
   */
  const isEmailVerified = useCallback((): boolean => {
    if (!user) return false;
    // Implement email verification check based on your user model
    // For now, return true if user exists
    return !!user.email;
  }, [user]);

  /**
   * Check if user's mobile is verified
   * Note: This assumes mobile verification status is part of the user object
   */
  const isMobileVerified = useCallback((): boolean => {
    if (!user) return false;
    // Implement mobile verification check based on your user model
    // For now, return true if user exists
    return !!user.mobile;
  }, [user]);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo(
    () => ({
      // State
      isAuthenticated,
      user,
      token,
      loading,
      error,

      // Actions
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshToken: handleRefreshToken,
      verifyToken: handleVerifyToken,
      setUser: handleSetUser,
      updateUser: handleUpdateUser,
      clearError: handleClearError,
      resetAuth: handleResetAuth,

      // Utility functions
      hasRole,
      hasPermission,
      isKYCVerified,
      isEmailVerified,
      isMobileVerified,
    }),
    [
      isAuthenticated,
      user,
      token,
      loading,
      error,
      handleLogin,
      handleRegister,
      handleLogout,
      handleRefreshToken,
      handleVerifyToken,
      handleSetUser,
      handleUpdateUser,
      handleClearError,
      handleResetAuth,
      hasRole,
      hasPermission,
      isKYCVerified,
      isEmailVerified,
      isMobileVerified,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use Auth Context
 *
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};

/**
 * HOC to require authentication
 *
 * @param Component - Component to wrap
 * @returns Wrapped component that requires authentication
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated } = useAuthContext();

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WithAuthComponent;
};

/**
 * HOC to require specific role
 *
 * @param Component - Component to wrap
 * @param requiredRole - Role required to access component
 * @returns Wrapped component that requires specific role
 */
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string
): React.FC<P> => {
  const WithRoleComponent: React.FC<P> = (props) => {
    const { hasRole } = useAuthContext();

    if (!hasRole(requiredRole)) {
      return null;
    }

    return <Component {...props} />;
  };

  WithRoleComponent.displayName = `withRole(${Component.displayName || Component.name || 'Component'})`;

  return WithRoleComponent;
};

/**
 * HOC to require KYC verification
 *
 * @param Component - Component to wrap
 * @returns Wrapped component that requires KYC verification
 */
export const withKYC = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithKYCComponent: React.FC<P> = (props) => {
    const { isKYCVerified } = useAuthContext();

    if (!isKYCVerified()) {
      return null;
    }

    return <Component {...props} />;
  };

  WithKYCComponent.displayName = `withKYC(${Component.displayName || Component.name || 'Component'})`;

  return WithKYCComponent;
};

// Export context for advanced usage
export { AuthContext };

// Default export
export default AuthProvider;
