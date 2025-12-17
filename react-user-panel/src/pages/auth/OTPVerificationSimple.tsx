import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Email,
  Phone,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OTPVerificationSimple: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, mobile, from } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-send OTP on mount
  useEffect(() => {
    if (from === 'registration' && email) {
      handleSendOTP();
    }
  }, []);

  // Handle OTP input change
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);

    if (newOtp.length === 6) {
      handleVerifyOTP(pastedData);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    try {
      setResending(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-otp/email`, { email });
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
    } finally {
      setResending(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (otpValue?: string) => {
    const otpCode = otpValue || otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        emailOrMobile: email,
        otp: otpCode,
        type: 'EMAIL'
      });

      if (response.data.success) {
        setSuccess(true);

        // Save token if provided
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    handleSendOTP();
  };

  if (!email && !mobile) {
    navigate('/register');
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)`,
            color: 'white',
            py: 4,
            textAlign: 'center',
          }}
        >
          {success ? (
            <CheckCircle sx={{ fontSize: 64, mb: 2 }} />
          ) : (
            <Email sx={{ fontSize: 64, mb: 2 }} />
          )}
          <Typography variant="h4" fontWeight={700}>
            {success ? 'Verified!' : 'Verify Your Email'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {success ? 'Your account has been verified successfully' : `Enter the 6-digit code sent to ${email}`}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Redirecting to dashboard...
              </Typography>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* OTP Input */}
              <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 4 }}>
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={loading || success}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 700,
                      },
                    }}
                    sx={{
                      width: 56,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* Timer */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {!canResend ? (
                  <Typography variant="body2" color="text.secondary">
                    <AccessTime sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Resend OTP in {timer}s
                  </Typography>
                ) : (
                  <Button
                    variant="text"
                    onClick={handleResend}
                    disabled={resending}
                    startIcon={resending ? <CircularProgress size={16} /> : null}
                  >
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </Button>
                )}
              </Box>

              {/* Verify Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleVerifyOTP()}
                disabled={loading || otp.some((d) => !d)}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'VERIFY OTP'}
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default OTPVerificationSimple;
