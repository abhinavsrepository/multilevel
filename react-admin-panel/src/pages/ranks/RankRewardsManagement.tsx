import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Select,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Space,
  DatePicker,
  Typography
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { rankApi, RankReward } from '@/api/rankApi';
import { formatCurrency, formatDate } from '@/utils/helpers';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const RankRewardsManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<RankReward[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<number | undefined>();
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  useEffect(() => {
    fetchRewards();
  }, [filterStatus, filterMonth, filterYear]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterMonth) params.periodMonth = filterMonth;
      if (filterYear) params.periodYear = filterYear;

      const response = await rankApi.getAllRewards(params);
      if (response.data.success && response.data.data) {
        setRewards(response.data.data.rewards || []);
      }
    } catch (error) {
      message.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyRewards = async () => {
    try {
      setLoading(true);
      const response = await rankApi.generateMonthlyRewards(selectedMonth, selectedYear);
      if (response.data.success) {
        message.success(response.data.message || 'Monthly rewards generated successfully');
        setGenerateModalVisible(false);
        fetchRewards();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to generate rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessMonthlyRewards = async () => {
    try {
      setLoading(true);
      const response = await rankApi.processMonthlyRewards(selectedMonth, selectedYear);
      if (response.data.success) {
        message.success(response.data.message || 'Monthly rewards processed successfully');
        setProcessModalVisible(false);
        fetchRewards();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to process rewards');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSED':
        return 'processing';
      case 'PAID':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate totals
  const totalPending = rewards
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.toString()), 0);

  const totalProcessed = rewards
    .filter((r) => r.status === 'PROCESSED')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.toString()), 0);

  const totalPaid = rewards
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.toString()), 0);

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: RankReward) => (
        <div>
          <Text strong>{record.User?.fullName || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.User?.username || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Rank',
      dataIndex: ['Rank', 'name'],
      key: 'rank',
      render: (text: string) => <Tag color="gold">{text || 'N/A'}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'rewardType',
      key: 'rewardType',
      render: (text: string) => (
        <Tag color="blue">{text.replace(/_/g, ' ')}</Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'rewardAmount',
      key: 'rewardAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      render: (_: any, record: RankReward) => {
        if (record.periodMonth && record.periodYear) {
          const month = months.find((m) => m.value === record.periodMonth);
          return `${month?.label} ${record.periodYear}`;
        }
        return 'N/A';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Rank Rewards Management</Title>
        <Text type="secondary">
          Manage and distribute monthly leadership bonuses and one-time achievement rewards
        </Text>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Rewards"
              value={totalPending}
              prefix="₹"
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Processed Rewards"
              value={totalProcessed}
              prefix="₹"
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Paid Rewards"
              value={totalPaid}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Status"
              allowClear
              value={filterStatus || undefined}
              onChange={(value) => setFilterStatus(value || '')}
            >
              <Option value="PENDING">Pending</Option>
              <Option value="PROCESSED">Processed</Option>
              <Option value="PAID">Paid</Option>
              <Option value="FAILED">Failed</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Month"
              allowClear
              value={filterMonth}
              onChange={(value) => setFilterMonth(value)}
            >
              {months.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Year"
              value={filterYear}
              onChange={(value) => setFilterYear(value)}
            >
              <Option value={2024}>2024</Option>
              <Option value={2025}>2025</Option>
              <Option value={2026}>2026</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button type="default" block onClick={fetchRewards}>
              Refresh
            </Button>
          </Col>
        </Row>
        <Space>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => setGenerateModalVisible(true)}
          >
            Generate Monthly Rewards
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setProcessModalVisible(true)}
          >
            Process Monthly Rewards
          </Button>
        </Space>
      </Card>

      {/* Rewards Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={rewards}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
        />
      </Card>

      {/* Generate Monthly Rewards Modal */}
      <Modal
        title="Generate Monthly Rewards"
        open={generateModalVisible}
        onOk={handleGenerateMonthlyRewards}
        onCancel={() => setGenerateModalVisible(false)}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Month"
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
          >
            {months.map((month) => (
              <Option key={month.value} value={month.value}>
                {month.label}
              </Option>
            ))}
          </Select>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Year"
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
          >
            <Option value={2024}>2024</Option>
            <Option value={2025}>2025</Option>
            <Option value={2026}>2026</Option>
          </Select>
        </Space>
      </Modal>

      {/* Process Monthly Rewards Modal */}
      <Modal
        title="Process Monthly Rewards"
        open={processModalVisible}
        onOk={handleProcessMonthlyRewards}
        onCancel={() => setProcessModalVisible(false)}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Month"
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
          >
            {months.map((month) => (
              <Option key={month.value} value={month.value}>
                {month.label}
              </Option>
            ))}
          </Select>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Year"
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
          >
            <Option value={2024}>2024</Option>
            <Option value={2025}>2025</Option>
            <Option value={2026}>2026</Option>
          </Select>
        </Space>
      </Modal>
    </div>
  );
};

export default RankRewardsManagement;
