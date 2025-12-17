/**
 * useNotification Hook
 * Custom hook for displaying toast notifications
 */

import { useCallback } from 'react';
import { toast, ToastOptions, ToastPosition, TypeOptions } from 'react-toastify';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface NotificationOptions extends Omit<ToastOptions, 'type'> {
  type?: NotificationType;
  message?: string;
  duration?: number;
  position?: ToastPosition;
  closeButton?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  rtl?: boolean;
  autoClose?: number | false;
  theme?: 'light' | 'dark' | 'colored';
}

export interface UseNotificationReturn {
  success: (message: string, options?: NotificationOptions) => void;
  error: (message: string, options?: NotificationOptions) => void;
  warning: (message: string, options?: NotificationOptions) => void;
  info: (message: string, options?: NotificationOptions) => void;
  notify: (message: string, options?: NotificationOptions) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: NotificationOptions
  ) => Promise<T>;
  dismiss: (toastId?: string | number) => void;
  dismissAll: () => void;
  update: (toastId: string | number, options: NotificationOptions) => void;
  isActive: (toastId: string | number) => boolean;
}

/**
 * Default notification options
 */
const DEFAULT_OPTIONS: NotificationOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

/**
 * Custom hook for notifications
 */
export const useNotification = (): UseNotificationReturn => {
  /**
   * Show success notification
   */
  const success = useCallback((message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.success(message, mergedOptions);
  }, []);

  /**
   * Show error notification
   */
  const error = useCallback((message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.error(message, mergedOptions);
  }, []);

  /**
   * Show warning notification
   */
  const warning = useCallback((message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.warning(message, mergedOptions);
  }, []);

  /**
   * Show info notification
   */
  const info = useCallback((message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.info(message, mergedOptions);
  }, []);

  /**
   * Show notification with custom type
   */
  const notify = useCallback((message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { type, ...restOptions } = mergedOptions;

    if (type && type !== 'default') {
      toast[type](message, restOptions);
    } else {
      toast(message, restOptions);
    }
  }, []);

  /**
   * Show promise-based notification
   */
  const promiseNotification = useCallback(
    <T,>(
      promise: Promise<T>,
      messages: {
        pending: string;
        success: string;
        error: string;
      },
      options?: NotificationOptions
    ): Promise<T> => {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      return toast.promise(
        promise,
        {
          pending: messages.pending,
          success: messages.success,
          error: messages.error,
        },
        mergedOptions
      );
    },
    []
  );

  /**
   * Dismiss a specific notification
   */
  const dismiss = useCallback((toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  }, []);

  /**
   * Dismiss all notifications
   */
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  /**
   * Update an existing notification
   */
  const update = useCallback((toastId: string | number, options: NotificationOptions) => {
    toast.update(toastId, options);
  }, []);

  /**
   * Check if a notification is active
   */
  const isActive = useCallback((toastId: string | number): boolean => {
    return toast.isActive(toastId);
  }, []);

  return {
    success,
    error,
    warning,
    info,
    notify,
    promise: promiseNotification,
    dismiss,
    dismissAll,
    update,
    isActive,
  };
};

/**
 * Notification helper functions (can be used without hook)
 */
export const notification = {
  /**
   * Show success notification
   */
  success: (message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.success(message, mergedOptions);
  },

  /**
   * Show error notification
   */
  error: (message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.error(message, mergedOptions);
  },

  /**
   * Show warning notification
   */
  warning: (message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.warning(message, mergedOptions);
  },

  /**
   * Show info notification
   */
  info: (message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    toast.info(message, mergedOptions);
  },

  /**
   * Show notification with custom type
   */
  notify: (message: string, options?: NotificationOptions) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { type, ...restOptions } = mergedOptions;

    if (type && type !== 'default') {
      toast[type](message, restOptions);
    } else {
      toast(message, restOptions);
    }
  },

  /**
   * Show promise-based notification
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: NotificationOptions
  ): Promise<T> => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    return toast.promise(
      promise,
      {
        pending: messages.pending,
        success: messages.success,
        error: messages.error,
      },
      mergedOptions
    );
  },

  /**
   * Dismiss a specific notification
   */
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Dismiss all notifications
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Update an existing notification
   */
  update: (toastId: string | number, options: NotificationOptions) => {
    toast.update(toastId, options);
  },

  /**
   * Check if a notification is active
   */
  isActive: (toastId: string | number): boolean => {
    return toast.isActive(toastId);
  },
};

/**
 * Predefined notification messages
 */
