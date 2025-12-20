import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Skeleton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AccountBalance,
  MonetizationOn,
  CheckCircle,
  Cancel,
  AccessTime,
  EmojiEvents,
  ExpandMore,
  Lock,
  LockOpen,
} from '@mui/icons-material';

import { getRankProgress } from '@/api/user.api';
import { RankProgress as RankProgressType } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const RankProgress: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankData, setRankData] = useState<RankProgressType | null>(null);

  useEffect(() => {
    fetchRankData();
  }, []);

  const fetchRankData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRankProgress();
      setRankData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rank progress');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const CircularProgressWithLabel = ({ value }: { value: number }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={Math.min(value, 100)}
          size={180}
          thickness={8}
          sx={{
            color: value >= 100 ? theme.palette.success.main : theme.palette.primary.main,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
            {Math.round(value)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Complete
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
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

  if (!rankData || !rankData.nextRank) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        You have achieved the highest rank! Congratulations!
      </Alert>
    );
  }

  const { currentRank, nextRank, progress, overallProgress } = rankData;

  return (
    <Box>
      {/* Next Rank Card */}
      <Paper
          sx={{
            p: 4,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Next Rank
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {nextRank.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                You are {Math.round(overallProgress)}% of the way to achieving {nextRank.name} rank
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overall Progress</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {Math.round(overallProgress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(overallProgress, 100)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <CircularProgressWithLabel value={overallProgress} />
            </Grid>
          </Grid>
        </Paper>

        {/* Progress Bars */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Direct Referrals */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Direct Referrals
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invite and refer new members
                    </Typography>
                  </Box>
                  <Chip
                    label={`${progress.directReferrals.current}/${progress.directReferrals.required}`}
                    color={getProgressColor(progress.directReferrals.percentage)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress.directReferrals.percentage, 100)}
                  color={getProgressColor(progress.directReferrals.percentage)}
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" align="right">
                  {Math.round(progress.directReferrals.percentage)}% Complete
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Investment */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalance sx={{ fontSize: 32, color: 'success.main', mr: 1.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Team Investment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total team investment volume
                    </Typography>
                  </Box>
                  <Chip
                    label={`${formatCurrency(progress.teamInvestment.current)}`}
                    color={getProgressColor(progress.teamInvestment.percentage)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress.teamInvestment.percentage, 100)}
                  color={getProgressColor(progress.teamInvestment.percentage)}
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Required: {formatCurrency(progress.teamInvestment.required)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress.teamInvestment.percentage)}% Complete
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Investment */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOn sx={{ fontSize: 32, color: 'warning.main', mr: 1.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Personal Investment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your own investment amount
                    </Typography>
                  </Box>
                  <Chip
                    label={`${formatCurrency(progress.personalInvestment.current)}`}
                    color={getProgressColor(progress.personalInvestment.percentage)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress.personalInvestment.percentage, 100)}
                  color={getProgressColor(progress.personalInvestment.percentage)}
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Required: {formatCurrency(progress.personalInvestment.required)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress.personalInvestment.percentage)}% Complete
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Legs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 32, color: 'info.main', mr: 1.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Active Legs
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Both legs must be active
                    </Typography>
                  </Box>
                  <Chip
                    icon={
                      progress.activeLegs.achieved ? (
                        <CheckCircle />
                      ) : (
                        <Cancel />
                      )
                    }
                    label={progress.activeLegs.achieved ? 'Achieved' : 'Not Achieved'}
                    color={progress.activeLegs.achieved ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: progress.activeLegs.leftActive
                          ? 'success.lighter'
                          : 'error.lighter',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      {progress.activeLegs.leftActive ? (
                        <CheckCircle color="success" sx={{ fontSize: 32 }} />
                      ) : (
                        <Cancel color="error" sx={{ fontSize: 32 }} />
                      )}
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        Left Leg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress.activeLegs.leftActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: progress.activeLegs.rightActive
                          ? 'success.lighter'
                          : 'error.lighter',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      {progress.activeLegs.rightActive ? (
                        <CheckCircle color="success" sx={{ fontSize: 32 }} />
                      ) : (
                        <Cancel color="error" sx={{ fontSize: 32 }} />
                      )}
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        Right Leg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress.activeLegs.rightActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Next Rank Benefits Preview */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ fontSize: 32, color: 'warning.main', mr: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {nextRank.name} Benefits
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <List>
                  {nextRank.benefits && nextRank.benefits.length > 0 ? (
                    nextRank.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <LockOpen color="success" />
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
                  {nextRank.oneTimeBonus > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          bgcolor: 'success.lighter',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          One-Time Bonus
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(nextRank.oneTimeBonus)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {nextRank.monthlyBonus > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          bgcolor: 'primary.lighter',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Monthly Bonus
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {formatCurrency(nextRank.monthlyBonus)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {nextRank.commissionBoost > 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          bgcolor: 'warning.lighter',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Commission Boost
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                          {nextRank.commissionBoost}%
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Estimated Time to Achieve */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ fontSize: 32, color: 'info.main', mr: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    What You Need to Do
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <People color={progress.directReferrals.percentage >= 100 ? 'success' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Refer ${Math.max(0, progress.directReferrals.required - progress.directReferrals.current)
                        } more members`}
                      secondary={`${progress.directReferrals.current} of ${progress.directReferrals.required} completed`}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AccountBalance
                        color={progress.teamInvestment.percentage >= 100 ? 'success' : 'primary'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Team investment of ${formatCurrency(
                        Math.max(0, progress.teamInvestment.required - progress.teamInvestment.current)
                      )} more`}
                      secondary={`${formatCurrency(progress.teamInvestment.current)} of ${formatCurrency(
                        progress.teamInvestment.required
                      )} completed`}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <MonetizationOn
                        color={progress.personalInvestment.percentage >= 100 ? 'success' : 'primary'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Invest ${formatCurrency(
                        Math.max(
                          0,
                          progress.personalInvestment.required - progress.personalInvestment.current
                        )
                      )} more`}
                      secondary={`${formatCurrency(progress.personalInvestment.current)} of ${formatCurrency(
                        progress.personalInvestment.required
                      )} completed`}
                    />
                  </ListItem>

                  {!progress.activeLegs.achieved && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Activate both legs"
                        secondary={
                          !progress.activeLegs.leftActive && !progress.activeLegs.rightActive
                            ? 'Both legs need to be active'
                            : !progress.activeLegs.leftActive
                              ? 'Activate left leg'
                              : 'Activate right leg'
                        }
                      />
                    </ListItem>
                  )}
                </List>

      <Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    At your current pace, you can achieve {nextRank.name} rank in approximately{' '}
                    <strong>2-3 months</strong>. Keep up the great work!
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
};

export default RankProgress;
