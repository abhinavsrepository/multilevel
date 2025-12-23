import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  useTheme,
  Paper,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { register as registerUser, clearError, selectAuth } from '@/redux/slices/authSlice';
import { validateSponsor } from '@/api/auth.api';
import { InputField } from '@/components/forms/InputField';
import { PasswordStrength } from '@/components/forms/PasswordStrength';
import { AuthLayout } from '@/layouts';

import {
  Person,
  Email,
  Phone,
  Lock,
  GroupAdd,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  HowToReg,
  VerifiedUser,
  Cancel,
} from '@mui/icons-material';
import { RegisterRequest } from '@/types';

// Steps
const steps = ['Personal Information', 'Sponsor Details', 'Terms & Conditions'];

// Step 1 Schema
const step1Schema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must not exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
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
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Step 2 Schema
const step2Schema = yup.object().shape({
  sponsorId: yup.string().required('Sponsor ID is required'),
  placement: yup.string().oneOf(['LEFT', 'RIGHT', 'AUTO'], 'Please select a placement').required('Placement is required'),
});

// Step 3 Schema
const step3Schema = yup.object().shape({
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('Terms acceptance is required'),
  privacyAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the privacy policy')
    .required('Privacy policy acceptance is required'),
});

// Combined Schema for all steps
const registerSchema = step1Schema.concat(step2Schema).concat(step3Schema);

type RegisterFormData = yup.InferType<typeof registerSchema>;

interface SponsorInfo {
  sponsorId: string;
  name: string;
  rank: string;
  contact: string;
  isValid: boolean;
}

/**
 * Register Page Component
 *
 * Multi-step registration form with:
 * - Step 1: Personal Information
 * - Step 2: Sponsor Details
 * - Step 3: Terms & Conditions
 *
 * Features:
 * - Form validation with Yup
 * - Password strength indicator
 * - Sponsor validation
 * - Placement selection (Binary tree)
 * - Terms acceptance
 * - Redux integration
 * - Loading and error states
 * - Responsive design
 * - Dark mode support
 */
