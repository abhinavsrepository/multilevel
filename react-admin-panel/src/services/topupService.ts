import { api } from '@/api/axiosConfig';

export interface Package {
    id: number;
    name: string;
    amount: string;
    bv: string;
    isActive: boolean;
}

export interface Topup {
    id: number;
    userId: number;
    user: {
        username: string;
        fullName: string;
    };
    package: {
        name: string;
    };
    amount: string;
    status: string;
    createdAt: string;
}

export const topupService = {
    getPackages: () => {
        return api.get<Package[]>('/topup/packages');
    },

    createTopup: (data: { userId: number; packageId: number }) => {
        return api.post('/topup', data);
    },

    getHistory: (params: { page?: number; limit?: number; userId?: string; startDate?: string; endDate?: string }) => {
        return api.get<{ data: Topup[]; total: number; pages: number }>('/topup/history', { params });
    }
};
