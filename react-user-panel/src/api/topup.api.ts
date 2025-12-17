import { apiGet, apiPost } from './config/axiosConfig';
import { ApiResponse } from '../types';

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
    package: {
        name: string;
    };
    amount: string;
    status: string;
    createdAt: string;
}


export const getPackages = async (): Promise<ApiResponse<Package[]>> => {
    return apiGet<ApiResponse<Package[]>>('/topup/packages');
};


export const createTopup = async (data: { userId: number; packageId: number }): Promise<ApiResponse> => {
    return apiPost<ApiResponse>('/topup', data);
};


export const getTopupHistory = async (params: any): Promise<ApiResponse<{ data: Topup[]; total: number; pages: number }>> => {
    return apiGet<ApiResponse<{ data: Topup[]; total: number; pages: number }>>('/topup/history', { params });
};
