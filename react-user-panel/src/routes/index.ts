/**
 * Routes
 *
 * Export all routing-related components and configurations
 */

export { default as AppRoutes, getBreadcrumbs, getPageTitle, isProtectedRoute, getRouteConfig } from './AppRoutes';
export { default as PrivateRoute, withPrivateRoute } from './PrivateRoute';
export {
  default as routesConfig,
  type RouteConfig,
  getRouteByPath,
  getProtectedRoutes,
  getPublicRoutes,
  getRoutesByLayout,
  routeGroups,
} from './routes.config';
