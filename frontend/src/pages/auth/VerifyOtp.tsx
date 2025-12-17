import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Container,
  CircularProgress,
  TextField,
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyOtpThunk } from '../../store/slices/authSlice';
import authApi from '../../api/authApi';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; // seconds

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailOrMobile = searchParams.get('contact') || '';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Redirect if no contact info provided
  useEffect(() => {
    if (!emailOrMobile) {
      toast.error('Missing contact information. Please register again.');
      navigate('/auth/register');
    }
  }, [emailOrMobile, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste
    if (value.length > 1) {
      const pastedData = value.slice(0, OTP_LENGTH);
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = pastedData[i];
        }
      }
      setOtp(newOtp);

      // Focus on the next empty box or the last box
      const nextIndex = Math.min(index + pastedData.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single character input
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, focus previous box
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    // Handle left arrow
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow
    else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== OTP_LENGTH) {
      toast.error(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    try {
      await dispatch(
        verifyOtpThunk({
          emailOrMobile,
          otp: otpCode,
        })
      ).unwrap();

      toast.success('OTP verified successfully! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error || 'OTP verification failed. Please try again.');
      // Clear OTP on error
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);

    try {
      await authApi.resendOtp(emailOrMobile);
      toast.success('OTP resent successfully! Check your email/SMS.');
      setResendTimer(RESEND_TIMEOUT);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'primary.light',
                  mb: 2,
                }}
              >
                <CheckCircleOutline sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>

              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Verify OTP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                We've sent a {OTP_LENGTH}-digit code to
              </Typography>
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {emailOrMobile}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        padding: '12px 0',
                      },
                    }}
                    sx={{
                      width: { xs: 45, sm: 55 },
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                        },
                      },
                    }}
                    disabled={loading}
                  />
                ))}
              </Box>

              <Button
                onClick={handleVerify}
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || otp.join('').length !== OTP_LENGTH}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  position: 'relative',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: '-12px',
                      }}
                    />
                    <span style={{ opacity: 0 }}>Verify OTP</span>
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </Box>

            {/* Resend OTP Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Didn't receive the code?
              </Typography>

              {canResend ? (
                <Button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  variant="text"
                  sx={{ fontWeight: 600 }}
                >
                  {isResending ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Resending...
                    </>
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Resend available in{' '}
                  <Typography component="span" color="primary.main" fontWeight={600}>
                    {resendTimer}s
                  </Typography>
                </Typography>
              )}
            </Box>

            {/* Back to Register Link */}
            <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary">
                Wrong contact information?{' '}
                <Button
                  onClick={() => navigate('/auth/register')}
                  variant="text"
                  size="small"
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Register Again
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default VerifyOtp;
