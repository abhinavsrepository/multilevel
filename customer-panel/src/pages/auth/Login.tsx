import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Radio, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { authApi } from '@/api';
import { LoginCredentials } from '@/types/auth.types';

const { Title, Text } = Typography;

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'ASSOCIATE' | 'CUSTOMER'>('ASSOCIATE');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();

  // Auto-fill credentials based on user type for demo purposes
  useEffect(() => {
    if (userType === 'ASSOCIATE') {
      form.setFieldsValue({
        email: 'userpanel@test.com',
        password: 'UserPanel@123'
      });
    } else {
      form.setFieldsValue({
        email: 'customer@test.com',
        password: 'Customer@123'
      });
    }
  }, [userType, form]);

  const onFinish = async (values: LoginCredentials) => {
    try {
      setLoading(true);
      dispatch(loginStart());

      const response = await authApi.login(values);
      const { token, user } = response.data.data;

      if (user.role !== userType) {
        message.error(`This account is not registered as ${userType}. Please select the correct user type.`);
        dispatch(loginFailure('Invalid user type'));
        setLoading(false);
        return;
      }

      dispatch(loginSuccess({ user, token }));
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch(loginFailure(errorMessage));
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card variant="outlined" style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Real Estate Portal</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>I am a:</Text>
          <Radio.Group value={userType} onChange={(e) => setUserType(e.target.value)} style={{ width: '100%' }}>
            <Radio.Button value="ASSOCIATE" style={{ width: '50%', textAlign: 'center' }}>Associate</Radio.Button>
            <Radio.Button value="CUSTOMER" style={{ width: '50%', textAlign: 'center' }}>Customer</Radio.Button>
          </Radio.Group>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{
            email: 'userpanel@test.com',
            password: 'UserPanel@123'
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
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
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate('/auth/forgot-password')}>
              Forgot password?
            </Button>
            <span style={{ margin: '0 8px' }}>•</span>
            <Button type="link" onClick={() => navigate('/auth/register')}>
              Register now
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
