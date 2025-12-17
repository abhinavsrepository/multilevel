import { api } from './axiosConfig';

export interface Deposit {
    id: number;
    userId: number;
    amount: number;
    paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'CRYPTO' | 'OTHER';
    transactionId?: string;
    paymentProof?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: number;
    approvedAt?: string;
    rejectionReason?: string;
    epinGenerated: boolean;
    epinId?: number;
    createdAt: string;
    updatedAt: string;
    User?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        username: string;
    };
    EPin?: {
        id: number;
        pinCode: string;
        amount: number;
    };
}

export interface DepositStats {
    totalDeposits: number;
    totalAmount: number;
    pendingDeposits: number;
    pendingAmount: number;
    approvedDeposits: number;
    approvedAmount: number;
    rejectedDeposits: number;
    rejectedAmount: number;
    todayDeposits: number;
    todayAmount: number;
}

export const depositApi = {
    // Admin endpoints
    getAll: (params?: any) => api.get<{ data: Deposit[]; total: number }>('/deposits/admin', { params }),

    getPending: () => api.get<Deposit[]>('/deposits/admin/pending'),

    getStats: () => api.get<DepositStats>('/deposits/admin/stats'),

    approve: (id: number, generateEPin: boolean = true) =>
        api.post(`/deposits/admin/${id}/approve`, { generateEPin }),

    reject: (id: number, reason: string) =>
        api.post(`/deposits/admin/${id}/reject`, { rejectionReason: reason }),
};
