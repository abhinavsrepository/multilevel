import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  DatePicker,
  Button
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { api } from '../../api/axiosConfig';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Payout {
  payoutId: string;
  userId: number;
  user: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  requestedAmount: string;
  netAmount: string;
  paymentMethod: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
}

const AllPayouts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchPayouts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      // Fetch all processed payouts (PAID, REJECTED)
      // Or just fetch everything and let user filter? 
      // User request said "Paid Payouts (The History Ledger)" so let's filter for PAID/APPROVED/REJECTED
      // But the backend `getAllPayouts` supports status filter.
      // Let's fetch everything that is NOT 'REQUESTED' (or maybe everything for audit trail)
      // For now, let's fetch everything to be safe, or just PAID.
      // The requirement says "Paid Payouts... history of all commissions that have been successfully processed".
      // So status = PAID.

      const response = await api.get(`/payouts/admin/all`, {
        params: {
          page,
          limit: pageSize,
          status: 'PAID'
        }
      });

      if (response.data.success) {
        // Ensure data is always an array
        const payoutsData = Array.isArray(response.data.data) ? response.data.data : [];
        setData(payoutsData);
        setPagination({
          current: response.data.pagination.page,
          pageSize: pageSize,
          total: response.data.pagination.total
        });
      } else {
        setData([]); // Set empty array if no data
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payout history');
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchPayouts(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Payout ID',
      dataIndex: 'payoutId',
      key: 'payoutId',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: Payout) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user?.firstName} {record.user?.lastName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.username}</Text>
        </Space>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_: any, record: Payout) => (
        <Space direction="vertical" size={0}>
          <Text>Paid: ₹{parseFloat(record.netAmount).toFixed(2)}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Gross: ₹{parseFloat(record.requestedAmount).toFixed(2)}</Text>
        </Space>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Processed Date',
      dataIndex: 'processedAt',
      key: 'processedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="green">{status}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Paid Payouts</Title>
            <Text type="secondary">History of processed payments</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchPayouts()}>Refresh</Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="payoutId"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>
      </Space>
    </div>
  );
};

export default AllPayouts;
