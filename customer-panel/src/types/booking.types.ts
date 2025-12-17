export interface Booking {
  id: number;
  bookingNumber: string;
  clientId: number;
  clientName: string;
  propertyId: number;
  propertyTitle: string;
  plotNumber?: string;
  bookingAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  bookingDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  emiSchedule: EMISchedule[];
  documents: BookingDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface EMISchedule {
  id: number;
  bookingId: number;
  emiNumber: number;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paidAmount?: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paymentMode?: string;
  transactionId?: string;
}

export interface BookingDocument {
  id: number;
  bookingId: number;
  docType: 'AGREEMENT' | 'RECEIPT' | 'NOC' | 'ALLOTMENT_LETTER' | 'OTHER';
  name: string;
  url: string;
  uploadedAt: string;
}
