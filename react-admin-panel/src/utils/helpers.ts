import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DATE_FORMAT, DATE_TIME_FORMAT } from './constants';

dayjs.extend(relativeTime);

// Format currency
export const formatCurrency = (amount: number | undefined | null, currency: string = '₹'): string => {
  const value = amount || 0;
  return `${currency}${value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Format date
export const formatDate = (date: string | Date | undefined | null, format: string = DATE_FORMAT): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

// Format date time
export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  return dayjs(date).format(DATE_TIME_FORMAT);
};

// Relative time
export const getRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Calculate growth
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Download file
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Parse query params
export const parseQueryParams = (search: string): Record<string, any> => {
  const params = new URLSearchParams(search);
  const result: Record<string, any> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// Build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return filtered ? `?${filtered}` : '';
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Deep clone
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate random color
export const generateRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate mobile
export const isValidMobile = (mobile: string): boolean => {
  const re = /^[0-9]{10}$/;
  return re.test(mobile);
};

// Get status color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    PENDING: 'warning',
    BLOCKED: 'error',
    INACTIVE: 'default',
    COMPLETED: 'success',
    CANCELLED: 'error',
    APPROVED: 'success',
    REJECTED: 'error',
    PROCESSING: 'processing',
    FAILED: 'error',
  };
  return colors[status] || 'default';
};
