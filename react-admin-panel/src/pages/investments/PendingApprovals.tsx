import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Modal, Input, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { investmentApi } from '@/api/investmentApi';
import { Investment } from '@/types/investment.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Investment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingInvestments();
  }, [page, pageSize]);

  const fetchPendingInvestments = async () => {
    try {
      setLoading(true);
      // Use 'PENDING' status for approvals
      const response = await investmentApi.getInvestments({
        status: 'PENDING',
        page,
        size: pageSize
      });

      if (response.data.success && response.data.data) {
        // Handle paginated response correctly
        // The API returns PaginatedResponse inside data
        const paginatedData = response.data.data;
        // Check if paginatedData has content property (is indeed PaginatedResponse)
        if ('content' in paginatedData) {
          setData(paginatedData.content as Investment[]);
          setTotal(paginatedData.totalElements);
        } else {
          // Fallback if data is directly an array
          setData(Array.isArray(paginatedData) ? paginatedData : []);
          setTotal(0);
        }
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch pending investments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true);
      await investmentApi.approveInvestment(id);
      message.success('Investment approved successfully');
      fetchPendingInvestments();
    } catch (error) {
      message.error('Failed to approve investment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedInvestmentId(id);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedInvestmentId) return;
    if (!rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await investmentApi.rejectInvestment(selectedInvestmentId, rejectionReason);
      message.success('Investment rejected successfully');
      setRejectModalVisible(false);
      setRejectionReason('');
      fetchPendingInvestments();
    } catch (error) {
      message.error('Failed to reject investment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: 'Investment ID',
      dataIndex: 'investmentId',
      key: 'investmentId',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
      render: (_: any, record: Investment) => (
        <div>
          <div>{record.user?.fullName} </div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.user?.email || record.user?.userId}</div>
        </div>
      ),
    },
    {
      title: 'Property',
      dataIndex: ['property', 'title'],
      key: 'property',
      render: (text: string) => <div style={{ maxWidth: 200 }} className="text-truncate">{text}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'investmentAmount',
      key: 'amount',
      render: (amount: number) => `$${amount?.toLocaleString()}`,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Investment) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/investments/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="small"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => handleApprove(record.id)}
              loading={actionLoading}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              type="primary"
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              onClick={() => handleRejectClick(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pending-approvals">
      <Card title="Pending Investment Approvals">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Reject Investment"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
        }}
        confirmLoading={actionLoading}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to reject this investment? Please provide a reason.</p>
        <TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>
    </div>
  );
};

export default PendingApprovals;
