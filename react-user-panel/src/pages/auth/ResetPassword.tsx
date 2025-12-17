import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  useTheme,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword, validateResetToken } from '@/api/auth.api';
import { InputField } from '@/components/forms/InputField';
import { PasswordStrength } from '@/components/forms/PasswordStrength';

import {
  Lock,
  CheckCircle,
  ArrowBack,
  VpnKey,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Validation Schema
const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

/**
 * ResetPassword Page Component
 *
 * Features:
 * - Token validation
 * - New password form
 * - Password strength indicator
 * - Form validation with Yup
 * - Loading and success states
 * - Responsive design
 * - Dark mode support
 */
const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('newPassword');

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenValidating(false);
        setError('Invalid or missing reset token');
        return;
      }

      try {
        const response = await validateResetToken(token);
        if (response.success && response.data?.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError('Invalid or expired reset token');
        }
      } catch (err: any) {
        setTokenValid(false);
        setError(
          err.response?.data?.message || 'Invalid or expired reset token'
        );
      } finally {
        setTokenValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.success) {
        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login', {
            state: { message: 'Password reset successful! Please login with your new password.' },
          });
        }, 3000);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading while validating token
  if (tokenValidating) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Validating reset token..."
        showLogo={true}
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please wait...
          </Typography>
        </Box>
      </>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Invalid or expired reset token"
        showLogo={true}
        maxWidth="sm"
      >
        <Box>
          <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
            {error || 'The password reset link is invalid or has expired.'}
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.05)',
              border: 1,
              borderColor: 'error.main',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Invalid Reset Link
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The password reset link you used is either invalid or has
              expired. Please request a new password reset link.
            </Typography>
          </Paper>

          {/* Action Buttons */}
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/auth/forgot-password"
              variant="contained"
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Request New Link
            </Button>
            <Button
              component={Link}
              to="/auth/login"
              variant="outlined"
              startIcon={<ArrowBack />}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Back to Login
            </Button>
          </Stack>
        </Box>
      </>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new password for your account"
      showLogo={true}
      maxWidth="sm"
    >
      {/* Success Message */}
      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            Password reset successful!
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(76, 175, 80, 0.1)'
                  : 'rgba(76, 175, 80, 0.05)',
              border: 1,
              borderColor: 'success.main',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 64,
                color: 'success.main',
                mb: 2,
              }}
            />
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Password Updated Successfully
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your password has been reset successfully. You can now login with
              your new password.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Redirecting to login page...
            </Typography>
          </Paper>
        </Box>
      ) : (
        <>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {/* Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.05)',
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Please create a strong password for your account. Make sure
                  it meets all the security requirements.
                </Typography>
              </Paper>

              {/* New Password Input */}
              <InputField
                name="newPassword"
                control={control}
                label="New Password"
                type="password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                autoFocus
                startIcon={<Lock fontSize="small" sx={{ opacity: 0.6 }} />}
              />

              {/* Password Strength Indicator */}
              {passwordValue && (
                <PasswordStrength password={passwordValue} showCriteria={true} />
              )}

              {/* Confirm Password Input */}
              <InputField
                name="confirmPassword"
                control={control}
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                startIcon={<Lock fontSize="small" sx={{ opacity: 0.6 }} />}
              />

              {/* Reset Password Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<VpnKey />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              {/* Back to Login */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/auth/login"
                  variant="text"
                  startIcon={<ArrowBack />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Stack>
          </form>
        </>
      )}
    </>
  );
};

export default ResetPassword;
