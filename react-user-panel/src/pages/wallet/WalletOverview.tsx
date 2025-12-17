import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add,
  GetApp,
  SwapHoriz,
  Receipt,
  Refresh,
  AccountBalanceWallet,
  TrendingUp,
} from '@mui/icons-material';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import WalletCard from '../../components/cards/WalletCard';
import LineChart from '../../components/charts/LineChart';
import { getWalletBalance, getTransactionTrends } from '../../api/wallet.api';
import { WalletBalance } from '../../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const WalletOverview: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWalletBalance();
      if (response.data) {
        setWalletBalance(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet balance');
      toast.error('Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction trends
  const fetchTrends = async () => {
    try {
      setTrendsLoading(true);
      const response = await getTransactionTrends({ period: 'MONTH' });
      if (response.data) {
        // Transform data for chart
        const chartData = response.data.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          balance: item.credits - item.debits,
          credits: item.credits,
          debits: Math.abs(item.debits),
        }));
        setTrendData(chartData);
      }
    } catch (err: any) {
      console.error('Failed to fetch trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchTrends();
  }, []);

  const handleRefresh = () => {
    fetchWalletBalance();
    fetchTrends();
  };

  const handleToggleBalance = () => {
    setShowBalances(!showBalances);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout title="Wallet">
        <Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} lg={3} key={item}>
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !walletBalance) {
    return (
      <DashboardLayout title="Wallet">
        <Alert severity="error">{error || 'Failed to load wallet'}</Alert>
        <Button startIcon={<Refresh />} onClick={handleRefresh} sx={{ mt: 2 }}>
          Retry
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wallet Overview">
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <div>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Wallet Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your funds across multiple wallets
            </Typography>
          </div>
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
            Refresh
          </Button>
        </Stack>

        {/* Total Balance Card */}
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Wallet Balance
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {showBalances ? formatCurrency(walletBalance.totalBalance) : '••••••••'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                  <TrendingUp />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Across all wallets
                  </Typography>
                </Stack>
              </Box>
              <AccountBalanceWallet sx={{ fontSize: 100, opacity: 0.2 }} />
            </Stack>
          </CardContent>
        </Card>

        {/* Wallet Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <WalletCard
              walletType="COMMISSION"
              balance={walletBalance.commissionWallet}
              label="Commission Wallet"
              color="blue"
              icon={FiDollarSign}
              onWithdraw={() => navigate('/wallet/withdrawal')}
              onViewTransactions={() => navigate('/wallet/transactions?wallet=COMMISSION')}
              showBalance={showBalances}
              onToggleBalance={handleToggleBalance}
              variant="detailed"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <WalletCard
              walletType="INVESTMENT"
              balance={walletBalance.investmentWallet}
              label="Investment Wallet"
              color="green"
              icon={FiTrendingUp}
              onAddMoney={() => navigate('/wallet/add-money')}
              onViewTransactions={() => navigate('/wallet/transactions?wallet=INVESTMENT')}
              showBalance={showBalances}
              onToggleBalance={handleToggleBalance}
              variant="detailed"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <WalletCard
              walletType="RENTAL"
              balance={walletBalance.rentalIncomeWallet}
              label="Rental Income Wallet"
              color="purple"
              icon={FiDollarSign}
              onWithdraw={() => navigate('/wallet/withdrawal')}
              onViewTransactions={() => navigate('/wallet/transactions?wallet=RENTAL')}
              showBalance={showBalances}
              onToggleBalance={handleToggleBalance}
              variant="detailed"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <WalletCard
              walletType="ROI"
              balance={walletBalance.roiWallet}
              label="ROI Wallet"
              color="orange"
              icon={FiDollarSign}
              onWithdraw={() => navigate('/wallet/withdrawal')}
              onViewTransactions={() => navigate('/wallet/transactions?wallet=ROI')}
              showBalance={showBalances}
              onToggleBalance={handleToggleBalance}
              variant="detailed"
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => navigate('/wallet/add-money')}
                >
                  Add Money
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<GetApp />}
                  onClick={() => navigate('/wallet/withdrawal')}
                >
                  Withdraw
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<SwapHoriz />}
                  onClick={() => navigate('/wallet/transfer')}
                >
                  Transfer
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<Receipt />}
                  onClick={() => navigate('/wallet/transactions')}
                >
                  View Transactions
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Wallet Balance Trend */}
        <LineChart
          data={trendData}
          lines={[
            { dataKey: 'credits', name: 'Credits', stroke: '#10b981' },
            { dataKey: 'debits', name: 'Debits', stroke: '#ef4444' },
          ]}
          xAxisKey="date"
          height={350}
          title="Wallet Activity (Last 30 Days)"
          loading={trendsLoading}
          tooltipFormatter={(value) => formatCurrency(value)}
        />

        {/* Information Card */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            About Your Wallets
          </Typography>
          <Typography variant="caption" component="div" gutterBottom>
            <strong>Commission Wallet:</strong> Earnings from referrals and network commissions
          </Typography>
          <Typography variant="caption" component="div" gutterBottom>
            <strong>Investment Wallet:</strong> Funds available for property investments
          </Typography>
          <Typography variant="caption" component="div" gutterBottom>
            <strong>Rental Income Wallet:</strong> Rental returns from your properties
          </Typography>
          <Typography variant="caption" component="div">
            <strong>ROI Wallet:</strong> Return on investment earnings
          </Typography>
        </Alert>
      </Box>
    </DashboardLayout>
  );
};

export default WalletOverview;
