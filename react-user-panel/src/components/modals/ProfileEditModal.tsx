import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider,
  Alert,
  Stack,
  Box,
  Avatar,
  Badge,
  Grid,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Person,
  Edit,
  Email,
  Phone,
  Home,
  CameraAlt,
  Save,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputField, SelectField, DatePicker, FileUpload } from '../forms';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  currentData?: Partial<ProfileFormData>;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  profileImage?: File;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const indianStates = [
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal_pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'delhi', label: 'Delhi' },
];

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name should only contain letters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name should only contain letters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  dateOfBirth: yup
    .date()
    .nullable()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .test('age', 'You must be at least 18 years old', function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  gender: yup.string().required('Gender is required'),
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),
  city: yup.string().required('City is required').min(2, 'City name is too short'),
  state: yup.string().required('State is required'),
  pincode: yup
    .string()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: yup.string().required('Country is required'),
});

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  open,
  onClose,
  onSubmit,
  currentData,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    mode: 'onChange',
  });

  // Load current data when modal opens
  useEffect(() => {
    if (open && currentData) {
      reset({
        firstName: currentData.firstName || '',
        lastName: currentData.lastName || '',
        email: currentData.email || '',
        phone: currentData.phone || '',
        dateOfBirth: currentData.dateOfBirth || null,
        gender: currentData.gender || '',
        address: currentData.address || '',
        city: currentData.city || '',
        state: currentData.state || '',
        pincode: currentData.pincode || '',
        country: currentData.country || 'India',
      });
    }
  }, [open, currentData, reset]);

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Add profile image if uploaded
      if (uploadedFiles.length > 0) {
        data.profileImage = uploadedFiles[0];
      }

      await onSubmit(data);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setProfileImagePreview(null);
    setUploadedFiles([]);
    reset();
    onClose();
  };

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setProfileImagePreview(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Edit color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Edit Profile
          </Typography>
        </Stack>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close profile edit modal"
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={4}>
            {/* Profile Picture Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 3,
                      borderColor: 'background.paper',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <CameraAlt sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                }
              >
                <Avatar
                  src={profileImagePreview || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    border: 4,
                    borderColor: 'divider',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
              </Badge>
            </Box>

            {/* Profile Image Upload */}
            <Box>
              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={1}
                maxSize={2097152} // 2MB
                acceptedFileTypes={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                }}
                multiple={false}
                showPreview={false}
                label="Profile Picture"
                helperText="Upload a profile picture (Max 2MB, JPG/PNG)"
              />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Personal Information */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <Person color="primary" />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="firstName"
                    control={control}
                    label="First Name"
                    placeholder="Enter first name"
                    required
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="lastName"
                    control={control}
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    name="dateOfBirth"
                    control={control}
                    label="Date of Birth"
                    required
                    disableFuture
                    maxDate={new Date()}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectField
                    name="gender"
                    control={control}
                    label="Gender"
                    options={genderOptions}
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <Phone color="primary" />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="email"
                    control={control}
                    label="Email Address"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    startIcon={<Email />}
                    disabled // Email usually shouldn't be changed
                    helperText="Contact support to change email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="phone"
                    control={control}
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    required
                    startIcon={<Phone />}
                    inputProps={{
                      maxLength: 10,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Address Information */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <Home color="primary" />
                Address Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InputField
                    name="address"
                    control={control}
                    label="Address"
                    placeholder="Enter your complete address"
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="city"
                    control={control}
                    label="City"
                    placeholder="Enter city"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectField
                    name="state"
                    control={control}
                    label="State"
                    options={indianStates}
                    placeholder="Select state"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="pincode"
                    control={control}
                    label="Pincode"
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    required
                    inputProps={{
                      maxLength: 6,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    name="country"
                    control={control}
                    label="Country"
                    placeholder="Country"
                    required
                    disabled
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Info Alert */}
            <Alert severity="info">
              Make sure all information is accurate. Changes may require verification.
            </Alert>
          </Stack>
        </form>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading || !isDirty}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