const Register: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(selectAuth);

  const [activeStep, setActiveStep] = useState(0);
  const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo | null>(null);
  const [sponsorValidating, setSponsorValidating] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      sponsorId: '',
      placement: 'AUTO',
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const passwordValue = watch('password');
  const sponsorIdValue = watch('sponsorId');

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

  // Validate sponsor when sponsorId changes
  const handleValidateSponsor = async () => {
    if (!sponsorIdValue || sponsorIdValue.trim() === '') {
      setSponsorError('Please enter a sponsor ID');
      setSponsorInfo(null);
      return;
    }

    setSponsorValidating(true);
    setSponsorError(null);
    setSponsorInfo(null);

    try {
      const response = await validateSponsor(sponsorIdValue.trim());
      if (response.success && response.data) {
        setSponsorInfo(response.data);
        if (!response.data.isValid) {
          setSponsorError('Invalid sponsor ID');
        }
      } else {
        setSponsorError('Failed to validate sponsor ID');
      }
    } catch (err: any) {
      setSponsorError(err.response?.data?.message || 'Failed to validate sponsor ID');
      setSponsorInfo(null);
    } finally {
      setSponsorValidating(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    let isValid = false;

    // Validate current step
    if (activeStep === 0) {
      isValid = await trigger(['fullName', 'email', 'mobile', 'password', 'confirmPassword']);
    } else if (activeStep === 1) {
      isValid = await trigger(['sponsorId', 'placement']);
      // Also check if sponsor is validated
      if (isValid && !sponsorInfo?.isValid) {
        setSponsorError('Please validate sponsor ID first');
        isValid = false;
      }
    } else if (activeStep === 2) {
      isValid = await trigger(['termsAccepted', 'privacyAccepted']);
    }

    if (isValid) {
      if (activeStep === steps.length - 1) {
        // Last step - submit form
        await handleSubmit(onSubmit)();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const registrationData: RegisterRequest = {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        confirmPassword: data.confirmPassword,
        sponsorId: data.sponsorId,
        placement: data.placement as 'LEFT' | 'RIGHT' | 'AUTO',
        termsAccepted: data.termsAccepted,
        privacyAccepted: data.privacyAccepted,
      };

      const result = await dispatch(registerUser(registrationData)).unwrap();
      if (result) {
        setShowSuccessDialog(true);
      }
    } catch (err) {
      // Error is handled by Redux slice
      console.error('Registration failed:', err);
    }
  };

  const handleCloseSuccessDialog = () => {
    const email = getValues('email');
    const mobile = getValues('mobile');
    setShowSuccessDialog(false);
    navigate('/auth/otp-verification', {
      state: { email, mobile },
    });
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Create your account to get started
            </Typography>

            {/* Full Name */}
            <InputField
              name="fullName"
              control={control}
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              autoFocus
              startIcon={<Person fontSize="small" sx={{ opacity: 0.6 }} />}
            />

            {/* Email */}
            <InputField
              name="email"
              control={control}
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              startIcon={<Email fontSize="small" sx={{ opacity: 0.6 }} />}
            />

            {/* Mobile */}
            <InputField
              name="mobile"
              control={control}
              label="Mobile Number"
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              autoComplete="tel"
              startIcon={<Phone fontSize="small" sx={{ opacity: 0.6 }} />}
            />

            {/* Password */}
            <InputField
              name="password"
              control={control}
              label="Password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              startIcon={<Lock fontSize="small" sx={{ opacity: 0.6 }} />}
            />

            {/* Password Strength Indicator */}
            {passwordValue && <PasswordStrength password={passwordValue} showCriteria={true} />}

            {/* Confirm Password */}
            <InputField
              name="confirmPassword"
              control={control}
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              startIcon={<Lock fontSize="small" sx={{ opacity: 0.6 }} />}
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Enter your sponsor details
            </Typography>

            {/* Sponsor ID */}
            <Box>
              <InputField
                name="sponsorId"
                control={control}
                label="Sponsor ID"
                type="text"
                placeholder="Enter sponsor ID"
                startIcon={<GroupAdd fontSize="small" sx={{ opacity: 0.6 }} />}
                endIcon={
                  sponsorInfo?.isValid ? (
                    <CheckCircle color="success" />
                  ) : sponsorError ? (
                    <Cancel color="error" />
                  ) : null
                }
              />
              <Button
                variant="outlined"
                size="medium"
                fullWidth
                onClick={handleValidateSponsor}
                disabled={sponsorValidating || !sponsorIdValue}
                sx={{ mt: 1 }}
                startIcon={sponsorValidating ? <CircularProgress size={16} /> : <VerifiedUser />}
              >
                {sponsorValidating ? 'Validating...' : 'Validate Sponsor'}
              </Button>
            </Box>

            {/* Sponsor Error */}
            {sponsorError && (
              <Alert severity="error" onClose={() => setSponsorError(null)}>
                {sponsorError}
              </Alert>
            )}

            {/* Sponsor Details */}
            {sponsorInfo?.isValid && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                  border: 1,
                  borderColor: 'success.main',
                  borderRadius: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="subtitle2" color="success.main" fontWeight={600}>
                      Sponsor Verified
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {sponsorInfo.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Rank
                    </Typography>
                    <Chip label={sponsorInfo.rank} size="small" color="primary" sx={{ mt: 0.5 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography variant="body2">{sponsorInfo.contact}</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Placement Selection */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                Select Placement Position
              </FormLabel>
              <RadioGroup
                value={getValues('placement')}
                onChange={(e) => {
                  control._formValues.placement = e.target.value;
                }}
              >
                <FormControlLabel
                  value="LEFT"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Left Leg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Place in left position of binary tree
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="RIGHT"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Right Leg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Place in right position of binary tree
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="AUTO"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Auto Placement
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        System will automatically place you
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Review and accept our terms
            </Typography>

            {/* Terms Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                border: 1,
                borderColor: 'primary.main',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Registration Summary
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {getValues('fullName')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body2">{getValues('email')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Mobile:
                  </Typography>
                  <Typography variant="body2">{getValues('mobile')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Sponsor ID:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {getValues('sponsorId')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Placement:
                  </Typography>
                  <Chip label={getValues('placement')} size="small" color="primary" />
                </Box>
              </Stack>
            </Paper>

            {/* Terms Acceptance */}
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => {
                      control._formValues.termsAccepted = e.target.checked;
                    }}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I accept the{' '}
                    <MuiLink
                      href="/terms-conditions"
                      target="_blank"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Terms & Conditions
                    </MuiLink>
                  </Typography>
                }
              />
              {errors.termsAccepted && (
                <Typography variant="caption" color="error" sx={{ mt: -1, ml: 4 }}>
                  {errors.termsAccepted.message}
                </Typography>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => {
                      control._formValues.privacyAccepted = e.target.checked;
                    }}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I accept the{' '}
                    <MuiLink
                      href="/privacy-policy"
                      target="_blank"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Privacy Policy
                    </MuiLink>
                  </Typography>
                }
              />
              {errors.privacyAccepted && (
                <Typography variant="caption" color="error" sx={{ mt: -1, ml: 4 }}>
                  {errors.privacyAccepted.message}
                </Typography>
              )}
            </Stack>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout showLogo={true} maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, textAlign: 'center' }}
        >
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Join our MLM platform and start earning
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

      {/* Navigation Buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          size="large"
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBack />}
          sx={{
            flex: 1,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={loading}
          endIcon={activeStep === steps.length - 1 ? <HowToReg /> : <ArrowForward />}
          sx={{
            flex: 1,
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
          {activeStep === steps.length - 1 ? (loading ? 'Registering...' : 'Register') : 'Next'}
        </Button>
      </Stack>

      {/* Login Link */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink
            component={Link}
            to="/auth/login"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Sign In
          </MuiLink>
        </Typography>
      </Box>
      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => { }} // Disable closing by clicking outside
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white', py: 2 }}>
          <CheckCircle sx={{ fontSize: 48, mb: 1, display: 'block', mx: 'auto' }} />
          Registration Successful!
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <DialogContentText id="alert-dialog-description" textAlign="center" paragraph>
            Your account has been created successfully.
          </DialogContentText>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please take a screenshot of your credentials below for future reference.
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'grey.100',
              border: '1px dashed',
              borderColor: 'grey.400',
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email Address
                </Typography>
                <Typography variant="h6" fontWeight={600} fontFamily="monospace">
                  {getValues('email')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Password
                </Typography>
                <Typography variant="h6" fontWeight={600} fontFamily="monospace">
                  {getValues('password')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseSuccessDialog}
            variant="contained"
            size="large"
            autoFocus
            fullWidth
          >
            I have taken a screenshot, Continue to Verify
          </Button>
        </DialogActions>
      </Dialog>
    </AuthLayout>
  );
};

export default Register;
