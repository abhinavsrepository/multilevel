/**
 * Form and Modal Components - Usage Examples
 *
 * This file demonstrates how to use all form and modal components
 * in the React User Panel for the MLM Real Estate Platform.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Stack, Box, Container } from '@mui/material';

// Form Components
import {
  InputField,
  SelectField,
  DatePicker,
  FileUpload,
  PasswordStrength,
} from './src/components/forms';

// Modal Components
import {
  InvestmentModal,
  WithdrawalModal,
  ProfileEditModal,
  ConfirmModal,
  useConfirmDialog,
  confirmDelete,
  confirmLogout,
  InvestmentFormData,
  WithdrawalFormData,
  ProfileFormData,
} from './src/components/modals';

// =============================================================================
// EXAMPLE 1: Registration Form with All Form Components
// =============================================================================

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  state: string;
  termsAccepted: boolean;
}

const registrationSchema = yup.object({
  firstName: yup.string().required('First name is required').min(2),
  lastName: yup.string().required('Last name is required').min(2),
  email: yup.string().email().required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^[6-9]\d{9}$/, 'Invalid phone number'),
  dateOfBirth: yup.date().required('Date of birth is required').nullable(),
  gender: yup.string().required('Gender is required'),
  state: yup.string().required('State is required'),
});

export const RegistrationFormExample: React.FC = () => {
  const { control, handleSubmit, watch } = useForm<RegistrationFormData>({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: null,
      gender: '',
      state: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegistrationFormData) => {
    console.log('Registration data:', data);
    // Submit to API
  };

  return (
    <Container maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Text Input */}
          <InputField
            name="firstName"
            control={control}
            label="First Name"
            placeholder="Enter your first name"
            required
          />

          <InputField
            name="lastName"
            control={control}
            label="Last Name"
            placeholder="Enter your last name"
            required
          />

          {/* Email Input */}
          <InputField
            name="email"
            control={control}
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            required
          />

          {/* Password Input with Strength Indicator */}
          <InputField
            name="password"
            control={control}
            label="Password"
            type="password"
            placeholder="Create a strong password"
            required
          />

          <PasswordStrength password={password} showCriteria minLength={8} />

          {/* Phone Input */}
          <InputField
            name="phone"
            control={control}
            label="Phone Number"
            type="tel"
            placeholder="10-digit mobile number"
            required
          />

          {/* Date Picker */}
          <DatePicker
            name="dateOfBirth"
            control={control}
            label="Date of Birth"
            required
            disableFuture
          />

          {/* Select Field */}
          <SelectField
            name="gender"
            control={control}
            label="Gender"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            required
          />

          <SelectField
            name="state"
            control={control}
            label="State"
            options={[
              { value: 'maharashtra', label: 'Maharashtra' },
              { value: 'karnataka', label: 'Karnataka' },
              { value: 'tamil_nadu', label: 'Tamil Nadu' },
            ]}
            required
          />

          <Button type="submit" variant="contained" size="large">
            Register
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

// =============================================================================
// EXAMPLE 2: File Upload for KYC Documents
// =============================================================================

export const KYCUploadExample: React.FC = () => {
  const [documents, setDocuments] = useState<File[]>([]);

  const handleFilesChange = (files: File[]) => {
    setDocuments(files);
    console.log('Uploaded documents:', files);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    documents.forEach((file, index) => {
      formData.append(`document_${index}`, file);
    });

    // Upload to API
    console.log('Submitting KYC documents...');
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={3}>
        <FileUpload
          onFilesChange={handleFilesChange}
          maxFiles={5}
          maxSize={5242880} // 5MB
          acceptedFileTypes={{
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf'],
          }}
          multiple
          showPreview
          label="Upload KYC Documents"
          helperText="Upload Aadhaar, PAN, or other identity documents"
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={documents.length === 0}
        >
          Submit Documents
        </Button>
      </Stack>
    </Container>
  );
};

// =============================================================================
// EXAMPLE 3: Investment Modal Integration
// =============================================================================

export const InvestmentExample: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleInvestment = async (data: InvestmentFormData) => {
    console.log('Investment data:', data);

    // API call to create investment
    // await api.investments.create(data);

    // Show success message
    alert('Investment created successfully!');
  };

  return (
    <Box>
      <Button
        variant="contained"
        size="large"
        onClick={() => setModalOpen(true)}
      >
        New Investment
      </Button>

      <InvestmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInvestment}
        walletBalance={50000}
        minInvestment={1000}
        maxInvestment={10000000}
        interestRate={12}
        lockPeriod={365}
      />
    </Box>
  );
};

// =============================================================================
// EXAMPLE 4: Withdrawal Modal Integration
// =============================================================================

export const WithdrawalExample: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleWithdrawal = async (data: WithdrawalFormData) => {
    console.log('Withdrawal data:', data);

    // API call to create withdrawal
    // await api.withdrawals.create(data);

    // Show success message
    alert('Withdrawal request submitted successfully!');
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        onClick={() => setModalOpen(true)}
      >
        Withdraw Funds
      </Button>

      <WithdrawalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleWithdrawal}
        walletBalance={50000}
        minWithdrawal={500}
        maxWithdrawal={1000000}
        withdrawalFee={2}
        processingTime="2-3 business days"
      />
    </Box>
  );
};

// =============================================================================
// EXAMPLE 5: Profile Edit Modal Integration
// =============================================================================

