import { api } from './axiosConfig';

export interface TeamMember {
    id: number;
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    sponsorId?: number;
    sponsorName?: string;
    level: number;
    position?: 'LEFT' | 'RIGHT';
    leftLeg?: number;
    rightLeg?: number;
    personalBv: number;
    teamBv: number;
    leftBv: number;
    rightBv: number;
    totalReferrals: number;
    directReferrals: number;
    totalDownline: number;
    rank: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    joinedDate: string;
    lastActive?: string;
}

export interface TreeNode {
    id: number;
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    level: number;
    position?: 'LEFT' | 'RIGHT';
    sponsorId?: number;
    leftChild?: TreeNode;
    rightChild?: TreeNode;
    children?: TreeNode[];
    personalBv: number;
    teamBv: number;
    leftBv: number;
    rightBv: number;
    directReferrals: number;
    totalDownline: number;
    rank: string;
    status: string;
    profilePicture?: string;
}

export interface TeamStats {
    totalMembers: number;
    activeMembers: number;
    totalLevels: number;
    directReferrals: number;
    totalDownline: number;
    totalBv: number;
    leftBv: number;
    rightBv: number;
    monthlyGrowth: number;
}

export interface LevelStats {
    level: number;
    count: number;
    activeBv: number;
    totalBv: number;
}

export interface DownlineBusiness {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    level: number;
    personalBv: number;
    teamBv: number;
    directReferrals: number;
    totalDownline: number;
    totalBusiness: number;
    currentMonthBusiness: number;
    rank: string;
    joinedDate: string;
}

export interface TeamFilters {
    page?: number;
    limit?: number;
    search?: string;
    level?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sponsorId?: number;
}

export const teamApi = {
    // Get team tree (binary)
    getTreeView: (userId?: number) =>
        api.get('/team/admin/tree-view', { params: { userId } }),

    // Get team tree by levels (unilevel)
    getLevelTreeView: (userId?: number, maxLevel?: number) =>
        api.get('/team/admin/level-tree-view', { params: { userId, maxLevel } }),

    // Get direct referrals
    getDirectReferrals: (params?: TeamFilters) =>
        api.get('/team/admin/direct-referral', { params }),

    // Get total downline
    getTotalDownline: (params?: TeamFilters) =>
        api.get('/team/admin/total-downline', { params }),

    // Get team by levels
    getTeamLevelDownline: (params?: TeamFilters) =>
        api.get('/team/admin/level-downline', { params }),

    // Get downline business
    getDownlineBusiness: (params?: TeamFilters) =>
        api.get('/team/admin/downline-business', { params }),

    // Get team stats
    getTeamStats: (userId?: number) =>
        api.get('/team/admin/stats', { params: { userId } }),

    // Get level-wise stats
    getLevelStats: (userId?: number) =>
        api.get('/team/admin/level-stats', { params: { userId } }),

    // Export team data
    exportTeam: (params?: TeamFilters) =>
        api.get('/team/admin/export', {
            params,
            responseType: 'blob'
        }),

    // Export downline business
    exportDownlineBusiness: (params?: TeamFilters) =>
        api.get('/team/admin/export-business', {
            params,
            responseType: 'blob'
        }),

    // Get user's team overview
    getUserTeamOverview: (userId: number) =>
        api.get(`/team/admin/user/${userId}/overview`),
};
