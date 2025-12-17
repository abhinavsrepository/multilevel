import React from 'react';
import Swal, { SweetAlertOptions, SweetAlertResult, SweetAlertIcon } from 'sweetalert2';
import { useTheme } from '@mui/material';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  customClass?: {
    container?: string;
    popup?: string;
    header?: string;
    title?: string;
    closeButton?: string;
    icon?: string;
    image?: string;
    content?: string;
    htmlContainer?: string;
    input?: string;
    inputLabel?: string;
    validationMessage?: string;
    actions?: string;
    confirmButton?: string;
    denyButton?: string;
    cancelButton?: string;
    loader?: string;
    footer?: string;
  };
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  inputPlaceholder?: string;
  inputValue?: string;
  inputValidator?: (value: string) => Promise<string | null> | string | null;
  preConfirm?: (inputValue: any) => Promise<any> | any;
  timer?: number;
  timerProgressBar?: boolean;
  html?: string;
  footer?: string;
}

// Confirm Dialog Hook
export const useConfirmDialog = () => {
  const theme = useTheme();

  const getDefaultOptions = (isDark: boolean): SweetAlertOptions => ({
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#ffffff' : '#1e293b',
    confirmButtonColor: theme.palette.primary.main,
    cancelButtonColor: isDark ? '#475569' : '#94a3b8',
    customClass: {
      popup: isDark ? 'dark-popup' : 'light-popup',
      confirmButton: 'confirm-button-custom',
      cancelButton: 'cancel-button-custom',
    },
  });

  const showConfirm = async (
    options: ConfirmDialogOptions = {}
  ): Promise<SweetAlertResult> => {
    const isDark = theme.palette.mode === 'dark';

    const swalOptions: SweetAlertOptions = {
      ...getDefaultOptions(isDark),
      title: options.title || 'Are you sure?',
      text: options.message,
      html: options.html,
      icon: options.icon || 'question',
      showCancelButton: options.showCancelButton !== undefined ? options.showCancelButton : true,
      showConfirmButton:
        options.showConfirmButton !== undefined ? options.showConfirmButton : true,
      confirmButtonText: options.confirmButtonText || 'Confirm',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      allowOutsideClick: options.allowOutsideClick !== undefined ? options.allowOutsideClick : true,
      allowEscapeKey: options.allowEscapeKey !== undefined ? options.allowEscapeKey : true,
      reverseButtons: true,
      ...options,
    };

    if (options.confirmButtonColor) {
      swalOptions.confirmButtonColor = options.confirmButtonColor;
    }

    if (options.cancelButtonColor) {
      swalOptions.cancelButtonColor = options.cancelButtonColor;
    }

    return await Swal.fire(swalOptions);
  };

  const showAlert = async (
    title: string,
    message?: string,
    icon: SweetAlertIcon = 'info'
  ): Promise<SweetAlertResult> => {
    const isDark = theme.palette.mode === 'dark';

    return await Swal.fire({
      ...getDefaultOptions(isDark),
      title,
      text: message,
      icon,
      showCancelButton: false,
      confirmButtonText: 'OK',
    });
  };

  const showSuccess = async (
    title: string = 'Success!',
    message?: string
  ): Promise<SweetAlertResult> => {
    return await showAlert(title, message, 'success');
  };

  const showError = async (
    title: string = 'Error!',
    message?: string
  ): Promise<SweetAlertResult> => {
    return await showAlert(title, message, 'error');
  };

  const showWarning = async (
    title: string = 'Warning!',
    message?: string
  ): Promise<SweetAlertResult> => {
    return await showAlert(title, message, 'warning');
  };

  const showInfo = async (
    title: string = 'Info',
    message?: string
  ): Promise<SweetAlertResult> => {
    return await showAlert(title, message, 'info');
  };

  const showDelete = async (
    itemName: string = 'this item'
  ): Promise<SweetAlertResult> => {
    const isDark = theme.palette.mode === 'dark';

    return await Swal.fire({
      ...getDefaultOptions(isDark),
      title: 'Delete Confirmation',
      html: `Are you sure you want to delete <strong>${itemName}</strong>?<br/><small>This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: theme.palette.error.main,
      reverseButtons: true,
    });
  };

  const showInput = async (
    title: string,
    inputType: ConfirmDialogOptions['inputType'] = 'text',
    options: ConfirmDialogOptions = {}
  ): Promise<SweetAlertResult> => {
    const isDark = theme.palette.mode === 'dark';

    return await Swal.fire({
      ...getDefaultOptions(isDark),
      title,
      input: inputType,
      inputPlaceholder: options.inputPlaceholder,
      inputValue: options.inputValue,
      inputValidator: options.inputValidator,
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Submit',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      preConfirm: options.preConfirm,
      reverseButtons: true,
      ...options,
    });
  };

  const showLoading = (title: string = 'Processing...', message?: string) => {
    const isDark = theme.palette.mode === 'dark';

    Swal.fire({
      ...getDefaultOptions(isDark),
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const showToast = async (
    title: string,
    icon: SweetAlertIcon = 'success',
    position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end'
  ): Promise<SweetAlertResult> => {
    const isDark = theme.palette.mode === 'dark';

    return await Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#ffffff' : '#1e293b',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  };

  const close = () => {
    Swal.close();
  };

  return {
    showConfirm,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDelete,
    showInput,
    showLoading,
    showToast,
    close,
  };
};

// Component wrapper (optional)
interface ConfirmDialogProps {
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = () => {
  // This is just a wrapper component - actual dialogs are shown using the hook
  return null;
};

export default ConfirmDialog;
