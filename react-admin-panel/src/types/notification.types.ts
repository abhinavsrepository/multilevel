export interface Notification {
  id: number;
  notificationId: string;
  title: string;
  message: string;
  imageUrl?: string;
  actionButtonText?: string;
  actionLink?: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';

  // Target
  targetAudience: 'ALL' | 'RANK' | 'SPECIFIC' | 'CUSTOM';
  userIds?: string[];
  rank?: string;
  filters?: Record<string, any>;
  targetCount: number;

  // Channels
  channels: ('PUSH' | 'EMAIL' | 'SMS' | 'IN_APP')[];

  // Stats
  deliveredCount: number;
  readCount: number;
  clickCount: number;
  failedCount: number;

  // Status
  status: 'SENT' | 'SCHEDULED' | 'FAILED' | 'CANCELLED';

  // Schedule
  scheduleTime?: string;
  sentDate?: string;
  sentBy: string;

  createdAt: string;
}

export interface BroadcastRequest {
  title: string;
  message: string;
  imageUrl?: string;
  actionButtonText?: string;
  actionLink?: string;
  priority: string;
  targetAudience: string;
  userIds?: string[];
  rank?: string;
  filters?: Record<string, any>;
  channels: string[];
  scheduleTime?: string;
}

export interface NotificationFilters {
  search?: string;
  status?: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
}
