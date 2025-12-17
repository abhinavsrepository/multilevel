/**
 * Application Constants
 * Contains all constant values used across the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  VERSION: 'v1',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    UPDATE_PASSWORD: '/user/update-password',
    UPDATE_AVATAR: '/user/update-avatar',
    KYC: '/user/kyc',
    UPDATE_KYC: '/user/update-kyc',
    BANK_DETAILS: '/user/bank-details',
    UPDATE_BANK_DETAILS: '/user/update-bank-details',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITIES: '/dashboard/recent-activities',
    EARNINGS_OVERVIEW: '/dashboard/earnings-overview',
    TEAM_PERFORMANCE: '/dashboard/team-performance',
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    DETAILS: '/properties/:id',
    FEATURED: '/properties/featured',
    MY_PROPERTIES: '/properties/my-properties',
    BOOK: '/properties/book',
    SHARE: '/properties/share',
  },

  // Network/Team
  NETWORK: {
    TREE: '/network/tree',
    DIRECT_REFERRALS: '/network/direct-referrals',
    DOWNLINE: '/network/downline',
    GENEALOGY: '/network/genealogy',
    TEAM_STATS: '/network/team-stats',
  },

  // Commissions
  COMMISSIONS: {
    LIST: '/commissions',
    DETAILS: '/commissions/:id',
    SUMMARY: '/commissions/summary',
    BY_TYPE: '/commissions/by-type',
  },

  // Earnings
  EARNINGS: {
    LIST: '/earnings',
    DETAILS: '/earnings/:id',
    SUMMARY: '/earnings/summary',
    STATISTICS: '/earnings/statistics',
  },

  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    WITHDRAW: '/wallet/withdraw',
    TRANSFER: '/wallet/transfer',
  },

  // Withdrawals
  WITHDRAWALS: {
    LIST: '/withdrawals',
    CREATE: '/withdrawals/create',
    DETAILS: '/withdrawals/:id',
    CANCEL: '/withdrawals/:id/cancel',
  },

  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets/create',
    TICKET_DETAILS: '/support/tickets/:id',
    MESSAGES: '/support/tickets/:id/messages',
    SEND_MESSAGE: '/support/tickets/:id/messages',
    CLOSE_TICKET: '/support/tickets/:id/close',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: '/notifications/:id',
  },

  // Documents
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    DOWNLOAD: '/documents/:id/download',
    DELETE: '/documents/:id',
  },

  // Reports
  REPORTS: {
    EARNINGS: '/reports/earnings',
    COMMISSIONS: '/reports/commissions',
    TEAM: '/reports/team',
    PROPERTIES: '/reports/properties',
  },
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BLOCKED: 'blocked',
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.SUSPENDED]: 'Suspended',
  [USER_STATUS.PENDING]: 'Pending',
  [USER_STATUS.BLOCKED]: 'Blocked',
} as const;

export const USER_STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'success',
  [USER_STATUS.INACTIVE]: 'default',
  [USER_STATUS.SUSPENDED]: 'warning',
  [USER_STATUS.PENDING]: 'info',
  [USER_STATUS.BLOCKED]: 'error',
} as const;

// KYC Status
export const KYC_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESUBMITTED: 'resubmitted',
} as const;

export const KYC_STATUS_LABELS = {
  [KYC_STATUS.NOT_SUBMITTED]: 'Not Submitted',
  [KYC_STATUS.PENDING]: 'Pending Verification',
  [KYC_STATUS.APPROVED]: 'Approved',
  [KYC_STATUS.REJECTED]: 'Rejected',
  [KYC_STATUS.RESUBMITTED]: 'Resubmitted',
} as const;

export const KYC_STATUS_COLORS = {
  [KYC_STATUS.NOT_SUBMITTED]: 'default',
  [KYC_STATUS.PENDING]: 'warning',
  [KYC_STATUS.APPROVED]: 'success',
  [KYC_STATUS.REJECTED]: 'error',
  [KYC_STATUS.RESUBMITTED]: 'info',
} as const;

// Property Status
export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  SOLD: 'sold',
  RESERVED: 'reserved',
  UPCOMING: 'upcoming',
} as const;

export const PROPERTY_STATUS_LABELS = {
  [PROPERTY_STATUS.AVAILABLE]: 'Available',
  [PROPERTY_STATUS.BOOKED]: 'Booked',
  [PROPERTY_STATUS.SOLD]: 'Sold',
  [PROPERTY_STATUS.RESERVED]: 'Reserved',
  [PROPERTY_STATUS.UPCOMING]: 'Upcoming',
} as const;

export const PROPERTY_STATUS_COLORS = {
  [PROPERTY_STATUS.AVAILABLE]: 'success',
  [PROPERTY_STATUS.BOOKED]: 'warning',
  [PROPERTY_STATUS.SOLD]: 'error',
  [PROPERTY_STATUS.RESERVED]: 'info',
  [PROPERTY_STATUS.UPCOMING]: 'default',
} as const;

// Commission Status
export const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
} as const;

export const COMMISSION_STATUS_LABELS = {
  [COMMISSION_STATUS.PENDING]: 'Pending',
  [COMMISSION_STATUS.APPROVED]: 'Approved',
  [COMMISSION_STATUS.PAID]: 'Paid',
  [COMMISSION_STATUS.REJECTED]: 'Rejected',
  [COMMISSION_STATUS.PROCESSING]: 'Processing',
} as const;

export const COMMISSION_STATUS_COLORS = {
  [COMMISSION_STATUS.PENDING]: 'warning',
  [COMMISSION_STATUS.APPROVED]: 'info',
  [COMMISSION_STATUS.PAID]: 'success',
  [COMMISSION_STATUS.REJECTED]: 'error',
  [COMMISSION_STATUS.PROCESSING]: 'default',
} as const;

// Commission Types
export const COMMISSION_TYPES = {
  DIRECT: 'direct',
  LEVEL: 'level',
  MATCHING: 'matching',
  LEADERSHIP: 'leadership',
  PERFORMANCE: 'performance',
  BONUS: 'bonus',
} as const;

export const COMMISSION_TYPE_LABELS = {
  [COMMISSION_TYPES.DIRECT]: 'Direct Commission',
  [COMMISSION_TYPES.LEVEL]: 'Level Commission',
  [COMMISSION_TYPES.MATCHING]: 'Matching Bonus',
  [COMMISSION_TYPES.LEADERSHIP]: 'Leadership Bonus',
  [COMMISSION_TYPES.PERFORMANCE]: 'Performance Bonus',
  [COMMISSION_TYPES.BONUS]: 'Bonus',
} as const;

// Withdrawal Status
export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export const WITHDRAWAL_STATUS_LABELS = {
  [WITHDRAWAL_STATUS.PENDING]: 'Pending',
  [WITHDRAWAL_STATUS.PROCESSING]: 'Processing',
  [WITHDRAWAL_STATUS.APPROVED]: 'Approved',
  [WITHDRAWAL_STATUS.COMPLETED]: 'Completed',
  [WITHDRAWAL_STATUS.REJECTED]: 'Rejected',
  [WITHDRAWAL_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const WITHDRAWAL_STATUS_COLORS = {
  [WITHDRAWAL_STATUS.PENDING]: 'warning',
  [WITHDRAWAL_STATUS.PROCESSING]: 'info',
  [WITHDRAWAL_STATUS.APPROVED]: 'primary',
  [WITHDRAWAL_STATUS.COMPLETED]: 'success',
  [WITHDRAWAL_STATUS.REJECTED]: 'error',
  [WITHDRAWAL_STATUS.CANCELLED]: 'default',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  COMMISSION: 'commission',
  WITHDRAWAL: 'withdrawal',
  REFUND: 'refund',
  TRANSFER: 'transfer',
  BONUS: 'bonus',
} as const;

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.CREDIT]: 'Credit',
  [TRANSACTION_TYPES.DEBIT]: 'Debit',
  [TRANSACTION_TYPES.COMMISSION]: 'Commission',
  [TRANSACTION_TYPES.WITHDRAWAL]: 'Withdrawal',
  [TRANSACTION_TYPES.REFUND]: 'Refund',
  [TRANSACTION_TYPES.TRANSFER]: 'Transfer',
  [TRANSACTION_TYPES.BONUS]: 'Bonus',
} as const;

// Support Ticket Status
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
} as const;

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.OPEN]: 'Open',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.RESOLVED]: 'Resolved',
  [TICKET_STATUS.CLOSED]: 'Closed',
  [TICKET_STATUS.REOPENED]: 'Reopened',
} as const;

export const TICKET_STATUS_COLORS = {
  [TICKET_STATUS.OPEN]: 'error',
  [TICKET_STATUS.IN_PROGRESS]: 'warning',
  [TICKET_STATUS.RESOLVED]: 'success',
  [TICKET_STATUS.CLOSED]: 'default',
  [TICKET_STATUS.REOPENED]: 'info',
} as const;

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TICKET_PRIORITY_LABELS = {
  [TICKET_PRIORITY.LOW]: 'Low',
  [TICKET_PRIORITY.MEDIUM]: 'Medium',
  [TICKET_PRIORITY.HIGH]: 'High',
  [TICKET_PRIORITY.URGENT]: 'Urgent',
} as const;

export const TICKET_PRIORITY_COLORS = {
  [TICKET_PRIORITY.LOW]: 'default',
  [TICKET_PRIORITY.MEDIUM]: 'info',
  [TICKET_PRIORITY.HIGH]: 'warning',
  [TICKET_PRIORITY.URGENT]: 'error',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  COMMISSION: 'commission',
  PROPERTY: 'property',
  TEAM: 'team',
  SYSTEM: 'system',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY, hh:mm A',
  INPUT: 'YYYY-MM-DD',
  API: 'YYYY-MM-DD',
  LONG: 'MMMM DD, YYYY',
  SHORT: 'DD/MM/YYYY',
  TIME_12: 'hh:mm A',
  TIME_24: 'HH:mm',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  ALLOWED_EXTENSIONS: {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENT: ['.pdf', '.doc', '.docx'],
    ALL: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'],
  },
} as const;

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  REMEMBER_ME: 'remember_me',
} as const;

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Languages
export const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi',
} as const;

export const LANGUAGE_LABELS = {
  [LANGUAGES.ENGLISH]: 'English',
  [LANGUAGES.HINDI]: 'हिंदी',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  MOBILE: /^[6-9]\d{9}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  PINCODE: /^\d{6}$/,
  GST: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
  ACCOUNT_NUMBER: /^\d{9,18}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  ALPHABETIC: /^[a-zA-Z\s]+$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  REGISTER: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_UPDATED: 'Password updated successfully!',
  KYC_SUBMITTED: 'KYC submitted successfully!',
  WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully!',
  TICKET_CREATED: 'Support ticket created successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  GENERIC_SUCCESS: 'Operation completed successfully!',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  KYC: '/kyc',
  BANK_DETAILS: '/bank-details',
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: '/properties/:id',
  NETWORK: '/network',
  GENEALOGY: '/network/genealogy',
  DIRECT_REFERRALS: '/network/direct-referrals',
  DOWNLINE: '/network/downline',
  COMMISSIONS: '/commissions',
  EARNINGS: '/earnings',
  WALLET: '/wallet',
  WITHDRAWALS: '/withdrawals',
  NEW_WITHDRAWAL: '/withdrawals/new',
  SUPPORT: '/support',
  NEW_TICKET: '/support/new',
  TICKET_DETAILS: '/support/:id',
  NOTIFICATIONS: '/notifications',
  DOCUMENTS: '/documents',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
  PURPLE: '#9c27b0',
  TEAL: '#009688',
  PINK: '#e91e63',
  ORANGE: '#ff5722',
} as const;

// MLM Levels
export const MLM_LEVELS = {
  MAX_LEVELS: 10,
  LEVEL_NAMES: [
    'Level 1',
    'Level 2',
    'Level 3',
    'Level 4',
    'Level 5',
    'Level 6',
    'Level 7',
    'Level 8',
    'Level 9',
    'Level 10',
  ],
} as const;

// Rank/Titles
export const USER_RANKS = {
  ASSOCIATE: 'associate',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  CROWN_DIAMOND: 'crown_diamond',
} as const;

export const USER_RANK_LABELS = {
  [USER_RANKS.ASSOCIATE]: 'Associate',
  [USER_RANKS.SILVER]: 'Silver',
  [USER_RANKS.GOLD]: 'Gold',
  [USER_RANKS.PLATINUM]: 'Platinum',
  [USER_RANKS.DIAMOND]: 'Diamond',
  [USER_RANKS.CROWN_DIAMOND]: 'Crown Diamond',
} as const;

export const USER_RANK_COLORS = {
  [USER_RANKS.ASSOCIATE]: '#9e9e9e',
  [USER_RANKS.SILVER]: '#c0c0c0',
  [USER_RANKS.GOLD]: '#ffd700',
  [USER_RANKS.PLATINUM]: '#e5e4e2',
  [USER_RANKS.DIAMOND]: '#b9f2ff',
  [USER_RANKS.CROWN_DIAMOND]: '#4169e1',
} as const;

// App Info
export const APP_INFO = {
  NAME: 'MLM Real Estate',
  VERSION: '1.0.0',
  DESCRIPTION: 'MLM Real Estate User Panel',
  COMPANY: 'MLM Real Estate',
  COPYRIGHT: `© ${new Date().getFullYear()} MLM Real Estate. All rights reserved.`,
  SUPPORT_EMAIL: 'support@mlmrealestate.com',
  SUPPORT_PHONE: '+91 9876543210',
} as const;
