import { apiGet, apiPost, apiPut, apiDelete } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Notification,
  NotificationType,
  NotificationSettings,
  Announcement,
} from '@/types';

// ==================== Notification List APIs ====================

/**
 * Get all notifications with pagination
 */
export const getNotifications = async (params?: {
  page?: number;
  size?: number;
  type?: NotificationType;
  isRead?: boolean;
}): Promise<PaginatedResponse<Notification>> => {
  return apiGet<PaginatedResponse<Notification>>('/notifications', params);
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
  return apiGet<PaginatedResponse<Notification>>('/notifications/unread', params);
};

/**
 * Get read notifications
 */
export const getReadNotifications = async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
  return apiGet<PaginatedResponse<Notification>>('/notifications/read', params);
};

/**
 * Get notifications by type
 */
export const getNotificationsByType = async (
  type: NotificationType,
  params?: PaginationParams
): Promise<PaginatedResponse<Notification>> => {
  return apiGet<PaginatedResponse<Notification>>(`/notifications/type/${type}`, params);
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (notificationId: number): Promise<ApiResponse<Notification>> => {
  return apiGet<ApiResponse<Notification>>(`/notifications/${notificationId}`);
};

// ==================== Notification Count APIs ====================

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  return apiGet<ApiResponse<{ count: number }>>('/notifications/unread/count');
};

/**
 * Get unread count by type
 */
export const getUnreadCountByType = async (): Promise<ApiResponse<{
  total: number;
  byType: {
    type: NotificationType;
    count: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    byType: {
      type: NotificationType;
      count: number;
    }[];
  }>>('/notifications/unread/count-by-type');
};

// ==================== Mark as Read APIs ====================

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: number): Promise<ApiResponse<Notification>> => {
  return apiPost<ApiResponse<Notification>>(`/notifications/${notificationId}/mark-read`);
};

/**
 * Mark multiple notifications as read
 */
export const markMultipleAsRead = async (notificationIds: number[]): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/notifications/mark-read/multiple', { notificationIds });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/notifications/mark-read/all');
};

/**
 * Mark notifications by type as read
 */
