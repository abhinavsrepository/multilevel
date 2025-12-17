import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Link,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Email, ArrowBack, MailOutline } from '@mui/icons-material';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';

// Validation schema
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

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

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    try {
      await authApi.forgotPassword(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!sentEmail) return;

    setLoading(true);

    try {
      await authApi.forgotPassword(sentEmail);
      toast.success('Password reset link resent successfully!');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to resend reset link. Please try again.'
      );
    } finally {
      setLoading(false);
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
            {!emailSent ? (
              <>
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
                    <Email sx={{ fontSize: 48, color: 'primary.main' }} />
                  </Box>

                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Forgot Password?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No worries! Enter your email and we'll send you reset instructions
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Email Input */}
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="email"
                          label="Email Address"
                          placeholder="Enter your registered email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{
                        mt: 1,
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
                          <span style={{ opacity: 0 }}>Send Reset Link</span>
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>

                    {/* Back to Login */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Link
                        component={RouterLink}
                        to="/auth/login"
                        underline="none"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'text.secondary',
                          fontWeight: 500,
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        <ArrowBack fontSize="small" />
                        Back to Login
                      </Link>
                    </Box>
                  </Box>
                </form>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'success.light',
                      mb: 2,
                    }}
                  >
                    <MailOutline sx={{ fontSize: 48, color: 'success.main' }} />
                  </Box>

                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Check Your Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    We've sent password reset instructions to
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main" sx={{ mb: 3 }}>
                    {sentEmail}
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Didn't receive the email? Check your spam folder or click the button below to
                    resend.
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Resend Button */}
                  <Button
                    onClick={handleResendEmail}
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled={loading}
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
                        <span style={{ opacity: 0 }}>Resend Email</span>
                      </>
                    ) : (
                      'Resend Email'
                    )}
                  </Button>

                  {/* Back to Login */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component={RouterLink}
                      to="/auth/login"
                      underline="none"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'text.secondary',
                        fontWeight: 500,
                        '&:hover': {
                          color: 'primary.main',
                        },
                      }}
                    >
                      <ArrowBack fontSize="small" />
                      Back to Login
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
