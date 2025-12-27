import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Switch, Input } from 'antd';
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
const { Search } = Input;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const { unreadCount } = useSelector((state: RootState) => state.notification);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reorganized menu items for compact view
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users-menu',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        { key: '/users', label: 'All Users' },
        { key: '/users/add', label: 'Add User' },
        { key: '/registrations', label: 'Registrations' },
      ],
    },
    {
      key: 'properties-menu',
      icon: <HomeOutlined />,
      label: 'Property Management',
      children: [
        { key: '/properties', label: 'All Properties' },
        { key: '/properties/add', label: 'Add Property' },
        { key: '/bonanza', label: 'Bonanza Campaigns' },
      ],
    },
    {
      key: 'investments-menu',
      icon: <WalletOutlined />,
      label: 'Investment Management',
      children: [
        { key: '/investments', label: 'All Investments' },
        { key: '/investments/pending', label: 'Pending Approvals' },
      ],
    },
    {
      key: 'financial-menu',
      icon: <DollarOutlined />,
      label: 'Financial Management',
      children: [
        { key: '/commissions', label: 'Commissions' },
        { key: '/commissions/settings', label: 'Commission Settings' },
        { key: '/payouts/pending', label: 'Pending Payouts' },
        { key: '/payouts', label: 'All Payouts' },
        { key: '/deposits', label: 'Deposits' },
        { key: '/withdrawals', label: 'Withdrawals' },
        { key: '/epins', label: 'E-Pins' },
        { key: '/topup/new', label: 'New Topup' },
        { key: '/topup/history', label: 'Topup History' },
      ],
    },
    {
      key: 'incomes',
      icon: <RiseOutlined />,
      label: 'Income Details',
      children: [
        { key: '/incomes/summary', label: 'Income Summary' },
        { key: '/incomes/direct-bonus', label: 'Direct Bonus' },
        { key: '/incomes/level-bonus', label: 'Level Bonus' },
        { key: '/incomes/matching-bonus', label: 'Matching Bonus' },
        { key: '/incomes/roi-bonus', label: 'ROI Bonus' },
        { key: '/incomes/reward-status', label: 'Reward Status' },
      ],
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: 'Team Management',
      children: [
        { key: '/team/tree-view', label: 'Tree View' },
        { key: '/team/level-tree-view', label: 'Level Tree View' },
        { key: '/team/direct-referral', label: 'Direct Referrals' },
        { key: '/team/total-downline', label: 'Total Downline' },
        { key: '/team/level-downline', label: 'Level Downline' },
        { key: '/team/downline-business', label: 'Downline Business' },
        { key: '/ranks/settings', label: 'Rank Settings' },
        { key: '/ranks/achievements', label: 'Rank Achievements' },
      ],
    },
    {
      key: 'kyc-management',
      icon: <FileTextOutlined />,
      label: 'KYC Management',
      children: [
        { key: '/kyc/pending', label: 'Pending KYC' },
        { key: '/kyc', label: 'All KYC' },
      ],
    },
    {
      key: 'communications',
      icon: <BellOutlined />,
      label: 'Communications',
      children: [
        { key: '/notifications/send', label: 'Send Notification' },
        { key: '/notifications/history', label: 'Notification History' },
        { key: '/support', label: 'Support Tickets' },
      ],
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: 'System',
      children: [
        { key: '/settings/general', label: 'General Settings' },
        { key: '/settings/admins', label: 'Admin Users' },
        { key: '/settings/plan', label: 'Level Plan Settings' },
        { key: '/audit-logs', label: 'Audit Logs' },
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

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
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
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDark ? 'dark' : 'light'}
        width={250}
        className={`sidebar ${isMobile && mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="logo">
          {!collapsed && <span className="logo-text" style={{ color: '#10b981', fontWeight: 'bold' }}>Ecogram</span>}
          {collapsed && <span className="logo-icon" style={{ color: '#10b981', fontWeight: 'bold' }}>E</span>}
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout className={collapsed ? 'collapsed' : ''}>
        <Header className="site-layout-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: handleMenuToggle,
            })}
          </div>

          <div className="header-right">
            <Space size="large">
              <div style={{ width: 300, display: isMobile ? 'none' : 'block' }}>
                <Search
                  placeholder="Search users..."
                  allowClear
                  onSearch={(value) => {
                    if (value.trim()) navigate(`/users?search=${encodeURIComponent(value.trim())}`);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
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
