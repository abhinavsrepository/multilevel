import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Tag,
  message,
  Space,
  Avatar,
  Typography
} from 'antd';
import { UserOutlined, TrophyOutlined } from '@ant-design/icons';
import { userApi } from '@/api/userApi';
import { rankApi, Rank } from '@/api/rankApi';
import { User } from '@/types/user.types';
import { formatDate } from '@/utils/helpers';

const { Option } = Select;
const { Text } = Typography;

const RankAchievements: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchRanks();
  }, [page, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({ page, limit: pageSize });
      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await rankApi.getAllRanks();
      if (response.data.success && response.data.data) {
        setRanks(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ranks');
    }
  };

  const handleAssignClick = (user: User) => {
    setSelectedUser(user);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedUser) {
        await rankApi.assignRank(selectedUser.id, values.rankId, values.notes);
        message.success(`Rank assigned to ${selectedUser.fullName} successfully`);
        setIsModalVisible(false);
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      message.error('Failed to assign rank');
    }
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.profilePicture} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.fullName}</Text>
            <br />
            <Text type="secondary">{record.userId}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Current Rank',
      dataIndex: 'rankName',
      key: 'rankName',
      render: (text: string) => (
        <Tag color="gold" icon={<TrophyOutlined />}>
          {text || 'Unranked'}
        </Tag>
      ),
    },
    {
      title: 'Achieved Date',
      dataIndex: 'rankAchievedDate',
      key: 'rankAchievedDate',
      render: (text: string) => (text ? formatDate(text) : '-'),
    },
    {
      title: 'Direct Referrals',
      dataIndex: 'directReferrals',
      key: 'directReferrals',
    },
    {
      title: 'Team Size',
      dataIndex: 'totalTeamSize',
      key: 'totalTeamSize',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleAssignClick(record)}
        >
          Assign Rank
        </Button>
      ),
    },
  ];

  return (
    <div className="rank-achievements">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>Rank Achievements</h1>
        <Text type="secondary">View user ranks and manually assign new ranks.</Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Modal
        title={`Assign Rank to ${selectedUser?.fullName}`}
        open={isModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rankId"
            label="Select Rank"
            rules={[{ required: true, message: 'Please select a rank' }]}
          >
            <Select placeholder="Select a rank">
              {ranks.map((rank) => (
                <Option key={rank.id} value={rank.id}>
                  {rank.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea rows={3} placeholder="Reason for manual assignment..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RankAchievements;
