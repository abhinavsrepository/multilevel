import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  EmojiEvents,
  TrendingUp,
  Star,
  MonetizationOn,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { getMyAchievements, getMyAchievementTimeline } from '@/api/user.api';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface RankAchievement {
  id: number;
  rankId: number;
  rankName: string;
  achievedAt: string;
  oneTimeBonusGiven: number;
  bonusPaid: boolean;
  bonusPaidAt?: string;
  manualAssignment: boolean;
  notes?: string;
  Rank?: {
    name: string;
    displayOrder: number;
    icon?: string;
    color?: string;
    benefits?: string[];
  };
  milestone?: number;
  daysToAchieve?: number;
}

interface AchievementSummary {
  totalRanksAchieved: number;
  totalBonusesEarned: number;
  totalBonusesPaid: number;
  pendingBonuses: number;
}

const RankAchievementTimeline: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<RankAchievement[]>([]);
  const [timeline, setTimeline] = useState<RankAchievement[]>([]);
  const [summary, setSummary] = useState<AchievementSummary | null>(null);
  const [currentRank, setCurrentRank] = useState<any>(null);

  useEffect(() => {
    fetchAchievements();
    fetchTimeline();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await getMyAchievements();
      if (response.data.success) {
        setAchievements(response.data.data.achievements || []);
        setSummary(response.data.data.summary || null);
        setCurrentRank(response.data.data.currentRank || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await getMyAchievementTimeline();
      if (response.data.success) {
        setTimeline(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  return (
      <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Rank Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track your rank progression and achievement milestones
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
                          Current Rank
                        </Typography>
                        <Typography variant="h6" color="white" fontWeight="bold">
                          {currentRank?.name || 'Unranked'}
                        </Typography>
                      </Box>
                      <EmojiEvents sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
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
                          Ranks Achieved
                        </Typography>
                        <Typography variant="h5" color="white" fontWeight="bold">
                          {summary?.totalRanksAchieved || 0}
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
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
                          Bonuses Earned
                        </Typography>
                        <Typography variant="h6" color="white" fontWeight="bold">
                          {formatCurrency(summary?.totalBonusesEarned || 0)}
                        </Typography>
                      </Box>
                      <MonetizationOn sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
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
                          Pending Bonuses
                        </Typography>
                        <Typography variant="h6" color="white" fontWeight="bold">
                          {formatCurrency(summary?.pendingBonuses || 0)}
                        </Typography>
                      </Box>
                      <Schedule sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Achievement Timeline */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Achievement Timeline
              </Typography>

              {timeline.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No rank achievements yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep working towards your goals to achieve your first rank!
                  </Typography>
                </Box>
              ) : (
                <Timeline position="alternate">
                  {timeline.map((achievement, index) => (
                    <TimelineItem key={achievement.id}>
                      <TimelineOppositeContent color="text.secondary">
                        <Typography variant="body2">{formatDate(achievement.achievedAt)}</Typography>
                        {achievement.daysToAchieve !== undefined && achievement.daysToAchieve > 0 && (
                          <Typography variant="caption">
                            {achievement.daysToAchieve} days since start
                          </Typography>
                        )}
                      </TimelineOppositeContent>

                      <TimelineSeparator>
                        <TimelineDot
                          color="primary"
                          sx={{
                            bgcolor: achievement.Rank?.color || theme.palette.primary.main,
                            p: 1.5,
                          }}
                        >
                          <EmojiEvents />
                        </TimelineDot>
                        {index < timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>

                      <TimelineContent>
                        <Card
                          sx={{
                            bgcolor: 'background.paper',
                            boxShadow: theme.shadows[2],
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip
                                icon={<Star />}
                                label={`Milestone ${achievement.milestone}`}
                                size="small"
                                color="warning"
                              />
                              {achievement.manualAssignment && (
                                <Chip label="Manually Awarded" size="small" variant="outlined" />
                              )}
                            </Box>

                            <Typography variant="h6" fontWeight="bold">
                              {achievement.rankName}
                            </Typography>

                            {achievement.Rank?.benefits && achievement.Rank.benefits.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Benefits:
                                </Typography>
                                {achievement.Rank.benefits.slice(0, 2).map((benefit: string, i: number) => (
                                  <Typography key={i} variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    • {benefit}
                                  </Typography>
                                ))}
                              </Box>
                            )}

                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  One-Time Bonus
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="success.main">
                                  {formatCurrency(achievement.oneTimeBonusGiven)}
                                </Typography>
                              </Box>
                              <Box>
                                <Chip
                                  icon={achievement.bonusPaid ? <CheckCircle /> : <Schedule />}
                                  label={achievement.bonusPaid ? 'Bonus Paid' : 'Bonus Pending'}
                                  color={achievement.bonusPaid ? 'success' : 'warning'}
                                  size="small"
                                />
                              </Box>
                            </Box>

                            {achievement.notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Note: {achievement.notes}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Paper>
          </>
        )}
      </Box>
    
  );
};

export default RankAchievementTimeline;
