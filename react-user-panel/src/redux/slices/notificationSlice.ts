import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationSettings, Announcement } from '../../types/notification.types';
import { apiGet, apiPost, apiPut } from '../../api/config/axiosConfig';

// State interface
interface NotificationState {
  notifications: Notification[];
  announcements: Announcement[];
  settings: NotificationSettings | null;
  unreadCount: number;
  totalNotifications: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  settingsLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  announcements: [],
  settings: null,
  unreadCount: 0,
  totalNotifications: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,
  settingsLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (
    {
      page = 1,
      pageSize = 20,
      unreadOnly = false,
    }: {
      page?: number;
      pageSize?: number;
      unreadOnly?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiGet<{
        data: Notification[];
        total: number;
        unreadCount: number;
        page: number;
        pageSize: number;
      }>(`/notifications?page=${page}&pageSize=${pageSize}&unreadOnly=${unreadOnly}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: { count: number } }>('/notifications/unread-count');
      return response.data.count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ data: Notification }>(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiPost('/notifications/mark-all-read');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await apiPost(`/notifications/${notificationId}/delete`);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await apiPost('/notifications/delete-all');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete all notifications');
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk(
  'notification/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: NotificationSettings }>('/notifications/settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notification/updateSettings',
  async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      const response = await apiPut<{ data: NotificationSettings }>(
        '/notifications/settings',
        settings
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const fetchAnnouncements = createAsyncThunk(
  'notification/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Announcement[] }>('/announcements');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcements');
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.totalNotifications += 1;
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.totalNotifications -= 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.announcements = [];
      state.unreadCount = 0;
      state.totalNotifications = 0;
      state.currentPage = 1;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.totalNotifications = action.payload.total;
        state.unreadCount = action.payload.unreadCount;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications[index] = action.payload;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });

    // Mark all as read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        state.totalNotifications = Math.max(0, state.totalNotifications - 1);
      });

    // Delete all notifications
    builder
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.totalNotifications = 0;
      });

    // Fetch notification settings
    builder
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.settingsLoading = true;
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.error = action.payload as string;
      });

    // Update notification settings
    builder
      .addCase(updateNotificationSettings.pending, (state) => {
        state.settingsLoading = true;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settings = action.payload;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch announcements
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  addNotification,
  removeNotification,
  markNotificationAsRead,
  setCurrentPage,
  setPageSize,
  clearNotificationError,
  resetNotifications,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: { notification: NotificationState }) =>
  state.notification.notifications;
export const selectUnreadNotifications = (state: { notification: NotificationState }) =>
  state.notification.notifications.filter((n) => !n.isRead);
export const selectUnreadCount = (state: { notification: NotificationState }) =>
  state.notification.unreadCount;
export const selectAnnouncements = (state: { notification: NotificationState }) =>
  state.notification.announcements;
export const selectPinnedAnnouncements = (state: { notification: NotificationState }) =>
  state.notification.announcements.filter((a) => a.isPinned);
export const selectNotificationSettings = (state: { notification: NotificationState }) =>
  state.notification.settings;
export const selectTotalNotifications = (state: { notification: NotificationState }) =>
  state.notification.totalNotifications;
export const selectCurrentPage = (state: { notification: NotificationState }) =>
  state.notification.currentPage;
export const selectPageSize = (state: { notification: NotificationState }) =>
  state.notification.pageSize;
export const selectTotalPages = (state: { notification: NotificationState }) =>
  Math.ceil(state.notification.totalNotifications / state.notification.pageSize);
export const selectNotificationLoading = (state: { notification: NotificationState }) =>
  state.notification.loading;
export const selectSettingsLoading = (state: { notification: NotificationState }) =>
  state.notification.settingsLoading;
export const selectNotificationError = (state: { notification: NotificationState }) =>
  state.notification.error;

// Reducer
export default notificationSlice.reducer;
