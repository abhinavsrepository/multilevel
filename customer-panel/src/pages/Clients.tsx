import { useEffect, useState } from 'react';
import { Table, Button, Card, Input, Select, Tag, Space, Modal, Form, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '@/api';
import { Client, CreateClientInput } from '@/types/client.types';

const { Title } = Typography;
const { Option } = Select;

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [leadStatus, setLeadStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [leadStatus]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getAll({ search: searchText, leadStatus });
      setClients(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch clients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (values: CreateClientInput) => {
    try {
      await clientApi.create(values);
      message.success('Client added successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchClients();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to add client');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Lead Status',
      dataIndex: 'leadStatus',
      key: 'leadStatus',
      render: (status: string) => {
        const colors: any = { NEW: 'blue', WARM: 'orange', HOT: 'red', CONVERTED: 'green', LOST: 'gray' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    { title: 'Budget', dataIndex: 'budget', key: 'budget', render: (val: number) => `$${val?.toLocaleString() || 0}` },
    { title: 'Location', dataIndex: 'preferredLocation', key: 'location' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Client) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/clients/${record.id}`)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Client Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Client
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search clients..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchClients}
            style={{ width: 300 }}
          />
          <Select placeholder="Lead Status" value={leadStatus} onChange={setLeadStatus} style={{ width: 150 }} allowClear>
            <Option value="NEW">New</Option>
            <Option value="WARM">Warm</Option>
            <Option value="HOT">Hot</Option>
            <Option value="CONVERTED">Converted</Option>
            <Option value="LOST">Lost</Option>
          </Select>
          <Button type="primary" onClick={fetchClients}>Search</Button>
        </Space>

        <Table columns={columns} dataSource={clients} loading={loading} rowKey="id" />
      </Card>

      <Modal
        title="Add New Client"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddClient}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="budget" label="Budget">
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item name="preferredLocation" label="Preferred Location">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Add Client</Button>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
