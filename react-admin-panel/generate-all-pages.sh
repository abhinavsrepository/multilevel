#!/bin/bash

echo "Creating all page directories..."
mkdir -p src/pages/{auth,dashboard,users,properties,investments,commissions,payouts,kyc,notifications,support,reports,ranks,settings,audit,analytics,monitoring,backup}
mkdir -p src/components/{common,charts,forms}

echo "Generating authentication pages..."

# Login Page
cat > src/pages/auth/Login.tsx << 'EOF'
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
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
EOF

cat > src/pages/auth/Login.scss << 'EOF'
.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;

  .login-header {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      margin-bottom: 8px;
    }
  }
}
EOF

# Forgot Password
cat > src/pages/auth/ForgotPassword.tsx << 'EOF'
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
EOF

# Two Factor Auth
cat > src/pages/auth/TwoFactorAuth.tsx << 'EOF'
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
EOF

echo "Authentication pages created!"

