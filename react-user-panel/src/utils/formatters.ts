/**
 * Formatter Functions
 * Contains formatting functions for various data types
 */

import { CURRENCY, DATE_FORMATS } from './constants';

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number | string,
  options: {
    showSymbol?: boolean;
    decimals?: number;
    locale?: string;
  } = {}
): string => {
  const {
    showSymbol = true,
    decimals = 2,
    locale = CURRENCY.LOCALE,
  } = options;

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return showSymbol ? `${CURRENCY.SYMBOL} 0.${'0'.repeat(decimals)}` : `0.${'0'.repeat(decimals)}`;
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericAmount);

  return showSymbol ? `${CURRENCY.SYMBOL} ${formatted}` : formatted;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (
  num: number | string,
  options: {
    decimals?: number;
    locale?: string;
  } = {}
): string => {
  const {
    decimals = 0,
    locale = CURRENCY.LOCALE,
  } = options;

  const numericValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numericValue)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number | string,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string => {
  const {
    decimals = 2,
    showSign = true,
  } = options;

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '0%';
  }

  const formatted = numericValue.toFixed(decimals);
  return showSign ? `${formatted}%` : formatted;
};

/**
 * Format compact number (1K, 1L, 1Cr, etc.)
 */
export const formatCompactNumber = (
  num: number | string,
  options: {
    decimals?: number;
    useIndianSystem?: boolean;
  } = {}
): string => {
  const {
    decimals = 2,
    useIndianSystem = true,
  } = options;

  const numericValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numericValue)) {
    return '0';
  }

  if (useIndianSystem) {
    // Indian numbering system
    if (numericValue >= 10000000) {
      return `${(numericValue / 10000000).toFixed(decimals)} Cr`;
    }
    if (numericValue >= 100000) {
      return `${(numericValue / 100000).toFixed(decimals)} L`;
    }
    if (numericValue >= 1000) {
      return `${(numericValue / 1000).toFixed(decimals)} K`;
    }
  } else {
    // International numbering system
    if (numericValue >= 1000000000) {
      return `${(numericValue / 1000000000).toFixed(decimals)} B`;
    }
    if (numericValue >= 1000000) {
      return `${(numericValue / 1000000).toFixed(decimals)} M`;
    }
    if (numericValue >= 1000) {
      return `${(numericValue / 1000).toFixed(decimals)} K`;
    }
  }

  return numericValue.toFixed(decimals);
};

/**
 * Format date to specified format
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  format: string = DATE_FORMATS.DISPLAY
): string => {
  if (!date) return '-';

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    const dayOfWeek = dateObj.getDay();

    const paddedDay = day.toString().padStart(2, '0');
    const paddedMonth = (month + 1).toString().padStart(2, '0');
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    const hours12 = hours % 12 || 12;
    const paddedHours12 = hours12.toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Replace format tokens
    let formatted = format
      .replace('YYYY', year.toString())
      .replace('YY', year.toString().slice(-2))
      .replace('MMMM', longMonths[month])
      .replace('MMM', months[month])
      .replace('MM', paddedMonth)
      .replace('M', (month + 1).toString())
      .replace('DD', paddedDay)
      .replace('D', day.toString())
      .replace('dddd', days[dayOfWeek])
      .replace('ddd', shortDays[dayOfWeek])
      .replace('HH', paddedHours)
      .replace('H', hours.toString())
      .replace('hh', paddedHours12)
      .replace('h', hours12.toString())
      .replace('mm', paddedMinutes)
      .replace('m', minutes.toString())
      .replace('ss', paddedSeconds)
      .replace('s', seconds.toString())
      .replace('A', ampm)
      .replace('a', ampm.toLowerCase());

    return formatted;
  } catch (error) {
    return '-';
  }
};

/**
 * Format time
 */
export const formatTime = (
  date: Date | string | number,
  format: '12h' | '24h' = '12h'
): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    if (format === '12h') {
      return formatDate(dateObj, DATE_FORMATS.TIME_12);
    } else {
      return formatDate(dateObj, DATE_FORMATS.TIME_24);
    }
  } catch (error) {
    return '-';
  }
};

/**
 * Format datetime
 */
