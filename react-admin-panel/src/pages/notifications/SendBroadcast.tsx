import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { notificationApi } from '@/api/notificationApi';

const { Option } = Select;
const { TextArea } = Input;

const SendBroadcast: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        userId: values.targetType === 'ALL' ? 'ALL' : Number(values.userId),
        title: values.title,
        message: values.message,
        type: 'GENERAL',
      };

      const response = await notificationApi.sendNotification(payload as any);
      if (response.data.success) {
        message.success('Notification sent successfully');
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      message.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Send Broadcast Notification">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ targetType: 'ALL' }}
      >
        <Form.Item name="targetType" label="Target Audience">
          <Select onChange={(value) => setTargetType(value)}>
            <Option value="ALL">All Users</Option>
            <Option value="SPECIFIC">Specific User</Option>
          </Select>
        </Form.Item>

        {targetType === 'SPECIFIC' && (
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: 'Please enter User ID' }]}
          >
            <Input type="number" placeholder="Enter User ID" />
          </Form.Item>
        )}

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="Notification Title" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: 'Please enter message' }]}
        >
          <TextArea rows={4} placeholder="Notification Message" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
            Send Notification
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SendBroadcast;
