import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Select } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  HomeOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { analyticsApi } from '@/api/analyticsApi';
import { formatCurrency, formatDate, getRelativeTime } from '@/utils/helpers';
import type { DashboardStats, ChartData, ActivityLog } from '@/types/analytics.types';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboardStats();
      if (response.data.success && response.data.data) {
        setStats(response.data.data.stats);
        setCharts(response.data.data.charts);
        setActivities(response.data.data.recentActivities);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activityColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => getRelativeTime(text),
      width: 150,
    },
    {
      title: 'Activity',
      dataIndex: 'activityType',
      key: 'activityType',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user.fullName,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (amount ? formatCurrency(amount) : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'SUCCESS' ? 'success' : 'error'}>{status}</Tag>,
    },
  ];

  const registrationConfig = {
    data: charts?.registrationTrend || [],
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: '#1890ff',
  };

  const investmentConfig = {
    data: charts?.investmentTrend || [],
    xField: 'date',
    yField: 'value',
    smooth: true,
    areaStyle: { fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff' },
  };

  const commissionConfig = {
    data: charts?.commissionDistribution || [],
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
  };

  const topPerformersConfig = {
    data: charts?.topPerformers || [],
    xField: 'name',
    yField: 'value',
    seriesField: 'name',
    color: ({ name }: any) => {
      const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
      const index = charts?.topPerformers.findIndex((p) => p.name === name) || 0;
      return colors[index % colors.length];
    },
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
          <Select.Option value="7d">Last 7 Days</Select.Option>
          <Select.Option value="30d">Last 30 Days</Select.Option>
          <Select.Option value="90d">Last 90 Days</Select.Option>
        </Select>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Users"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              suffix={
                stats && stats.userGrowth > 0 ? (
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <ArrowUpOutlined /> {stats.userGrowth}%
                  </span>
                ) : null
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Today's Registrations"
              value={stats?.todayRegistrations || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Investment"
              value={stats?.totalInvestment || 0}
              prefix="₹"
              precision={0}
              suffix={
                stats && stats.investmentGrowth > 0 ? (
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <ArrowUpOutlined /> {stats.investmentGrowth}%
                  </span>
                ) : null
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Today's Investment"
              value={stats?.todayInvestment || 0}
              prefix="₹"
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Active Properties"
              value={stats?.activeProperties || 0}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Pending Payouts"
              value={stats?.pendingPayouts.count || 0}
              suffix={`(${formatCurrency(stats?.pendingPayouts.amount || 0)})`}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Commissions Paid"
              value={stats?.commissionsPaid || 0}
              prefix="₹"
              precision={0}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Pending KYC"
              value={stats?.pendingKYC || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="User Registrations Trend" loading={loading}>
            <Line {...registrationConfig} height={300} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Investment Trend" loading={loading}>
            <Line {...investmentConfig} height={300} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Commission Distribution" loading={loading}>
            <Pie {...commissionConfig} height={300} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Performers" loading={loading}>
            <Column {...topPerformersConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card title="Recent Activities" loading={loading}>
        <Table
          dataSource={activities}
          columns={activityColumns}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
