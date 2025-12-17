import { api } from './axiosConfig';

export interface Property {
    id?: number;
    propertyId: string;
    title: string;
    description: string;
    propertyType: string;
    propertyCategory: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    googleMapsLink?: string;
    totalArea?: number;
    builtUpArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    facing?: string;
    furnishingStatus?: string;
    basePrice: number;
    investmentPrice?: number;
    minimumInvestment?: number;
    totalInvestmentSlots: number;
    slotsBooked?: number;
    directReferralCommissionPercent?: number;
    bvValue?: number;
    expectedRoiPercent?: number;
    roiTenureMonths?: number;
    appreciationRateAnnual?: number;
    developerName?: string;
    developerContact?: string;
    developerEmail?: string;
    reraNumber?: string;
    images?: string[];
    videos?: string[];
    virtualTourUrl?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'UNDER_MAINTENANCE';
    isFeatured: boolean;
    isNewLaunch: boolean;
    amenities?: string[];
    documents?: any[];
}

export const propertyApi = {
    getAll: (params?: any) => api.get<Property[]>('/properties', { params }),

    getById: (id: string | number) => api.get<Property>(`/properties/${id}`),

    create: (data: Partial<Property>) => api.post<Property>('/properties', data),

    update: (id: string | number, data: Partial<Property>) =>
        api.put<Property>(`/properties/${id}`, data),

    delete: (id: string | number) => api.delete(`/properties/${id}`),

    uploadImage: (file: File) => api.uploadFile<{ url: string }>('/properties/upload', file),

    uploadMultipleImages: (files: File[]) =>
        api.uploadMultipleFiles<{ urls: string[] }>('/properties/upload-multiple', files),
};
