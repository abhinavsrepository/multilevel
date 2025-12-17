import { api } from './axiosConfig';

export interface Withdrawal {
    id: number;
    userId: number;
    amount: number;
    transactionCharge: number;
    netAmount: number;
    withdrawalType: 'BANK_TRANSFER' | 'UPI' | 'CRYPTO' | 'CHECK' | 'OTHER';
    bankAccountId?: number;
    status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    approvedBy?: number;
    approvedAt?: string;
    processedAt?: string;
    rejectionReason?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
    User?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        username: string;
    };
    BankAccount?: {
        id: number;
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
        ifscCode?: string;
    };
}

export interface WithdrawalStats {
    totalWithdrawals: number;
    totalAmount: number;
    pendingWithdrawals: number;
    pendingAmount: number;
    processingWithdrawals: number;
    processingAmount: number;
    approvedWithdrawals: number;
    approvedAmount: number;
    completedWithdrawals: number;
    completedAmount: number;
    rejectedWithdrawals: number;
    rejectedAmount: number;
    todayWithdrawals: number;
    todayAmount: number;
}

export const withdrawalApi = {
    // Admin endpoints
    getAll: (params?: any) => api.get<{ data: Withdrawal[]; total: number }>('/withdrawals/admin', { params }),

    getPending: () => api.get<Withdrawal[]>('/withdrawals/admin/pending'),

    getStats: () => api.get<WithdrawalStats>('/withdrawals/admin/stats'),

    approve: (id: number) => api.post(`/withdrawals/admin/${id}/approve`),

    reject: (id: number, reason: string) =>
        api.post(`/withdrawals/admin/${id}/reject`, { rejectionReason: reason }),

    complete: (id: number, transactionId?: string) =>
        api.post(`/withdrawals/admin/${id}/complete`, { transactionId }),
};
