import axios from 'axios';

// Determine base URL - same logic as axiosConfig
const getBaseUrl = () => {
    // For local development, use proxy
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return '/api/v1';
    }
    // For production, always use the backend URL
    return 'https://mlm-backend-ljan.onrender.com/api/v1';
};

const api = axios.create({
    baseURL: getBaseUrl(),
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
