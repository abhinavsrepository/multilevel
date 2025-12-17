/**
 * Context Providers Index
 * Export all context providers and hooks from a single entry point
 */

// Auth Context
export {
  AuthProvider,
  useAuthContext,
  withAuth,
  withRole,
  withKYC,
  AuthContext,
} from './AuthContext';

// Theme Context
export {
  ThemeProvider,
  useThemeContext,
  ThemeContext,
} from './ThemeContext';

// Re-export types from Redux slices for convenience
export type { ThemeMode, ColorScheme, FontSize } from '../redux/slices/themeSlice';
export type { AuthUser } from '../types/auth.types';
