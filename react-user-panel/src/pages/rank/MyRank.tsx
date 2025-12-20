import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  Skeleton,
  Alert,

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
  CheckCircle,
  Star,
  CardGiftcard,
  MonetizationOn,
  EmojiEventsOutlined,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { getRankProgress } from '@/api/user.api';
import { RankProgress } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const MyRank: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankData, setRankData] = useState<RankProgress | null>(null);

  useEffect(() => {
    fetchRankData();
  }, []);

  const fetchRankData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRankProgress();
      setRankData(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rank data');
    } finally {
      setLoading(false);
    }
  };

  // Mock rank history data - replace with actual API call
  // Mock rank history data - replace with actual API call
  const rankHistory = [
    {
      rank: 'Bronze',
      date: '2024-01-15',
      badge: '🥉',
    },
    {
      rank: 'Silver',
      date: '2024-03-20',
      badge: '🥈',
    },
    {
      rank: 'Gold',
      date: '2024-06-10',
      badge: '🥇',
    },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!rankData) {
    return null;
  }

  const { currentRank } = rankData;

  return (
    <Box>
      {/* Current Rank Card */}
      <Paper
          sx={{
            p: 4,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            }}
          />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                <EmojiEvents sx={{ fontSize: 80 }} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Current Rank
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {currentRank.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Congratulations on achieving {currentRank.name} rank!
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Star />}
                  label={`Level ${currentRank.displayOrder}`}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<MonetizationOn />}
                  label={`${currentRank.commissionBoost}% Boost`}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/rank/progress')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                startIcon={<TrendingUp />}
              >
                View Progress
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Rank Benefits */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CardGiftcard sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Rank Benefits
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <List>
                  {currentRank.benefits && currentRank.benefits.length > 0 ? (
                    currentRank.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={benefit}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontWeight: 500 },
                          }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No benefits available
                    </Typography>
                  )}
                </List>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {currentRank.oneTimeBonus > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          One-Time Bonus
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(currentRank.oneTimeBonus)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {currentRank.monthlyBonus > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Monthly Bonus
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {formatCurrency(currentRank.monthlyBonus)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Rank History */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEventsOutlined sx={{ fontSize: 32, color: 'warning.main', mr: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Rank History
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Timeline position="right" sx={{ p: 0, m: 0 }}>
                  {rankHistory.map((item, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent sx={{ flex: 0.3 }}>
                        <Typography variant="caption" color="text.secondary" component="div">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14 }} />
                            {formatDate(item.date)}
                          </Box>
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot
                          color={index === rankHistory.length - 1 ? 'primary' : 'grey'}
                          variant={index === rankHistory.length - 1 ? 'filled' : 'outlined'}
                        >
                          <Typography sx={{ fontSize: 18 }}>{item.badge}</Typography>
                        </TimelineDot>
                        {index < rankHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.rank}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rank achieved
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/rank/all-ranks')}
                    fullWidth
                  >
                    View All Ranks
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/rank/progress')}
                      startIcon={<TrendingUp />}
                    >
                      Rank Progress
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/rank/all-ranks')}
                      startIcon={<EmojiEvents />}
                    >
                      All Ranks
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/rank/achievements')}
                      startIcon={<Star />}
                    >
                      Achievements
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/team')}
                      startIcon={<CheckCircle />}
                    >
                      My Team
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
};

export default MyRank;
