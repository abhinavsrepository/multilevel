#!/bin/bash

echo "Generating ALL module pages..."

# Create comprehensive page generation function
generate_list_page() {
    local module=$1
    local title=$2
    local api_method=$3
    
    cat > "src/pages/${module}/${title}List.tsx" << EOF
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ${module}Api } from '@/api/${module}Api';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { usePagination, useFilters } from '@/hooks';

const ${title}List: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { page, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    status: '',
  });

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ${module}Api.${api_method}({ page, size: pageSize, ...filters });
      if (response.data.success) {
        setData(response.data.data.content);
        setTotal(response.data.data.totalElements);
      }
    } catch (error: any) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>${title}</h1>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
            Add New
          </Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="PENDING">Pending</Select.Option>
          </Select>
          <Button onClick={resetFilters}>Reset</Button>
        </Space>

        <Table
          dataSource={data}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              handlePageChange(p - 1);
              handlePageSizeChange(ps);
            },
          }}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default ${title}List;
EOF
}

# Users Module
echo "Generating Users module..."
generate_list_page "user" "Users" "getUsers"

cat > src/pages/users/UserDetail.tsx << 'EOF'
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
        setUser(response.data.data);
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
          <Button onClick={() => navigate(\`/users/edit/\${id}\`)}>Edit</Button>
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
EOF

cat > src/pages/users/AddEditUser.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, message, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '@/api/userApi';
import type { User, CreateUserRequest } from '@/types/user.types';

const AddEditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await userApi.getUserById(Number(id));
      if (response.data.success) {
        form.setFieldsValue(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch user');
    }
  };

  const onFinish = async (values: CreateUserRequest) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        await userApi.updateUser(Number(id), values);
        message.success('User updated successfully');
      } else {
        await userApi.createUser(values);
        message.success('User created successfully');
      }
      navigate('/users');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit User' : 'Add User'}</h1>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {!isEdit && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item name="sponsorId" label="Sponsor ID">
            <Input />
          </Form.Item>

          <Form.Item name="placement" label="Placement">
            <Select>
              <Select.Option value="LEFT">Left</Select.Option>
              <Select.Option value="RIGHT">Right</Select.Option>
              <Select.Option value="AUTO">Auto</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate('/users')}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditUser;
EOF

cat > src/pages/users/GenealogyTree.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const GenealogyTree: React.FC = () => {
  return (
    <div>
      <h1>Genealogy Tree</h1>
      <Card>
        <p>Tree visualization will be implemented here with D3.js or ReactFlow</p>
      </Card>
    </div>
  );
};

export default GenealogyTree;
EOF

# Properties Module
echo "Generating Properties module..."
generate_list_page "property" "Properties" "getProperties"

cat > src/pages/properties/PropertyDetail.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const PropertyDetail: React.FC = () => {
  return (
    <div>
      <h1>Property Details</h1>
      <Card><p>Property details will be displayed here</p></Card>
    </div>
  );
};

export default PropertyDetail;
EOF

cat > src/pages/properties/AddEditProperty.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const AddEditProperty: React.FC = () => {
  return (
    <div>
      <h1>Add/Edit Property</h1>
      <Card><p>Property form will be here</p></Card>
    </div>
  );
};

export default AddEditProperty;
EOF

cat > src/pages/properties/PropertyInvestors.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const PropertyInvestors: React.FC = () => {
  return (
    <div>
      <h1>Property Investors</h1>
      <Card><p>Investors list will be displayed here</p></Card>
    </div>
  );
};

export default PropertyInvestors;
EOF

# Investments Module
echo "Generating Investments module..."
generate_list_page "investment" "Investments" "getInvestments"

cat > src/pages/investments/InvestmentDetail.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const InvestmentDetail: React.FC = () => {
  return (
    <div>
      <h1>Investment Details</h1>
      <Card><p>Investment details here</p></Card>
    </div>
  );
};

export default InvestmentDetail;
EOF

cat > src/pages/investments/PendingApprovals.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const PendingApprovals: React.FC = () => {
  return (
    <div>
      <h1>Pending Investment Approvals</h1>
      <Card><p>Pending investments list here</p></Card>
    </div>
  );
};

export default PendingApprovals;
EOF

# Commissions Module
echo "Generating Commissions module..."
generate_list_page "commission" "Commissions" "getCommissions"

cat > src/pages/commissions/CommissionDetail.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const CommissionDetail: React.FC = () => {
  return (
    <div>
      <h1>Commission Details</h1>
      <Card><p>Commission details here</p></Card>
    </div>
  );
};

export default CommissionDetail;
EOF

cat > src/pages/commissions/CommissionSettings.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const CommissionSettings: React.FC = () => {
  return (
    <div>
      <h1>Commission Settings</h1>
      <Card><p>Commission configuration here</p></Card>
    </div>
  );
};

export default CommissionSettings;
EOF

# Payouts Module
echo "Generating Payouts module..."

cat > src/pages/payouts/PendingPayouts.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const PendingPayouts: React.FC = () => {
  return (
    <div>
      <h1>Pending Payouts</h1>
      <Card><p>Pending payouts for approval</p></Card>
    </div>
  );
};

export default PendingPayouts;
EOF

cat > src/pages/payouts/AllPayouts.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const AllPayouts: React.FC = () => {
  return (
    <div>
      <h1>All Payouts</h1>
      <Card><p>All payouts history</p></Card>
    </div>
  );
};

export default AllPayouts;
EOF

cat > src/pages/payouts/PayoutDetail.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const PayoutDetail: React.FC = () => {
  return (
    <div>
      <h1>Payout Details</h1>
      <Card><p>Payout details here</p></Card>
    </div>
  );
};

export default PayoutDetail;
EOF

# KYC Module
echo "Generating KYC module..."

cat > src/pages/kyc/PendingKYC.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const PendingKYC: React.FC = () => {
  return (
    <div>
      <h1>Pending KYC Approvals</h1>
      <Card><p>Pending KYC documents</p></Card>
    </div>
  );
};

export default PendingKYC;
EOF

cat > src/pages/kyc/AllKYC.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const AllKYC: React.FC = () => {
  return (
    <div>
      <h1>All KYC Documents</h1>
      <Card><p>All KYC records</p></Card>
    </div>
  );
};

export default AllKYC;
EOF

# Notifications Module
echo "Generating Notifications module..."

cat > src/pages/notifications/SendBroadcast.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const SendBroadcast: React.FC = () => {
  return (
    <div>
      <h1>Send Broadcast Notification</h1>
      <Card><p>Broadcast notification form</p></Card>
    </div>
  );
};

export default SendBroadcast;
EOF

cat > src/pages/notifications/NotificationHistory.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const NotificationHistory: React.FC = () => {
  return (
    <div>
      <h1>Notification History</h1>
      <Card><p>All sent notifications</p></Card>
    </div>
  );
};

export default NotificationHistory;
EOF

# Support Module
echo "Generating Support module..."

cat > src/pages/support/TicketsList.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const TicketsList: React.FC = () => {
  return (
    <div>
      <h1>Support Tickets</h1>
      <Card><p>All support tickets</p></Card>
    </div>
  );
};

export default TicketsList;
EOF

cat > src/pages/support/TicketDetail.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const TicketDetail: React.FC = () => {
  return (
    <div>
      <h1>Ticket Details</h1>
      <Card><p>Ticket conversation</p></Card>
    </div>
  );
};

export default TicketDetail;
EOF

# Reports Module
echo "Generating Reports module..."

cat > src/pages/reports/ReportsDashboard.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const ReportsDashboard: React.FC = () => {
  return (
    <div>
      <h1>Reports Dashboard</h1>
      <Card><p>All available reports</p></Card>
    </div>
  );
};

export default ReportsDashboard;
EOF

# Ranks Module
echo "Generating Ranks module..."

cat > src/pages/ranks/RankSettings.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const RankSettings: React.FC = () => {
  return (
    <div>
      <h1>Rank Settings</h1>
      <Card><p>Configure ranks</p></Card>
    </div>
  );
};

export default RankSettings;
EOF

cat > src/pages/ranks/RankAchievements.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const RankAchievements: React.FC = () => {
  return (
    <div>
      <h1>Rank Achievements</h1>
      <Card><p>Users who achieved ranks</p></Card>
    </div>
  );
};

export default RankAchievements;
EOF

# Settings Module
echo "Generating Settings module..."

cat > src/pages/settings/GeneralSettings.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const GeneralSettings: React.FC = () => {
  return (
    <div>
      <h1>General Settings</h1>
      <Card><p>System configuration</p></Card>
    </div>
  );
};

export default GeneralSettings;
EOF

cat > src/pages/settings/AdminUsers.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const AdminUsers: React.FC = () => {
  return (
    <div>
      <h1>Admin Users</h1>
      <Card><p>Manage admin users</p></Card>
    </div>
  );
};

export default AdminUsers;
EOF

# Audit Module
echo "Generating Audit module..."

cat > src/pages/audit/AuditLogs.tsx << 'EOF'
import React from 'react';
import { Card } from 'antd';

const AuditLogs: React.FC = () => {
  return (
    <div>
      <h1>Audit Logs</h1>
      <Card><p>System audit trail</p></Card>
    </div>
  );
};

export default AuditLogs;
EOF

echo "All module pages created successfully!"

