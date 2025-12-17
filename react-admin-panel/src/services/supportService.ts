import { api } from '../api/axiosConfig';
import { Ticket, TicketFilters, TicketReply } from '../types/ticket.types';

export const supportService = {
    getTickets: async (page = 1, limit = 10, filters?: TicketFilters) => {
        const params = { page, limit, ...filters };
        const response = await api.get('/support', { params });
        return response.data;
    },

    getTicketById: async (id: string) => {
        const response = await api.get(`/support/${id}`);
        return response.data;
    },

    createTicket: async (data: Partial<Ticket>) => {
        const response = await api.post('/support', data);
        return response.data;
    },

    replyToTicket: async (ticketId: string, message: string) => {
        const response = await api.post(`/support/${ticketId}/reply`, { message });
        return response.data;
    },

    updateTicketStatus: async (ticketId: string, status: string) => {
        const response = await api.put(`/support/${ticketId}/status`, { status });
        return response.data;
    },
};
