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
  Steps,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { withdrawalApi, Withdrawal, WithdrawalStats } from '@/api/withdrawal.api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const WithdrawalManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
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
    fetchWithdrawals();
    fetchStats();
  }, [filters]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await withdrawalApi.getAll(filters);
      // Ensure data is always an array
      const withdrawalsData = Array.isArray(response.data.data) ? response.data.data : [];
      setData(withdrawalsData);
      setTotal(response.data.total || 0);
    } catch (error) {
      message.error('Failed to fetch withdrawals');
      setData([]); // Set empty array on error
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await withdrawalApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApproveClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setApproveModalVisible(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedWithdrawal) return;

    try {
      setActionLoading(true);
      await withdrawalApi.approve(selectedWithdrawal.id);
      message.success('Withdrawal moved to processing');
      setApproveModalVisible(false);
      fetchWithdrawals();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedWithdrawal) return;
    if (!rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await withdrawalApi.reject(selectedWithdrawal.id, rejectionReason);
      message.success('Withdrawal rejected and amount refunded to wallet');
      setRejectModalVisible(false);
      setRejectionReason('');
      fetchWithdrawals();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setTransactionId('');
    setCompleteModalVisible(true);
  };

  const handleCompleteConfirm = async () => {
    if (!selectedWithdrawal) return;

    try {
      setActionLoading(true);
      await withdrawalApi.complete(selectedWithdrawal.id, transactionId || undefined);
      message.success('Withdrawal marked as completed');
      setCompleteModalVisible(false);
      setTransactionId('');
      fetchWithdrawals();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to complete withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'PROCESSING':
        return 'blue';
      case 'APPROVED':
        return 'cyan';
      case 'COMPLETED':
        return 'green';
      case 'REJECTED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockCircleOutlined />;
      case 'PROCESSING':
        return <SyncOutlined spin />;
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircleOutlined />;
      case 'REJECTED':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const getWithdrawalTypeLabel = (type: string) => {
    switch (type) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'UPI':
        return 'UPI';
      case 'CRYPTO':
        return 'Crypto';
      case 'CHECK':
        return 'Check';
      default:
        return type;
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
      render: (_: any, record: Withdrawal) => (
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
      key: 'amount',
      render: (_: any, record: Withdrawal) => (
        <div>
          <div>
            <strong style={{ color: '#1890ff' }}>${record.amount?.toLocaleString()}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Charge: ${record.transactionCharge} | Net: ${record.netAmount?.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'withdrawalType',
      key: 'withdrawalType',
      render: (type: string) => <Tag>{getWithdrawalTypeLabel(type)}</Tag>,
    },
    {
      title: 'Bank Account',
      dataIndex: ['BankAccount'],
      key: 'bankAccount',
      render: (_: any, record: Withdrawal) =>
        record.BankAccount ? (
          <div>
            <div>{record.BankAccount.bankName}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {record.BankAccount.accountNumber}
            </div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text: string) => text || '-',
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
      width: 200,
      render: (_: any, record: Withdrawal) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Approve & Move to Processing">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
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
          {(record.status === 'PROCESSING' || record.status === 'APPROVED') && (
            <>
              <Tooltip title="Mark as Completed">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleCompleteClick(record)}
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
    <div className="withdrawal-management">
      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Withdrawals"
                value={stats.totalWithdrawals}
                prefix={<DollarOutlined />}
                suffix={`/ $${stats.totalAmount?.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pendingWithdrawals}
                prefix={<ClockCircleOutlined />}
                suffix={`/ $${stats.pendingAmount?.toLocaleString()}`}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Processing"
                value={stats.processingWithdrawals}
                prefix={<SyncOutlined />}
                suffix={`/ $${stats.processingAmount?.toLocaleString()}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed"
                value={stats.completedWithdrawals}
                prefix={<CheckCircleOutlined />}
                suffix={`/ $${stats.completedAmount?.toLocaleString()}`}
                valueStyle={{ color: '#52c41a' }}
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
              <Option value="PROCESSING">Processing</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="COMPLETED">Completed</Option>
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
                fetchWithdrawals();
                fetchStats();
              }}
              style={{ width: '100%' }}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Withdrawals Table */}
      <Card title="Withdrawal Requests">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page, pageSize) => setFilters({ ...filters, page, limit: pageSize || 10 }),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} withdrawals`,
          }}
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Approve Withdrawal"
        open={approveModalVisible}
        onOk={handleApproveConfirm}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedWithdrawal(null);
        }}
        confirmLoading={actionLoading}
        okText="Approve & Move to Processing"
        okButtonProps={{ style: { backgroundColor: '#1890ff', borderColor: '#1890ff' } }}
      >
        {selectedWithdrawal && (
          <div>
            <p>
              Are you sure you want to approve this withdrawal and move it to processing?
            </p>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
              <p>
                <strong>User:</strong> {selectedWithdrawal.User?.firstName}{' '}
                {selectedWithdrawal.User?.lastName}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedWithdrawal.amount?.toLocaleString()}
              </p>
              <p>
                <strong>Transaction Charge:</strong> ${selectedWithdrawal.transactionCharge}
              </p>
              <p>
                <strong>Net Amount:</strong> ${selectedWithdrawal.netAmount?.toLocaleString()}
              </p>
              {selectedWithdrawal.BankAccount && (
                <>
                  <p>
                    <strong>Bank:</strong> {selectedWithdrawal.BankAccount.bankName}
                  </p>
                  <p>
                    <strong>Account:</strong> {selectedWithdrawal.BankAccount.accountNumber}
                  </p>
                  <p>
                    <strong>Account Holder:</strong>{' '}
                    {selectedWithdrawal.BankAccount.accountHolderName}
                  </p>
                </>
              )}
            </div>
            <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>
              The withdrawal will be moved to "PROCESSING" status. You can mark it as completed later.
            </p>
          </div>
        )}
      </Modal>

      {/* Complete Modal */}
      <Modal
        title="Complete Withdrawal"
        open={completeModalVisible}
        onOk={handleCompleteConfirm}
        onCancel={() => {
          setCompleteModalVisible(false);
          setTransactionId('');
          setSelectedWithdrawal(null);
        }}
        confirmLoading={actionLoading}
        okText="Mark as Completed"
        okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      >
        {selectedWithdrawal && (
          <div>
            <p>Mark this withdrawal as completed?</p>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
              <p>
                <strong>User:</strong> {selectedWithdrawal.User?.firstName}{' '}
                {selectedWithdrawal.User?.lastName}
              </p>
              <p>
                <strong>Net Amount:</strong> ${selectedWithdrawal.netAmount?.toLocaleString()}
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              <label>Transaction ID (Optional):</label>
              <Input
                placeholder="Enter transaction/reference ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Withdrawal"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
          setSelectedWithdrawal(null);
        }}
        confirmLoading={actionLoading}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        {selectedWithdrawal && (
          <div>
            <p>
              Are you sure you want to reject this withdrawal? The amount will be refunded to the
              user's wallet.
            </p>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
              <p>
                <strong>User:</strong> {selectedWithdrawal.User?.firstName}{' '}
                {selectedWithdrawal.User?.lastName}
              </p>
              <p>
                <strong>Amount to Refund:</strong> ${selectedWithdrawal.amount?.toLocaleString()}
              </p>
            </div>
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
    </div>
  );
};

export default WithdrawalManagement;
