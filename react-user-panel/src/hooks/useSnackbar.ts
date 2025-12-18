/**
 * useSnackbar Hook
 * Custom hook for displaying snackbar notifications
 */

import { useCallback } from 'react';
import { toast, ToastOptions } from 'react-toastify';

export interface SnackbarOptions extends ToastOptions {
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface UseSnackbarReturn {
  showSnackbar: (message: string, optionsOrSeverity?: SnackbarOptions | 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * useSnackbar Hook
 * Provides a simple interface for showing toast notifications
 */
export const useSnackbar = (): UseSnackbarReturn => {
  const showSnackbar = useCallback((message: string, optionsOrSeverity?: SnackbarOptions | 'success' | 'error' | 'warning' | 'info') => {
    // Support both object options and string severity
    const options = typeof optionsOrSeverity === 'string'
      ? { severity: optionsOrSeverity }
      : optionsOrSeverity || {};

    const { severity = 'info', duration = 3000, ...toastOptions } = options;

    const finalOptions: ToastOptions = {
      autoClose: duration,
      position: 'top-right',
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...toastOptions,
    };

    switch (severity) {
      case 'success':
        toast.success(message, finalOptions);
        break;
      case 'error':
        toast.error(message, finalOptions);
        break;
      case 'warning':
        toast.warning(message, finalOptions);
        break;
      case 'info':
      default:
        toast.info(message, finalOptions);
        break;
    }
  }, []);

  return { showSnackbar };
};
