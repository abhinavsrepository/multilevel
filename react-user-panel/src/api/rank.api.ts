import { api } from './config/axiosConfig';

export interface RankProgressData {
    currentRank: {
        name: string;
        displayOrder: number;
    };
    nextRank: {
        name: string;
        displayOrder: number;
        reward: number;
    } | null;
    progress: {
        directReferrals: { current: number; required: number; percentage: number };
        teamInvestment: { current: number; required: number; percentage: number };
        personalInvestment: { current: number; required: number; percentage: number };
    };
    overallProgress: number;
    guidance: string[];
}

export interface RankProgressResponse {
    success: boolean;
    data: RankProgressData;
}

export const rankApi = {
    getRankProgress: () => api.get<RankProgressResponse>('/ranks/progress'),
};
