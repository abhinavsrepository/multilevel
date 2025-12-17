import React from 'react';
import { Backdrop, Box, CircularProgress, Typography, keyframes } from '@mui/material';

interface LoadingSpinnerProps {
  open?: boolean;
  message?: string;
  fullPage?: boolean;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  open = true,
  message,
  fullPage = true,
  size = 60,
  thickness = 4,
  color = 'primary',
}) => {
  // Full page loading with backdrop
  if (fullPage) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1000,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        open={open}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress
            size={size}
            thickness={thickness}
            sx={{
              color: 'white',
            }}
          />
          {message && (
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                fontWeight: 500,
                animation: `${pulse} 1.5s ease-in-out infinite`,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    );
  }

  // Inline/centered loading
  if (!open) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        width: '100%',
        py: 4,
      }}
    >
      <CircularProgress size={size} thickness={thickness} color={color} />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 2,
            fontWeight: 500,
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
