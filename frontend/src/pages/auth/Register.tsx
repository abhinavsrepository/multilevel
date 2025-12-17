import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
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
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  Container,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  SupervisorAccount,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerThunk } from '../../store/slices/authSlice';

// Password strength calculator
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 12.5;
  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
  return Math.min(strength, 100);
};

// Get password strength color
const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 25) return '#f44336'; // red
  if (strength < 50) return '#ff9800'; // orange
  if (strength < 75) return '#ffc107'; // yellow
  return '#4caf50'; // green
};

// Get password strength label
const getPasswordStrengthLabel = (strength: number): string => {
  if (strength < 25) return 'Weak';
  if (strength < 50) return 'Fair';
  if (strength < 75) return 'Good';
  return 'Strong';
};

// Validation schema
const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  sponsorCode: yup
    .string()
    .optional()
    .matches(/^[A-Z0-9]{6,}$/, 'Sponsor code must be at least 6 alphanumeric characters'),
  placement: yup
    .string()
    .oneOf(['LEFT', 'RIGHT', 'AUTO'], 'Select a valid placement option')
    .default('AUTO'),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

interface RegisterFormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  sponsorCode?: string;
  placement: 'LEFT' | 'RIGHT' | 'AUTO';
  termsAccepted: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      sponsorCode: searchParams.get('ref') || '',
      placement: 'AUTO',
      termsAccepted: false,
    },
  });

  const password = watch('password');

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(
        registerThunk({
          fullName: data.fullName,
          email: data.email,
          mobile: data.mobile,
          password: data.password,
          sponsorCode: data.sponsorCode || undefined,
          placement: data.placement === 'AUTO' ? undefined : data.placement,
        })
      ).unwrap();

      toast.success('Registration successful! Please verify your OTP.');
      // Navigate to OTP verification with email/mobile
      navigate(`/auth/verify-otp?contact=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error || 'Registration failed. Please try again.');
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
      <Container maxWidth="md">
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join our MLM platform and start your journey
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Grid container spacing={2.5}>
                  {/* Full Name */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Full Name"
                          placeholder="Enter your full name"
                          error={!!errors.fullName}
                          helperText={errors.fullName?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="email"
                          label="Email Address"
                          placeholder="Enter your email"
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
                  </Grid>

                  {/* Mobile */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="mobile"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Mobile Number"
                          placeholder="10-digit mobile number"
                          error={!!errors.mobile}
                          helperText={errors.mobile?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Sponsor Code */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="sponsorCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Sponsor Code (Optional)"
                          placeholder="Enter sponsor referral code"
                          error={!!errors.sponsorCode}
                          helperText={errors.sponsorCode?.message || 'Leave blank if none'}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SupervisorAccount color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Password */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          label="Password"
                          placeholder="Create a strong password"
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  disabled={loading}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Confirm Password */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type={showConfirmPassword ? 'text' : 'password'}
                          label="Confirm Password"
                          placeholder="Re-enter your password"
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  disabled={loading}
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Password Strength Indicator */}
                {password && (
                  <Box sx={{ mt: 0.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Password Strength:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: getPasswordStrengthColor(passwordStrength), fontWeight: 600 }}
                      >
                        {getPasswordStrengthLabel(passwordStrength)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getPasswordStrengthColor(passwordStrength),
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Placement Selection */}
                <Controller
                  name="placement"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.placement} disabled={loading}>
                      <InputLabel>Placement Position</InputLabel>
                      <Select {...field} label="Placement Position">
                        <MenuItem value="AUTO">Auto Placement (Recommended)</MenuItem>
                        <MenuItem value="LEFT">Left Position</MenuItem>
                        <MenuItem value="RIGHT">Right Position</MenuItem>
                      </Select>
                      <FormHelperText>
                        {errors.placement?.message || 'Choose your position in the binary tree'}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                {/* Terms and Conditions */}
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <FormControl error={!!errors.termsAccepted}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            disabled={loading}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            I agree to the{' '}
                            <Link href="#" underline="hover" sx={{ color: 'primary.main' }}>
                              Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="#" underline="hover" sx={{ color: 'primary.main' }}>
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                      />
                      {errors.termsAccepted && (
                        <FormHelperText>{errors.termsAccepted.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {/* Register Button */}
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
                      <span style={{ opacity: 0 }}>Create Account</span>
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {/* Login Link */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/auth/login"
                      underline="hover"
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
