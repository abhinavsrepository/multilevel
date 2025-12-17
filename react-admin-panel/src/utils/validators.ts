import * as Yup from 'yup';

// Login schema
export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

// User schema
export const userSchema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile must be 10 digits')
    .required('Mobile is required'),
  password: Yup.string().when('$isEdit', {
    is: false,
    then: (schema) =>
      schema
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    otherwise: (schema) => schema.optional(),
  }),
  dateOfBirth: Yup.string().optional(),
  gender: Yup.string().optional(),
  address: Yup.string().optional(),
  city: Yup.string().optional(),
  state: Yup.string().optional(),
  pincode: Yup.string().optional(),
  sponsorId: Yup.string().optional(),
});

// Property schema
export const propertySchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  propertyType: Yup.string().required('Property type is required'),
  category: Yup.string().required('Category is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  pincode: Yup.string().required('Pincode is required'),
  basePrice: Yup.number()
    .positive('Price must be positive')
    .required('Base price is required'),
  investmentPrice: Yup.number()
    .positive('Price must be positive')
    .required('Investment price is required'),
  minimumInvestment: Yup.number()
    .positive('Amount must be positive')
    .required('Minimum investment is required'),
  totalSlots: Yup.number()
    .positive('Slots must be positive')
    .integer('Slots must be an integer')
    .required('Total slots is required'),
  directReferralCommissionPercent: Yup.number()
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100%')
    .required('Commission percentage is required'),
  bvValue: Yup.number()
    .min(0, 'Cannot be negative')
    .required('BV value is required'),
  expectedROI: Yup.number()
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100%')
    .required('Expected ROI is required'),
  roiTenure: Yup.number()
    .positive('Tenure must be positive')
    .integer('Tenure must be an integer')
    .required('ROI tenure is required'),
});

// Payout approval schema
export const payoutApprovalSchema = Yup.object({
  utrNumber: Yup.string().optional(),
  remarks: Yup.string().optional(),
});

// Payout rejection schema
export const payoutRejectionSchema = Yup.object({
  reason: Yup.string().required('Rejection reason is required'),
});

// KYC verification schema
export const kycVerificationSchema = Yup.object({
  kycLevel: Yup.string()
    .oneOf(['BASIC', 'FULL', 'PREMIUM'], 'Invalid KYC level')
    .required('KYC level is required'),
  remarks: Yup.string().optional(),
});

// Broadcast notification schema
export const broadcastSchema = Yup.object({
  title: Yup.string().max(100, 'Title too long').required('Title is required'),
  message: Yup.string().max(500, 'Message too long').required('Message is required'),
  targetAudience: Yup.string().required('Target audience is required'),
  channels: Yup.array().min(1, 'Select at least one channel'),
  priority: Yup.string().required('Priority is required'),
});

// Ticket reply schema
export const ticketReplySchema = Yup.object({
  message: Yup.string().required('Message is required'),
  isInternal: Yup.boolean(),
});

// Change password schema
export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});
