import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const directBonusApi = {
    getStats: () =>
        api.get('/direct-bonus/stats'),

    getLog: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; status?: string }) =>
        api.get('/direct-bonus/log', { params }),

    getFastStartBonus: () =>
        api.get('/direct-bonus/fast-start'),

    updateFastStartProgress: () =>
        api.post('/direct-bonus/fast-start/update'),

    getReferrals: (params?: { page?: number; limit?: number }) =>
        api.get('/direct-bonus/referrals', { params }),
};
