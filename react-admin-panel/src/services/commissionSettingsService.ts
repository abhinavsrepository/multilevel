import { api } from '../api/axiosConfig';

const API_URL = '/commissions/settings';

export interface LevelCommissionRule {
    id?: number;
    level: number;
    commissionType: 'PERCENTAGE' | 'FIXED';
    value: number;
    requiredRank?: string;
    isActive: boolean;
}

export const getCommissionRules = async (): Promise<LevelCommissionRule[]> => {
    const response = await api.get(API_URL);
    return response.data.data;
};

export const updateCommissionRules = async (rules: LevelCommissionRule[]): Promise<LevelCommissionRule[]> => {
    const response = await api.post(API_URL, { rules });
    return response.data.data;
};
