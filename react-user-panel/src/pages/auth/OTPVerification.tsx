import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  useTheme,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP, resendOTP } from '@/api/auth.api';

import {
  VerifiedUser,
  Refresh,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import AuthLayout from '@/layouts/AuthLayout';

/**
 * OTPVerification Page Component
 *
 * Features:
 * - 6-digit OTP input
 * - Auto-focus on next input
 * - Paste support
 * - Resend countdown (60 seconds)
 * - Email/Mobile verification
 * - Loading and error states
 * - Responsive design
 * - Dark mode support
 */
const OTPVerification: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email/mobile from navigation state
  const { email, mobile } = location.state || {};

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Focus on first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no email/mobile in state
  useEffect(() => {
    if (!email && !mobile) {
      navigate('/auth/login');
    }
  }, [email, mobile, navigate]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are entered
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // Only allow 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();

      // Auto-submit
      handleVerify(pastedData);
    }
  };

  // Handle OTP verification
  const handleVerify = async (otpValue?: string) => {
    const otpCode = otpValue || otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verifyOTP({
        emailOrMobile: email || mobile,
        otp: otpCode,
        verificationType: 'REGISTRATION',
      });

      if (response.success) {
        setSuccess(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login', {
            state: { message: 'Registration successful! Please login to continue.' },
          });
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const response = await resendOTP(
        email || mobile,
        email ? 'EMAIL' : 'MOBILE'
      );

      if (response.success) {
        setResendCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        // Show success message
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`Enter the 6-digit code sent to ${email || mobile}`}
      showLogo={true}
      maxWidth="sm"
    >
      {/* Success Message */}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          icon={<CheckCircle />}
        >
          OTP verified successfully! Redirecting to login...
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* OTP Input */}
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Enter the verification code
          </Typography>

          {/* OTP Input Boxes */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 1, sm: 2 },
            }}
          >
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
                onPaste={handlePaste}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    padding: '16px 0',
                  },
                  'aria-label': `OTP digit ${index + 1}`,
                }}
                sx={{
                  width: { xs: 45, sm: 56 },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderWidth: 2,
                      borderColor: digit
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                }}
                disabled={loading || success}
              />
            ))}
          </Box>
        </Box>

        {/* Verify Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => handleVerify()}
          disabled={loading || success || otp.some((digit) => digit === '')}
          startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUser />}
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
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>

        {/* Resend OTP */}
        <Box sx={{ textAlign: 'center' }}>
          {canResend ? (
            <Button
              variant="text"
              onClick={handleResendOTP}
              disabled={resendLoading}
              startIcon={resendLoading ? <CircularProgress size={16} /> : <Refresh />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Resend OTP in{' '}
              <Typography
                component="span"
                variant="body2"
                color="primary"
                fontWeight={600}
              >
                {resendCountdown}s
              </Typography>
            </Typography>
          )}
        </Box>

        {/* Info Box */}
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
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Didn't receive the code? Check your spam folder or click resend after the countdown.
          </Typography>
        </Paper>

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
    </AuthLayout>
  );
};

export default OTPVerification;
