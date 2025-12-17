import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider,
  Stack,
  Box,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Warning,
  CheckCircle,
  Info,
  Error as ErrorIcon,
  HelpOutline,
} from '@mui/icons-material';

export type ConfirmModalVariant = 'info' | 'warning' | 'error' | 'success' | 'question';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  variant?: ConfirmModalVariant;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info';
  showIcon?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

const variantConfig: Record<
  ConfirmModalVariant,
  {
    icon: React.ReactElement;
    color: string;
    backgroundColor: string;
  }
> = {
  info: {
    icon: <Info sx={{ fontSize: 56 }} />,
    color: 'info.main',
    backgroundColor: 'info.main',
  },
  warning: {
    icon: <Warning sx={{ fontSize: 56 }} />,
    color: 'warning.main',
    backgroundColor: 'warning.main',
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 56 }} />,
    color: 'error.main',
    backgroundColor: 'error.main',
  },
  success: {
    icon: <CheckCircle sx={{ fontSize: 56 }} />,
    color: 'success.main',
    backgroundColor: 'success.main',
  },
  question: {
    icon: <HelpOutline sx={{ fontSize: 56 }} />,
    color: 'primary.main',
    backgroundColor: 'primary.main',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'question',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  showIcon = true,
  maxWidth = 'xs',
  children,
}) => {
  const [loading, setLoading] = useState(false);

  const config = variantConfig[variant];

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const result = onConfirm();

      // Check if onConfirm returns a Promise
      if (result instanceof Promise) {
        await result;
      }

      onClose();
    } catch (error) {
      console.error('Error in confirm action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close dialog"
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3} alignItems="center">
          {/* Icon */}
          {showIcon && (
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (theme) => alpha(theme.palette[variant].main, 0.1),
                color: config.color,
              }}
            >
              {config.icon}
            </Box>
          )}

          {/* Message */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              id="confirm-dialog-description"
              variant="body1"
              color="text.primary"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {message}
            </Typography>
          </Box>

          {/* Custom Content */}
          {children && (
            <Box sx={{ width: '100%', mt: 2 }}>
              {children}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          fullWidth
          sx={{ mr: 1 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          fullWidth
          startIcon={loading ? <CircularProgress size={20} /> : null}
          autoFocus
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Convenience hooks for common confirmation dialogs
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: ConfirmModalVariant;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'question',
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      variant?: ConfirmModalVariant;
      confirmText?: string;
      cancelText?: string;
      confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info';
    }
  ) => {
    setDialogState({
      open: true,
      title,
      message,
      onConfirm,
      variant: options?.variant || 'question',
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      confirmColor: options?.confirmColor,
    });
  };

  const hideConfirm = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const confirmProps = {
    open: dialogState.open,
    onClose: hideConfirm,
    onConfirm: dialogState.onConfirm,
    title: dialogState.title,
    message: dialogState.message,
    variant: dialogState.variant,
    confirmText: dialogState.confirmText,
    cancelText: dialogState.cancelText,
    confirmColor: dialogState.confirmColor,
  };

  return {
    showConfirm,
    hideConfirm,
    confirmProps,
  };
};

// Preset confirmation dialogs
export const confirmDelete = (
  itemName: string,
  onConfirm: () => void | Promise<void>
): {
  title: string;
  message: string;
  variant: ConfirmModalVariant;
  confirmColor: 'error';
  confirmText: string;
  onConfirm: () => void | Promise<void>;
} => ({
  title: 'Delete Confirmation',
  message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
  variant: 'error',
  confirmColor: 'error',
  confirmText: 'Delete',
  onConfirm,
});

export const confirmLogout = (
  onConfirm: () => void | Promise<void>
): {
  title: string;
  message: string;
  variant: ConfirmModalVariant;
  confirmColor: 'warning';
  confirmText: string;
  onConfirm: () => void | Promise<void>;
} => ({
  title: 'Logout',
  message: 'Are you sure you want to logout from your account?',
  variant: 'warning',
  confirmColor: 'warning',
  confirmText: 'Logout',
  onConfirm,
});

export const confirmCancel = (
  actionName: string,
  onConfirm: () => void | Promise<void>
): {
  title: string;
  message: string;
  variant: ConfirmModalVariant;
  confirmColor: 'warning';
  confirmText: string;
  onConfirm: () => void | Promise<void>;
} => ({
  title: 'Cancel Confirmation',
  message: `Are you sure you want to cancel ${actionName}? Any unsaved changes will be lost.`,
  variant: 'warning',
  confirmColor: 'warning',
  confirmText: 'Yes, Cancel',
  onConfirm,
});

export const confirmSubmit = (
  onConfirm: () => void | Promise<void>
): {
  title: string;
  message: string;
  variant: ConfirmModalVariant;
  confirmColor: 'success';
  confirmText: string;
  onConfirm: () => void | Promise<void>;
} => ({
  title: 'Submit Confirmation',
  message: 'Are you sure you want to submit? Please review all information before confirming.',
  variant: 'question',
  confirmColor: 'success',
  confirmText: 'Submit',
  onConfirm,
});