export const formatDateTime = (
  date: Date | string | number,
  options: {
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    separator?: string;
  } = {}
): string => {
  const {
    dateFormat = DATE_FORMATS.DISPLAY,
    timeFormat = '12h',
    separator = ', ',
  } = options;

  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const formattedDate = formatDate(dateObj, dateFormat);
    const formattedTime = formatTime(dateObj, timeFormat);

    return `${formattedDate}${separator}${formattedTime}`;
  } catch (error) {
    return '-';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 0) {
      return 'just now';
    }

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    return '-';
  }
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (
  phone: string,
  options: {
    countryCode?: string;
    format?: 'default' | 'dashed' | 'spaced';
  } = {}
): string => {
  const {
    countryCode = '+91',
    format = 'default',
  } = options;

  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length !== 10) {
    return phone;
  }

  switch (format) {
    case 'dashed':
      return `${countryCode} ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    case 'spaced':
      return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    default:
      return `${countryCode} ${cleaned}`;
  }
};

/**
 * Format PAN number
 */
export const formatPAN = (pan: string): string => {
  if (!pan) return '';
  return pan.toUpperCase();
};

/**
 * Format Aadhaar number
 */
export const formatAadhaar = (
  aadhaar: string,
  options: {
    masked?: boolean;
    separator?: string;
  } = {}
): string => {
  const {
    masked = false,
    separator = ' ',
  } = options;

  if (!aadhaar) return '';

  const cleaned = aadhaar.replace(/\D/g, '');

  if (cleaned.length !== 12) {
    return aadhaar;
  }

  if (masked) {
    return `XXXX${separator}XXXX${separator}${cleaned.slice(-4)}`;
  }

  return `${cleaned.slice(0, 4)}${separator}${cleaned.slice(4, 8)}${separator}${cleaned.slice(8)}`;
};

/**
 * Format bank account number
 */
export const formatAccountNumber = (
  accountNumber: string,
  options: {
    masked?: boolean;
    visibleDigits?: number;
  } = {}
): string => {
  const {
    masked = false,
    visibleDigits = 4,
  } = options;

  if (!accountNumber) return '';

  const cleaned = accountNumber.replace(/\D/g, '');

  if (masked) {
    const maskedPart = 'X'.repeat(Math.max(0, cleaned.length - visibleDigits));
    const visiblePart = cleaned.slice(-visibleDigits);
    return maskedPart + visiblePart;
  }

  return cleaned;
};

/**
 * Format IFSC code
 */
export const formatIFSC = (ifsc: string): string => {
  if (!ifsc) return '';
  return ifsc.toUpperCase();
};

/**
 * Format card number
 */
export const formatCardNumber = (
  cardNumber: string,
  options: {
    masked?: boolean;
    separator?: string;
  } = {}
): string => {
  const {
    masked = false,
    separator = ' ',
  } = options;

  if (!cardNumber) return '';

  const cleaned = cardNumber.replace(/\D/g, '');

  if (masked) {
    const visiblePart = cleaned.slice(-4);
    return `XXXX${separator}XXXX${separator}XXXX${separator}${visiblePart}`;
  }

  // Format as XXXX XXXX XXXX XXXX
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(separator);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format duration (seconds to human readable)
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr` : `${days} day${days > 1 ? 's' : ''}`;
};

/**
 * Format name (capitalize properly)
 */
export const formatName = (name: string): string => {
  if (!name) return '';

  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format address (capitalize properly)
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';

  return address
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format email (lowercase)
 */
export const formatEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Mask email
 */
export const maskEmail = (email: string): string => {
  if (!email) return '';

  const [username, domain] = email.split('@');

  if (!domain) return email;

  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const maskedUsername = username.slice(0, visibleChars) + '*'.repeat(Math.max(0, username.length - visibleChars));

  return `${maskedUsername}@${domain}`;
};

/**
 * Mask phone number
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10) return phone;

  return `${cleaned.slice(0, 2)}******${cleaned.slice(-2)}`;
};

/**
 * Format boolean to Yes/No
 */
export const formatBoolean = (value: boolean, options: { yes?: string; no?: string } = {}): string => {
  const { yes = 'Yes', no = 'No' } = options;
  return value ? yes : no;
};

/**
 * Format array to comma separated string
 */
export const formatArrayToString = (
  array: any[],
  options: {
    separator?: string;
    lastSeparator?: string;
  } = {}
): string => {
  const {
    separator = ', ',
    lastSeparator = ' and ',
  } = options;

  if (!array || array.length === 0) return '';
  if (array.length === 1) return String(array[0]);
  if (array.length === 2) return array.join(lastSeparator);

  const allButLast = array.slice(0, -1).join(separator);
  const last = array[array.length - 1];

  return `${allButLast}${lastSeparator}${last}`;
};

/**
 * Format transaction ID
 */
export const formatTransactionId = (id: string, options: { prefix?: string } = {}): string => {
  const { prefix = 'TXN' } = options;

  if (!id) return '';

  return `${prefix}${id.toUpperCase()}`;
};

/**
 * Format reference number
 */
export const formatReferenceNumber = (ref: string, options: { prefix?: string } = {}): string => {
  const { prefix = 'REF' } = options;

  if (!ref) return '';

  return `${prefix}${ref.toUpperCase()}`;
};

/**
 * Format order number
 */
export const formatOrderNumber = (order: string, options: { prefix?: string } = {}): string => {
  const { prefix = 'ORD' } = options;

  if (!order) return '';

  return `${prefix}${order.toUpperCase()}`;
};

/**
 * Format property ID
 */
export const formatPropertyId = (id: string, options: { prefix?: string } = {}): string => {
  const { prefix = 'PROP' } = options;

  if (!id) return '';

  return `${prefix}${id.toUpperCase()}`;
};

/**
 * Format user ID
 */
export const formatUserId = (id: string, options: { prefix?: string } = {}): string => {
  const { prefix = 'USER' } = options;

  if (!id) return '';

  return `${prefix}${id.toUpperCase()}`;
};

/**
 * Format coordinates (latitude, longitude)
 */
export const formatCoordinates = (lat: number, lng: number, decimals = 6): string => {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

/**
 * Format color (ensure # prefix)
 */
export const formatColor = (color: string): string => {
  if (!color) return '';
  return color.startsWith('#') ? color : `#${color}`;
};

/**
 * Format slug (URL friendly string)
 */
export const formatSlug = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number, suffix = '...'): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

/**
 * Pluralize word based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format count with word
 */
export const formatCountWithWord = (count: number, singular: string, plural?: string): string => {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`;
};
