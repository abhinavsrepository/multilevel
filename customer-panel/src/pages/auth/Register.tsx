import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Radio, App } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { authApi } from '@/api';
import { RegisterInput } from '@/types/auth.types';

const { Title, Text } = Typography;

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'ASSOCIATE' | 'CUSTOMER'>('CUSTOMER');
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values: RegisterInput) => {
    try {
      setLoading(true);
      // Transform field names to match backend expectations
      const registerData = {
        fullName: values.name,
        email: values.email,
        mobile: values.phone,
        password: values.password,
        role: userType,
        companyName: values.companyName,
      };
      const response = await authApi.register(registerData as any);
      message.success('Registration successful! Please login.');
      navigate('/auth/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '20px 0' }}>
      <Card bordered={false} variant="outlined" style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Create Account</Title>
          <Text type="secondary">Join our real estate platform</Text>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Register as:</Text>
          <Radio.Group value={userType} onChange={(e) => setUserType(e.target.value)} style={{ width: '100%' }}>
            <Radio.Button value="CUSTOMER" style={{ width: '50%', textAlign: 'center' }}>Customer</Radio.Button>
            <Radio.Button value="ASSOCIATE" style={{ width: '50%', textAlign: 'center' }}>Associate</Radio.Button>
          </Radio.Group>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" maxLength={10} />
          </Form.Item>

          {userType === 'ASSOCIATE' && (
            <Form.Item
              name="companyName"
              rules={[{ required: true, message: 'Please input your company name!' }]}
            >
              <Input prefix={<BankOutlined />} placeholder="Company Name" />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>Already have an account? </Text>
            <Button type="link" onClick={() => navigate('/auth/login')}>
              Sign In
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
