import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tabs, Button, Tag, Space, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '@/api/userApi';
import { formatDate, formatCurrency } from '@/utils/helpers';
import type { User } from '@/types/user.types';
import RankProgressWidget from '@/components/users/RankProgressWidget';
import ManualCommissionModal from '@/components/users/ManualCommissionModal';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [manualCommissionVisible, setManualCommissionVisible] = useState(false);

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

      <div className="mb-6">
        <RankProgressWidget userId={Number(id)} />
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
                    <Tag color={user.kycStatus === 'APPROVED' || user.kycStatus === 'VERIFIED' ? 'success' : user.kycStatus === 'PENDING' ? 'warning' : 'default'}>{user.kycStatus}</Tag>
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
          {
            key: '4',
            label: 'Governance',
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Verification Controls */}
                <Card title="Verification Controls" extra={<Tag color="blue">Admin Only</Tag>}>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="KYC Approval System">
                      <Space>
                        <Tag color={user.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{user.kycStatus}</Tag>
                        {user.kycStatus === 'PENDING' && (
                          <>
                            <Button type="primary" onClick={() => userApi.updateUser(user.id, { kycStatus: 'VERIFIED' }).then(fetchUser)}>Approve KYC</Button>
                            <Button danger onClick={() => userApi.updateUser(user.id, { kycStatus: 'REJECTED' }).then(fetchUser)}>Reject KYC</Button>
                          </>
                        )}
                        <Button type="link">View Documents</Button>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Manual Activation">
                      <Space>
                        <span>Current Status: <strong>{user.status}</strong></span>
                        {user.status !== 'ACTIVE' ? (
                          <Button type="primary" onClick={() => userApi.activateUser(user.id).then(fetchUser)}>Activate User (Paid Offline)</Button>
                        ) : (
                          <Button danger onClick={() => userApi.blockUser(user.id).then(fetchUser)}>Deactivate / Block</Button>
                        )}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="TDS & Tax Management">
                      <span>Accumulated TDS Deductions: <strong>{formatCurrency(user.tdsDeducted || 0)}</strong></span>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Performance Overrides */}
                <Card title="Performance Overrides" extra={<Tag color="red">Sensitive Actions</Tag>}>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Reward Claim Management">
                      <Space>
                        <span>Next Reward Target: 50 Lacs</span>
                        {/* Create dummy action */}
                        <Button onClick={() => alert('Reward Issued (Mock)')}>Mark Reward "Issued" (Scooty)</Button>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Manual Commission / Adjustment">
                      <Space>
                        <span>Distribute Project Specific Commission</span>
                        <Button onClick={() => setManualCommissionVisible(true)}>Manual Distribution</Button>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Space>
            ),
          }
        ]}
      />

      <ManualCommissionModal
        visible={manualCommissionVisible}
        onCancel={() => setManualCommissionVisible(false)}
        userId={Number(id)}
        onSuccess={fetchUser}
      />
    </div>
  );
};

export default UserDetail;
