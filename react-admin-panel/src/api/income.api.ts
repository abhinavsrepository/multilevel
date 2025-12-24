import axiosInstance, { api } from './axiosConfig';

export interface Income {
    id: number;
    userId: number;
    incomeType: 'DIRECT' | 'LEVEL' | 'MATCHING' | 'ROI' | 'REWARD' | 'CLUB_BONUS';
    amount: number;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
    fromUserId?: number;
    level?: number;
    percentage?: number;
    referenceId?: string;
    remarks?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    User?: {
        id: number;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    FromUser?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
}

export interface IncomeStats {
    totalIncome: number;
    directBonus: number;
    levelBonus: number;
    matchingBonus: number;
    roiBonus: number;
    rewardBonus: number;
    pendingAmount: number;
    paidAmount: number;
    totalUsers: number;
}

export interface IncomeSummary {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    totalIncome: number;
    directBonus: number;
    levelBonus: number;
    matchingBonus: number;
    roiBonus: number;
    rewardBonus: number;
    paidAmount: number;
    pendingAmount: number;
}

export interface IncomeFilters {
    page?: number;
    limit?: number;
    search?: string;
    incomeType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: number;
}

export const incomeApi = {
    // Get all incomes with filters
    getAll: (params?: IncomeFilters) =>
        api.get('/incomes/admin/all', { params }),

    // Get income by type
    getByType: (type: string, params?: IncomeFilters) =>
        api.get(`/incomes/admin/type/${type}`, { params }),

    // Get income stats
    getStats: () =>
        api.get('/incomes/admin/stats'),

    // Get income summary by user
    getSummary: (params?: IncomeFilters) =>
        api.get('/incomes/admin/summary', { params }),

    // Get user income details
    getUserIncomes: (userId: number, params?: IncomeFilters) =>
        api.get(`/incomes/admin/user/${userId}`, { params }),

    // Approve income
    approve: (id: number) =>
        api.put(`/incomes/admin/${id}/approve`),

    // Reject income
    reject: (id: number, reason: string) =>
        api.put(`/incomes/admin/${id}/reject`, { reason }),

    // Mark as paid
    markAsPaid: (id: number) =>
        api.put(`/incomes/admin/${id}/mark-paid`),

    // Export to Excel
    exportToExcel: (params?: IncomeFilters) =>
        axiosInstance.get<Blob>('/incomes/admin/export', {
            params,
            responseType: 'blob'
        }),

    // Export summary to Excel
    exportSummary: (params?: IncomeFilters) =>
        axiosInstance.get<Blob>('/incomes/admin/export-summary', {
            params,
            responseType: 'blob'
        }),
};
