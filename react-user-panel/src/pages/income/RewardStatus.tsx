import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Stack,
  LinearProgress,
  useTheme,
  Alert
} from '@mui/material';
import {
  EmojiEvents,
  MonetizationOn,
  Timeline,
  CheckCircle,
  Pending,
  Lock,
  Star,
  MilitaryTech,
  History
} from '@mui/icons-material';
import dayjs from 'dayjs';
import StatsCard from '../../components/common/StatsCard';
import {
  getMyAchievements,
  MyAchievementsResponse,
  RankAchievement
} from '../../api/rank-achievement.api';
import {
  getMyRewards,
  MyRewardsResponse,
  RankReward
} from '../../api/rank-reward.api';

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const RewardStatus: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Data States
  const [achievementData, setAchievementData] = useState<MyAchievementsResponse | null>(null);
  const [rewardsData, setRewardsData] = useState<MyRewardsResponse | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [achievementsRes, rewardsRes] = await Promise.all([
        getMyAchievements(),
        getMyRewards()
      ]);

      if (achievementsRes.data) {
        setAchievementData(achievementsRes.data);
      }
      if (rewardsRes.data) {
        setRewardsData(rewardsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch reward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress />
      </Box>
    );
  }

  // Calculate totals
  const totalEarned = rewardsData?.summary?.overall?.total || 0;
  const pendingRewards = rewardsData?.summary?.overall?.pending || 0;
  const currentRankName = achievementData?.currentRank?.name || 'No Rank';
  const highestRankAchieved = achievementData?.achievements?.length
    ? achievementData.achievements[0].rankName // Assuming sorted by latest
    : 'None';

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Reward & Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your rank progress and claimed rewards
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Current Rank"
            value={currentRankName}
            icon={<MilitaryTech fontSize="large" />}
            color="primary"
            gradient
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Rewards Earned"
            value={totalEarned}
            prefix="₹"
            icon={<EmojiEvents fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Rewards"
            value={pendingRewards}
            prefix="₹"
            icon={<Pending fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Ranks Achieved"
            value={achievementData?.achievements.length || 0}
            icon={<Star fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ minHeight: 400 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="reward tabs">
            <Tab label="Achievement Timeline" icon={<Timeline />} iconPosition="start" />
            <Tab label="Reward History" icon={<History />} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Achievement Timeline Tab */}
          <CustomTabPanel value={tabValue} index={0}>
            {achievementData?.achievements && achievementData.achievements.length > 0 ? (
              <Box>
                {achievementData.achievements.map((achievement, index) => (
                  <Box
                    key={achievement.id}
                    sx={{
                      position: 'relative',
                      pl: 4,
                      pb: 4,
                      '&:last-child': { pb: 0 },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 19,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: index === achievementData.achievements.length - 1 ? 'transparent' : 'grey.200',
                        display: 'block'
                      }
                    }}
                  >
                    {/* Timestamp Dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: 40,
                        height: 40,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        border: `2px solid ${theme.palette.primary.main}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                      }}
                    >
                      <MilitaryTech color="primary" />
                    </Box>

                    {/* Content */}
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, ml: 2, borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                            <Typography variant="h6" fontWeight={700}>
                              {achievement.rankName}
                            </Typography>
                            <Chip
                              label="Achieved"
                              color="success"
                              size="small"
                              icon={<CheckCircle />}
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Achieved on: {dayjs(achievement.achievedAt).format('DD MMM YYYY, hh:mm A')}
                          </Typography>

                          {achievement.Rank && (
                            <Box mt={2}>
                              <Typography variant="subtitle2" fontWeight={600}>Rank Benefits:</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {achievement.Rank.oneTimeBonus ? `One Time Bonus: ₹${achievement.Rank.oneTimeBonus}` : ''}
                                {achievement.Rank.oneTimeBonus && achievement.Rank.monthlyBonus ? ' | ' : ''}
                                {achievement.Rank.monthlyBonus ? `Monthly Bonus: ₹${achievement.Rank.monthlyBonus}` : ''}
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          {achievement.oneTimeBonusGiven > 0 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Bonus Received
                              </Typography>
                              <Typography variant="h6" color="success.main" fontWeight={700}>
                                +₹{achievement.oneTimeBonusGiven.toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                You haven't achieved any ranks yet. Keep growing your team!
              </Alert>
            )}
          </CustomTabPanel>

          {/* Reward History Tab */}
          <CustomTabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reward Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rewardsData?.rewards && rewardsData.rewards.length > 0 ? (
                    rewardsData.rewards.map((reward) => (
                      <TableRow key={reward.id} hover>
                        <TableCell>
                          {dayjs(reward.createdAt).format('DD MMM YYYY')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reward.rewardType.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {reward.Rank ? `Rank: ${reward.Rank.name}` : 'Bonus Reward'}
                          {reward.notes && ` - ${reward.notes}`}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                          ₹{reward.rewardAmount.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={reward.status}
                            size="small"
                            color={
                              reward.status === 'PAID' ? 'success' :
                                reward.status === 'PENDING' ? 'warning' :
                                  reward.status === 'PROCESSED' ? 'info' : 'error'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No reward history found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RewardStatus;
