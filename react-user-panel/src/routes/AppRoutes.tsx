import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { routesConfig, RouteConfig } from './routes.config';
import PrivateRoute from './PrivateRoute';
import { AuthLayout, DashboardLayout, BlankLayout } from '@/layouts';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Loading Fallback Component
 *
 * Shown while lazy-loaded components are being loaded
 */
const LoadingFallback: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="body1" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
};

/**
 * Get Layout Component based on layout type
 */
const getLayoutComponent = (layout: 'auth' | 'dashboard' | 'blank') => {
  switch (layout) {
    case 'auth':
      return AuthLayout;
    case 'dashboard':
      return DashboardLayout;
    case 'blank':
      return BlankLayout;
    default:
      return BlankLayout;
  }
};

/**
 * Render Route with Layout and Protection
 */
const RenderRoute: React.FC<{ route: RouteConfig }> = ({ route }) => {
  const Layout = getLayoutComponent(route.layout);
  const Element = route.element;

  // Wrap component in layout
  const LayoutWrappedElement = (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Element />
      </Suspense>
    </Layout>
  );

  // Wrap in PrivateRoute if protected
  if (route.protected) {
    return (
      <PrivateRoute>
        {LayoutWrappedElement}
      </PrivateRoute>
    );
  }

  return LayoutWrappedElement;
};

/**
 * AppRoutes Component
 *
 * Main routing component that renders all application routes
 * with proper layouts and protection.
 *
 * Features:
 * - Lazy loading with code splitting
 * - Protected routes with authentication check
 * - Layout wrapping (Auth, Dashboard, Blank)
 * - Loading fallback for lazy components
 * - Auto redirect authenticated users from auth pages
 * - 404 Not Found handling
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Map all routes from config */}
        {routesConfig.map((route) => {
          // For auth routes, redirect to dashboard if already authenticated
          if (route.layout === 'auth' && !route.protected) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <RenderRoute route={route} />
                  )
                }
              />
            );
          }

          // For all other routes
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<RenderRoute route={route} />}
            />
          );
        })}

        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <BlankLayout>
              <Suspense fallback={<LoadingFallback />}>
                {(() => {
                  const NotFound = routesConfig.find((r) => r.path === '*')?.element;
                  return NotFound ? <NotFound /> : <Navigate to="/404" replace />;
                })()}
              </Suspense>
            </BlankLayout>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

/**
 * Route Helper Functions
 */

/**
 * Get breadcrumbs for current path
 */
export const getBreadcrumbs = (pathname: string): string[] => {
  const route = routesConfig.find((r) => {
    // Exact match
    if (r.path === pathname) return true;

    // Dynamic route match (e.g., /properties/:id)
    const routePattern = r.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });

  if (!route) return [];

  // Build breadcrumb trail
  const breadcrumbs: string[] = [];
  const pathSegments = pathname.split('/').filter(Boolean);

  pathSegments.forEach((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const matchedRoute = routesConfig.find((r) => r.path === path);

    if (matchedRoute?.breadcrumb) {
      breadcrumbs.push(matchedRoute.breadcrumb);
    } else {
      // Capitalize segment as fallback
      breadcrumbs.push(segment.charAt(0).toUpperCase() + segment.slice(1));
    }
  });

  return breadcrumbs;
};

/**
 * Get page title for current path
 */
export const getPageTitle = (pathname: string): string => {
  const route = routesConfig.find((r) => {
    // Exact match
    if (r.path === pathname) return true;

    // Dynamic route match
    const routePattern = r.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });

  return route?.title || 'MLM Real Estate Platform';
};

/**
 * Check if route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  const route = routesConfig.find((r) => {
    // Exact match
    if (r.path === pathname) return true;

    // Dynamic route match
    const routePattern = r.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });

  return route?.protected || false;
};

/**
 * Get route config by pathname
 */
export const getRouteConfig = (pathname: string): RouteConfig | undefined => {
  return routesConfig.find((r) => {
    // Exact match
    if (r.path === pathname) return true;

    // Dynamic route match
    const routePattern = r.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });
};
