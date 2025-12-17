import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/redux/slices/authSlice';
import { authApi } from '@/api/authApi';

const { Title, Text } = Typography;

const TwoFactorAuth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values: { otp: string }) => {
    try {
      setLoading(true);
      const email = localStorage.getItem('tempEmail') || '';
      const response = await authApi.verify2FA({ email, otp: values.otp });

      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminRefreshToken', refreshToken);
        localStorage.removeItem('tempEmail');
        dispatch(login({ user, token }));
        message.success('Verification successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <Title level={2}>Two-Factor Authentication</Title>
        <Text type="secondary">Enter the 6-digit code sent to your email</Text>
      </div>

      <Form name="2fa" onFinish={onFinish} size="large">
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: 'Please input the verification code!' },
            { len: 6, message: 'Code must be 6 digits!' },
          ]}
        >
          <Input
            prefix={<SafetyOutlined />}
            placeholder="Enter 6-digit code"
            maxLength={6}
            style={{ letterSpacing: '0.5em', fontSize: '20px', textAlign: 'center' }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Verify
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => navigate('/login')} block>
            Back to Login
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TwoFactorAuth;
