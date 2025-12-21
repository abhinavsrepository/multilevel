import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, List, Typography, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { dashboardApi } from '@/api';
import { DashboardStats } from '@/types/dashboard.types';

const { Title, Text } = Typography;

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [leadPipelineData, setLeadPipelineData] = useState<any[]>([]);
  const [todayFollowUps, setTodayFollowUps] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAssociate = user?.role === 'ASSOCIATE';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, pipelineRes, followUpsRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRevenueChart('30d'),
        isAssociate ? dashboardApi.getLeadPipeline() : Promise.resolve({ data: { success: true, message: 'Mock', data: [] } } as any),
        isAssociate ? dashboardApi.getTodayFollowUps() : Promise.resolve({ data: { success: true, message: 'Mock', data: [] } } as any),
      ]);

      setStats(statsRes.data?.data || null);
      setRevenueData(revenueRes.data?.data || []);

      const pipelineData = pipelineRes.data as any; // Temporary cast to bypass complex conditional types
      setLeadPipelineData(pipelineData?.data || []);

      const followUpsData = followUpsRes.data as any; // Temporary cast to bypass complex conditional types
      setTodayFollowUps(followUpsData?.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const associateKPIs = [
    {
      title: 'Total Clients',
      value: stats?.totalClients || 0,
      prefix: <TeamOutlined />,
      styles: { content: { color: '#3f8600' } },
      suffix: <ArrowUpOutlined />,
    },
    {
      title: 'Active Clients',
      value: stats?.activeClients || 0,
      prefix: <UserOutlined />,
      styles: { content: { color: '#1890ff' } },
    },
    {
      title: "Today's Follow-ups",
      value: stats?.followUpsToday || 0,
      prefix: <CalendarOutlined />,
      styles: { content: { color: '#fa8c16' } },
    },
    {
      title: 'Commission (This Month)',
      value: stats?.commissionEarned || 0,
      precision: 2,
      styles: { content: { color: '#52c41a' } },
      prefix: '$',
    },
  ];

  const customerKPIs = [
    {
      title: 'Active Bookings',
      value: stats?.activeBookings || 0,
      prefix: <CheckCircleOutlined />,
      styles: { content: { color: '#1890ff' } },
    },
    {
      title: 'Total Paid',
      value: stats?.totalRevenue || 0,
      precision: 2,
      prefix: '$',
      styles: { content: { color: '#3f8600' } },
    },
    {
      title: 'Pending EMIs',
      value: 3,
      prefix: <ClockCircleOutlined />,
      styles: { content: { color: '#fa8c16' } },
    },
    {
      title: 'Next Site Visit',
      value: 'Dec 15',
      prefix: <CalendarOutlined />,
    },
  ];

  const kpis = isAssociate ? associateKPIs : customerKPIs;

  const revenueChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    point: { size: 3 },
    line: { color: '#1890ff' },
    areaStyle: { fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff' },
  };

  const pipelineChartConfig = {
    data: leadPipelineData,
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
    },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic {...kpi} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Revenue Trend (Last 30 Days)">
            <Line {...revenueChartConfig} height={300} />
          </Card>
        </Col>

        {isAssociate && (
          <Col xs={24} lg={8}>
            <Card title="Lead Pipeline">
              <Pie {...pipelineChartConfig} height={300} />
            </Card>
          </Col>
        )}
      </Row>

      {/* Today's Follow-ups & Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {isAssociate && (
          <Col xs={24} lg={16}>
            <Card
              title="Today's Follow-ups"
              extra={<Button type="link" onClick={() => navigate('/tasks')}>View All</Button>}
            >
              <Table
                dataSource={todayFollowUps}
                rowKey="clientId"
                columns={[
                  { title: 'Client', dataIndex: 'clientName', key: 'clientName' },
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  { title: 'Time', dataIndex: 'scheduledTime', key: 'time' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'PENDING' ? 'orange' : 'green'}>{status}</Tag>
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_, record) => (
                      <Button size="small" type="primary" onClick={() => navigate(`/clients/${record.clientId}`)}>
                        View
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        )}

        <Col xs={24} lg={isAssociate ? 8 : 24}>
          <Card title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(isAssociate ? [
                { title: 'Add New Client', action: () => navigate('/clients/new') },
                { title: 'Schedule Site Visit', action: () => navigate('/site-visits/new') },
                { title: 'Create Task', action: () => navigate('/tasks/new') },
                { title: 'View Properties', action: () => navigate('/properties') },
              ] : [
                { title: 'Browse Properties', action: () => navigate('/properties') },
                { title: 'Pay EMI', action: () => navigate('/emi-tracking') },
                { title: 'Schedule Site Visit', action: () => navigate('/site-visits/new') },
                { title: 'View Documents', action: () => navigate('/documents') },
              ]).map((item, idx) => (
                <div key={idx} style={{ padding: '8px 0', borderBottom: idx < 3 ? '1px solid #f0f0f0' : 'none' }}>
                  <Button type="link" onClick={item.action} style={{ padding: 0 }}>
                    {item.title}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Commission Summary (Associate Only) */}
      {isAssociate && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card title="Commission Summary">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Earned"
                    value={stats?.commissionEarned || 0}
                    precision={2}
                    prefix="$"
                    styles={{ content: { color: '#3f8600' } }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Pending"
                    value={stats?.commissionPending || 0}
                    precision={2}
                    prefix="$"
                    styles={{ content: { color: '#fa8c16' } }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Button type="primary" onClick={() => navigate('/commissions')}>
                    View Details
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};
