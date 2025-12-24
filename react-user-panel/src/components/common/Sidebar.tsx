import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Collapse,
  Divider,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Home,
  Apartment,
  AccountBalance,
  Paid,
  Groups,
  EmojiEvents,
  Share,
  VerifiedUser,
  Support,
  Assessment,
  Notifications,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  AttachMoney,
  TrendingUp,
  Group,
  CardGiftcard,
  MonetizationOn,
  ShowChart,
  CompareArrows,
  Stars,
  AccountTree,
  Diversity3,
  PersonAdd,
  GroupWork,
  Business,
} from '@mui/icons-material';
import {
  FaBuilding,
  FaWallet,
  FaChartLine,
  FaUsers,
  FaTrophy,
  FaShare,
  FaIdCard,
  FaHeadset,
  FaFileAlt,
  FaBell,
  FaCog,
} from 'react-icons/fa';
import { selectSidebarCollapsed, setSidebarCollapsed } from '../../redux/slices/themeSlice';
import { selectUser } from '../../redux/slices/authSlice';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const collapsed = useSelector(selectSidebarCollapsed);
  const user = useSelector(selectUser);

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const drawerWidth = collapsed ? 70 : 260;
  const mobileSidebarOpen = !collapsed;

  // Navigation menu items - Reorganized for compact view
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      id: 'properties-investments',
      label: 'Properties & Investments',
      icon: <Apartment />,
      path: '/properties',
      children: [
        {
          id: 'all-properties',
          label: 'Browse Properties',
          icon: <Home />,
          path: '/properties',
        },
        {
          id: 'my-investments',
          label: 'My Investments',
          icon: <TrendingUp />,
          path: '/investments',
        },
        {
          id: 'bonanza',
          label: 'Campaigns & Bonanza',
          icon: <EmojiEvents />,
          path: '/bonanza',
        },
      ],
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: <AccountBalance />,
      path: '/wallet',
      children: [
        {
          id: 'wallet-overview',
          label: 'Wallet Overview',
          icon: <FaWallet />,
          path: '/wallet',
        },
        {
          id: 'wallet-transactions',
          label: 'Transactions',
          icon: <Assessment />,
          path: '/wallet/transactions',
        },
        {
          id: 'wallet-deposit',
          label: 'Deposit Funds',
          icon: <AttachMoney />,
          path: '/wallet/deposit',
        },
        {
          id: 'wallet-withdraw',
          label: 'Withdraw Funds',
          icon: <Paid />,
          path: '/wallet/withdraw',
        },
        {
          id: 'commissions',
          label: 'Commissions',
          icon: <MonetizationOn />,
          path: '/commissions',
        },
        {
          id: 'topup-new',
          label: 'New Topup',
          icon: <AttachMoney />,
          path: '/topup',
        },
        {
          id: 'topup-history',
          label: 'Topup History',
          icon: <Assessment />,
          path: '/topup/history',
        },
      ],
    },
    {
      id: 'incomes',
      label: 'Income Details',
      icon: <TrendingUp />,
      path: '/incomes',
      children: [
        {
          id: 'income-summary',
          label: 'Income Summary',
          icon: <Assessment />,
          path: '/incomes/summary',
        },
        {
          id: 'direct-bonus',
          label: 'Direct Bonus',
          icon: <MonetizationOn />,
          path: '/incomes/direct-bonus',
        },
        {
          id: 'level-bonus',
          label: 'Level Bonus',
          icon: <ShowChart />,
          path: '/incomes/level-bonus',
        },
        {
          id: 'matching-bonus',
          label: 'Matching Bonus',
          icon: <CompareArrows />,
          path: '/incomes/matching-bonus',
        },
        {
          id: 'roi-bonus',
          label: 'ROI Bonus',
          icon: <TrendingUp />,
          path: '/incomes/roi-bonus',
        },
        {
          id: 'reward-status',
          label: 'Reward Status',
          icon: <Stars />,
          path: '/incomes/reward-status',
        },
      ],
    },
    {
      id: 'team-network',
      label: 'Team & Network',
      icon: <Groups />,
      path: '/team',
      children: [
        {
          id: 'tree-view',
          label: 'Tree View',
          icon: <AccountTree />,
          path: '/team/tree-view',
        },
        {
          id: 'level-tree-view',
          label: 'Level Tree View',
          icon: <Diversity3 />,
          path: '/team/level-tree-view',
        },
        {
          id: 'direct-referral',
          label: 'Direct Referrals',
          icon: <PersonAdd />,
          path: '/team/direct-referral',
        },
        {
          id: 'total-downline',
          label: 'Total Downline',
          icon: <FaUsers />,
          path: '/team/total-downline',
        },
        {
          id: 'level-downline',
          label: 'Level Downline',
          icon: <GroupWork />,
          path: '/team/level-downline',
        },
        {
          id: 'downline-business',
          label: 'Downline Business',
          icon: <Business />,
          path: '/team/downline-business',
        },
        {
          id: 'rank',
          label: 'My Rank',
          icon: <EmojiEvents />,
          path: '/rank',
        },
      ],
    },
    {
      id: 'referral',
      label: 'Referral Tools',
      icon: <Share />,
      path: '/referral',
      children: [
        {
          id: 'referral-registration',
          label: 'Direct Registration',
          icon: <PersonAdd />,
          path: '/referral/registration',
        },
        {
          id: 'my-referrals',
          label: 'My Referrals',
          icon: <Group />,
          path: '/referral/my-referrals',
        },
        {
          id: 'referral-links',
          label: 'Referral Links',
          icon: <FaShare />,
          path: '/referral-tools',
        },
        {
          id: 'referral-materials',
          label: 'Marketing Materials',
          icon: <CardGiftcard />,
          path: '/referral/materials',
        },
      ],
    },
    {
      id: 'account-support',
      label: 'Account & Support',
      icon: <Support />,
      path: '/support',
      children: [
        {
          id: 'kyc',
          label: 'KYC Verification',
          icon: <VerifiedUser />,
          path: '/kyc',
        },
        {
          id: 'support-tickets',
          label: 'My Tickets',
          icon: <FaHeadset />,
          path: '/support/tickets',
        },
        {
          id: 'support-create',
          label: 'Create Ticket',
          icon: <FaFileAlt />,
          path: '/support/create',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Notifications />,
          path: '/notifications',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings />,
          path: '/settings',
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <Assessment />,
      path: '/reports',
    },
  ];

  const handleToggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(setSidebarCollapsed(true));
    }
  };

  const handleToggleSidebar = () => {
    dispatch(setSidebarCollapsed(!collapsed));
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={collapsed ? item.label : ''} placement="right">
            <ListItemButton
              onClick={() => {
                if (hasChildren) {
                  handleToggleMenu(item.id);
                } else {
                  handleNavigate(item.path);
                }
              }}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: collapsed ? 1.5 : level === 0 ? 2.5 : 3.5,
                py: 1.2,
                mx: collapsed ? 1 : 1.5,
                my: 0.3,
                borderRadius: 2,
                backgroundColor: active
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(99, 102, 241, 0.1)'
                  : 'transparent',
                color: active
                  ? theme.palette.primary.main
                  : theme.palette.mode === 'dark'
                    ? '#cbd5e1'
                    : '#475569',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.08)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: level === 0 ? '0.9rem' : '0.85rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color="error"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {hasChildren &&
                    (isExpanded ? (
                      <ExpandLess sx={{ fontSize: '1.2rem' }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: '1.2rem' }} />
                    ))}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Submenu */}
        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Logo and Toggle */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              RE
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
                  lineHeight: 1.2,
                }}
              >
                RealEstate
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                  fontSize: '0.7rem',
                }}
              >
                MLM Platform
              </Typography>
            </Box>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleToggleSidebar}
            size="small"
            sx={{
              color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b',
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              },
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* User Info (when not collapsed) */}
      {!collapsed && user && (
        <Box
          sx={{
            p: 2,
            mx: 1.5,
            my: 1,
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user.profilePicture}
              alt={user.fullName}
              sx={{
                width: 44,
                height: 44,
                bgcolor: theme.palette.primary.main,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {user.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.fullName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                  display: 'block',
                }}
              >
                {user.rank}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 0.5,
          py: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'dark' ? '#475569' : '#94a3b8',
          },
        }}
      >
        {menuItems.map((item) => renderMenuItem(item))}
      </List>

      {/* Footer */}
      {!collapsed && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
            }}
          >
            v1.0.0 &copy; 2024
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileSidebarOpen}
          onClose={handleToggleSidebar}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
