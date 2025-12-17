import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const levelBonusApi = {
    getEligibility: () =>
        api.get('/level-bonus/eligibility'),

    getHistory: (params?: { page?: number; limit?: number; status?: string }) =>
        api.get('/level-bonus/history', { params }),

    getDirectSales: (params?: { page?: number; limit?: number }) =>
        api.get('/level-bonus/direct-sales', { params }),
};
