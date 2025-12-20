import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  Redeem,
  CheckCircle,
  TrendingUp,
  People,
  MonetizationOn,
  CardGiftcard,
  Close,
  Download,
  Share,
} from '@mui/icons-material';

import { formatCurrency, formatDate } from '@/utils/formatters';
import { getMyAchievements, getMyAchievementTimeline } from '@/api/rank-achievement.api';
import { getMyRewards } from '@/api/rank-reward.api';
import {
  RankAchievement,
  RankReward,
  MyAchievementsResponse,
  MyRewardsResponse,
} from '@/types';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Achievements: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<RankAchievement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for achievements and rewards
  const [achievementsData, setAchievementsData] = useState<MyAchievementsResponse | null>(null);
  const [rewardsData, setRewardsData] = useState<MyRewardsResponse | null>(null);
  const [timeline, setTimeline] = useState<RankAchievement[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [achievementsRes, rewardsRes, timelineRes] = await Promise.all([
        getMyAchievements(),
        getMyRewards(),
        getMyAchievementTimeline(),
      ]);

      if (achievementsRes.success && achievementsRes.data) {
        setAchievementsData(achievementsRes.data);
      }

      if (rewardsRes.success && rewardsRes.data) {
        setRewardsData(rewardsRes.data);
      }

      if (timelineRes.success && timelineRes.data) {
        setTimeline(timelineRes.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load achievements';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDetails = (achievement: RankAchievement) => {
    setSelectedAchievement(achievement);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedAchievement(null);
  };

  const handleClaimReward = async (rewardId: number) => {
    toast.info('Reward claiming functionality will be implemented soon');
  };

  const getAchievementColor = (rankName: string) => {
    const colors: { [key: string]: string } = {
      BRONZE: '#CD7F32',
      SILVER: '#C0C0C0',
      GOLD: '#FFD700',
      PLATINUM: '#E5E4E2',
      DIAMOND: '#B9F2FF',
    };
    return colors[rankName.toUpperCase()] || theme.palette.primary.main;
  };

  // Filter rewards
  const eligibleRewards = rewardsData?.rewards.filter((r) => r.status === 'PENDING') || [];
  const claimedRewards = rewardsData?.rewards.filter((r) => r.status === 'PAID') || [];

  const totalPoints = achievementsData?.achievements.reduce((sum, a) => sum + (a.oneTimeBonusGiven || 0), 0) || 0;

  if (loading) {
    return (
      
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      
    );
  }

  if (error) {
    return (
      
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchData}>
          Retry
        </Button>
      
    );
  }

  return (
    
      <Box>
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmojiEvents sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {achievementsData?.summary.totalRanksAchieved || 0}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ranks Achieved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star sx={{ fontSize: 32, color: 'warning.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totalPoints)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Bonuses Earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Redeem sx={{ fontSize: 32, color: 'success.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {eligibleRewards.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Rewards Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MonetizationOn sx={{ fontSize: 32, color: 'info.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(rewardsData?.summary.overall.paid || 0)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Rewards Claimed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="My Achievements" />
              <Tab label="Timeline" />
              <Tab label="Rewards" />
            </Tabs>
          </Box>

          {/* My Achievements */}
          <TabPanel value={tabValue} index={0}>
            {achievementsData?.achievements && achievementsData.achievements.length > 0 ? (
              <Grid container spacing={3}>
                {achievementsData.achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                      onClick={() => handleOpenDetails(achievement)}
                    >
                      <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              bgcolor: alpha(
                                getAchievementColor(achievement.rankName),
                                0.1
                              ),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: 40,
                              border: 3,
                              borderColor: getAchievementColor(achievement.rankName),
                              position: 'relative',
                            }}
                          >
                            {achievement.Rank?.icon || '🏆'}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                bgcolor: 'success.main',
                                borderRadius: '50%',
                                p: 0.5,
                              }}
                            >
                              <CheckCircle sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                          </Box>
                        </Box>

                        <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {achievement.rankName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{ mb: 2 }}
                        >
                          {achievement.Rank?.benefits || 'Rank Achievement'}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                          <Chip
                            label={achievement.manualAssignment ? 'Manual' : 'Earned'}
                            size="small"
                            color={achievement.manualAssignment ? 'warning' : 'success'}
                            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                          />
                          <Chip
                            icon={<MonetizationOn />}
                            label={formatCurrency(achievement.oneTimeBonusGiven)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        </Box>

                        <Typography variant="caption" color="text.secondary" display="block" sx={{ textAlign: 'center' }}>
                          Achieved on {formatDate(achievement.achievedAt)}
                        </Typography>

                        {achievement.bonusPaid && (
                          <Chip
                            icon={<CheckCircle />}
                            label="Bonus Paid"
                            size="small"
                            color="success"
                            sx={{ mt: 1, width: '100%' }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No achievements yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep investing and building your team to unlock achievements!
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Timeline */}
          <TabPanel value={tabValue} index={1}>
            {timeline && timeline.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Your Achievement Journey
                </Typography>
                <List>
                  {timeline.map((achievement, index) => (
                    <ListItem
                      key={achievement.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 2,
                        bgcolor: 'background.paper',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            bgcolor: alpha(getAchievementColor(achievement.rankName), 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            border: 2,
                            borderColor: getAchievementColor(achievement.rankName),
                            mr: 2,
                          }}
                        >
                          {achievement.Rank?.icon || '🏆'}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {achievement.rankName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Milestone #{achievement.milestone} • {formatDate(achievement.achievedAt)}
                          </Typography>
                        </Box>
                        <Chip
                          label={formatCurrency(achievement.oneTimeBonusGiven)}
                          color="success"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                      {achievement.daysToAchieve !== undefined && achievement.daysToAchieve > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 8 }}>
                          Achieved {achievement.daysToAchieve} days after your first rank
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <TrendingUp sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No achievement timeline yet
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Rewards */}
          <TabPanel value={tabValue} index={2}>
            {/* Eligible Rewards */}
            {eligibleRewards.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Available Rewards
                </Typography>
                <Grid container spacing={3}>
                  {eligibleRewards.map((reward) => (
                    <Grid item xs={12} sm={6} md={4} key={reward.id}>
                      <Card
                        sx={{
                          height: '100%',
                          border: 2,
                          borderColor: 'success.main',
                          boxShadow: theme.shadows[4],
                        }}
                      >
                        <CardContent>
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography sx={{ fontSize: 48 }}>
                              {reward.Rank?.icon || '🎁'}
                            </Typography>
                          </Box>
                          <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                            {reward.rewardType.replace(/_/g, ' ')}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 2 }}
                          >
                            {reward.notes || `${reward.Rank?.name} rank reward`}
                          </Typography>
                          <Typography
                            variant="h5"
                            align="center"
                            sx={{ fontWeight: 700, color: 'success.main', mb: 2 }}
                          >
                            {formatCurrency(reward.rewardAmount)}
                          </Typography>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            onClick={() => handleClaimReward(reward.id)}
                          >
                            Claim Reward
                          </Button>
                          {reward.periodMonth && reward.periodYear && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                              Period: {reward.periodMonth}/{reward.periodYear}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Claimed Rewards */}
            {claimedRewards.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Claimed Rewards
                </Typography>
                <List>
                  {claimedRewards.map((reward) => (
                    <ListItem
                      key={reward.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <ListItemIcon>
                        <Typography sx={{ fontSize: 32 }}>{reward.Rank?.icon || '🎁'}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={reward.rewardType.replace(/_/g, ' ')}
                        secondary={
                          <>
                            {reward.notes}
                            {reward.paidAt && (
                              <Typography component="span" variant="caption" display="block">
                                Paid on {formatDate(reward.paidAt)}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Chip
                        label={formatCurrency(reward.rewardAmount)}
                        color="success"
                        sx={{ fontWeight: 700, mr: 1 }}
                      />
                      <Chip icon={<CheckCircle />} label="Paid" color="success" />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {eligibleRewards.length === 0 && claimedRewards.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Redeem sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No rewards available yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep unlocking achievements to earn rewards!
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Card>

        {/* Achievement Details Dialog */}
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
          {selectedAchievement && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedAchievement.rankName}
                  </Typography>
                  <Button onClick={handleCloseDetails} color="inherit">
                    <Close />
                  </Button>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography sx={{ fontSize: 80 }}>
                    {selectedAchievement.Rank?.icon || '🏆'}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAchievement.Rank?.benefits || 'Congratulations on achieving this rank!'}
                </Typography>
                {selectedAchievement.notes && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {selectedAchievement.notes}
                  </Alert>
                )}
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <MonetizationOn color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="One-Time Bonus"
                      secondary={formatCurrency(selectedAchievement.oneTimeBonusGiven)}
                    />
                  </ListItem>
                  {selectedAchievement.directReferralsCount && (
                    <ListItem>
                      <ListItemIcon>
                        <People color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Direct Referrals"
                        secondary={selectedAchievement.directReferralsCount}
                      />
                    </ListItem>
                  )}
                  {selectedAchievement.personalInvestmentAmount && (
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Personal Investment"
                        secondary={formatCurrency(selectedAchievement.personalInvestmentAmount)}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Achieved On"
                      secondary={formatDate(selectedAchievement.achievedAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CardGiftcard color={selectedAchievement.bonusPaid ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bonus Status"
                      secondary={selectedAchievement.bonusPaid ? 'Paid' : 'Pending'}
                    />
                  </ListItem>
                </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetails}>Close</Button>
                <Button startIcon={<Download />} disabled>
                  Download Certificate
                </Button>
                <Button variant="contained" startIcon={<Share />} disabled>
                  Share
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    
  );
};

export default Achievements;
