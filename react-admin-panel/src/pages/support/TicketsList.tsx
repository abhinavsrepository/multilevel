import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  message,
  Input
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supportService } from '../../services/supportService';
import { Ticket } from '../../types/ticket.types';

const { Title, Text } = Typography;
const { Option } = Select;

const TicketsList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchTickets = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await supportService.getTickets(page, pageSize, { status: statusFilter });
      if (response.success) {
        setData(response.data);
        setPagination({
          current: response.pagination.page,
          pageSize: pageSize,
          total: response.pagination.total
        });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleTableChange = (pagination: any) => {
    fetchTickets(pagination.current, pagination.pageSize);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'blue';
      case 'IN_PROGRESS': return 'orange';
      case 'RESOLVED': return 'green';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'volcano';
      case 'MEDIUM': return 'gold';
      case 'LOW': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text copyable>{text.substring(0, 8)}...</Text>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: any) => ( // Using any for record temporarily as backend response might differ slightly
        <Space direction="vertical" size={0}>
          <Text>{record.user?.firstName} {record.user?.lastName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (text: string) => <Tag color={getPriorityColor(text)}>{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => <Tag color={getStatusColor(text)}>{text}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/support/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Support Tickets</Title>
            <Text type="secondary">Manage user support requests</Text>
          </div>
          <Space>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="OPEN">Open</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchTickets()}>Refresh</Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>
      </Space>
    </div>
  );
};

export default TicketsList;
