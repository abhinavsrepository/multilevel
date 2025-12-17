import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Tag,
  message,
  Popconfirm,
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { rankApi, Rank } from '@/api/rankApi';
import { formatCurrency } from '@/utils/helpers';

const RankSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const response = await rankApi.getAllRanks();
      if (response.data.success && response.data.data) {
        setRanks(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch ranks');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRank(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank);
    form.setFieldsValue(rank);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await rankApi.deleteRank(id);
      message.success('Rank deleted successfully');
      fetchRanks();
    } catch (error) {
      message.error('Failed to delete rank');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRank) {
        await rankApi.updateRank(editingRank.id, values);
        message.success('Rank updated successfully');
      } else {
        await rankApi.createRank(values);
        message.success('Rank created successfully');
      }
      setIsModalVisible(false);
      fetchRanks();
    } catch (error) {
      message.error('Failed to save rank');
    }
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      sorter: (a: Rank, b: Rank) => a.displayOrder - b.displayOrder,
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Rank) => (
        <Tag color={record.color}>{text}</Tag>
      ),
    },
    {
      title: 'Requirements',
      key: 'requirements',
      render: (_: any, record: Rank) => (
        <Space direction="vertical" size="small">
          <span>Directs: {record.requiredDirectReferrals}</span>
          <span>Team Inv: {formatCurrency(record.requiredTeamInvestment)}</span>
          <span>Personal Inv: {formatCurrency(record.requiredPersonalInvestment)}</span>
        </Space>
      ),
    },
    {
      title: 'Bonuses',
      key: 'bonuses',
      render: (_: any, record: Rank) => (
        <Space direction="vertical" size="small">
          <span>One-time: {formatCurrency(record.oneTimeBonus)}</span>
          <span>Monthly: {formatCurrency(record.monthlyBonus)}</span>
          <span>Boost: {record.commissionBoost}%</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Rank) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this rank?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="rank-settings">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Rank Settings</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add New Rank
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={ranks}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingRank ? 'Edit Rank' : 'Add New Rank'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true, color: '#1890ff' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Rank Name"
              rules={[{ required: true, message: 'Please enter rank name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="displayOrder"
              label="Display Order"
              rules={[{ required: true, message: 'Please enter display order' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="color" label="Color (Hex)">
              <Input type="color" style={{ width: '100%', height: 32 }} />
            </Form.Item>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Card title="Requirements" size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Form.Item name="requiredDirectReferrals" label="Direct Referrals">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
              <Form.Item name="requiredTeamInvestment" label="Team Investment">
                <InputNumber style={{ width: '100%' }} min={0} prefix="₹" />
              </Form.Item>
              <Form.Item name="requiredPersonalInvestment" label="Personal Investment">
                <InputNumber style={{ width: '100%' }} min={0} prefix="₹" />
              </Form.Item>
            </div>
          </Card>

          <Card title="Benefits & Bonuses" size="small">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Form.Item name="oneTimeBonus" label="One-Time Bonus">
                <InputNumber style={{ width: '100%' }} min={0} prefix="₹" />
              </Form.Item>
              <Form.Item name="monthlyBonus" label="Monthly Bonus">
                <InputNumber style={{ width: '100%' }} min={0} prefix="₹" />
              </Form.Item>
              <Form.Item name="commissionBoost" label="Commission Boost (%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} suffix="%" />
              </Form.Item>
            </div>
            <Form.Item name="benefits" label="Benefits List">
              <Select mode="tags" placeholder="Type and press enter to add benefits" />
            </Form.Item>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default RankSettings;
