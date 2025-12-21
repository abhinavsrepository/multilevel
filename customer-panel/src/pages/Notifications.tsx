import { useEffect, useState } from 'react';
import { List, Card, Button, Typography, Tag, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notificationApi } from '@/api';
import { useAppDispatch } from '@/redux/hooks';
import { setNotifications, markAsRead, markAllAsRead } from '@/redux/slices/notificationSlice';
import { Notification } from '@/types/notification.types';

dayjs.extend(relativeTime);

const { Title } = Typography;

export const Notifications = () => {
  const [notifications, setNotificationsLocal] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getAll();
      setNotificationsLocal(response.data.data || []);
      dispatch(setNotifications(response.data.data || []));
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      dispatch(markAsRead(id));
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      dispatch(markAllAsRead());
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Notifications</Title>
        <Button icon={<CheckOutlined />} onClick={handleMarkAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <Empty description="No notifications" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.read ? 'transparent' : '#f0f5ff',
                  padding: 16,
                  borderRadius: 4,
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <BellOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: '4px' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, fontSize: '16px' }}>{item.title}</span>
                      {!item.read && <Tag color="blue">NEW</Tag>}
                    </div>
                    <p style={{ margin: 0, color: '#595959' }}>{item.message}</p>
                    <small style={{ color: '#8c8c8c' }}>{dayjs(item.createdAt).fromNow()}</small>
                  </div>
                </div>
                {!item.read && (
                  <Button size="small" onClick={() => handleMarkAsRead(item.id)}>
                    Mark as Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
