import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, LinearProgress, Typography, useTheme, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export type PageLoaderVariant = 'circular' | 'linear' | 'logo' | 'dots' | 'spinner';

interface PageLoaderProps {
  variant?: PageLoaderVariant;
  message?: string;
  progress?: number;
  fullScreen?: boolean;
  overlay?: boolean;
  showLogo?: boolean;
  minDuration?: number;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  variant = 'circular',
  message,
  progress,
  fullScreen = true,
  overlay = true,
  showLogo = true,
  minDuration = 0,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (minDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [minDuration]);

  if (!visible && minDuration > 0) {
    return null;
  }

  const containerStyles = {
    position: fullScreen ? ('fixed' as const) : ('absolute' as const),
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: fullScreen ? 9999 : 1,
    backgroundColor: overlay
      ? theme.palette.mode === 'dark'
        ? 'rgba(15, 23, 42, 0.95)'
        : 'rgba(255, 255, 255, 0.95)'
      : 'transparent',
    backdropFilter: overlay ? 'blur(8px)' : 'none',
  };

  // Circular Loader
  if (variant === 'circular') {
    return (
      <Fade in timeout={300}>
        <Box sx={containerStyles}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {showLogo && (
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    backgroundColor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  RE
                </Box>
              )}

              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />

              {message && (
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b',
                    fontWeight: 500,
                    mt: 2,
                  }}
                >
                  {message}
                </Typography>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Fade>
    );
  }

  // Linear Loader
  if (variant === 'linear') {
    return (
      <Fade in timeout={300}>
        <Box sx={containerStyles}>
          <Box sx={{ width: '100%', maxWidth: 400, px: 4 }}>
            {showLogo && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    backgroundColor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  RE
                </Box>
              </Box>
            )}

            <LinearProgress
              variant={progress !== undefined ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />

            {message && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b',
                  fontWeight: 500,
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                {message}
              </Typography>
            )}

            {progress !== undefined && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#94a3b8' : '#94a3b8',
                  display: 'block',
                  textAlign: 'center',
                  mt: 1,
                }}
              >
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        </Box>
      </Fade>
    );
  }

  // Logo Loader
  if (variant === 'logo') {
    return (
      <Fade in timeout={300}>
        <Box sx={containerStyles}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              }}
            >
              RE
            </Box>
          </motion.div>

          {message && (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b',
                fontWeight: 500,
                mt: 3,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  // Dots Loader
  if (variant === 'dots') {
    return (
      <Fade in timeout={300}>
        <Box sx={containerStyles}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                  }}
                />
              </motion.div>
            ))}
          </Box>

          {message && (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b',
                fontWeight: 500,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  // Spinner Loader
  if (variant === 'spinner') {
    return (
      <Fade in timeout={300}>
        <Box sx={containerStyles}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                border: `4px solid ${
                  theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'
                }`,
                borderTopColor: theme.palette.primary.main,
                borderRadius: '50%',
              }}
            />
          </motion.div>

          {message && (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b',
                fontWeight: 500,
                mt: 3,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  return null;
};

export default PageLoader;
