import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  useTheme,
  Paper,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth.api';
import { InputField } from '@/components/forms/InputField';

import {
  Email,
  Send,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import AuthLayout from '@/layouts/AuthLayout';

// Validation Schema
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

/**
 * ForgotPassword Page Component
 *
 * Features:
 * - Email input to send reset link
 * - Form validation with Yup
 * - Loading and success states
 * - Responsive design
 * - Dark mode support
 */
const ForgotPassword: React.FC = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await forgotPassword(data);

      if (response.success) {
        setSuccess(true);
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email to receive a password reset link"
      showLogo={true}
      maxWidth="sm"
    >
      {/* Success Message */}
      {success ? (
        <Box>
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            icon={<CheckCircle />}
          >
            Password reset link has been sent to your email!
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
              Check Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a password reset link to your email address. Please
              check your inbox and follow the instructions to reset your
              password.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Didn't receive the email? Check your spam folder or try again.
            </Typography>
          </Paper>

          {/* Back to Login */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              component={Link}
              to="/auth/login"
              variant="contained"
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
          </Box>
        </Box>
      ) : (
        <>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Forgot Password Form */}
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
                  Enter your registered email address and we'll send you a link
                  to reset your password.
                </Typography>
              </Paper>

              {/* Email Input */}
              <InputField
                name="email"
                control={control}
                label="Email Address"
                type="email"
                placeholder="Enter your registered email"
                autoComplete="email"
                autoFocus
                startIcon={<Email fontSize="small" sx={{ opacity: 0.6 }} />}
              />

              {/* Send Reset Link Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<Send />}
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
                {loading ? 'Sending...' : 'Send Reset Link'}
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
    </AuthLayout>
  );
};

export default ForgotPassword;
