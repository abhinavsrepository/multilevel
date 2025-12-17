import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './AuthLayout.scss';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <Outlet />
      </div>
      <div className="auth-footer">
        <p>&copy; 2024 MLM Real Estate Platform. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
