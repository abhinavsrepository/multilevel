import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  useTheme,
  Alert,
  Skeleton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '@/api/user.api';
import { DashboardData } from '@/types';

import StatsCard from '@/components/common/StatsCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import {
  AccountBalanceWallet,
  TrendingUp,
  People,
  Home,
  CalendarToday,
  EmojiEvents,
  ContentCopy,
  Refresh,
  AddCircle,
  AccountBalance,
  SwapHoriz,
  Person,
  Notifications,
  Assessment,
  Settings,
  Support,
  ChevronRight,
  CheckCircle,
  Circle,
  Error as ErrorIcon,
  Announcement,
} from '@mui/icons-material';
import { useAppSelector } from '@/redux/store';
import { selectUser } from '@/redux/slices/authSlice';

/**
 * Dashboard Page Component
 *
 * Complete dashboard with:
 * - Welcome section with user info
 * - 8 stats cards (Investment, Earnings, Balance, Team, Properties, Today's Income, Rank, Referral Code)
 * - 4 charts (Earnings Trend Line, Commission Breakdown Pie, Portfolio Donut, Team Growth Bar)
 * - Quick Actions panel (6 action cards)
 * - Recent Activities feed
 * - Announcements carousel
 *
 * Features:
 * - Redux integration
 * - API integration
 * - Loading states
 * - Error handling
 * - Fully responsive
 * - Dark mode support
 * - TypeScript typed
 * - Production-ready
 */
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Copy referral code
  const handleCopyReferralCode = () => {
    if (dashboardData?.stats.referralCode) {
      navigator.clipboard.writeText(dashboardData.stats.referralCode);
      // Show success notification (you can use a toast library)
    }
  };

  // Quick action handlers
  const quickActions = [
    {
      title: 'New Investment',
      icon: <AddCircle sx={{ fontSize: 32 }} />,
      color: 'primary',
      action: () => navigate('/properties'),
    },
    {
      title: 'Withdraw Funds',
      icon: <AccountBalance sx={{ fontSize: 32 }} />,
      color: 'success',
      action: () => navigate('/wallet/withdrawal'),
    },
    {
      title: 'Transfer',
      icon: <SwapHoriz sx={{ fontSize: 32 }} />,
      color: 'info',
      action: () => navigate('/wallet/transfer'),
    },
    {
      title: 'View Team',
      icon: <People sx={{ fontSize: 32 }} />,
      color: 'secondary',
      action: () => navigate('/team'),
    },
    {
      title: 'Reports',
      icon: <Assessment sx={{ fontSize: 32 }} />,
      color: 'warning',
      action: () => navigate('/reports'),
    },
    {
      title: 'Support',
      icon: <Support sx={{ fontSize: 32 }} />,
      color: 'error',
      action: () => navigate('/support'),
    },
    {
      title: 'Notifications',
      icon: <Notifications sx={{ fontSize: 32 }} />,
      color: 'primary',
      action: () => navigate('/notifications'),
    },
  ];

  // Activity icon mapping
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'NEW_MEMBER':
        return <Person sx={{ color: 'primary.main' }} />;
      case 'COMMISSION':
        return <TrendingUp sx={{ color: 'success.main' }} />;
      case 'INVESTMENT':
        return <Home sx={{ color: 'info.main' }} />;
      case 'PAYOUT':
        return <AccountBalance sx={{ color: 'warning.main' }} />;
      case 'RANK_UPGRADE':
        return <EmojiEvents sx={{ color: 'secondary.main' }} />;
      case 'PROPERTY_LAUNCH':
        return <Home sx={{ color: 'primary.main' }} />;
      case 'INSTALLMENT_PAID':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      default:
        return <Circle sx={{ color: 'text.secondary' }} />;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, charts, recentActivities, announcements } = dashboardData;

  if (!stats) {
    return (
      <>
        <Alert severity="warning">Dashboard data is incomplete.</Alert>
      </>
    );
  }

  return (
    <>
      <Box>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: '#fff',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user?.profilePicture}
                    alt={user?.fullName}
                    sx={{
                      width: { xs: 70, sm: 90 },
                      height: { xs: 70, sm: 90 },
                      border: '4px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome back, {user?.fullName?.split(' ')[0]}!
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      User ID: {user?.userId}
                    </Typography>
                    <Chip
                      icon={<EmojiEvents />}
                      label={stats.currentRank}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <Refresh className={refreshing ? 'rotating' : ''} />
                  </IconButton>
                </Grid>
              </Grid>

              {/* Rank Progress */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Next Rank Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.nextRankProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.nextRankProgress}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#fff',
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)',
              }}
            />
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Investment"
              value={stats.totalInvestment}
              prefix="₹"
              decimals={2}
              icon={<AccountBalanceWallet />}
              color="primary"
              trend={{ value: 12.5, isPositive: true, label: 'vs last month' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Earnings"
              value={stats.totalEarnings}
              prefix="₹"
              decimals={2}
              icon={<TrendingUp />}
              color="success"
              trend={{ value: 8.2, isPositive: true, label: 'vs last month' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Available Balance"
              value={stats.availableBalance}
              prefix="₹"
              decimals={2}
              icon={<AccountBalance />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Team Size"
              value={stats.teamSize}
              icon={<People />}
              color="secondary"
              trend={{ value: 15, isPositive: true, label: 'new members' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Properties"
              value={stats.activeProperties}
              icon={<Home />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Today's Income"
              value={stats.todayIncome}
              prefix="₹"
              decimals={2}
              icon={<CalendarToday />}
              color="success"
              gradient
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Current Rank"
              value={stats.currentRank}
              icon={<EmojiEvents />}
              color="primary"
              gradient
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.mode === 'dark' ? '#1e293b' : '#fff',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Referral Code
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ flex: 1, fontFamily: 'monospace' }}
                  >
                    {stats.referralCode}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleCopyReferralCode}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: '#fff',
                      '&:hover': { bgcolor: theme.palette.primary.dark },
                    }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Share this code to invite new members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Earnings Trend Line Chart */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Earnings Trend
              </Typography>
              <LineChart
                data={charts.earningsTrend.map((item) => ({
                  name: item.date,
                  'Total Earnings': item.totalEarnings,
                  Commission: item.commission,
                  ROI: item.roi,
                }))}
                xAxisKey="name"
                lines={[
                  { dataKey: 'Total Earnings', stroke: theme.palette.primary.main },
                  { dataKey: 'Commission', stroke: theme.palette.success.main },
                  { dataKey: 'ROI', stroke: theme.palette.info.main },
                ]}
                height={300}
              />
            </Paper>
          </Grid>

          {/* Commission Breakdown Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Commission Breakdown
              </Typography>
              <PieChart
                data={charts.commissionBreakdown.map((item) => ({
                  name: item.type,
                  value: item.amount,
                  color: item.color,
                }))}
                height={300}
              />
            </Paper>
          </Grid>

          {/* Portfolio Distribution Donut Chart */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Portfolio Distribution
              </Typography>
              <DonutChart
                data={charts.portfolioDistribution.map((item) => ({
                  name: item.propertyType,
                  value: item.currentValue,
                  color: item.color,
                }))}
                height={300}
              />
            </Paper>
          </Grid>

          {/* Team Growth Bar Chart */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Team Growth
              </Typography>
              <BarChart
                data={charts.teamGrowth.map((item) => ({
                  name: item.month,
                  'Left Leg': item.leftLeg,
                  'Right Leg': item.rightLeg,
                }))}
                xAxisKey="name"
                bars={[
                  { dataKey: 'Left Leg', fill: theme.palette.primary.main },
                  { dataKey: 'Right Leg', fill: theme.palette.secondary.main },
                ]}
                height={300}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions & Recent Activities */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                      onClick={action.action}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Box
                          sx={{
                            color: `${action.color}.main`,
                            mb: 1,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {action.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Activities
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRight />}
                  onClick={() => navigate('/notifications')}
                >
                  View All
                </Button>
              </Box>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {recentActivities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'background.paper', border: `2px solid ${theme.palette.divider}` }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.timeAgo}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {activity.amount && (
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          +₹{activity.amount.toLocaleString()}
                        </Typography>
                      )}
                      {activity.status && (
                        <Chip
                          label={activity.status}
                          size="small"
                          sx={{
                            bgcolor: activity.statusColor || 'default',
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Announcement color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Announcements
              </Typography>
            </Box>
            <Stack spacing={2}>
              {announcements.map((announcement) => (
                <Card key={announcement.id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {announcement.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {announcement.date}
                      </Typography>
                      {announcement.link && (
                        <Button size="small" endIcon={<ChevronRight />}>
                          Read More
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Add rotating animation for refresh icon */}
      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotating {
            animation: rotate 1s linear infinite;
          }
        `}
      </style>
    </>
  );
};

export default Dashboard;
