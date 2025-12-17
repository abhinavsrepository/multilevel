import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People,
  GroupAdd,
  TrendingUp,
  AccountBalance,
  AccountTree,
  Assessment,
  ListAlt,
  Diversity3,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { LineChart } from '@/components/charts';
import { getTeamStats, getTeamGrowth, getLevelBreakdown } from '@/api/team.api';
import type { TeamStats, TeamGrowth, LevelBreakdown } from '@/types';

/**
 * TeamOverview Page
 *
 * Displays team overview including:
 * - Team stats cards (Total Team, Direct Referrals, Team BV, Team Investment)
 * - Quick actions (View Binary Tree, View Unilevel Tree, My Referrals, Team Report)
 * - Team growth chart (last 12 months)
 * - Level-wise breakdown table/cards
 */
const TeamOverview: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [growth, setGrowth] = useState<TeamGrowth[]>([]);
  const [levelBreakdown, setLevelBreakdown] = useState<LevelBreakdown[]>([]);

  /**
   * Fetch team data
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, growthRes, levelRes] = await Promise.all([
          getTeamStats(),
          getTeamGrowth({ period: 'MONTH' }),
          getLevelBreakdown(),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (growthRes.success && growthRes.data) {
          setGrowth(growthRes.data);
        }

        if (levelRes.success && levelRes.data) {
          setLevelBreakdown(levelRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
   * Prepare growth chart data
   */
  const getGrowthChartData = () => {
    return growth.map((g) => ({
      date: new Date(g.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      total: g.total,
      leftLeg: g.leftLeg,
      rightLeg: g.rightLeg,
    }));
  };

  /**
   * Quick action cards
   */
  const quickActions = [
    {
      title: 'Binary Tree',
      icon: <AccountTree />,
      color: '#3b82f6',
      path: '/team/binary-tree',
      description: 'View binary genealogy',
    },
    {
      title: 'Unilevel Tree',
      icon: <Diversity3 />,
      color: '#8b5cf6',
      path: '/team/unilevel-tree',
      description: 'View unilevel structure',
    },
    {
      title: 'My Referrals',
      icon: <GroupAdd />,
      color: '#10b981',
      path: '/team/direct-referrals',
      description: 'View direct referrals',
    },
    {
      title: 'Team Report',
      icon: <Assessment />,
      color: '#f59e0b',
      path: '/team/report',
      description: 'Detailed team analytics',
    },
  ];

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <DashboardLayout title="Team Overview">
        <Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={`action-${i}`}>
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
  if (error || !stats) {
    return (
      <DashboardLayout title="Team Overview">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Failed to load team data'}
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Team Overview">
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Team Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage your team network
          </Typography>
        </Box>

        {/* Team Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Team"
              value={stats.totalTeam}
              icon={<People />}
              color="primary"
              gradient
              trend={{
                value: 8.5,
                isPositive: true,
                label: 'vs last month',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Direct Referrals"
              value={stats.directReferrals}
              icon={<GroupAdd />}
              color="success"
              trend={{
                value: stats.directReferralsThisMonth,
                isPositive: true,
                label: 'this month',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Team BV"
              value={stats.teamBV.toLocaleString()}
              icon={<TrendingUp />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Team Investment"
              value={stats.teamInvestment}
              prefix="₹"
              icon={<AccountBalance />}
              color="warning"
              decimals={0}
            />
          </Grid>
        </Grid>

        {/* Leg Comparison */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Left Leg
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Members
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {stats.leftLeg}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Business Volume
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="text.primary">
                    {stats.leftBV.toLocaleString()} BV
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Right Leg
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Members
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="secondary.main">
                    {stats.rightLeg}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Business Volume
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="text.primary">
                    {stats.rightBV.toLocaleString()} BV
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
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
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                        borderColor: action.color,
                      },
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${action.color}20`,
                          color: action.color,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Charts and Level Breakdown */}
        <Grid container spacing={3}>
          {/* Team Growth Chart */}
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
                Team Growth
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Last 12 months team expansion
              </Typography>
              <Box sx={{ height: 340 }}>
                <LineChart
                  data={getGrowthChartData()}
                  xAxisKey="date"
                  lines={[
                    { dataKey: 'total', name: 'Total Team', stroke: theme.palette.primary.main },
                    { dataKey: 'leftLeg', name: 'Left Leg', stroke: '#3b82f6' },
                    { dataKey: 'rightLeg', name: 'Right Leg', stroke: '#8b5cf6' },
                  ]}
                  xAxisLabel="Month"
                  yAxisLabel="Members"
                />
              </Box>
            </Paper>
          </Grid>

          {/* Level-wise Breakdown */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Level-wise Breakdown
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="caption" fontWeight={600}>
                          Level
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" fontWeight={600}>
                          Members
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" fontWeight={600}>
                          %
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {levelBreakdown.map((level) => (
                      <TableRow
                        key={level.level}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { bgcolor: theme.palette.action.hover },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Level {level.level}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{level.members}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            {level.percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {levelBreakdown.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No level data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Matching BV
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {stats.matchingBV.toLocaleString()} BV
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Carry Forward
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {stats.carryForward.toLocaleString()} BV
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Members
              </Typography>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {stats.active} / {stats.totalTeam}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default TeamOverview;
