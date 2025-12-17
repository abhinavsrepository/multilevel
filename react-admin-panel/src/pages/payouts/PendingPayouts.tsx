import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Typography,
  Tooltip,
  InputNumber,
  Form
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DollarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { api } from '../../api/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  tdsAmount: string;
  adminCharge: string;
  netAmount: string;
  paymentMethod: string;
  status: string;
  requestedAt: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

const PendingPayouts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Modal states
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'PAY' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number | null>(null);

  const fetchPayouts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await api.get(`/payouts/admin/all`, {
        params: {
          page,
          limit: pageSize,
          status: 'REQUESTED' // Or PENDING depending on backend default
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
      message.error(error.response?.data?.message || 'Failed to fetch payouts');
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

  const showProcessModal = (payout: Payout, type: 'APPROVE' | 'REJECT' | 'PAY') => {
    setSelectedPayout(payout);
    setActionType(type);
    setRemarks('');
    setTransactionId('');
    setProcessModalVisible(true);
  };

  const showAdjustModal = (payout: Payout) => {
    setSelectedPayout(payout);
    setAdjustAmount(parseFloat(payout.requestedAmount));
    setAdjustModalVisible(true);
  };

  const handleProcessSubmit = async () => {
    if (!selectedPayout || !actionType) return;

    try {
      const statusMap = {
        'APPROVE': 'APPROVED',
        'REJECT': 'REJECTED',
        'PAY': 'PAID'
      };

      await api.put(`/payouts/admin/${selectedPayout.payoutId}/process`, {
        status: statusMap[actionType],
        remarks,
        transactionId: actionType === 'PAY' ? transactionId : undefined
      });

      message.success(`Payout ${actionType.toLowerCase()}ed successfully`);
      setProcessModalVisible(false);
      fetchPayouts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleAdjustSubmit = async () => {
    if (!selectedPayout || !adjustAmount) return;

    try {
      await api.put(`/payouts/admin/${selectedPayout.payoutId}/adjust`, {
        amount: adjustAmount
      });

      message.success('Payout amount adjusted successfully');
      setAdjustModalVisible(false);
      fetchPayouts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Adjustment failed');
    }
  };

  const columns = [
    {
      title: 'Payout ID',
      dataIndex: 'payoutId',
      key: 'payoutId',
      render: (text: string) => <Text strong>{text}</Text>,
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
          <Text>Req: ₹{parseFloat(record.requestedAmount).toFixed(2)}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Net: ₹{parseFloat(record.netAmount).toFixed(2)}</Text>
        </Space>
      ),
    },
    {
      title: 'Payment Details',
      key: 'payment',
      render: (_: any, record: Payout) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.paymentMethod}</Tag>
          {record.paymentMethod === 'BANK_TRANSFER' ? (
            <Text style={{ fontSize: '12px' }}>{record.bankName} - {record.accountNumber}</Text>
          ) : (
            <Text style={{ fontSize: '12px' }}>UPI: {record.upiId}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'REQUESTED') color = 'orange';
        if (status === 'APPROVED') color = 'blue';
        if (status === 'PAID') color = 'green';
        if (status === 'REJECTED') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Payout) => (
        <Space>
          <Tooltip title="Adjust Amount">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showAdjustModal(record)}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => showProcessModal(record, 'APPROVE')}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              onClick={() => showProcessModal(record, 'REJECT')}
            />
          </Tooltip>
          <Tooltip title="Mark as Paid">
            <Button
              style={{ backgroundColor: '#52c41a', color: 'white', borderColor: '#52c41a' }}
              icon={<DollarOutlined />}
              size="small"
              onClick={() => showProcessModal(record, 'PAY')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Pending Payouts</Title>
            <Text type="secondary">Review and manage withdrawal requests</Text>
          </div>
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

      {/* Process Modal (Approve/Reject/Pay) */}
      <Modal
        title={`${actionType === 'PAY' ? 'Process Payment' : actionType === 'APPROVE' ? 'Approve Payout' : 'Reject Payout'}`}
        open={processModalVisible}
        onOk={handleProcessSubmit}
        onCancel={() => setProcessModalVisible(false)}
        okText={actionType === 'PAY' ? 'Confirm Payment' : 'Confirm'}
        okButtonProps={{ danger: actionType === 'REJECT' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {actionType === 'REJECT' && (
            <Tag color="red" style={{ width: '100%', padding: '8px', textAlign: 'center' }}>
              <ExclamationCircleOutlined /> Warning: This will refund the amount to the user's wallet.
            </Tag>
          )}

          {actionType === 'PAY' && (
            <Form.Item label="Transaction ID" required>
              <Input
                placeholder="Enter bank transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </Form.Item>
          )}

          <Form.Item label="Remarks">
            <TextArea
              rows={4}
              placeholder="Enter remarks or reason..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Form.Item>
        </Space>
      </Modal>

      {/* Adjust Amount Modal */}
      <Modal
        title="Adjust Payout Amount"
        open={adjustModalVisible}
        onOk={handleAdjustSubmit}
        onCancel={() => setAdjustModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tag color="orange" style={{ width: '100%', padding: '8px' }}>
            <ExclamationCircleOutlined /> Changing the amount will automatically adjust the user's wallet balance (deduct or refund difference).
          </Tag>

          <Form.Item label="New Amount (₹)">
            <InputNumber
              style={{ width: '100%' }}
              value={adjustAmount}
              onChange={(val) => setAdjustAmount(val)}
              prefix="₹"
            />
          </Form.Item>
        </Space>
      </Modal>
    </div>
  );
};

export default PendingPayouts;
