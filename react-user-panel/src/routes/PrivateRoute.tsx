import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthContext } from '@/context/AuthContext';

/**
 * PrivateRoute Props
 */
interface PrivateRouteProps {
  children: React.ReactNode;
  requireKYC?: boolean;
  requireEmailVerification?: boolean;
  requireMobileVerification?: boolean;
  redirectTo?: string;
}

/**
 * PrivateRoute Component
 *
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 * Optionally checks for KYC verification, email verification, etc.
 *
 * @param children - Child components to render if authenticated
 * @param requireKYC - Whether KYC verification is required
 * @param requireEmailVerification - Whether email verification is required
 * @param requireMobileVerification - Whether mobile verification is required
 * @param redirectTo - Custom redirect path (defaults to /login)
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requireKYC = false,
  requireEmailVerification = false,
  requireMobileVerification = false,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    loading,
    isKYCVerified,
    isEmailVerified,
    isMobileVerified,
  } = useAuthContext();

  /**
   * Show loading spinner while checking authentication
   */
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  /**
   * Redirect to login if not authenticated
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  /**
   * Check KYC verification if required
   */
  if (requireKYC && !isKYCVerified()) {
    return (
      <Navigate
        to="/kyc"
        state={{
          from: location,
          message: 'KYC verification is required to access this page',
        }}
        replace
      />
    );
  }

  /**
   * Check email verification if required
   */
  if (requireEmailVerification && !isEmailVerified()) {
    return (
      <Navigate
        to="/verify-email"
        state={{
          from: location,
          message: 'Email verification is required to access this page',
        }}
        replace
      />
    );
  }

  /**
   * Check mobile verification if required
   */
  if (requireMobileVerification && !isMobileVerified()) {
    return (
      <Navigate
        to="/verify-mobile"
        state={{
          from: location,
          message: 'Mobile verification is required to access this page',
        }}
        replace
      />
    );
  }

  /**
   * Render children if all checks pass
   */
  return <>{children}</>;
};

export default PrivateRoute;

/**
 * Higher-Order Component for protecting routes
 *
 * Usage:
 * const ProtectedComponent = withPrivateRoute(MyComponent, { requireKYC: true });
 */
export const withPrivateRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireKYC?: boolean;
    requireEmailVerification?: boolean;
    requireMobileVerification?: boolean;
    redirectTo?: string;
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <PrivateRoute {...options}>
        <Component {...props} />
      </PrivateRoute>
    );
  };

  WrappedComponent.displayName = `withPrivateRoute(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};
