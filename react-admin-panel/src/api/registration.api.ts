import { api } from './axiosConfig';

export interface Registration {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    sponsor?: {
        id: number;
        username: string;
        name: string;
    };
    placementUser?: {
        id: number;
        username: string;
        name: string;
    };
    position?: 'LEFT' | 'RIGHT';
    rank: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    emailVerified: boolean;
    phoneVerified: boolean;
    registrationDate: string;
    profilePicture?: string;
}

export interface RegistrationStats {
    total: number;
    active: number;
    inactive: number;
    suspended?: number;
    verifiedEmail: number;
    verifiedPhone?: number;
    pendingKYC: number;
    approvedKYC?: number;
    monthlyTrend?: Array<{
        month: string;
        count: number;
    }>;
}

export interface RegistrationFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    kycStatus?: string;
    startDate?: string;
    endDate?: string;
    sponsorId?: number;
}

export interface CreateRegistrationData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    sponsorId?: number;
    placementUserId?: number;
    position?: 'LEFT' | 'RIGHT';
    dateOfBirth?: string;
    fatherHusbandName?: string;
    panNumber?: string;
    cityState?: string;
    address?: string;
    addressProof?: string;
    addressProofNo?: string;
    pinCode?: string;
}

export const registrationApi = {
    // Get all registrations with filters
    getAll: (params?: RegistrationFilters) =>
        api.get('/registrations/admin', { params }),

    // Get registration by ID
    getById: (id: number) =>
        api.get(`/registrations/admin/${id}`),

    // Create new registration
    create: (data: CreateRegistrationData) =>
        api.post('/registrations/admin', data),

    // Update registration
    update: (id: number, data: Partial<CreateRegistrationData>) =>
        api.put(`/registrations/admin/${id}`, data),

    // Delete registration
    delete: (id: number) =>
        api.delete(`/registrations/admin/${id}`),

    // Approve registration
    approve: (id: number) =>
        api.post(`/registrations/admin/${id}/approve`),

    // Reject registration
    reject: (id: number, reason?: string) =>
        api.post(`/registrations/admin/${id}/reject`, { reason }),

    // Get statistics
    getStats: () =>
        api.get('/registrations/admin/stats'),

    // Export registrations
    export: (params?: RegistrationFilters) =>
        api.get('/registrations/admin/export', {
            params,
            responseType: 'blob'
        }),
};
