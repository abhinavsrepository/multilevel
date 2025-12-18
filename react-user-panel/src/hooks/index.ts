/**
 * Hooks Index
 * Central export point for all custom hooks
 */

// Auth Hook
export { useAuth } from './useAuth';
export type { AuthUser, LoginCredentials, RegisterData, AuthState, UseAuthReturn } from './useAuth';

// Debounce Hook
export {
  useDebounce,
  useDebouncedCallback,
  useDebouncedCallbackImmediate,
  useDebouncedSearch,
  useAdvancedDebounce,
} from './useDebounce';
export type { UseDebouncedSearchReturn, DebouncedFunction } from './useDebounce';

// LocalStorage Hook
export {
  useLocalStorage,
  useLocalStorageSSR,
  useLocalStorageValidated,
  useLocalStorageWithExpiry,
} from './useLocalStorage';
export type { UseLocalStorageValidatedOptions, StorageWithExpiry } from './useLocalStorage';

// Window Size Hook
export {
  useWindowSize,
  useBreakpoint,
  useWidthRange,
  useMediaQuery,
  useDarkMode,
  useReducedMotion,
  useTouchDevice,
  useViewport,
  useScrollPosition,
  useScrollDirection,
  useInViewport,
  useWindowFocus,
  useOnlineStatus,
} from './useWindowSize';
export type { WindowSize, UseWindowSizeReturn, ScrollPosition, ScrollDirection } from './useWindowSize';

// Infinite Scroll Hook
export {
  useInfiniteScroll,
  useInfiniteScrollRef,
  useInfiniteScrollScroll,
  useInfiniteScrollContainer,
  usePaginatedData,
  useCursorPagination,
} from './useInfiniteScroll';
export type {
  UseInfiniteScrollOptions,
  UseInfiniteScrollReturn,
  UseInfiniteScrollScrollOptions,
  UsePaginatedDataOptions,
  UsePaginatedDataReturn,
  UseCursorPaginationOptions,
  UseCursorPaginationReturn,
} from './useInfiniteScroll';

// Notification Hook
export {
  useNotification,
  notification,
  NOTIFICATION_MESSAGES,
  notifyApiCall,
  withNotification,
  showLoading,
  updateToSuccess,
  updateToError,
  confirmNotification,
} from './useNotification';
export type { NotificationType, NotificationOptions, UseNotificationReturn } from './useNotification';

// Snackbar Hook
export { useSnackbar } from './useSnackbar';
export type { SnackbarOptions, UseSnackbarReturn } from './useSnackbar';
