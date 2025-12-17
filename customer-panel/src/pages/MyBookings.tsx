import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { bookingApi } from '@/api';
import { Booking } from '@/types/booking.types';

const { Title } = Typography;

export const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Booking #', dataIndex: 'bookingNumber', key: 'bookingNumber' },
    { title: 'Property', dataIndex: 'propertyTitle', key: 'propertyTitle' },
    { title: 'Booking Date', dataIndex: 'bookingDate', key: 'bookingDate', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (val: number) => `$${val.toLocaleString()}` },
    { title: 'Paid', dataIndex: 'paidAmount', key: 'paidAmount', render: (val: number) => `$${val.toLocaleString()}` },
    { title: 'Balance', dataIndex: 'balanceAmount', key: 'balanceAmount', render: (val: number) => `$${val.toLocaleString()}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = { PENDING: 'orange', CONFIRMED: 'blue', COMPLETED: 'green', CANCELLED: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Booking) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/bookings/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>My Bookings</Title>

      <Card>
        <Table columns={columns} dataSource={bookings} loading={loading} rowKey="id" />
      </Card>
    </div>
  );
};
