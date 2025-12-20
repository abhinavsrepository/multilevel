import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  MonetizationOn,
  TrendingUp,
  CheckCircle,
  Schedule,
  CardGiftcard,
} from '@mui/icons-material';
import { getMyRewards, getMyRewardStats } from '@/api/user.api';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface RankReward {
  id: number;
  rewardType: string;
  rewardAmount: number;
  periodMonth?: number;
  periodYear?: number;
  status: string;
  createdAt: string;
  Rank?: {
    name: string;
    displayOrder: number;
    icon?: string;
    color?: string;
  };
}

interface RewardSummary {
  monthlyRewards: { total: number; pending: number; paid: number };
  oneTimeBonuses: { total: number; pending: number; paid: number };
  overall: { total: number; pending: number; paid: number };
}

const MyRewards: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RankReward[]>([]);
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<any[]>([]);

  useEffect(() => {
    fetchRewards();
    fetchRewardStats();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await getMyRewards();
      if (response.data.success) {
        setRewards(response.data.data.rewards || []);
        setSummary(response.data.data.summary || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardStats = async () => {
    try {
      const response = await getMyRewardStats();
      if (response.data.success) {
        setMonthlyBreakdown(response.data.data.monthlyBreakdown || []);
      }
    } catch (err) {
      console.error('Failed to fetch reward stats:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSED':
        return 'info';
      case 'PAID':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredRewards = tabValue === 0
    ? rewards
    : tabValue === 1
    ? rewards.filter(r => r.rewardType === 'MONTHLY_LEADERSHIP')
    : rewards.filter(r => r.rewardType === 'ONE_TIME_BONUS');

  return (
      <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Rank Rewards
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View your monthly leadership bonuses and one-time achievement rewards
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="white" variant="body2" gutterBottom>
                          Total Earned
                        </Typography>
                        <Typography variant="h5" color="white" fontWeight="bold">
                          {formatCurrency(summary?.overall.total || 0)}
                        </Typography>
                      </Box>
                      <MonetizationOn sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="white" variant="body2" gutterBottom>
                          Pending
                        </Typography>
                        <Typography variant="h5" color="white" fontWeight="bold">
                          {formatCurrency(summary?.overall.pending || 0)}
                        </Typography>
                      </Box>
                      <Schedule sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="white" variant="body2" gutterBottom>
                          Paid
                        </Typography>
                        <Typography variant="h5" color="white" fontWeight="bold">
                          {formatCurrency(summary?.overall.paid || 0)}
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="white" variant="body2" gutterBottom>
                          Monthly Rewards
                        </Typography>
                        <Typography variant="h5" color="white" fontWeight="bold">
                          {formatCurrency(summary?.monthlyRewards.total || 0)}
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Monthly Breakdown */}
            {monthlyBreakdown.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Breakdown - {new Date().getFullYear()}
                </Typography>
                <Grid container spacing={2}>
                  {monthlyBreakdown.map((month: any) => (
                    <Grid item xs={6} sm={4} md={2} key={month.period_month}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            {months[month.period_month - 1]}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(month.total_amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {month.count} reward{month.count !== 1 ? 's' : ''}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Rewards Table */}
            <Paper>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="All Rewards" />
                <Tab label="Monthly Bonuses" />
                <Tab label="One-Time Bonuses" />
              </Tabs>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRewards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box sx={{ py: 4 }}>
                            <CardGiftcard sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography color="text.secondary">
                              No rewards found
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            <Chip
                              label={reward.Rank?.name || 'N/A'}
                              size="small"
                              sx={{
                                backgroundColor: reward.Rank?.color || theme.palette.primary.main,
                                color: 'white',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {reward.rewardType.replace(/_/g, ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                              {formatCurrency(reward.rewardAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {reward.periodMonth && reward.periodYear
                              ? `${months[reward.periodMonth - 1]} ${reward.periodYear}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={reward.status}
                              color={getStatusColor(reward.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(reward.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    
  );
};

export default MyRewards;
