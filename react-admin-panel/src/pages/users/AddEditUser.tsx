import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, message, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '@/api/userApi';
import type { CreateUserRequest } from '@/types/user.types';

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
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {!isEdit && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item name="sponsorCode" label="Sponsor Code">
            <Input placeholder="Optional" />
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
