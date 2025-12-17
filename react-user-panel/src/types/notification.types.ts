// Notification Types
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | 'INVESTMENT_CONFIRMED'
  | 'COMMISSION_CREDITED'
  | 'PAYOUT_APPROVED'
  | 'PAYOUT_REJECTED'
  | 'NEW_TEAM_MEMBER'
  | 'RANK_UPGRADED'
  | 'PROPERTY_LAUNCH'
  | 'INSTALLMENT_REMINDER'
  | 'INSTALLMENT_OVERDUE'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'TICKET_REPLY'
  | 'GENERAL';

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  preferences: {
    investmentUpdates: boolean;
    commissionAlerts: boolean;
    payoutUpdates: boolean;
    teamUpdates: boolean;
    rankAchievements: boolean;
    systemAnnouncements: boolean;
    marketingMessages: boolean;
  };
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  content?: string;
  image?: string;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  category: 'GENERAL' | 'INVESTMENT' | 'PROMOTION' | 'MAINTENANCE' | 'UPDATE';
}
