import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Row, Col, message, Modal, Spin, Divider } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { investmentApi, Investment } from '@/api/investment.api';
import dayjs from 'dayjs';

const { confirm } = Modal;

const InvestmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [investment, setInvestment] = useState<Investment | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvestment(id);
    }
  }, [id]);

  const fetchInvestment = async (investmentId: string) => {
    try {
      setLoading(true);
      const response = await investmentApi.getById(investmentId);
      if (response.data.success) {
        setInvestment(response.data.data || null);
      } else {
        message.error('Failed to fetch investment details');
      }
    } catch (error) {
      message.error('Failed to fetch investment details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    confirm({
      title: 'Approve Investment',
      content: 'Are you sure you want to approve this investment?',
      onOk: async () => {
        try {
          await investmentApi.approve(id!);
          message.success('Investment approved successfully');
          fetchInvestment(id!);
        } catch (error) {
          message.error('Failed to approve investment');
        }
      },
    });
  };

  const handleReject = () => {
    let reason = '';
    confirm({
      title: 'Reject Investment',
      content: (
        <div>
          <p>Please provide a reason for rejection:</p>
          <input
            type="text"
            className="ant-input"
            onChange={(e) => (reason = e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        if (!reason) {
          message.error('Rejection reason is required');
          return Promise.reject();
        }
        try {
          await investmentApi.reject(id!, reason);
          message.success('Investment rejected successfully');
          fetchInvestment(id!);
        } catch (error) {
          message.error('Failed to reject investment');
        }
      },
    });
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!investment) {
    return <div>Investment not found</div>;
  }

  return (
    <div className="investment-detail" style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/investments')}>
          Back to List
        </Button>
      </div>

      <Card
        title={
          <Space>
            <span>Investment #{investment.investmentId}</span>
            <Tag color={getStatusColor(investment.status)}>{investment.status}</Tag>
          </Space>
        }
        extra={
          investment.status === 'PENDING' && (
            <Space>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
                Approve
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>
                Reject
              </Button>
            </Space>
          )
        }
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Descriptions title="Investment Summary" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
              <Descriptions.Item label="Amount">₹{investment.investmentAmount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Date">{dayjs(investment.createdAt).format('DD MMM YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="ROI Earned">₹{investment.roiEarned?.toLocaleString() || 0}</Descriptions.Item>
              <Descriptions.Item label="Current Value">₹{investment.currentValue?.toLocaleString() || 0}</Descriptions.Item>
              <Descriptions.Item label="Maturity Date">{investment.expectedMaturityDate ? dayjs(investment.expectedMaturityDate).format('DD MMM YYYY') : '-'}</Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={24}>
            <Divider />
            <Descriptions title="Investor Details" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
              <Descriptions.Item label="Name">{investment.User?.firstName} {investment.User?.lastName}</Descriptions.Item>
              <Descriptions.Item label="Username">{investment.User?.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{investment.User?.email}</Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={24}>
            <Divider />
            <Descriptions title="Property Details" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
              <Descriptions.Item label="Property">{investment.Property?.title}</Descriptions.Item>
              <Descriptions.Item label="Property ID">{investment.Property?.propertyId}</Descriptions.Item>
              <Descriptions.Item label="Action">
                <Button type="link" onClick={() => navigate(`/properties/${investment.propertyId}`)}>
                  View Property
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InvestmentDetail;
