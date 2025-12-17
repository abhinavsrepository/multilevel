import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/redux/slices/authSlice';
import { authApi } from '@/api/authApi';
import './Login.scss';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values: { email: string; password: string; remember: boolean }) => {
    try {
      setLoading(true);
      const response = await authApi.login(values.email, values.password);

      if (response.data.success) {
        const { token, refreshToken, user, requires2FA } = response.data.data;

        if (requires2FA) {
          localStorage.setItem('tempEmail', values.email);
          navigate('/2fa');
          return;
        }

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminRefreshToken', refreshToken);

        if (values.remember) {
          localStorage.setItem('rememberedEmail', values.email);
        }

        dispatch(login({ user, token }));
        message.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const bypassLogin = () => {
    const dummyUser = {
      id: 1,
      fullName: 'Admin User',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
    };
    const dummyToken = 'dummy-admin-token';

    localStorage.setItem('adminToken', dummyToken);
    localStorage.setItem('adminRefreshToken', dummyToken);

    dispatch(login({ user: dummyUser as any, token: dummyToken }));
    message.success('Bypass Login successful!');
    navigate('/dashboard');
  };

  return (
    <Card className="login-card" variant="borderless">
      <div className="login-header">
        <Title level={2}>Admin Panel</Title>
        <Text type="secondary">MLM Real Estate Platform</Text>
      </div>

      <Form
        name="login"
        initialValues={{ remember: true, email: localStorage.getItem('rememberedEmail') || '' }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a href="/forgot-password">Forgot password</a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
          <Button
            type="default"
            onClick={bypassLogin}
            block
            style={{ marginTop: '10px', backgroundColor: '#f0f2f5' }}
          >
            Bypass Login (Dev Only)
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
