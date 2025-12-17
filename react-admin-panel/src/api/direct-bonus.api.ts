import { api } from './axiosConfig';

export interface DirectBonusStats {
    totalRecruits: number;
    monthRecruits: number;
    totalBonus: number;
    monthBonus: number;
    pendingBonus: number;
}

export interface DirectBonusLog {
    id: number;
    newTeamMemberName: string;
    agentId: string;
    email: string;
    joinDate: string;
    bonusPaid: number;
    percentage?: number;
    baseAmount?: number;
    status: string;
    paidDate?: string;
    remarks?: string;
}

export interface FastStartBonus {
    id: number;
    targetSales: number;
    targetRecruits: number;
    currentSales: number;
    currentRecruits: number;
    bonusAmount: number;
    periodDays: number;
    daysRemaining: number;
    startDate: string;
    endDate: string;
    salesProgress: number;
    recruitsProgress: number;
    overallProgress: number;
    isQualified: boolean;
    status: string;
}

export interface DirectReferral {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    status: string;
    joinDate: string;
}

export const directBonusApi = {
    // User endpoints
    getStats: () =>
        api.get('/direct-bonus/stats'),

    getLog: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; status?: string }) =>
        api.get('/direct-bonus/log', { params }),

    getFastStartBonus: () =>
        api.get('/direct-bonus/fast-start'),

    updateFastStartProgress: () =>
        api.post('/direct-bonus/fast-start/update'),

    getReferrals: (params?: { page?: number; limit?: number }) =>
        api.get('/direct-bonus/referrals', { params }),

    // Admin endpoints
    adminGetAll: (params?: any) =>
        api.get('/direct-bonus/admin', { params }),

    adminGetStats: () =>
        api.get('/direct-bonus/admin/stats'),

    adminCreate: (data: {
        userId: number;
        fromUserId?: number;
        amount: number;
        percentage?: number;
        baseAmount?: number;
        remarks?: string;
    }) =>
        api.post('/direct-bonus/admin', data),

    adminApprove: (id: number) =>
        api.post(`/direct-bonus/admin/${id}/approve`),

    adminReject: (id: number, reason?: string) =>
        api.post(`/direct-bonus/admin/${id}/reject`, { reason }),

    adminGetFastStart: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
        api.get('/direct-bonus/admin/fast-start', { params }),

    adminCreateFastStart: (data: {
        userId: number;
        targetSales: number;
        targetRecruits: number;
        bonusAmount: number;
        periodDays?: number;
    }) =>
        api.post('/direct-bonus/admin/fast-start', data),
};
