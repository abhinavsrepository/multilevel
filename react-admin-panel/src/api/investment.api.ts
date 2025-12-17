import { api } from './axiosConfig';

export interface Investment {
    id: number;
    investmentId: string;
    propertyId: number;
    userId: number;
    investmentAmount: number;
    bvAllocated?: number;
    investmentType: string;
    installmentPlan?: string;
    totalInstallments?: number;
    installmentsPaid?: number;
    installmentAmount?: number;
    totalPaid?: number;
    pendingAmount?: number;
    nextInstallmentDate?: string;
    paymentMethod?: string;
    paymentGatewayRef?: string;
    commissionEligible?: boolean;
    commissionsPaid?: number;
    commissionStatus?: string;
    nomineeName?: string;
    nomineeRelation?: string;
    nomineeContact?: string;
    nomineeDob?: string;
    agreementNumber?: string;
    agreementDate?: string;
    documentUrls?: any;
    investmentStatus: 'ACTIVE' | 'COMPLETED' | 'MATURED' | 'EXITED' | 'CANCELLED';
    bookingStatus: 'PROVISIONAL' | 'CONFIRMED' | 'CANCELLED';
    expectedMaturityDate?: string;
    currentValue?: number;
    roiEarned?: number;
    rentalIncomeEarned?: number;
    exitRequested?: boolean;
    exitDate?: string;
    exitAmount?: number;
    capitalGains?: number;
    lockInPeriodMonths?: number;
    lockInEndDate?: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    User?: {
        firstName: string;
        lastName: string;
        email: string;
        username: string;
    };
    Property?: {
        title: string;
        propertyId: string;
    };
}

export const investmentApi = {
    getAll: (params?: any) => api.get<Investment[]>('/investments', { params }),

    getById: (id: string | number) => api.get<Investment>(`/investments/${id}`),

    updateStatus: (id: string | number, status: string) =>
        api.put<Investment>(`/investments/${id}/status`, { status }),

    approve: (id: string | number) => api.post(`/investments/${id}/approve`),

    reject: (id: string | number, reason: string) => api.post(`/investments/${id}/reject`, { reason }),

    getStats: () => api.get('/investments/stats'),
};
