import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Button,
  Input,
  Select
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { api } from '../../api/axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;

interface KycDocument {
  id: number;
  userId: number;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  documentType: string;
  documentNumber: string;
  status: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

const AllKYC: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KycDocument[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchRequests = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await api.get(`/kyc/admin/requests`, {
        params: {
          page,
          limit: pageSize,
          status: statusFilter
        }
      });

      if (response.data.success) {
        // Ensure data is always an array
        const kycData = Array.isArray(response.data.data) ? response.data.data : [];
        setData(kycData);
        setPagination({
          current: response.data.pagination?.page || 1,
          pageSize: pageSize,
          total: response.data.pagination?.total || 0
        });
      } else {
        setData([]); // Set empty array if no data
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch KYC history');
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleTableChange = (pagination: any) => {
    fetchRequests(pagination.current, pagination.pageSize);
  };

  const getDocumentName = (type: string) => {
    return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: KycDocument) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user?.firstName} {record.user?.lastName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.username}</Text>
        </Space>
      ),
    },
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (text: string) => <Tag>{getDocumentName(text)}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'APPROVED') color = 'success';
        if (status === 'REJECTED') color = 'error';
        if (status === 'PENDING') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Verified Date',
      dataIndex: 'verifiedAt',
      key: 'verifiedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Verified By',
      dataIndex: 'verifiedBy',
      key: 'verifiedBy',
      render: (text: string) => text || '-',
    },
    {
      title: 'Remarks',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      render: (text: string) => text ? <Text type="danger">{text}</Text> : '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>KYC History</Title>
            <Text type="secondary">Audit trail of all KYC verifications</Text>
          </div>
          <Space>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchRequests()}>Refresh</Button>
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

export default AllKYC;
