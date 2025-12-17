import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      await authApi.forgotPassword(values);
      setSubmitted(true);
      message.success('Password reset link sent to your email');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <Result
          status="success"
          title="Email Sent!"
          subTitle="Please check your email for password reset instructions."
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <Title level={2}>Forgot Password</Title>
        <Text type="secondary">Enter your email to reset your password</Text>
      </div>

      <Form name="forgot-password" onFinish={onFinish} size="large">
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Send Reset Link
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

export default ForgotPassword;
