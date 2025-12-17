import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tabs, Button, Tag, Space, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '@/api/userApi';
import { formatDate, formatCurrency } from '@/utils/helpers';
import type { User } from '@/types/user.types';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserById(Number(id));
      if (response.data.success) {
        setUser(response.data.data || null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <div className="page-header">
        <h1>User Details</h1>
        <Space>
          <Button onClick={() => navigate(`/users/edit/${id}`)}>Edit</Button>
          <Button onClick={() => navigate('/users')}>Back</Button>
        </Space>
      </div>

      <Tabs
        items={[
          {
            key: '1',
            label: 'Personal Info',
            children: (
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="User ID">{user.userId}</Descriptions.Item>
                  <Descriptions.Item label="Full Name">{user.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                  <Descriptions.Item label="Mobile">{user.mobile}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={user.status === 'ACTIVE' ? 'success' : 'error'}>{user.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="KYC Status">
                    <Tag>{user.kycStatus}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rank">{user.rankName || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Registered">{formatDate(user.createdAt)}</Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: '2',
            label: 'MLM Info',
            children: (
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Sponsor">{user.sponsorName || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Total Team">{user.totalTeamSize}</Descriptions.Item>
                  <Descriptions.Item label="Left BV">{user.leftBV}</Descriptions.Item>
                  <Descriptions.Item label="Right BV">{user.rightBV}</Descriptions.Item>
                  <Descriptions.Item label="Direct Referrals">{user.directReferrals}</Descriptions.Item>
                  <Descriptions.Item label="Level">{user.level}</Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: '3',
            label: 'Financial',
            children: (
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Total Investment">{formatCurrency(user.totalInvestment)}</Descriptions.Item>
                  <Descriptions.Item label="Total Earnings">{formatCurrency(user.totalEarnings)}</Descriptions.Item>
                  <Descriptions.Item label="Total Withdrawn">{formatCurrency(user.totalWithdrawn)}</Descriptions.Item>
                  <Descriptions.Item label="Available Balance">{formatCurrency(user.availableBalance)}</Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default UserDetail;
