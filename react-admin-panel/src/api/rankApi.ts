import { api } from './axiosConfig';

export interface Rank {
    id: number;
    name: string;
    displayOrder: number;
    icon: string;
    color: string;
    description: string;
    requiredDirectReferrals: number;
    requiredTeamInvestment: number;
    requiredPersonalInvestment: number;
    requireActiveLegs: boolean;
    oneTimeBonus: number;
    monthlyBonus: number;
    commissionBoost: number;
    benefits: string[];
    isActive: boolean;
}

export interface RankReward {
    id: number;
    userId: number;
    rankId: number;
    rewardType: string;
    rewardAmount: number;
    periodMonth?: number;
    periodYear?: number;
    status: string;
    processedAt?: string;
    paidAt?: string;
    transactionId?: string;
    notes?: string;
    createdAt: string;
    User?: any;
    Rank?: any;
}

export interface RankAchievement {
    id: number;
    userId: number;
    rankId: number;
    rankName: string;
    achievedAt: string;
    oneTimeBonusGiven: number;
    bonusPaid: boolean;
    manualAssignment: boolean;
    notes?: string;
    User?: any;
    Rank?: any;
}

export const rankApi = {
    getAllRanks: () => api.get<Rank[]>('/ranks'),
    createRank: (data: Partial<Rank>) => api.post<Rank>('/ranks', data),
    updateRank: (id: number | string, data: Partial<Rank>) => api.patch<Rank>(`/ranks/${id}`, data),
    deleteRank: (id: number | string) => api.delete(`/ranks/${id}`),
    assignRank: (userId: number | string, rankId: number | string, notes?: string) =>
        api.post('/ranks/assign', { userId, rankId, notes }),

    // Rank Rewards APIs
    getAllRewards: (params?: any) => api.get<any>('/rank-rewards/all', { params }),
    generateMonthlyRewards: (periodMonth: number, periodYear: number) =>
        api.post('/rank-rewards/generate-monthly', { periodMonth, periodYear }),
    processMonthlyRewards: (periodMonth: number, periodYear: number) =>
        api.post('/rank-rewards/process-monthly', { periodMonth, periodYear }),
    markRewardsPaid: (rewardIds: number[]) =>
        api.post('/rank-rewards/mark-paid', { rewardIds }),

    // Rank Achievements APIs
    getAllAchievements: (params?: any) => api.get<any>('/rank-achievements/all', { params }),
    getUserAchievements: (userId: number) => api.get<any>(`/rank-achievements/user/${userId}`),
    getAchievementStats: () => api.get<any>('/rank-achievements/stats'),
    awardRank: (userId: number, rankId: number, notes?: string) =>
        api.post('/rank-achievements/award', { userId, rankId, notes }),

    // Progress
    getRankProgress: (userId: number | string) => api.get<any>(`/ranks/users/${userId}/progress`),
};
