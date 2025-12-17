import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Avatar, Row, Col, Typography, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateUser } from '@/redux/slices/authSlice';
import { authApi } from '@/api';

const { Title } = Typography;

export const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  const handleUpdate = async (values: any) => {
    try {
      setLoading(true);
      const response = await authApi.updateProfile(values);
      dispatch(updateUser(response.data));
      message.success('Profile updated successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>My Profile</Title>

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} src={user?.avatar} style={{ marginBottom: 16 }} />
              <Title level={4}>{user?.name}</Title>
              <p style={{ color: '#8c8c8c' }}>{user?.email}</p>
              <p style={{ color: '#8c8c8c' }}>{user?.role}</p>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Profile Information">
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input prefix={<MailOutlined />} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={['address', 'city']} label="City">
                    <Input prefix={<HomeOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Update Profile
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
