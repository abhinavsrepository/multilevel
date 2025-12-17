import { useEffect, useState } from 'react';
import { Card, Table, Tag, Progress, Typography, Row, Col, Statistic, Button } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { bookingApi } from '@/api';
import { EMISchedule } from '@/types/booking.types';

const { Title } = Typography;

export const EMITracking = () => {
  const [emiSchedule, setEmiSchedule] = useState<EMISchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, paid: 0, balance: 0 });

  useEffect(() => {
    fetchEMIData();
  }, []);

  const fetchEMIData = async () => {
    try {
      setLoading(true);
      // Assuming customer has bookingId = 1 (would come from context/state)
      const response = await bookingApi.getEMISchedule(1);
      setEmiSchedule(response.data || []);

      const total = response.data.reduce((sum: number, emi: EMISchedule) => sum + emi.amount, 0);
      const paid = response.data.filter((emi: EMISchedule) => emi.status === 'PAID').reduce((sum: number, emi: EMISchedule) => sum + (emi.paidAmount || 0), 0);
      setStats({ total, paid, balance: total - paid });
    } catch (error) {
      console.error('Failed to fetch EMI data', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'EMI #', dataIndex: 'emiNumber', key: 'emiNumber' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `$${val.toLocaleString()}` },
    { title: 'Paid Date', dataIndex: 'paidDate', key: 'paidDate', render: (date: string) => date ? dayjs(date).format('MMM D, YYYY') : '-' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = { PENDING: 'orange', PAID: 'green', OVERDUE: 'red', PARTIAL: 'blue' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: EMISchedule) => (
        record.status === 'PENDING' && <Button type="primary" size="small">Pay Now</Button>
      ),
    },
  ];

  const paidPercentage = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>EMI Tracking</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Amount"
              value={stats.total}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={stats.paid}
              precision={2}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Balance"
              value={stats.balance}
              precision={2}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Payment Progress" style={{ marginBottom: 24 }}>
        <Progress percent={paidPercentage} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
        <p style={{ marginTop: 8, color: '#8c8c8c' }}>
          {paidPercentage.toFixed(1)}% of total amount paid
        </p>
      </Card>

      <Card title="EMI Schedule">
        <Table columns={columns} dataSource={emiSchedule} loading={loading} rowKey="id" />
      </Card>
    </div>
  );
};
