import api from './axiosConfig';
import type { Booking, EMISchedule, PaginatedResponse, PaginationParams } from '@/types';

export const bookingApi = {
  // For Associates
  getAll: (params?: PaginationParams & { status?: string; search?: string }) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params }),

  getById: (id: number) => api.get<Booking>(`/bookings/${id}`),

  // For Customers
  getMyBookings: () => api.get<Booking[]>('/bookings/my-bookings'),

  getMyBookingById: (id: number) => api.get<Booking>(`/bookings/my-bookings/${id}`),

  // EMI Management
  getEMISchedule: (bookingId: number) => api.get<EMISchedule[]>(`/bookings/${bookingId}/emi-schedule`),

  getPendingEMIs: (bookingId: number) => api.get<EMISchedule[]>(`/bookings/${bookingId}/emi/pending`),

  getOverdueEMIs: (bookingId: number) => api.get<EMISchedule[]>(`/bookings/${bookingId}/emi/overdue`),

  recordEMIPayment: (emiId: number, data: { amount: number; paymentMode: string; transactionId: string }) =>
    api.post(`/emi/${emiId}/pay`, data),

  // Documents
  getDocuments: (bookingId: number) => api.get(`/bookings/${bookingId}/documents`),

  uploadDocument: (bookingId: number, data: FormData) =>
    api.post(`/bookings/${bookingId}/documents`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  downloadDocument: (docId: number) => api.get(`/documents/${docId}/download`, { responseType: 'blob' }),
};
