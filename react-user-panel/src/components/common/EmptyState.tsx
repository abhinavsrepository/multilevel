import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import {
  Inbox,
  SearchOff,
  ErrorOutline,
  FolderOpen,
  CloudOff,
  AccountBalanceWallet,
  Notifications,
  Assignment,
} from '@mui/icons-material';

export type EmptyStateVariant =
  | 'default'
  | 'search'
  | 'error'
  | 'no-data'
  | 'offline'
  | 'empty-wallet'
  | 'no-notifications'
  | 'no-documents';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  message,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const theme = useTheme();

  // Preset configurations for different variants
  const presets = {
    default: {
      icon: <Inbox sx={{ fontSize: 80 }} />,
      title: 'No Data Available',
      message: 'There is no data to display at the moment.',
      color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
    },
    search: {
      icon: <SearchOff sx={{ fontSize: 80 }} />,
      title: 'No Results Found',
      message: 'We couldn\'t find any results matching your search criteria. Try adjusting your filters.',
      color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
    },
    error: {
      icon: <ErrorOutline sx={{ fontSize: 80 }} />,
      title: 'Something Went Wrong',
      message: 'We encountered an error while loading the data. Please try again.',
      color: theme.palette.error.main,
    },
    'no-data': {
      icon: <FolderOpen sx={{ fontSize: 80 }} />,
      title: 'No Data Yet',
      message: 'You haven\'t created any items yet. Get started by creating your first one.',
      color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
    },
    offline: {
      icon: <CloudOff sx={{ fontSize: 80 }} />,
      title: 'You\'re Offline',
      message: 'Please check your internet connection and try again.',
      color: theme.palette.warning.main,
    },
    'empty-wallet': {
      icon: <AccountBalanceWallet sx={{ fontSize: 80 }} />,
      title: 'Wallet is Empty',
      message: 'Your wallet balance is currently zero. Add funds to get started.',
      color: theme.palette.info.main,
    },
    'no-notifications': {
      icon: <Notifications sx={{ fontSize: 80 }} />,
      title: 'No Notifications',
      message: 'You\'re all caught up! No new notifications at the moment.',
      color: theme.palette.success.main,
    },
    'no-documents': {
      icon: <Assignment sx={{ fontSize: 80 }} />,
      title: 'No Documents',
      message: 'You haven\'t uploaded any documents yet.',
      color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
    },
  };

  const preset = presets[variant];
  const displayIcon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayMessage = message || preset.message;
  const displayColor = preset.color;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        minHeight: 300,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          color: displayColor,
          opacity: 0.6,
          mb: 3,
          animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 0.6, transform: 'translateY(0)' },
          },
        }}
      >
        {displayIcon}
      </Box>

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
        }}
      >
        {displayTitle}
      </Typography>

      {/* Message */}
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
          maxWidth: 500,
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        {displayMessage}
      </Typography>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {actionLabel && onAction && (
            <Button
              variant="contained"
              onClick={onAction}
              sx={{
                px: 4,
                py: 1.2,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outlined"
              onClick={onSecondaryAction}
              sx={{
                px: 4,
                py: 1.2,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