export const NOTIFICATION_MESSAGES = {
  // Success messages
  SUCCESS: {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logout successful!',
    REGISTER: 'Registration successful!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PASSWORD_UPDATED: 'Password updated successfully!',
    KYC_SUBMITTED: 'KYC submitted successfully!',
    KYC_UPDATED: 'KYC updated successfully!',
    BANK_DETAILS_UPDATED: 'Bank details updated successfully!',
    WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully!',
    TICKET_CREATED: 'Support ticket created successfully!',
    MESSAGE_SENT: 'Message sent successfully!',
    COPIED: 'Copied to clipboard!',
    SAVED: 'Changes saved successfully!',
    DELETED: 'Deleted successfully!',
    UPLOADED: 'File uploaded successfully!',
  },

  // Error messages
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your internet connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    VALIDATION: 'Please check the form for errors.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    REGISTRATION_FAILED: 'Registration failed. Please try again.',
    UPDATE_FAILED: 'Update failed. Please try again.',
    DELETE_FAILED: 'Delete failed. Please try again.',
    UPLOAD_FAILED: 'File upload failed. Please try again.',
    COPY_FAILED: 'Failed to copy to clipboard.',
  },

  // Warning messages
  WARNING: {
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
    DELETE_CONFIRM: 'Are you sure you want to delete this?',
    LOGOUT_CONFIRM: 'Are you sure you want to logout?',
    CANCEL_CONFIRM: 'Are you sure you want to cancel?',
    INCOMPLETE_PROFILE: 'Please complete your profile.',
    KYC_PENDING: 'Your KYC verification is pending.',
    INSUFFICIENT_BALANCE: 'Insufficient balance.',
  },

  // Info messages
  INFO: {
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    SAVING: 'Saving...',
    UPLOADING: 'Uploading...',
    DOWNLOADING: 'Downloading...',
    SENDING: 'Sending...',
    NO_DATA: 'No data available.',
    NO_RESULTS: 'No results found.',
    EMPTY_LIST: 'List is empty.',
  },
};

/**
 * Notification helper for API calls
 */
export const notifyApiCall = async <T,>(
  apiCall: () => Promise<T>,
  messages?: {
    pending?: string;
    success?: string;
    error?: string;
  },
  options?: NotificationOptions
): Promise<T> => {
  const defaultMessages = {
    pending: messages?.pending || NOTIFICATION_MESSAGES.INFO.PROCESSING,
    success: messages?.success || NOTIFICATION_MESSAGES.SUCCESS.SAVED,
    error: messages?.error || NOTIFICATION_MESSAGES.ERROR.GENERIC,
  };

  return notification.promise(apiCall(), defaultMessages, options);
};

/**
 * Notification helper for async operations
 */
export const withNotification = <T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  messages?: {
    pending?: string;
    success?: string;
    error?: string;
  },
  options?: NotificationOptions
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const defaultMessages = {
      pending: messages?.pending || NOTIFICATION_MESSAGES.INFO.PROCESSING,
      success: messages?.success || NOTIFICATION_MESSAGES.SUCCESS.SAVED,
      error: messages?.error || NOTIFICATION_MESSAGES.ERROR.GENERIC,
    };

    try {
      const result = await notification.promise(asyncFn(...args), defaultMessages, options);
      return result;
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Show loading notification
 */
export const showLoading = (message: string = NOTIFICATION_MESSAGES.INFO.LOADING): string | number => {
  return toast.loading(message);
};

/**
 * Update loading notification to success
 */
export const updateToSuccess = (
  toastId: string | number,
  message: string = NOTIFICATION_MESSAGES.SUCCESS.SAVED
): void => {
  toast.update(toastId, {
    render: message,
    type: 'success',
    isLoading: false,
    autoClose: 5000,
  });
};

/**
 * Update loading notification to error
 */
export const updateToError = (
  toastId: string | number,
  message: string = NOTIFICATION_MESSAGES.ERROR.GENERIC
): void => {
  toast.update(toastId, {
    render: message,
    type: 'error',
    isLoading: false,
    autoClose: 5000,
  });
};

/**
 * Confirm notification (requires user interaction)
 */
export const confirmNotification = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  const CustomToast = ({ closeToast }: { closeToast: () => void }) => (
    <div>
      <p>{message}</p>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            onConfirm();
            closeToast();
          }}
          style={{
            padding: '5px 15px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => {
            onCancel?.();
            closeToast();
          }}
          style={{
            padding: '5px 15px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  toast(<CustomToast closeToast={() => toast.dismiss()} />, {
    autoClose: false,
    closeButton: true,
  });
};

export default useNotification;
