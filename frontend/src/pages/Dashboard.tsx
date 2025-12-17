import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  People,
  AttachMoney,
  Visibility,
  AccountTree,
  Support,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDashboardThunk } from '../store/slices/userSlice';
import { fetchBalanceThunk } from '../store/slices/walletSlice';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card
    elevation={2}
    sx={{
      height: '100%',
      borderLeft: 4,
      borderColor: color,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              {trend}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}20`,
            color: color,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dashboard, loading: userLoading } = useAppSelector((state) => state.user);
  const { balance, loading: walletLoading } = useAppSelector((state) => state.wallet);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardThunk());
    dispatch(fetchBalanceThunk());
  }, [dispatch]);

  const loading = userLoading || walletLoading;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get KYC status color and icon
  const getKycStatus = () => {
    if (!user) return { color: 'default', icon: <Warning />, text: 'Unknown' };

    switch (user.kycStatus) {
      case 'APPROVED':
        return { color: 'success', icon: <CheckCircle />, text: 'Verified' };
      case 'PENDING':
        return { color: 'warning', icon: <Warning />, text: 'Pending' };
      case 'REJECTED':
        return { color: 'error', icon: <Warning />, text: 'Rejected' };
      default:
        return { color: 'default', icon: <Warning />, text: 'Not Submitted' };
    }
  };

  const kycStatus = getKycStatus();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.fullName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your investments today.
        </Typography>
      </Box>

      {/* User Info Card */}
      {loading ? (
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
      ) : (
        <Card elevation={2} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {user?.fullName?.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Member ID: {user?.referralCode}
                </Typography>
              </Grid>
              <Grid item>
                <Chip
                  icon={kycStatus.icon}
                  label={`KYC: ${kycStatus.text}`}
                  color={kycStatus.color as any}
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              title="Total Investment"
              value={formatCurrency(dashboard?.totalInvestment || 0)}
              icon={<AccountBalanceWallet />}
              color="#667eea"
              trend="+12% this month"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              title="Total Earnings"
              value={formatCurrency(dashboard?.totalReturns || 0)}
              icon={<TrendingUp />}
              color="#06d6a0"
              trend="+8.5% this month"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              title="Team Members"
              value={(dashboard?.teamSize || 0).toString()}
              icon={<People />}
              color="#f77f00"
              trend="+3 this week"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              title="Today's Income"
              value={formatCurrency(balance?.availableBalance || 0)}
              icon={<AttachMoney />}
              color="#06d6a0"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Earnings Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Last 7 Days Earnings
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dashboard?.investmentGrowth || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#667eea"
                      strokeWidth={3}
                      dot={{ fill: '#667eea', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/properties')}
                  sx={{ py: 1.5 }}
                >
                  Invest Now
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountBalanceWallet />}
                  onClick={() => navigate('/payout')}
                  sx={{ py: 1.5 }}
                >
                  Withdraw Funds
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountTree />}
                  onClick={() => navigate('/team')}
                  sx={{ py: 1.5 }}
                >
                  View My Tree
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Support />}
                  onClick={() => navigate('/support')}
                  sx={{ py: 1.5 }}
                >
                  Get Support
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Portfolio Summary */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Portfolio Stats
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Active Investments
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {dashboard?.activeInvestments || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Direct Referrals
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {dashboard?.directReferrals || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Earnings
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {formatCurrency(dashboard?.monthlyEarnings || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending Commissions
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    {formatCurrency(dashboard?.pendingCommissions || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activities
                </Typography>
                <Button
                  size="small"
                  endIcon={<Visibility />}
                  onClick={() => navigate('/wallet')}
                >
                  View All
                </Button>
              </Box>

              {loading ? (
                <>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </>
              ) : dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
                <Box>
                  {dashboard.recentActivities.slice(0, 10).map((activity, index) => (
                    <Box
                      key={activity.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        borderBottom: index < 9 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={activity.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {activity.amount > 0 ? '+' : ''}
                        {formatCurrency(activity.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activities
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
