import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Home,
  AccountBalanceWallet,
  TrendingUp,
  AccountTree,
  MonetizationOn,
  Person,
  Description,
  Support,
  Article,
  Settings,
  EmojiEvents,
  VerifiedUser,
} from '@mui/icons-material';
import { useAppSelector } from '../../store';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Menu items
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
    },
    {
      title: 'Properties',
      path: '/properties',
      icon: <Home />,
    },
    {
      title: 'My Investments',
      path: '/my-investments',
      icon: <TrendingUp />,
    },
    {
      title: 'Genealogy',
      path: '/genealogy',
      icon: <AccountTree />,
    },
    {
      title: 'Commission',
      path: '/commission',
      icon: <MonetizationOn />,
    },
    {
      title: 'Wallet',
      path: '/wallet',
      icon: <AccountBalanceWallet />,
    },
    {
      title: 'Payout',
      path: '/payout',
      icon: <AccountBalanceWallet />,
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: <Person />,
    },
    {
      title: 'KYC',
      path: '/kyc',
      icon: <VerifiedUser />,
      badge: user?.kycStatus === 'NOT_SUBMITTED' ? 1 : undefined,
    },
    {
      title: 'Support',
      path: '/support',
      icon: <Support />,
    },
  ];

  // Check if route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  // Get KYC status color
  const getKycStatusColor = () => {
    switch (user?.kycStatus) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Spacer for AppBar */}
      <Box sx={{ height: 64 }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'white' : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="error"
                  sx={{ height: 20, minWidth: 20 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* User Info Section */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'primary.light',
              transform: 'translateY(-2px)',
            },
          }}
          onClick={() => handleNavigate('/profile')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                mr: 1.5,
              }}
            >
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                noWrap
                sx={{ color: 'primary.dark' }}
              >
                {user?.fullName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                ID: {user?.referralCode || 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={user?.kycStatus === 'APPROVED' ? 'Verified' : 'Not Verified'}
              size="small"
              color={getKycStatusColor() as any}
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Quick Stats
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Team
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                24
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Earning
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                ₹45K
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Rank
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                Silver
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* App Version */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
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