export const markTypeAsRead = async (type: NotificationType): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/notifications/mark-read/type/${type}`);
};

// ==================== Mark as Unread APIs ====================

/**
 * Mark notification as unread
 */
export const markAsUnread = async (notificationId: number): Promise<ApiResponse<Notification>> => {
  return apiPost<ApiResponse<Notification>>(`/notifications/${notificationId}/mark-unread`);
};

// ==================== Delete Notification APIs ====================

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: number): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>(`/notifications/${notificationId}`);
};

/**
 * Delete multiple notifications
 */
export const deleteMultipleNotifications = async (notificationIds: number[]): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/notifications/delete/multiple', { notificationIds });
};

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = async (): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>('/notifications/delete/all-read');
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>('/notifications/clear-all');
};

// ==================== Notification Settings APIs ====================

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettings>> => {
  return apiGet<ApiResponse<NotificationSettings>>('/notifications/settings');
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> => {
  return apiPut<ApiResponse<NotificationSettings>>('/notifications/settings', settings);
};

/**
 * Toggle email notifications
 */
export const toggleEmailNotifications = async (enabled: boolean): Promise<ApiResponse<NotificationSettings>> => {
  return apiPut<ApiResponse<NotificationSettings>>('/notifications/settings/email', { enabled });
};

/**
 * Toggle SMS notifications
 */
export const toggleSMSNotifications = async (enabled: boolean): Promise<ApiResponse<NotificationSettings>> => {
  return apiPut<ApiResponse<NotificationSettings>>('/notifications/settings/sms', { enabled });
};

/**
 * Toggle push notifications
 */
export const togglePushNotifications = async (enabled: boolean): Promise<ApiResponse<NotificationSettings>> => {
  return apiPut<ApiResponse<NotificationSettings>>('/notifications/settings/push', { enabled });
};

/**
 * Update notification preference
 */
export const updateNotificationPreference = async (
  preference: keyof NotificationSettings['preferences'],
  enabled: boolean
): Promise<ApiResponse<NotificationSettings>> => {
  return apiPut<ApiResponse<NotificationSettings>>(`/notifications/settings/preferences/${preference}`, { enabled });
};

// ==================== Announcement APIs ====================

/**
 * Get all announcements
 */
export const getAnnouncements = async (params?: {
  page?: number;
  size?: number;
  category?: 'GENERAL' | 'INVESTMENT' | 'PROMOTION' | 'MAINTENANCE' | 'UPDATE';
}): Promise<PaginatedResponse<Announcement>> => {
  return apiGet<PaginatedResponse<Announcement>>('/notifications/announcements', params);
};

/**
 * Get active announcements
 */
export const getActiveAnnouncements = async (params?: PaginationParams): Promise<PaginatedResponse<Announcement>> => {
  return apiGet<PaginatedResponse<Announcement>>('/notifications/announcements/active', params);
};

/**
 * Get pinned announcements
 */
export const getPinnedAnnouncements = async (): Promise<ApiResponse<Announcement[]>> => {
  return apiGet<ApiResponse<Announcement[]>>('/notifications/announcements/pinned');
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = async (announcementId: number): Promise<ApiResponse<Announcement>> => {
  return apiGet<ApiResponse<Announcement>>(`/notifications/announcements/${announcementId}`);
};

/**
 * Get announcements by category
 */
export const getAnnouncementsByCategory = async (
  category: 'GENERAL' | 'INVESTMENT' | 'PROMOTION' | 'MAINTENANCE' | 'UPDATE',
  params?: PaginationParams
): Promise<PaginatedResponse<Announcement>> => {
  return apiGet<PaginatedResponse<Announcement>>(`/notifications/announcements/category/${category}`, params);
};

// ==================== Real-time Notification APIs ====================

/**
 * Get latest notifications (for polling)
 */
export const getLatestNotifications = async (params?: {
  since?: string; // ISO timestamp
  limit?: number;
}): Promise<ApiResponse<Notification[]>> => {
  return apiGet<ApiResponse<Notification[]>>('/notifications/latest', params);
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (subscription: PushSubscription): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/notifications/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.toJSON().keys?.p256dh,
      auth: subscription.toJSON().keys?.auth,
    },
  });
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/notifications/push/unsubscribe');
};

// ==================== Notification Statistics APIs ====================

/**
 * Get notification statistics
 */
export const getNotificationStats = async (): Promise<ApiResponse<{
  total: number;
  unread: number;
  read: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: {
    type: NotificationType;
    count: number;
    unread: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    unread: number;
    read: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: {
      type: NotificationType;
      count: number;
      unread: number;
    }[];
  }>>('/notifications/stats');
};

// ==================== Notification Templates APIs ====================

/**
 * Test notification
 */
export const sendTestNotification = async (type: NotificationType): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/notifications/test', { type });
};

// ==================== Notification Preferences by Type APIs ====================

/**
 * Get notification type preferences
 */
export const getNotificationTypePreferences = async (): Promise<ApiResponse<{
  type: NotificationType;
  name: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}[]>> => {
  return apiGet<ApiResponse<{
    type: NotificationType;
    name: string;
    description: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  }[]>>('/notifications/preferences/types');
};

/**
 * Update notification type preference
 */
export const updateNotificationTypePreference = async (
  type: NotificationType,
  channels: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }
): Promise<ApiResponse> => {
  return apiPut<ApiResponse>(`/notifications/preferences/types/${type}`, channels);
};

// ==================== Notification History APIs ====================

/**
 * Get notification history
 */
export const getNotificationHistory = async (params?: {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  type?: NotificationType;
}): Promise<PaginatedResponse<Notification>> => {
  return apiGet<PaginatedResponse<Notification>>('/notifications/history', params);
};

/**
 * Archive notification
 */
export const archiveNotification = async (notificationId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/notifications/${notificationId}/archive`);
};

/**
 * Get archived notifications
 */
export const getArchivedNotifications = async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
  return apiGet<PaginatedResponse<Notification>>('/notifications/archived', params);
};

/**
 * Unarchive notification
 */
export const unarchiveNotification = async (notificationId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/notifications/${notificationId}/unarchive`);
};
