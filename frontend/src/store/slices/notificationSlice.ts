import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

// Helper function to generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: generateId(),
        read: false,
        createdAt: new Date().toISOString(),
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        const removed = state.notifications.pop();
        if (removed && !removed.read) {
          state.unreadCount -= 1;
        }
      }
    },

    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload.map((notif) => ({
        ...notif,
        id: notif.id || generateId(),
        read: notif.read || false,
        createdAt: notif.createdAt || new Date().toISOString(),
      }));

      state.notifications = [...newNotifications, ...state.notifications];
      state.unreadCount = state.notifications.filter((n) => !n.read).length;

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter((n) => !n.read);
    },

    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const {
  addNotification,
  addNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  clearReadNotifications,
  setNotifications,
  setUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
