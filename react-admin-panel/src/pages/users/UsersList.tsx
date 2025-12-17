import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, message, Avatar } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/api/userApi';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { usePagination, useFilters } from '@/hooks';
import type { User } from '@/types/user.types';
import type { ColumnsType } from 'antd/es/table';

const UsersList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { page, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    status: '',
    kycStatus: '',
  });

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({ page, size: pageSize, ...filters });
      // Backend returns { success, data: User[], pagination: { total, ... } }
      // Casting to any to handle type mismatch with frontend interface definition
      const resData = response.data as any;
      if (resData.success) {
        // Handle array response (Backend style)
        if (Array.isArray(resData.data)) {
          setData(resData.data);
          setTotal(resData.pagination?.total || 0);
        }
        // Handle PaginatedResponse object (Frontend type definition style)
        else if (resData.data?.content) {
          setData(resData.data.content);
          setTotal(resData.data.totalElements);
        }
      }
    } catch (error: any) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar src={record.profilePicture} icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.userId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Rank',
      dataIndex: 'rankName',
      key: 'rankName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'success' : status === 'PENDING' ? 'warning' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'KYC',
      dataIndex: 'kycStatus',
      key: 'kycStatus',
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: 'Total Investment',
      dataIndex: 'totalInvestment',
      key: 'totalInvestment',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/users/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/users/add')}>
            Add User
          </Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search by name, email, ID..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="BLOCKED">Blocked</Select.Option>
          </Select>
          <Select
            placeholder="KYC Status"
            value={filters.kycStatus}
            onChange={(value) => updateFilter('kycStatus', value)}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="BASIC">Basic</Select.Option>
            <Select.Option value="FULL">Full</Select.Option>
            <Select.Option value="PREMIUM">Premium</Select.Option>
          </Select>
          <Button onClick={resetFilters}>Reset</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
            onChange: (p, ps) => {
              handlePageChange(p - 1);
              if (ps) handlePageSizeChange(ps);
            },
          }}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default UsersList;
