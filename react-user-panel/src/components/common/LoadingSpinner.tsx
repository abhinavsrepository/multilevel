import React from 'react';
import {
  Box,
  CircularProgress,
  Skeleton,
  Card,
  CardContent,
  Grid,
  useTheme,
  Typography,
} from '@mui/material';

export type LoadingVariant = 'circular' | 'skeleton' | 'card' | 'table' | 'list';

interface LoadingSpinnerProps {
  variant?: LoadingVariant;
  message?: string;
  size?: number | 'small' | 'medium' | 'large';
  color?: string;
  rows?: number;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'circular',
  message,
  size = 'medium',
  color,
  rows = 3,
  fullScreen = false,
}) => {
  const theme = useTheme();

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const circularSize = typeof size === 'string' ? sizeMap[size] : size;

  // Circular Loading
  if (variant === 'circular') {
    const content = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <CircularProgress
          size={circularSize}
          thickness={4}
          sx={{
            color: color || theme.palette.primary.main,
          }}
        />
        {message && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              fontWeight: 500,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );

    if (fullScreen) {
      return (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
        >
          {content}
        </Box>
      );
    }

    return content;
  }

  // Skeleton Loading
  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            animation="wave"
            sx={{
              fontSize: '1rem',
              mb: 1,
              width: index === rows - 1 ? '70%' : '100%',
            }}
          />
        ))}
      </Box>
    );
  }

  // Card Loading
  if (variant === 'card') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: rows > 6 ? 6 : rows }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="circular" width={48} height={48} />
                </Box>
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Table Loading
  if (variant === 'table') {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Table Header */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="text" width="25%" height={24} />
          ))}
        </Box>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              pb: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width="25%"
                height={20}
                animation="wave"
              />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  // List Loading
  if (variant === 'list') {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              pb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};

export default LoadingSpinner;
