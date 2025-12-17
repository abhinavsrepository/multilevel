import { api } from './axiosConfig';

export interface SystemSetting {
    id: number;
    settingKey: string;
    settingValue: string | null;
    settingType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY';
    category: 'GENERAL' | 'PAYMENT' | 'PLAN_CONFIG' | 'WITHDRAWAL' | 'EPIN' | 'LEVEL_PLAN' | 'COMMISSION' | 'EMAIL' | 'SMS' | 'SECURITY';
    description: string | null;
    isActive: boolean;
    updatedBy: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface LevelCommissionRule {
    id: number;
    level: number;
    commissionType: 'PERCENTAGE' | 'FIXED';
    commissionValue: number;
    minTeamMembers: number;
    minActiveMembers: number;
    isActive: boolean;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isActive: boolean;
    displayFrom: string | null;
    displayUntil: string | null;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSettingRequest {
    settingKey: string;
    settingValue: any;
    settingType?: string;
    category?: string;
    description?: string;
}

export interface UpdateLevelRuleRequest {
    level: number;
    commissionType?: string;
    commissionValue?: number;
    minTeamMembers?: number;
    minActiveMembers?: number;
    isActive?: boolean;
    description?: string;
}

export const settingsApi = {
    // System settings
    getSystemSettings: (category?: string) =>
        api.get<{ [category: string]: SystemSetting[] }>('/settings', { params: { category } }),

    updateSystemSetting: (data: UpdateSettingRequest) => api.put('/settings/update', data),

    bulkUpdateSettings: (settings: UpdateSettingRequest[]) =>
        api.put('/settings/bulk-update', { settings }),

    // Level commission rules
    getLevelRules: () => api.get<LevelCommissionRule[]>('/settings/level-rules'),

    updateLevelRule: (data: UpdateLevelRuleRequest) =>
        api.put('/settings/level-rules/update', data),

    bulkUpdateLevelRules: (rules: UpdateLevelRuleRequest[]) =>
        api.put('/settings/level-rules/bulk-update', { rules }),

    // Announcements
    getAllAnnouncements: (params?: any) => api.get<Announcement[]>('/settings/announcements', { params }),

    createAnnouncement: (data: Partial<Announcement>) =>
        api.post<Announcement>('/settings/announcements', data),

    updateAnnouncement: (id: number, data: Partial<Announcement>) =>
        api.put<Announcement>(`/settings/announcements/${id}`, data),

    deleteAnnouncement: (id: number) => api.delete(`/settings/announcements/${id}`),
};
