import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Email,
  Phone,
  Cake,
  LocationOn,
  AccountBalance,
  Lock,
  CheckCircle,
  Warning,
  Verified,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store';

interface PersonalInfoForm {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface BankDetailsForm {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Validation schemas
const personalInfoSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required').min(3, 'Name must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().required('Pincode is required').matches(/^\d{6}$/, 'Invalid pincode'),
});

const bankDetailsSchema = yup.object().shape({
  accountHolderName: yup.string().required('Account holder name is required'),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .matches(/^\d{9,18}$/, 'Invalid account number'),
  confirmAccountNumber: yup
    .string()
    .required('Please confirm account number')
    .oneOf([yup.ref('accountNumber')], 'Account numbers do not match'),
  ifscCode: yup
    .string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  bankName: yup.string().required('Bank name is required'),
  branch: yup.string().required('Branch is required'),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Personal Info Form
  const {
    control: personalControl,
    handleSubmit: handlePersonalSubmit,
    formState: { errors: personalErrors },
    reset: resetPersonal,
  } = useForm<PersonalInfoForm>({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
  });

  // Bank Details Form
  const {
    control: bankControl,
    handleSubmit: handleBankSubmit,
    formState: { errors: bankErrors },
    reset: resetBank,
  } = useForm<BankDetailsForm>({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: '',
    },
  });

  // Password Form
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        // Here you would upload to server
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save personal info
  const onSavePersonalInfo = (data: PersonalInfoForm) => {
    console.log('Saving personal info:', data);
    // Implement API call to save personal info
    setEditingPersonal(false);
    setSuccessMessage('Personal information updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Save bank details
  const onSaveBankDetails = (data: BankDetailsForm) => {
    console.log('Saving bank details:', data);
    // Implement API call to save bank details
    setEditingBank(false);
    setSuccessMessage('Bank details updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Change password
  const onChangePassword = (data: PasswordForm) => {
    console.log('Changing password:', data);
    // Implement API call to change password
    resetPassword();
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Get KYC status
  const getKycStatus = () => {
    const status = user?.kycStatus || 'NOT_SUBMITTED';
    switch (status) {
      case 'APPROVED':
        return { color: 'success', icon: <Verified />, text: 'Verified' };
      case 'PENDING':
        return { color: 'warning', icon: <Warning />, text: 'Under Review' };
      case 'REJECTED':
        return { color: 'error', icon: <Warning />, text: 'Rejected' };
      default:
        return { color: 'default', icon: <Warning />, text: 'Not Submitted' };
    }
  };

  const kycStatus = getKycStatus();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your personal information and account settings
      </Typography>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Profile Picture Section */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileImage || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                size="small"
              >
                <PhotoCamera />
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member ID: {user?.referralCode}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Chip
                  icon={kycStatus.icon}
                  label={`KYC: ${kycStatus.text}`}
                  color={kycStatus.color as any}
                  size="small"
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Active Member"
                  color="success"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Personal Information
            </Typography>
            {!editingPersonal ? (
              <Button startIcon={<Edit />} onClick={() => setEditingPersonal(true)}>
                Edit
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Save />}
                  variant="contained"
                  onClick={handlePersonalSubmit(onSavePersonalInfo)}
                >
                  Save
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={() => {
                    setEditingPersonal(false);
                    resetPersonal();
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          <form>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="fullName"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      disabled={!editingPersonal}
                      error={!!personalErrors.fullName}
                      helperText={personalErrors.fullName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      disabled={!editingPersonal}
                      error={!!personalErrors.email}
                      helperText={personalErrors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="mobile"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number"
                      disabled={!editingPersonal}
                      error={!!personalErrors.mobile}
                      helperText={personalErrors.mobile?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="dateOfBirth"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      disabled={!editingPersonal}
                      error={!!personalErrors.dateOfBirth}
                      helperText={personalErrors.dateOfBirth?.message}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Cake />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="gender"
                  control={personalControl}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={!editingPersonal}>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="address"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address"
                      disabled={!editingPersonal}
                      error={!!personalErrors.address}
                      helperText={personalErrors.address?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="city"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      disabled={!editingPersonal}
                      error={!!personalErrors.city}
                      helperText={personalErrors.city?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="state"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                      disabled={!editingPersonal}
                      error={!!personalErrors.state}
                      helperText={personalErrors.state?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="pincode"
                  control={personalControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Pincode"
                      disabled={!editingPersonal}
                      error={!!personalErrors.pincode}
                      helperText={personalErrors.pincode?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Bank Details
            </Typography>
            {!editingBank ? (
              <Button startIcon={<Edit />} onClick={() => setEditingBank(true)}>
                Edit
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Save />}
                  variant="contained"
                  onClick={handleBankSubmit(onSaveBankDetails)}
                >
                  Save
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={() => {
                    setEditingBank(false);
                    resetBank();
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          <form>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="accountHolderName"
                  control={bankControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Account Holder Name"
                      disabled={!editingBank}
                      error={!!bankErrors.accountHolderName}
                      helperText={bankErrors.accountHolderName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="accountNumber"
                  control={bankControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Account Number"
                      disabled={!editingBank}
                      error={!!bankErrors.accountNumber}
                      helperText={bankErrors.accountNumber?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountBalance />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="confirmAccountNumber"
                  control={bankControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Account Number"
                      disabled={!editingBank}
                      error={!!bankErrors.confirmAccountNumber}
                      helperText={bankErrors.confirmAccountNumber?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountBalance />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="ifscCode"
                  control={bankControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="IFSC Code"
                      disabled={!editingBank}
                      error={!!bankErrors.ifscCode}
                      helperText={bankErrors.ifscCode?.message}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="bankName"
                  control={bankControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Bank Name"
                      disabled={!editingBank}
                      error={!!bankErrors.bankName}
                      helperText={bankErrors.bankName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="branch"
                  control={bankControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Branch"
                      disabled={!editingBank}
                      error={!!bankErrors.branch}
                      helperText={bankErrors.branch?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Change Password
          </Typography>

          <form onSubmit={handlePasswordSubmit(onChangePassword)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
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
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Lock />}
                  sx={{ px: 4 }}
                >
                  Change Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
