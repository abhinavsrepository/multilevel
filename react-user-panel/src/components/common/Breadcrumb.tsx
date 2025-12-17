import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box, useTheme } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator }) => {
  const location = useLocation();
  const theme = useTheme();

  // Auto-generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items && items.length > 0) {
      return items;
    }

    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map of path segments to readable labels
    const labelMap: { [key: string]: string } = {
      dashboard: 'Dashboard',
      properties: 'Properties',
      investments: 'My Investments',
      wallet: 'Wallet',
      transactions: 'Transactions',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      commissions: 'Commissions',
      team: 'Team',
      tree: 'Team Tree',
      members: 'Team Members',
      genealogy: 'Genealogy',
      rank: 'Rank',
      referral: 'Referral Tools',
      links: 'Referral Links',
      materials: 'Marketing Materials',
      kyc: 'KYC Verification',
      support: 'Support',
      tickets: 'My Tickets',
      create: 'Create Ticket',
      reports: 'Reports',
      notifications: 'Notifications',
      settings: 'Settings',
      profile: 'My Profile',
      security: 'Security',
      categories: 'Categories',
      residential: 'Residential',
      commercial: 'Commercial',
      luxury: 'Luxury',
    };

    return pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = labelMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

      return {
        label,
        path: index === pathnames.length - 1 ? undefined : path,
      };
    });
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Don't show breadcrumb on home page or if there are no items
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        py: 2,
        px: { xs: 2, sm: 3 },
        backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
      role="navigation"
      aria-label="breadcrumb"
    >
      <Breadcrumbs
        separator={separator || <NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8',
          },
        }}
      >
        {/* Home Link */}
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
            fontSize: '0.875rem',
            fontWeight: 500,
            '&:hover': {
              color: theme.palette.primary.main,
            },
            transition: 'color 0.2s',
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: '1.1rem' }} />
          Home
        </Link>

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) =>
          item.path ? (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              underline="hover"
              sx={{
                color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                transition: 'color 0.2s',
              }}
            >
              {item.label}
            </Link>
          ) : (
            <Typography
              key={index}
              sx={{
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {item.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
