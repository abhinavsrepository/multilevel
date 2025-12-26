export type SaleType = 'PRIMARY_BOOKING' | 'FULL_PAYMENT';

export type SaleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface BuyerDetails {
  fullName: string;
  email?: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  userId?: number;
  username?: string;
  isExistingUser?: boolean;
  isSelfCode?: boolean;
}

export interface PropertySaleForm {
  propertyId: number | null;
  saleType: SaleType;
  plotSize: string;
  pricePerSqFt: string;
  paymentReceipt: string;
  buyerDetails: BuyerDetails;
  remarks: string;
}

export const ECOGRAM_PROPERTIES = [
  { id: 1, name: 'Pocket-1', minPrice: 550, maxPrice: 750 },
  { id: 2, name: 'Eco Vihar', minPrice: 650, maxPrice: 850 },
  { id: 3, name: 'Indraprastha', minPrice: 800, maxPrice: 1499 },
] as const;

export const SALE_TYPE_OPTIONS = [
  { value: 'PRIMARY_BOOKING', label: 'Primary Booking (25% Down)', description: '25% down payment, 75% in 24 months' },
  { value: 'FULL_PAYMENT', label: 'Full Payment', description: '100% payment upfront' },
] as const;

export const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
  COMPLETED: 'success',
};

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  PENDING: 'Pending Verification',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};
