import api from './axiosConfig';
import { ApiResponse } from '../types/common.types';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendNotificationParams {
  userId: number | 'ALL';
  title: string;
  message: string;
  type?: string;
}

export const notificationApi = {
  sendNotification: (data: SendNotificationParams) =>
    api.post<ApiResponse<any>>('/notifications/send', data),
};
