export interface Notification {
  id: number;
  userId: number;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'REMINDER' | 'NEW_LEAD';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}
