import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, DatePicker, Row, Col, message, Statistic, Tooltip } from 'antd';
import { EyeOutlined, SearchOutlined, FilterOutlined, DollarOutlined, RiseOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { investmentApi, Investment } from '@/api/investment.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface InvestmentStats {
  totalInvested: number;
  totalInvestments: number;
  activeInvestments: number;
  totalROI: number;
}

const InvestmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [data, setData] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats>({
    totalInvested: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalROI: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: [] as any[],
  });

  useEffect(() => {
    fetchInvestments();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await investmentApi.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      };

      const response = await investmentApi.getAll(params);
      if (response.data.success) {
        // Ensure data is always an array
        const investmentsData = Array.isArray(response.data.data) ? response.data.data : [];
        setData(investmentsData);
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.page,
            pageSize: 10, // Keep consistent
            total: response.data.pagination.total,
          });
        }
      } else {
        message.error(response.data.message || 'Failed to fetch investments');
        setData([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      message.error('Failed to fetch investments');
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({ ...pagination, current: newPagination.current });
  };

  const handleRefresh = () => {
    fetchInvestments();
    fetchStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      case 'MATURED': return 'purple';
      case 'EXITED': return 'orange';
      case 'CANCELLED': return 'red';
      case 'PENDING': return 'gold';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Investment',
      key: 'investment',
      width: 250,
      render: (_: any, record: Investment) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.Property?.title}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>ID: {record.investmentId}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>{dayjs(record.createdAt).format('DD MMM YYYY')}</span>
        </Space>
      ),
    },
    {
      title: 'Investor',
      key: 'user',
      width: 200,
      render: (_: any, record: Investment) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.User?.firstName} {record.User?.lastName}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>{record.User?.username}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>{record.User?.email}</span>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'investmentAmount',
      key: 'amount',
      width: 150,
      render: (amount: number) => (
        <span style={{ fontWeight: 600 }}>₹{amount?.toLocaleString()}</span>
      ),
    },
    {
      title: 'ROI Earned',
      dataIndex: 'roiEarned',
      key: 'roi',
      width: 150,
      render: (amount: number) => (
        <span style={{ color: amount > 0 ? 'green' : 'inherit' }}>
          {amount ? `₹${amount.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'investmentStatus',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Investment) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/investments/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="investments-list" style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Investments</h1>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>Manage and track all user investments</p>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Refresh</Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total Invested"
              value={stats.totalInvested}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total Investments"
              value={stats.totalInvestments}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Active Investments"
              value={stats.activeInvestments}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total ROI Distributed"
              value={stats.totalROI}
              prefix="₹"
              precision={0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by ID, User, or Property..."
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onPressEnter={fetchInvestments}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Status"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="ACTIVE">Active</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="MATURED">Matured</Option>
              <Option value="EXITED">Exited</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as any[] })}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchInvestments}
              block
            >
              Apply
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default InvestmentsList;
