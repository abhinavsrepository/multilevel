import { api } from './axiosConfig';
import { Ticket, TicketFilters, TicketReply, TicketTemplate } from '@/types/ticket.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const ticketApi = {
  // Get all tickets
  getTickets: (params: FilterParams & TicketFilters) =>
    api.get<PaginatedResponse<Ticket>>('/admin/tickets', { params }),

  // Get ticket by ID
  getTicketById: (id: number) => api.get<Ticket>(`/admin/tickets/${id}`),

  // Reply to ticket
  replyToTicket: (id: number, data: FormData) =>
    api.post(`/admin/tickets/${id}/reply`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update ticket status
  updateTicketStatus: (id: number, status: string) =>
    api.put(`/admin/tickets/${id}/status`, { status }),

  // Update ticket priority
  updateTicketPriority: (id: number, priority: string) =>
    api.put(`/admin/tickets/${id}/priority`, { priority }),

  // Assign ticket
  assignTicket: (id: number, adminId: number) =>
    api.put(`/admin/tickets/${id}/assign`, { adminId }),

  // Close ticket
  closeTicket: (id: number) => api.put(`/admin/tickets/${id}/close`),

  // Reopen ticket
  reopenTicket: (id: number) => api.put(`/admin/tickets/${id}/reopen`),

  // Get ticket templates
  getTemplates: () => api.get<TicketTemplate[]>('/admin/tickets/templates'),

  // Create template
  createTemplate: (data: Partial<TicketTemplate>) =>
    api.post('/admin/tickets/templates', data),

  // Update template
  updateTemplate: (id: number, data: Partial<TicketTemplate>) =>
    api.put(`/admin/tickets/templates/${id}`, data),

  // Delete template
  deleteTemplate: (id: number) => api.delete(`/admin/tickets/templates/${id}`),

  // Export tickets
  exportTickets: (params: TicketFilters) =>
    api.get('/admin/tickets/export', { params, responseType: 'blob' }),
};
