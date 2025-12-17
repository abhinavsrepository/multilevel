import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,

  Alert,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  People,
  Home,
  ShowChart,
  EmojiEvents,
  Stars,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';

import StatsCard from '@/components/common/StatsCard';
import { LineChart } from '@/components/charts';
import { PieChart } from '@/components/charts';
import { getCommissionSummary, getCommissionTrends } from '@/api/commission.api';
import type { CommissionSummary, CommissionTrend } from '@/types';

//8081796504

/**
 * CommissionOverview Page
 *
 * Displays comprehensive commission overview including:
 * - Total earnings cards (all-time, this month, today)
 * - Commission type breakdown (7 types)
 * - Trend line chart (last 6 months)
 * - Distribution pie chart
 */
const CommissionOverview: React.FC = () => {
  const theme = useTheme();


  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [trends, setTrends] = useState<CommissionTrend[]>([]);

  /**
   * Fetch commission data
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, trendsRes] = await Promise.all([
          getCommissionSummary(),
          getCommissionTrends({ period: 'MONTH' }),
        ]);

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        }

        if (trendsRes.success && trendsRes.data) {
          setTrends(trendsRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load commission data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Get commission type icon
   */
  const getCommissionTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      DIRECT_REFERRAL: <People />,
      BINARY_PAIRING: <TrendingUp />,
      LEVEL_COMMISSION: <People />,
      RENTAL_INCOME: <Home />,
      PROPERTY_APPRECIATION: <ShowChart />,
      RANK_BONUS: <EmojiEvents />,
      LEADERSHIP_BONUS: <Stars />,
    };
    return iconMap[type] || <AccountBalance />;
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Prepare trend chart data
   */
  const getTrendChartData = () => {
    if (!trends.length) return [];

    return trends.map((t) => ({
      ...t,
      formattedDate: new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    }));
  };

  /**
   * Prepare distribution chart data
   */
  const getDistributionChartData = () => {
    if (!summary?.distribution) return [];

    return summary.distribution.map((d) => ({
      name: d.name,
      value: d.amount,
      color: d.color,
    }));
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <DashboardLayout title="Commission Overview">
        <Box>
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={`type-${i}`}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  /**
   * Render error state
   */
  if (error || !summary) {
    return (
      <DashboardLayout title="Commission Overview">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Failed to load commission data'}
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Commission Overview" showBreadcrumb={false}>
      <Box>
        {/* Total Earnings Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="Total Earnings"
              value={summary.totalEarnings}
              prefix="₹"
              icon={<AccountBalance />}
              color="primary"
              gradient
              decimals={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="This Month"
              value={summary.thisMonth}
              prefix="₹"
              icon={<TrendingUp />}
              color="success"
              decimals={0}
              trend={{
                value: 12.5,
                isPositive: true,
                label: 'vs last month',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="Today"
              value={summary.today}
              prefix="₹"
              icon={<TrendingUp />}
              color="info"
              decimals={0}
            />
          </Grid>
        </Grid>

        {/* Commission Type Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            Commission by Type
          </Typography>
          <Grid container spacing={2}>
            {summary.byType.map((commType, index) => (
              <Grid item xs={12} sm={6} md={3} key={commType.type}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${commType.color}20`,
                            color: commType.color,
                            mr: 2,
                          }}
                        >
                          {getCommissionTypeIcon(commType.type)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {commType.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {formatCurrency(commType.totalEarned)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          This Month
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color={commType.color}>
                          {formatCurrency(commType.thisMonth)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Count
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {commType.count}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Commission Trends
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Last 6 months earnings by commission type
              </Typography>
              <Box sx={{ height: 340 }}>
                <LineChart
                  data={getTrendChartData()}
                  xAxisKey="formattedDate"
                  lines={[
                    { dataKey: 'total', name: 'Total', stroke: theme.palette.primary.main },
                    { dataKey: 'direct', name: 'Direct', stroke: '#3b82f6' },
                    { dataKey: 'binary', name: 'Binary', stroke: '#8b5cf6' },
                    { dataKey: 'level', name: 'Level', stroke: '#10b981' },
                    { dataKey: 'rental', name: 'Rental', stroke: '#f59e0b' },
                  ]}
                  height={340}
                  tooltipFormatter={(value) => formatCurrency(value)}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Distribution Chart */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Commission breakdown by type
              </Typography>
              <Box sx={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart
                  data={getDistributionChartData()}
                  height={340}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default CommissionOverview;