export const ProfileEditExample: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Partial<ProfileFormData>>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    dateOfBirth: new Date('1990-01-15'),
    gender: 'male',
    address: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'maharashtra',
    pincode: '400001',
    country: 'India',
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    console.log('Updated profile data:', data);

    // API call to update profile
    // await api.profile.update(data);

    // Update local state
    setCurrentProfile(data);

    // Show success message
    alert('Profile updated successfully!');
  };

  return (
    <Box>
      <Button
        variant="outlined"
        size="large"
        onClick={() => setModalOpen(true)}
      >
        Edit Profile
      </Button>

      <ProfileEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleProfileUpdate}
        currentData={currentProfile}
      />
    </Box>
  );
};

// =============================================================================
// EXAMPLE 6: Confirm Modal - Basic Usage
// =============================================================================

export const ConfirmModalBasicExample: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = async () => {
    console.log('Deleting item...');
    // Perform delete operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Item deleted!');
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="error"
        onClick={() => setModalOpen(true)}
      >
        Delete Item
      </Button>

      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        message="Are you sure you want to delete this item? This action cannot be undone."
        variant="error"
        confirmColor="error"
        confirmText="Delete"
      />
    </Box>
  );
};

// =============================================================================
// EXAMPLE 7: Confirm Modal - Using Hook
// =============================================================================

export const ConfirmModalHookExample: React.FC = () => {
  const { showConfirm, confirmProps } = useConfirmDialog();

  const handleLogout = async () => {
    console.log('Logging out...');
    // Perform logout
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Logged out successfully!');
  };

  const handleDeleteInvestment = async () => {
    console.log('Deleting investment...');
    // Perform delete
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Investment deleted!');
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="outlined"
        onClick={() =>
          showConfirm(
            'Logout',
            'Are you sure you want to logout from your account?',
            handleLogout,
            { variant: 'warning', confirmColor: 'warning', confirmText: 'Logout' }
          )
        }
      >
        Logout
      </Button>

      <Button
        variant="contained"
        color="error"
        onClick={() =>
          showConfirm(
            'Delete Investment',
            'Are you sure you want to delete this investment? This action cannot be undone.',
            handleDeleteInvestment,
            { variant: 'error', confirmColor: 'error', confirmText: 'Delete' }
          )
        }
      >
        Delete Investment
      </Button>

      <ConfirmModal {...confirmProps} />
    </Stack>
  );
};

// =============================================================================
// EXAMPLE 8: Confirm Modal - Using Presets
// =============================================================================

export const ConfirmModalPresetExample: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleDelete = async () => {
    console.log('Deleting...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const deleteProps = confirmDelete('Investment #12345', handleDelete);
  const logoutProps = confirmLogout(handleLogout);

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        color="error"
        onClick={() => setDeleteModalOpen(true)}
      >
        Delete with Preset
      </Button>

      <Button
        variant="outlined"
        onClick={() => setLogoutModalOpen(true)}
      >
        Logout with Preset
      </Button>

      <ConfirmModal
        {...deleteProps}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />

      <ConfirmModal
        {...logoutProps}
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </Stack>
  );
};

// =============================================================================
// EXAMPLE 9: Complete Dashboard Integration
// =============================================================================

export const DashboardExample: React.FC = () => {
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { showConfirm, confirmProps } = useConfirmDialog();

  const userProfile: Partial<ProfileFormData> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
  };

  const walletBalance = 50000;

  const handleInvestment = async (data: InvestmentFormData) => {
    console.log('Creating investment:', data);
    // API call
  };

  const handleWithdrawal = async (data: WithdrawalFormData) => {
    console.log('Creating withdrawal:', data);
    // API call
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    console.log('Updating profile:', data);
    // API call
  };

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        // Perform logout
        console.log('Logging out...');
      },
      { variant: 'warning', confirmColor: 'warning', confirmText: 'Logout' }
    );
  };

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            size="large"
            onClick={() => setInvestmentModalOpen(true)}
          >
            New Investment
          </Button>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => setWithdrawalModalOpen(true)}
          >
            Withdraw Funds
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => setProfileModalOpen(true)}
          >
            Edit Profile
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* Modals */}
        <InvestmentModal
          open={investmentModalOpen}
          onClose={() => setInvestmentModalOpen(false)}
          onSubmit={handleInvestment}
          walletBalance={walletBalance}
          minInvestment={1000}
          maxInvestment={10000000}
          interestRate={12}
          lockPeriod={365}
        />

        <WithdrawalModal
          open={withdrawalModalOpen}
          onClose={() => setWithdrawalModalOpen(false)}
          onSubmit={handleWithdrawal}
          walletBalance={walletBalance}
          minWithdrawal={500}
          maxWithdrawal={1000000}
          withdrawalFee={2}
          processingTime="2-3 business days"
        />

        <ProfileEditModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onSubmit={handleProfileUpdate}
          currentData={userProfile}
        />

        <ConfirmModal {...confirmProps} />
      </Stack>
    </Container>
  );
};

// =============================================================================
// Export all examples
// =============================================================================

export default {
  RegistrationFormExample,
  KYCUploadExample,
  InvestmentExample,
  WithdrawalExample,
  ProfileEditExample,
  ConfirmModalBasicExample,
  ConfirmModalHookExample,
  ConfirmModalPresetExample,
  DashboardExample,
};
