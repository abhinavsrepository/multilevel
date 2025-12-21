import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Link as MuiLink,
  Divider,
  IconButton,
  Alert,
  Stack,
  useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { login, clearError, selectAuth } from '@/redux/slices/authSlice';
import { InputField } from '@/components/forms/InputField';

import {
  Email,
  Phone,
  Lock,
  Google,
  Facebook,
  Apple,
  Login as LoginIcon,
} from '@mui/icons-material';
import { AuthLayout } from '@/layouts';

// Validation Schema
const loginSchema = yup.object().shape({
  emailOrMobile: yup
    .string()
    .required('Email or mobile number is required')
    .test('email-or-mobile', 'Please enter a valid email or mobile number', (value) => {
      if (!value) return false;
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a valid mobile (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      return emailRegex.test(value) || mobileRegex.test(value);
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: yup.boolean(),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

/**
 * Login Page Component
 *
 * Features:
 * - Email/Mobile and password login
 * - Remember me checkbox
 * - Forgot password link
 * - Social login buttons (optional)
 * - Form validation with Yup
 * - Redux integration for authentication
 * - Loading and error states
 * - Responsive design
 * - Dark mode support
 */
const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(selectAuth);

  const [showSocialLogin] = useState(false); // Toggle for social login feature

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      emailOrMobile: 'userpanel@test.com',
      password: 'UserPanel@123',
      rememberMe: false,
    },
  });

  // Clear error on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      if (result) {
        // Navigate to dashboard on successful login
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by Redux slice
      console.error('Login failed:', err);
    }
  };

  // Handle social login (placeholder)
  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      showLogo={true}
      maxWidth="sm"
    >
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          {/* Email or Mobile Input */}
          <InputField
            name="emailOrMobile"
            control={control}
            label="Email or Mobile Number"
            type="text"
            placeholder="Enter your email or mobile number"
            autoComplete="username"
            autoFocus
            startIcon={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email fontSize="small" sx={{ opacity: 0.6 }} />
                <Typography sx={{ opacity: 0.4 }}>/</Typography>
                <Phone fontSize="small" sx={{ opacity: 0.6 }} />
              </Box>
            }
          />

          {/* Password Input */}
          <InputField
            name="password"
            control={control}
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            startIcon={<Lock fontSize="small" sx={{ opacity: 0.6 }} />}
          />

          {/* Remember Me & Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(e) => setValue('rememberMe', e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Remember me
                </Typography>
              }
            />
            <MuiLink
              component={Link}
              to="/auth/forgot-password"
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </MuiLink>
          </Box>

          {/* Login Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || isSubmitting}
            startIcon={<LoginIcon />}
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
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Social Login (Optional) */}
          {showSocialLogin && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Or continue with
                </Typography>
              </Divider>

              <Stack direction="row" spacing={2} justifyContent="center">
                {/* Google Login */}
                <IconButton
                  onClick={() => handleSocialLogin('google')}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    },
                  }}
                  aria-label="Sign in with Google"
                >
                  <Google />
                </IconButton>

                {/* Facebook Login */}
                <IconButton
                  onClick={() => handleSocialLogin('facebook')}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    },
                  }}
                  aria-label="Sign in with Facebook"
                >
                  <Facebook />
                </IconButton>

                {/* Apple Login */}
                <IconButton
                  onClick={() => handleSocialLogin('apple')}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    },
                  }}
                  aria-label="Sign in with Apple"
                >
                  <Apple />
                </IconButton>
              </Stack>
            </>
          )}

          {/* Register Link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink
                component={Link}
                to="/auth/register"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign Up Now
              </MuiLink>
            </Typography>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default Login;
