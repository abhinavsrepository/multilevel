import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Modal, Form, Select, DatePicker, TimePicker, message, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { siteVisitApi } from '@/api';
import { SiteVisit } from '@/types/sitevisit.types';

const { Title } = Typography;
const { Option } = Select;

export const SiteVisits = () => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await siteVisitApi.getAll();
      setVisits(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch visits', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Client', dataIndex: 'clientName', key: 'clientName' },
    { title: 'Property', dataIndex: 'propertyTitle', key: 'propertyTitle' },
    {
      title: 'Visit Date',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date: string, record: SiteVisit) => `${dayjs(date).format('MMM D, YYYY')} at ${record.visitTime}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          SCHEDULED: 'blue',
          CONFIRMED: 'green',
          COMPLETED: 'purple',
          CANCELLED: 'red',
          RESCHEDULED: 'orange',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Site Visits</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Schedule Visit
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={visits} loading={loading} rowKey="id" />
      </Card>

      <Modal title="Schedule Site Visit" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical">
          <Form.Item name="clientId" label="Client" rules={[{ required: true }]}>
            <Select placeholder="Select client" showSearch />
          </Form.Item>
          <Form.Item name="propertyId" label="Property" rules={[{ required: true }]}>
            <Select placeholder="Select property" showSearch />
          </Form.Item>
          <Form.Item name="visitDate" label="Visit Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visitTime" label="Visit Time" rules={[{ required: true }]}>
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Schedule</Button>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
