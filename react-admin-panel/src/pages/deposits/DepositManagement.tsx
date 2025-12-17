import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Tooltip,
  Image,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { depositApi, Deposit, DepositStats } from '@/api/deposit.api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DepositManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Deposit[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [generateEPin, setGenerateEPin] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    search: '',
    page: 1,
    limit: 10,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  useEffect(() => {
    fetchDeposits();
    fetchStats();
  }, [filters]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await depositApi.getAll(filters);
      setData(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      message.error('Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await depositApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApproveClick = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setApproveModalVisible(true);
    setGenerateEPin(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedDeposit) return;

    try {
      setActionLoading(true);
      await depositApi.approve(selectedDeposit.id, generateEPin);
      message.success(
        generateEPin
          ? 'Deposit approved and E-Pin generated successfully'
          : 'Deposit approved successfully'
      );
      setApproveModalVisible(false);
      fetchDeposits();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to approve deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedDeposit) return;
    if (!rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await depositApi.reject(selectedDeposit.id, rejectionReason);
      message.success('Deposit rejected successfully');
      setRejectModalVisible(false);
      setRejectionReason('');
      fetchDeposits();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reject deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProof = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setProofModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'UPI':
        return 'UPI';
      case 'CARD':
        return 'Card';
      case 'CRYPTO':
        return 'Crypto';
      default:
        return method;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: number) => <strong>#{text}</strong>,
    },
    {
      title: 'User',
      dataIndex: ['User'],
      key: 'user',
      render: (_: any, record: Deposit) => (
        <div>
          <div>
            {record.User?.firstName} {record.User?.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>@{record.User?.username}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <strong style={{ color: '#1890ff' }}>${amount?.toLocaleString()}</strong>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => <Tag>{getPaymentMethodLabel(method)}</Tag>,
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text: string) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'E-Pin Generated',
      dataIndex: 'epinGenerated',
      key: 'epinGenerated',
      render: (generated: boolean, record: Deposit) =>
        generated ? (
          <Tag color="green">Yes ({record.EPin?.pinCode})</Tag>
        ) : (
          <Tag color="default">No</Tag>
        ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: Deposit) => (
        <Space size="small">
          {record.paymentProof && (
            <Tooltip title="View Payment Proof">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewProof(record)}
              />
            </Tooltip>
          )}
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleApproveClick(record)}
                  loading={actionLoading}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  onClick={() => handleRejectClick(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="deposit-management">
      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Deposits"
                value={stats.totalDeposits}
                prefix={<DollarOutlined />}
                suffix={`/ $${stats.totalAmount?.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pendingDeposits}
                prefix={<ClockCircleOutlined />}
                suffix={`/ $${stats.pendingAmount?.toLocaleString()}`}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Approved"
                value={stats.approvedDeposits}
                prefix={<CheckCircleOutlined />}
                suffix={`/ $${stats.approvedAmount?.toLocaleString()}`}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Today's Deposits"
                value={stats.todayDeposits}
                prefix={<DollarOutlined />}
                suffix={`/ $${stats.todayAmount?.toLocaleString()}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Search by username, email..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
              allowClear
            >
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    startDate: dates[0]?.format('YYYY-MM-DD'),
                    endDate: dates[1]?.format('YYYY-MM-DD'),
                    page: 1,
                  });
                } else {
                  setFilters({
                    ...filters,
                    startDate: undefined,
                    endDate: undefined,
                    page: 1,
                  });
                }
              }}
            />
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchDeposits();
                fetchStats();
              }}
              style={{ width: '100%' }}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Deposits Table */}
      <Card title="Deposit Requests">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page, pageSize) => setFilters({ ...filters, page, limit: pageSize || 10 }),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} deposits`,
          }}
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Approve Deposit"
        open={approveModalVisible}
        onOk={handleApproveConfirm}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedDeposit(null);
        }}
        confirmLoading={actionLoading}
        okText="Approve"
        okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      >
        {selectedDeposit && (
          <div>
            <p>
              Are you sure you want to approve this deposit of{' '}
              <strong>${selectedDeposit.amount?.toLocaleString()}</strong> from{' '}
              <strong>
                {selectedDeposit.User?.firstName} {selectedDeposit.User?.lastName}
              </strong>
              ?
            </p>
            <div style={{ marginTop: 16 }}>
              <label>
                <input
                  type="checkbox"
                  checked={generateEPin}
                  onChange={(e) => setGenerateEPin(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Generate E-Pin automatically
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Deposit"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
          setSelectedDeposit(null);
        }}
        confirmLoading={actionLoading}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        {selectedDeposit && (
          <div>
            <p>
              Are you sure you want to reject this deposit of{' '}
              <strong>${selectedDeposit.amount?.toLocaleString()}</strong> from{' '}
              <strong>
                {selectedDeposit.User?.firstName} {selectedDeposit.User?.lastName}
              </strong>
              ?
            </p>
            <p style={{ marginTop: 16 }}>Please provide a reason for rejection:</p>
            <TextArea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
          </div>
        )}
      </Modal>

      {/* Payment Proof Modal */}
      <Modal
        title="Payment Proof"
        open={proofModalVisible}
        onCancel={() => {
          setProofModalVisible(false);
          setSelectedDeposit(null);
        }}
        footer={null}
        width={800}
      >
        {selectedDeposit && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p>
                <strong>User:</strong> {selectedDeposit.User?.firstName}{' '}
                {selectedDeposit.User?.lastName} (@{selectedDeposit.User?.username})
              </p>
              <p>
                <strong>Amount:</strong> ${selectedDeposit.amount?.toLocaleString()}
              </p>
              <p>
                <strong>Payment Method:</strong>{' '}
                {getPaymentMethodLabel(selectedDeposit.paymentMethod)}
              </p>
              {selectedDeposit.transactionId && (
                <p>
                  <strong>Transaction ID:</strong> {selectedDeposit.transactionId}
                </p>
              )}
            </div>
            {selectedDeposit.paymentProof ? (
              <Image
                src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}${
                  selectedDeposit.paymentProof
                }`}
                alt="Payment Proof"
                style={{ maxWidth: '100%' }}
              />
            ) : (
              <p>No payment proof uploaded</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepositManagement;
