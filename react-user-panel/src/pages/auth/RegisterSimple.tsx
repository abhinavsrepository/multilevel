import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Chip,
  Link as MuiLink,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CreditCard,
  Public,
  CheckCircle,
  Visibility,
  VisibilityOff,
  VerifiedUser,
  PhotoCamera,
  Delete,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/redux/store';
import { register as registerUser } from '@/redux/slices/authSlice';
import { validateSponsor } from '@/api/auth.api';

interface SponsorInfo {
  sponsorId: string;
  name: string;
  rank?: string;
  email?: string;
  isValid: boolean;
}

const RegisterSimple: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Form state
  const [formData, setFormData] = useState({
    sponsorId: '',
    sponsorName: '',
    userName: '',
    country: '+91 India',
    mobileNo: '',
    aadharNo: '',
    panNo: '',
    email: '',
    password: '',
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sponsorValidating, setSponsorValidating] = useState(false);
  const [sponsorVerified, setSponsorVerified] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);

  // Handle input change
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (field === 'sponsorId') {
      setSponsorVerified(false);
      setSponsorError(null);
    }
  };

  // Handle photo upload
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle photo remove
  const handlePhotoRemove = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  // Validate sponsor
  const handleValidateSponsor = async () => {
    if (!formData.sponsorId.trim()) {
      setSponsorError('Please enter Sponsor ID');
      return;
    }

    setSponsorValidating(true);
    setSponsorError(null);

    try {
      const response = await validateSponsor(formData.sponsorId.trim());
      if (response.success && response.data) {
        setSponsorVerified(true);
        setFormData({ ...formData, sponsorName: response.data.name || 'Verified Sponsor' });
      } else {
        setSponsorError('Invalid Sponsor ID');
        setSponsorVerified(false);
      }
    } catch (err: any) {
      setSponsorError(err.response?.data?.message || 'Failed to validate sponsor');
      setSponsorVerified(false);
    } finally {
      setSponsorValidating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!sponsorVerified) {
      setError('Please validate your sponsor ID first');
      return;
    }

    if (!formData.userName || !formData.mobileNo || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, upload profile photo if exists
      let profilePhotoUrl = '';
      if (profilePhoto) {
        const formDataUpload = new FormData();
        formDataUpload.append('profilePhoto', profilePhoto);

        try {
          const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/profile-photo`, {
            method: 'POST',
            body: formDataUpload,
          });

          const uploadResult = await uploadResponse.json();
          if (uploadResult.success) {
            profilePhotoUrl = uploadResult.data.url;
          }
        } catch (uploadErr) {
          console.error('Failed to upload photo:', uploadErr);
          // Continue registration even if photo upload fails
        }
      }

      const registrationData = {
        fullName: formData.userName,
        email: formData.email,
        mobile: formData.mobileNo,
        password: formData.password,
        confirmPassword: formData.password,
        sponsorId: formData.sponsorId,
        placement: 'AUTO' as const,
        aadharNo: formData.aadharNo,
        panNo: formData.panNo,
        country: formData.country,
        profilePhotoUrl,
        termsAccepted: true,
        privacyAccepted: true,
      };

      const result = await dispatch(registerUser(registrationData)).unwrap();

      // After successful registration, redirect to OTP verification
      navigate('/otp-verification', {
        state: {
          email: formData.email,
          mobile: formData.mobileNo,
          from: 'registration'
        }
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 900,
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
            py: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Register a new membership
          </Typography>
        </Box>

        {/* Membership Type */}
        <Box sx={{ px: 4, pt: 3, pb: 1 }}>
          <Chip
            icon={<CheckCircle />}
            label="Free"
            color="primary"
            sx={{ fontWeight: 600, fontSize: '0.95rem' }}
          />
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Sponsor ID */}
            <FormControl fullWidth>
              <TextField
                label="Sponsor Id"
                value={formData.sponsorId}
                onChange={handleChange('sponsorId')}
                disabled={sponsorVerified}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: sponsorVerified ? (
                    <InputAdornment position="end">
                      <CheckCircle color="success" />
                    </InputAdornment>
                  ) : null,
                }}
                error={!!sponsorError}
                helperText={sponsorError}
              />
              {!sponsorVerified && formData.sponsorId && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleValidateSponsor}
                  disabled={sponsorValidating}
                  startIcon={sponsorValidating ? <CircularProgress size={16} /> : <VerifiedUser />}
                  sx={{ mt: 1 }}
                >
                  {sponsorValidating ? 'Validating...' : 'Verify Sponsor'}
                </Button>
              )}
            </FormControl>

            {/* Sponsor Name */}
            <TextField
              label="Sponsor Name"
              value={formData.sponsorName}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .Mui-disabled': {
                  backgroundColor: sponsorVerified ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                },
              }}
            />

            {/* User Name */}
            <TextField
              label="User Name"
              value={formData.userName}
              onChange={handleChange('userName')}
              required
              placeholder="Enter User Name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Country */}
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                label="Country"
                startAdornment={
                  <InputAdornment position="start">
                    <Public color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="+91 India">🇮🇳 +91 India</MenuItem>
                <MenuItem value="+1 USA">🇺🇸 +1 USA</MenuItem>
                <MenuItem value="+44 UK">🇬🇧 +44 UK</MenuItem>
                <MenuItem value="+971 UAE">🇦🇪 +971 UAE</MenuItem>
              </Select>
            </FormControl>

            {/* Mobile No */}
            <TextField
              label="Mobile No"
              value={formData.mobileNo}
              onChange={handleChange('mobileNo')}
              required
              placeholder="Enter Mobile No"
              type="tel"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Aadhar No */}
            <TextField
              label="Aadhar No"
              value={formData.aadharNo}
              onChange={handleChange('aadharNo')}
              placeholder="Enter Aadhar No"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Pan No */}
            <TextField
              label="Pan No"
              value={formData.panNo}
              onChange={handleChange('panNo')}
              placeholder="Enter Pan No"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Profile Photo Upload - Full Width */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Profile Photo (Optional)
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              {profilePhotoPreview ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box
                    component="img"
                    src={profilePhotoPreview}
                    alt="Profile Preview"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {profilePhoto?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profilePhoto && `${(profilePhoto.size / 1024).toFixed(2)} KB`}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handlePhotoRemove}
                    color="error"
                    sx={{
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.2),
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <PhotoCamera sx={{ fontSize: 48, color: theme.palette.action.disabled }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Upload your profile photo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      JPG, PNG or GIF (MAX. 5MB)
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
                      },
                    }}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Email */}
            <TextField
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              type="email"
              placeholder="Enter Email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password */}
            <TextField
              label="Password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !sponsorVerified}
            sx={{
              mt: 4,
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'REGISTER NOW!'}
          </Button>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <MuiLink
                component={Link}
                to="/auth/login"
                sx={{
                  color: theme.palette.info.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                I already have a membership
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterSimple;
