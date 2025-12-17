// Status options
export const USER_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Blocked', value: 'BLOCKED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export const KYC_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Basic', value: 'BASIC' },
  { label: 'Full', value: 'FULL' },
  { label: 'Premium', value: 'PREMIUM' },
  { label: 'Rejected', value: 'REJECTED' },
];

export const PROPERTY_TYPES = [
  { label: 'All', value: '' },
  { label: 'Residential', value: 'RESIDENTIAL' },
  { label: 'Commercial', value: 'COMMERCIAL' },
  { label: 'Plot', value: 'PLOT' },
  { label: 'Villa', value: 'VILLA' },
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'Land', value: 'LAND' },
];

export const PROPERTY_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Booking Open', value: 'BOOKING_OPEN' },
  { label: 'Booking Closed', value: 'BOOKING_CLOSED' },
  { label: 'Sold Out', value: 'SOLD_OUT' },
  { label: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
  { label: 'Completed', value: 'COMPLETED' },
];

export const INVESTMENT_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Matured', value: 'MATURED' },
];

export const COMMISSION_TYPES = [
  { label: 'All', value: '' },
  { label: 'Direct Referral', value: 'DIRECT_REFERRAL' },
  { label: 'Binary Pairing', value: 'BINARY_PAIRING' },
  { label: 'Level Commission', value: 'LEVEL_COMMISSION' },
  { label: 'Rank Bonus', value: 'RANK_BONUS' },
  { label: 'Leadership Bonus', value: 'LEADERSHIP_BONUS' },
  { label: 'Rental Income', value: 'RENTAL_INCOME' },
  { label: 'Property Appreciation', value: 'PROPERTY_APPRECIATION' },
  { label: 'ROI', value: 'ROI' },
];

export const PAYOUT_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Requested', value: 'REQUESTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Failed', value: 'FAILED' },
];

export const TICKET_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Reopened', value: 'REOPENED' },
];

export const PRIORITY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

// Badge colors
export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  BLOCKED: 'error',
  INACTIVE: 'default',
  VERIFIED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
  CANCELLED: 'error',
  PROCESSING: 'processing',
  FAILED: 'error',
  OPEN: 'processing',
  CLOSED: 'default',
  RESOLVED: 'success',
  URGENT: 'error',
  HIGH: 'warning',
  MEDIUM: 'default',
  LOW: 'default',
};

// Date formats
export const DATE_FORMAT = 'DD MMM YYYY';
export const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';
export const API_DATE_FORMAT = 'YYYY-MM-DD';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

// Chart colors
export const CHART_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
  '#2f54eb',
  '#a0d911',
];

// Permissions
export const PERMISSIONS = {
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
  },
  PROPERTIES: {
    VIEW: 'properties.view',
    CREATE: 'properties.create',
    UPDATE: 'properties.update',
    DELETE: 'properties.delete',
  },
  INVESTMENTS: {
    VIEW: 'investments.view',
    APPROVE: 'investments.approve',
    REJECT: 'investments.reject',
  },
  PAYOUTS: {
    VIEW: 'payouts.view',
    APPROVE: 'payouts.approve',
    REJECT: 'payouts.reject',
  },
  KYC: {
    VIEW: 'kyc.view',
    APPROVE: 'kyc.approve',
    REJECT: 'kyc.reject',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },
};
