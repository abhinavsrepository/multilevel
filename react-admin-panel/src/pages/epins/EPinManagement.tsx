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
  Form,
  InputNumber,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { epinApi, EPin, EPinStats, GenerateEPinRequest } from '@/api/epin.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const EPinManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EPin[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<EPinStats | null>(null);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  // Filters
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    generatedFrom: undefined as string | undefined,
    search: '',
    page: 1,
    limit: 10,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  useEffect(() => {
    fetchEPins();
    fetchStats();
  }, [filters]);

  const fetchEPins = async () => {
    try {
      setLoading(true);
      const response = await epinApi.getAll(filters);
      // Ensure data is always an array
      const epinsData = response.data.data?.data || [];
      setData(epinsData);
      setTotal(response.data.data?.total || 0);
    } catch (error) {
      message.error('Failed to fetch E-Pins');
      setData([]); // Set empty array on error
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await epinApi.getStats();
      setStats(response.data.data || null);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleGenerate = async (values: GenerateEPinRequest) => {
    try {
      setActionLoading(true);
      const response = await epinApi.generate(values);
      message.success(`Successfully generated ${response.data.data?.epins.length} E-Pins`);
      setGenerateModalVisible(false);
      form.resetFields();
      fetchEPins();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to generate E-Pins');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await epinApi.toggleStatus(id);
      message.success('E-Pin status updated');
      fetchEPins();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await epinApi.delete(id);
      message.success('E-Pin deleted successfully');
      fetchEPins();
      fetchStats();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete E-Pin');
    }
  };

  const handleCopyPin = (pinCode: string) => {
    navigator.clipboard.writeText(pinCode);
    message.success('E-Pin copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'USED':
        return 'blue';
      case 'EXPIRED':
        return 'orange';
      case 'BLOCKED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getGeneratedFromColor = (source: string) => {
    switch (source) {
      case 'ADMIN':
        return 'purple';
      case 'WALLET':
        return 'cyan';
      case 'DEPOSIT':
        return 'geekblue';
      default:
        return 'default';
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
      title: 'Pin Code',
      dataIndex: 'pinCode',
      key: 'pinCode',
      render: (pinCode: string) => (
        <Space>
          <code style={{ fontSize: 14, fontWeight: 'bold' }}>{pinCode}</code>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyPin(pinCode)}
          />
        </Space>
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
      title: 'Generated From',
      dataIndex: 'generatedFrom',
      key: 'generatedFrom',
      render: (source: string) => <Tag color={getGeneratedFromColor(source)}>{source}</Tag>,
    },
    {
      title: 'Generated By',
      dataIndex: ['GeneratedByUser'],
      key: 'generatedBy',
      render: (_: any, record: EPin) =>
        record.GeneratedByUser ? (
          <div>
            <div>
              {record.GeneratedByUser.firstName} {record.GeneratedByUser.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              @{record.GeneratedByUser.username}
            </div>
          </div>
        ) : (
          'Admin'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Used By',
      dataIndex: ['UsedByUser'],
      key: 'usedBy',
      render: (_: any, record: EPin) =>
        record.UsedByUser ? (
          <div>
            <div>
              {record.UsedByUser.firstName} {record.UsedByUser.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>@{record.UsedByUser.username}</div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Activated User',
      dataIndex: ['ActivatedUser'],
      key: 'activatedUser',
      render: (_: any, record: EPin) =>
        record.ActivatedUser ? (
          <div>
            <div>
              {record.ActivatedUser.firstName} {record.ActivatedUser.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              @{record.ActivatedUser.username}
            </div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) =>
        date ? (
          <span style={{ color: dayjs(date).isBefore(dayjs()) ? 'red' : 'inherit' }}>
            {dayjs(date).format('DD MMM YYYY')}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: EPin) => (
        <Space size="small">
          {record.status !== 'USED' && (
            <Tooltip title={record.status === 'BLOCKED' ? 'Unblock' : 'Block'}>
              <Button
                type={record.status === 'BLOCKED' ? 'default' : 'primary'}
                danger={record.status !== 'BLOCKED'}
                icon={record.status === 'BLOCKED' ? <UnlockOutlined /> : <LockOutlined />}
                size="small"
                onClick={() => handleToggleStatus(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'AVAILABLE' && (
            <Popconfirm
              title="Delete E-Pin"
              description="Are you sure you want to delete this E-Pin? This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="epin-management">
      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total E-Pins"
                value={stats.totalPins}
                prefix={<DollarOutlined />}
                suffix={`/ $${stats.totalValue?.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Available"
                value={stats.availablePins}
                prefix={<CheckCircleOutlined />}
                suffix={`/ $${stats.availableValue?.toLocaleString()}`}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Used"
                value={stats.usedPins}
                prefix={<CheckCircleOutlined />}
                suffix={`/ $${stats.usedValue?.toLocaleString()}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Blocked"
                value={stats.blockedPins}
                prefix={<CloseCircleOutlined />}
                suffix={`/ $${stats.blockedValue?.toLocaleString()}`}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters & Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={5}>
            <Input
              placeholder="Search by pin code..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
              allowClear
            >
              <Option value="AVAILABLE">Available</Option>
              <Option value="USED">Used</Option>
              <Option value="EXPIRED">Expired</Option>
              <Option value="BLOCKED">Blocked</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Generated from"
              style={{ width: '100%' }}
              value={filters.generatedFrom}
              onChange={(value) => setFilters({ ...filters, generatedFrom: value, page: 1 })}
              allowClear
            >
              <Option value="ADMIN">Admin</Option>
              <Option value="WALLET">Wallet</Option>
              <Option value="DEPOSIT">Deposit</Option>
            </Select>
          </Col>
          <Col span={7}>
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
          <Col span={2}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchEPins();
                fetchStats();
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={2}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setGenerateModalVisible(true)}
              style={{ width: '100%' }}
            >
              Generate
            </Button>
          </Col>
        </Row>
      </Card>

      {/* E-Pins Table */}
      <Card title="E-Pin List">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page, pageSize) => setFilters({ ...filters, page, limit: pageSize || 10 }),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} E-Pins`,
          }}
        />
      </Card>

      {/* Generate E-Pins Modal */}
      <Modal
        title="Generate E-Pins"
        open={generateModalVisible}
        onCancel={() => {
          setGenerateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleGenerate}>
          <Form.Item
            label="Number of E-Pins"
            name="count"
            rules={[
              { required: true, message: 'Please enter the number of E-Pins' },
              { type: 'number', min: 1, max: 1000, message: 'Count must be between 1 and 1000' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter count (1-1000)" min={1} max={1000} />
          </Form.Item>

          <Form.Item
            label="Amount per E-Pin"
            name="amount"
            rules={[
              { required: true, message: 'Please enter the amount' },
              { type: 'number', min: 1, message: 'Amount must be greater than 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter amount"
              prefix="$"
              min={1}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="Expiry Days (Optional)"
            name="expiryDays"
            help="Leave empty for no expiry"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter expiry days"
              min={1}
              max={3650}
            />
          </Form.Item>

          <Form.Item label="Remarks (Optional)" name="remarks">
            <TextArea rows={3} placeholder="Enter any remarks..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setGenerateModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading}>
                Generate E-Pins
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EPinManagement;
