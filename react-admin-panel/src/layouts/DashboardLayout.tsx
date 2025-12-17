import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Switch } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  WalletOutlined,
  DollarOutlined,
  FileTextOutlined,
  BellOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AuditOutlined,
  TrophyOutlined,
  RiseOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { RootState } from '@/redux/store';
import './DashboardLayout.scss';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const { unreadCount } = useSelector((state: RootState) => state.notification);

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users-menu',
      icon: <UserOutlined />,
      label: 'Users',
      children: [
        { key: '/users', label: 'All Users' },
        { key: '/users/add', label: 'Add User' },
      ],
    },
    {
      key: '/registrations',
      icon: <UserAddOutlined />,
      label: 'Registrations',
    },
    {
      key: 'properties-menu',
      icon: <HomeOutlined />,
      label: 'Properties',
      children: [
        { key: '/properties', label: 'All Properties' },
        { key: '/properties/add', label: 'Add Property' },
      ],
    },
    {
      key: 'investments-menu',
      icon: <WalletOutlined />,
      label: 'Investments',
      children: [
        { key: '/investments', label: 'All Investments' },
        { key: '/investments/pending', label: 'Pending Approvals' },
      ],
    },
    {
      key: 'commissions-menu',
      icon: <DollarOutlined />,
      label: 'Commissions',
      children: [
        { key: '/commissions', label: 'All Commissions' },
        { key: '/commissions/settings', label: 'Settings' },
      ],
    },
    {
      key: 'incomes',
      icon: <RiseOutlined />,
      label: 'Incomes Detail',
      children: [
        { key: '/incomes/direct-bonus', label: 'Direct Bonus' },
        { key: '/incomes/level-bonus', label: 'Level Bonus' },
        { key: '/incomes/matching-bonus', label: 'Matching Bonus' },
        { key: '/incomes/roi-bonus', label: 'ROI Bonus' },
        { key: '/incomes/reward-status', label: 'Reward Status' },
        { key: '/incomes/summary', label: 'Income Summary' },
      ],
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: 'Team Detail',
      children: [
        { key: '/team/tree-view', label: 'Tree View' },
        { key: '/team/level-tree-view', label: 'Team Level Tree View' },
        { key: '/team/direct-referral', label: 'Direct Referral' },
        { key: '/team/total-downline', label: 'Total Downline' },
        { key: '/team/level-downline', label: 'Team Level Downline' },
        { key: '/team/downline-business', label: 'Downline Business' },
      ],
    },
    {
      key: 'payouts-menu',
      icon: <DollarOutlined />,
      label: 'Payouts',
      children: [
        { key: '/payouts/pending', label: 'Pending Payouts' },
        { key: '/payouts', label: 'All Payouts' },
      ],
    },
    {
      key: '/deposits',
      icon: <WalletOutlined />,
      label: 'Deposits',
    },
    {
      key: '/withdrawals',
      icon: <DollarOutlined />,
      label: 'Withdrawals',
    },
    {
      key: '/epins',
      icon: <FileTextOutlined />,
      label: 'E-Pins',
    },
    {
      key: '/bonanza',
      icon: <TrophyOutlined />,
      label: 'Bonanza Campaigns',
    },
    {
      key: 'topup-menu',
      icon: <DollarOutlined />,
      label: 'New Topup',
      children: [
        { key: '/topup/new', label: 'New Topup' },
        { key: '/topup/history', label: 'Topup Detail' },
      ],
    },
    {
      key: 'kyc-management',
      icon: <FileTextOutlined />,
      label: 'KYC',
      children: [
        { key: '/kyc/pending', label: 'Pending KYC' },
        { key: '/kyc', label: 'All KYC' },
      ],
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
      children: [
        { key: '/notifications/send', label: 'Send Broadcast' },
        { key: '/notifications/history', label: 'History' },
      ],
    },
    {
      key: '/support',
      icon: <MessageOutlined />,
      label: 'Support',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/ranks',
      icon: <TrophyOutlined />,
      label: 'Ranks',
      children: [
        { key: '/ranks/settings', label: 'Rank Settings' },
        { key: '/ranks/achievements', label: 'Achievements' },
      ],
    },
    {
      key: '/audit-logs',
      icon: <AuditOutlined />,
      label: 'Audit Logs',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        { key: '/settings/general', label: 'General' },
        { key: '/settings/admins', label: 'Admin Users' },
        { key: '/settings/plan', label: 'Level Plan Settings' },
      ],
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        onClick: () => navigate('/settings'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const getSelectedKey = () => {
    const path = location.pathname;

    // Check for exact matches first
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        for (const child of item.children) {
          if (child && 'key' in child && path === child.key) {
            return [child.key as string];
          }
        }
      } else if (item && 'key' in item && path === item.key) {
        return [item.key as string];
      }
    }

    // Fallback to path-based matching
    if (path.startsWith('/users')) return ['/users'];
    if (path.startsWith('/registrations')) return ['/registrations'];
    if (path.startsWith('/properties')) return ['/properties'];
    if (path.startsWith('/investments')) return ['/investments'];
    if (path.startsWith('/commissions')) return ['/commissions'];
    if (path.startsWith('/incomes')) return [path];
    if (path.startsWith('/team')) return [path];
    if (path.startsWith('/payouts')) return ['/payouts'];
    if (path.startsWith('/kyc')) return ['/kyc'];
    if (path.startsWith('/notifications')) return ['/notifications'];
    if (path.startsWith('/support')) return ['/support'];
    if (path.startsWith('/reports')) return ['/reports'];
    if (path.startsWith('/ranks')) return ['/ranks'];
    if (path.startsWith('/settings')) return ['/settings'];
    if (path.startsWith('/audit-logs')) return ['/audit-logs'];

    return ['/dashboard'];
  };

  return (
    <Layout className={`dashboard-layout ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDark ? 'dark' : 'light'}
        width={250}
        className="sidebar"
      >
        <div className="logo">
          {!collapsed && <span className="logo-text">MLM Admin</span>}
          {collapsed && <span className="logo-icon">M</span>}
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout className={collapsed ? 'collapsed' : ''}>
        <Header className="site-layout-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>

          <div className="header-right">
            <Space size="large">
              <Switch
                checkedChildren="🌙"
                unCheckedChildren="☀️"
                checked={isDark}
                onChange={() => dispatch(toggleTheme())}
              />

              <Badge count={unreadCount} overflowCount={99}>
                <BellOutlined className="header-icon" onClick={() => navigate('/notifications')} />
              </Badge>

              <Dropdown menu={userMenu} placement="bottomRight">
                <Space className="user-info">
                  <Avatar src={user?.profilePicture} icon={<UserOutlined />} />
                  <span className="user-name">{user?.fullName}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className="site-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
