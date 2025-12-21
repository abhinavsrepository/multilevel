import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Card,
  CardContent,
  useTheme,
  Alert,
  Skeleton,
  LinearProgress,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  Home,
  AccountBalance,
  EmojiEvents,
  Group,
  ShowChart,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart } from '@/components/charts';
import StatsCard from '@/components/common/StatsCard';
import { getTeamMembers } from '@/api/team.api';
import type { TeamMember } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface PropertyPerformance {
  memberId: number;
  memberName: string;
  userId: string;
  profilePicture?: string;
  totalPropertiesInvested: number;
  totalPropertyInvestment: number;
  averageInvestmentPerProperty: number;
  propertiesInLastMonth: number;
  rank: string;
  performanceScore: number;
}

const TeamPropertyPerformance: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<PropertyPerformance[]>([]);
  const [stats, setStats] = useState({
    totalTeamPropertyInvestments: 0,
    totalPropertiesInvested: 0,
    averageInvestmentPerMember: 0,
    topPerformerCount: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch team members
        const membersRes = await getTeamMembers({
          page: 1,
          size: 100,
          status: 'ACTIVE',
        });

        if (!membersRes.success || !membersRes.data) {
          throw new Error('Failed to fetch team members');
        }

        const members: TeamMember[] = membersRes.data.content || [];

        // Calculate property performance for each member (mock data - would come from API)
        const performance: PropertyPerformance[] = members.map((member) => {
          const propertiesInvested = Math.floor(Math.random() * 10) + 1;
          const totalInvestment = member.totalInvestment;
          const avgInvestment = totalInvestment / propertiesInvested;
          const recentProperties = Math.floor(Math.random() * 3);

          // Performance score based on multiple factors
          const performanceScore = Math.min(
            100,
            (propertiesInvested * 10 + (totalInvestment / 100000) * 5 + recentProperties * 15)
          );

          return {
            memberId: member.id,
            memberName: member.fullName,
            userId: member.userId,
            profilePicture: member.profilePicture,
            totalPropertiesInvested: propertiesInvested,
            totalPropertyInvestment: totalInvestment,
            averageInvestmentPerProperty: avgInvestment,
            propertiesInLastMonth: recentProperties,
            rank: member.rank?.name || 'Associate',
            performanceScore: Math.round(performanceScore),
          };
        });

        // Sort by performance score
        performance.sort((a, b) => b.performanceScore - a.performanceScore);
        setPerformanceData(performance);

        // Calculate overall stats
        const totalInvestments = performance.reduce((sum, p) => sum + p.totalPropertyInvestment, 0);
        const totalProperties = performance.reduce((sum, p) => sum + p.totalPropertiesInvested, 0);
        const avgPerMember = performance.length > 0 ? totalInvestments / performance.length : 0;
        const topPerformers = performance.filter((p) => p.performanceScore >= 70).length;

        setStats({
          totalTeamPropertyInvestments: totalInvestments,
          totalPropertiesInvested: totalProperties,
          averageInvestmentPerMember: avgPerMember,
          topPerformerCount: topPerformers,
          monthlyGrowth: 12.5,
        });

      } catch (err: any) {
        setError(err.message || 'Failed to load team property performance');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Attention';
  };

  const getPieChartData = () => {
    const excellent = performanceData.filter((p) => p.performanceScore >= 80).length;
    const good = performanceData.filter((p) => p.performanceScore >= 60 && p.performanceScore < 80).length;
    const average = performanceData.filter((p) => p.performanceScore >= 40 && p.performanceScore < 60).length;
    const needsAttention = performanceData.filter((p) => p.performanceScore < 40).length;

    return [
      { name: 'Excellent', value: excellent, color: theme.palette.success.main },
      { name: 'Good', value: good, color: theme.palette.info.main },
      { name: 'Average', value: average, color: theme.palette.warning.main },
      { name: 'Needs Attention', value: needsAttention, color: theme.palette.error.main },
    ];
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Team Property Performance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your team's real estate investment performance and identify top performers
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Property Investments"
            value={stats.totalTeamPropertyInvestments}
            prefix="₹"
            icon={<AccountBalance />}
            color="primary"
            gradient
            decimals={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Properties Invested"
            value={stats.totalPropertiesInvested}
            icon={<Home />}
            color="success"
            trend={{
              value: stats.monthlyGrowth,
              isPositive: true,
              label: '% growth',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg per Member"
            value={stats.averageInvestmentPerMember}
            prefix="₹"
            icon={<TrendingUp />}
            color="info"
            decimals={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Top Performers"
            value={stats.topPerformerCount}
            icon={<EmojiEvents />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Performance Overview" icon={<ShowChart />} iconPosition="start" />
            <Tab label="Top Performers" icon={<EmojiEvents />} iconPosition="start" />
            <Tab label="All Members" icon={<Group />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 1: Performance Overview */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Performance Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Performance Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <PieChart data={getPieChartData()} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Breakdown */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Performance Breakdown
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {getPieChartData().map((item) => (
                      <Box key={item.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {item.value} members
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.value / performanceData.length) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: item.color,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Key Investment Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Highest Investment
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {performanceData.length > 0
                            ? formatCurrency(Math.max(...performanceData.map((p) => p.totalPropertyInvestment)))
                            : '₹0'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Most Properties
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {performanceData.length > 0
                            ? Math.max(...performanceData.map((p) => p.totalPropertiesInvested))
                            : 0}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Active This Month
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {performanceData.filter((p) => p.propertiesInLastMonth > 0).length}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.main', color: 'white', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Avg Properties/Member
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {performanceData.length > 0
                            ? (stats.totalPropertiesInvested / performanceData.length).toFixed(1)
                            : 0}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Top Performers */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Rank</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>MLM Rank</TableCell>
                    <TableCell align="right">Properties</TableCell>
                    <TableCell align="right">Total Investment</TableCell>
                    <TableCell align="right">Avg Investment</TableCell>
                    <TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.slice(0, 10).map((member, index) => (
                    <TableRow key={member.memberId} hover>
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          color={index < 3 ? 'warning' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={member.profilePicture} sx={{ width: 40, height: 40 }}>
                            {member.memberName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {member.memberName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={member.rank} size="small" variant="outlined" color="primary" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {member.totalPropertiesInvested}
                        </Typography>
                        {member.propertiesInLastMonth > 0 && (
                          <Typography variant="caption" color="success.main">
                            +{member.propertiesInLastMonth} this month
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(member.totalPropertyInvestment)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(member.averageInvestmentPerProperty)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Chip
                            label={`${member.performanceScore}%`}
                            size="small"
                            color={getPerformanceColor(member.performanceScore)}
                            sx={{ fontWeight: 600, minWidth: 70 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {getPerformanceLabel(member.performanceScore)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab 3: All Members */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Member</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell align="right">Properties</TableCell>
                    <TableCell align="right">Total Investment</TableCell>
                    <TableCell align="center">Performance</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.map((member) => (
                    <TableRow key={member.memberId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={member.profilePicture} sx={{ width: 36, height: 36 }}>
                            {member.memberName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {member.memberName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={member.rank} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{member.totalPropertiesInvested}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{formatCurrency(member.totalPropertyInvestment)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ minWidth: 100 }}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            {member.performanceScore}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={member.performanceScore}
                            color={getPerformanceColor(member.performanceScore)}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getPerformanceLabel(member.performanceScore)}
                          size="small"
                          color={getPerformanceColor(member.performanceScore)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TeamPropertyPerformance;
