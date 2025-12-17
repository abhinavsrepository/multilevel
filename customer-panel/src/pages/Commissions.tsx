import { useEffect, useState } from 'react';
import { Card, Table, Tag, Row, Col, Statistic, Typography, DatePicker } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import { commissionApi } from '@/api';
import { Commission, CommissionSummary } from '@/types/commission.types';

const { Title } = Typography;

export const Commissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, summaryRes] = await Promise.all([
        commissionApi.getHistory(),
        commissionApi.getSummary(),
      ]);
      setCommissions(historyRes.data.content || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch commission data', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (type: string) => <Tag>{type}</Tag> },
    { title: 'Source', dataIndex: 'source', key: 'source' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `$${val.toLocaleString()}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = { PENDING: 'orange', APPROVED: 'blue', PAID: 'green', CANCELLED: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
  ];

  const pieConfig = {
    data: summary?.byType || [],
    angleField: 'amount',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} (${value})',
    },
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Commission Overview</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Earned"
              value={summary?.totalEarned || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Pending" value={summary?.totalPending || 0} precision={2} prefix="$" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Paid" value={summary?.totalPaid || 0} precision={2} prefix="$" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Commission by Type">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Monthly Earnings">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="This Month" value={summary?.thisMonth || 0} precision={2} prefix="$" />
              </Col>
              <Col span={12}>
                <Statistic title="Last Month" value={summary?.lastMonth || 0} precision={2} prefix="$" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="Commission History">
        <Table columns={columns} dataSource={commissions} loading={loading} rowKey="id" />
      </Card>
    </div>
  );
};
