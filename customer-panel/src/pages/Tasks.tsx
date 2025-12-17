import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Modal, Form, Input, Select, DatePicker, message, Typography, Space } from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { taskApi } from '@/api';
import { Task, CreateTaskInput } from '@/types/task.types';

const { Title } = Typography;
const { Option } = Select;

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAll();
      setTasks(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (values: any) => {
    try {
      await taskApi.create({ ...values, dueDate: values.dueDate.toISOString() });
      message.success('Task created successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      await taskApi.updateStatus(id, 'COMPLETED');
      message.success('Task marked as completed');
      fetchTasks();
    } catch (error) {
      message.error('Failed to update task');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: any = { LOW: 'blue', MEDIUM: 'orange', HIGH: 'red', URGENT: 'purple' };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = { PENDING: 'orange', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'gray' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Task) => (
        record.status !== 'COMPLETED' && (
          <Button icon={<CheckOutlined />} size="small" onClick={() => handleCompleteTask(record.id)}>
            Complete
          </Button>
        )
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Tasks & Reminders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Create Task
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={tasks} loading={loading} rowKey="id" />
      </Card>

      <Modal title="Create New Task" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleAddTask}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
            <Select>
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
              <Option value="URGENT">Urgent</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Create</Button>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
