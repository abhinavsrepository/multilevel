import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, DatePicker, Select, message } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';

const { RangePicker } = DatePicker;
const { Option } = Select;



interface Commission {
  id: number;
  commissionId: string;
  userId: number;
  fromUser?: {
    username: string;
    firstName: string;
    lastName: string;
  };
  commissionType: string;
  level: number;
  amount: string;
  status: string;
  createdAt: string;
}

const CommissionsList: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await api.get('/commissions/history', {
        params: { page, limit: pageSize }
      });
      setCommissions(response.data.data);
      setPagination({
        current: response.data.pagination?.page || 1,
        pageSize: pageSize,
        total: response.data.pagination?.total || 0
      });
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
      message.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchCommissions(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'commissionId',
      key: 'commissionId',
    },
    {
      title: 'Type',
      dataIndex: 'commissionType',
      key: 'commissionType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => level > 0 ? `Level ${level}` : '-',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => `$${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'From User',
      dataIndex: 'fromUser',
      key: 'fromUser',
      render: (user: any) => user ? `${user.firstName} ${user.lastName} (${user.username})` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'CREDITED' || status === 'PAID' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Commissions"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchCommissions(pagination.current, pagination.pageSize)}>
              Refresh
            </Button>
            <Button type="primary" icon={<SettingOutlined />} onClick={() => navigate('/commissions/settings')}>
              Settings
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={commissions}
          columns={columns}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default CommissionsList;
