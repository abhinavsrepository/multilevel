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
      setNotificationsLocal(response.data || []);
      dispatch(setNotifications(response.data || []));
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
        <List
          loading={loading}
          dataSource={notifications}
          locale={{ emptyText: <Empty description="No notifications" /> }}
          renderItem={(item) => (
            <List.Item
              style={{ background: item.read ? 'transparent' : '#f0f5ff', padding: 16, borderRadius: 4, marginBottom: 8 }}
              actions={[
                !item.read && (
                  <Button size="small" onClick={() => handleMarkAsRead(item.id)}>
                    Mark as Read
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={<BellOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={
                  <div>
                    {item.title}
                    {!item.read && <Tag color="blue" style={{ marginLeft: 8 }}>NEW</Tag>}
                  </div>
                }
                description={
                  <>
                    <p>{item.message}</p>
                    <small style={{ color: '#8c8c8c' }}>{dayjs(item.createdAt).fromNow()}</small>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
