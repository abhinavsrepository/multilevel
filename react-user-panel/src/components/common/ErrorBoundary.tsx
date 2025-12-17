import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Container, Paper, useTheme } from '@mui/material';
import { ErrorOutline, Refresh, Home } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} onGoHome={this.handleGoHome} />;
    }

    return this.props.children;
  }
}

// Fallback component
interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
  onGoHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset, onGoHome }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Error Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 80,
                color: 'error.main',
                opacity: 0.8,
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
            }}
          >
            Oops! Something Went Wrong
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            We're sorry for the inconvenience. An unexpected error has occurred. Our team has been
            notified and is working to fix the issue. Please try refreshing the page or go back to
            the home page.
          </Typography>

          {/* Error Details (Development only) */}
          {isDevelopment && error && (
            <Box
              sx={{
                mb: 4,
                p: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                borderRadius: 2,
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 300,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'error.main',
                }}
              >
                Error Details (Development Mode):
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#cbd5e1' : '#475569',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  m: 0,
                }}
              >
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={onReset}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              Try Again
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Home />}
              onClick={onGoHome}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Go to Home
            </Button>
          </Box>

          {/* Support Info */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 4,
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
            }}
          >
            If the problem persists, please contact our support team at{' '}
            <Box
              component="a"
              href="mailto:support@realestate-mlm.com"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              support@realestate-mlm.com
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;
