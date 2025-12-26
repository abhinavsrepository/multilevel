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
