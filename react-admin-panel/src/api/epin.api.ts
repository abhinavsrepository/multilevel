import { api } from './axiosConfig';

export interface EPin {
    id: number;
    pinCode: string;
    amount: number;
    generatedBy: number;
    generatedFrom: 'ADMIN' | 'WALLET' | 'DEPOSIT';
    status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'BLOCKED';
    usedBy?: number;
    activatedUserId?: number;
    usedAt?: string;
    transactionFee: number;
    expiryDate?: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    GeneratedByUser?: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
    };
    UsedByUser?: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
    };
    ActivatedUser?: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
    };
}

export interface EPinStats {
    totalPins: number;
    totalValue: number;
    availablePins: number;
    availableValue: number;
    usedPins: number;
    usedValue: number;
    expiredPins: number;
    expiredValue: number;
    blockedPins: number;
    blockedValue: number;
}

export interface GenerateEPinRequest {
    count: number;
    amount: number;
    expiryDays?: number;
    remarks?: string;
}

export const epinApi = {
    // Admin endpoints
    getAll: (params?: any) => api.get<{ data: EPin[]; total: number }>('/epins/admin', { params }),

    getStats: () => api.get<EPinStats>('/epins/admin/stats'),

    generate: (data: GenerateEPinRequest) => api.post<{ epins: EPin[] }>('/epins/admin/generate', data),

    toggleStatus: (id: number) => api.put(`/epins/admin/${id}/toggle`),

    delete: (id: number) => api.delete(`/epins/admin/${id}`),
};
