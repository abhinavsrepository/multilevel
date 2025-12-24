import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  Skeleton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  ArrowForward,
  Lock
} from '@mui/icons-material';

// APIs & Types
import { getRankProgress, getAvailableRanks } from '@/api/user.api';
import { RankProgress as RankProgressType, Rank } from '@/types';
import { formatCurrency } from '@/utils/formatters';

// Components
import RankMilestoneMap from '@/components/rank/RankMilestoneMap';
import BalanceGauge from '@/components/rank/BalanceGauge';

const RankProgress: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankData, setRankData] = useState<RankProgressType | null>(null);
  const [allRanks, setAllRanks] = useState<Rank[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progressRes, ranksRes] = await Promise.all([
        getRankProgress(),
        getAvailableRanks()
      ]);
      setRankData(progressRes.data ?? null);
      setAllRanks(ranksRes.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rank progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = (rankName: string) => {
    // Implement claim logic or redirect
    alert(`Claiming reward for ${rankName}... (Request sent to admin)`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!rankData) return null;

  const { currentRank, nextRank, overallProgress, progress } = rankData;
  const isMaxRank = !nextRank;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        My Rank & Rewards
      </Typography>

      {/* 1. Horizontal Milestone Map */}
      <RankMilestoneMap
        ranks={allRanks}
        currentRank={currentRank}
        nextRank={nextRank}
        currentVolume={progress.balancing?.totalValidVolume || progress.teamInvestment.current}
      />

      {/* 2. Main Status Card */}
      <Paper
        sx={{
          p: 0,
          mb: 4,
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>Current Status</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              {currentRank.name}
            </Typography>
            {nextRank ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Next Goal: <strong>{nextRank.name}</strong>
                </Typography>
                <ArrowForward sx={{ opacity: 0.7 }} />
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Reward: <strong>{nextRank.oneTimeBonus ? formatCurrency(nextRank.oneTimeBonus) : 'Exclusive Benefits'}</strong>
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ opacity: 0.9 }}>You have reached the pinnacle!</Typography>
            )}
          </Box>

          <Box sx={{ mt: { xs: 3, md: 0 }, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Box
                sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>{Math.round(overallProgress)}%</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Complete</Typography>
              </Box>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={339.292}
                  strokeDashoffset={339.292 * (1 - overallProgress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* 3. 40:60 Balance Gauge (Left) */}
        <Grid item xs={12} lg={8}>
          {progress.balancing ? (
            <BalanceGauge balancing={progress.balancing} />
          ) : (
            <Alert severity="warning">Balancing data not available</Alert>
          )}
        </Grid>

        {/* 4. Requirements Checklist (Right) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Requirements for {nextRank?.name || 'Next Rank'}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List disablePadding>
                {/* 1. Direct Referrals */}
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {progress.directReferrals.percentage >= 100 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Direct Referrals"
                    secondary={`${progress.directReferrals.current} / ${progress.directReferrals.required} Active`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {progress.directReferrals.percentage}%
                  </Typography>
                </ListItem>

                {/* 2. Personal Investment */}
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {progress.personalInvestment.percentage >= 100 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Personal Investment"
                    secondary={`${formatCurrency(progress.personalInvestment.current)} / ${formatCurrency(progress.personalInvestment.required)}`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {progress.personalInvestment.percentage}%
                  </Typography>
                </ListItem>

                {/* 3. Team Volume (Balanced) */}
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {progress.teamInvestment.percentage >= 100 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Balanced Team Volume"
                    secondary={
                      <Box component="span">
                        {formatCurrency(progress.balancing?.totalValidVolume || progress.teamInvestment.current)}
                        {' / '}
                        {formatCurrency(progress.balancing?.target || progress.teamInvestment.required)}
                        <Typography variant="caption" display="block" color="text.secondary">
                          (Calculated via 40:60 Rule)
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {progress.teamInvestment.percentage}%
                  </Typography>
                </ListItem>

                {/* 4. Active Legs */}
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {progress.activeLegs.achieved ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Active Legs"
                    secondary={
                      !progress.activeLegs.achieved
                        ? (!progress.activeLegs.leftActive ? 'Activate Left Leg' : 'Activate Right Leg')
                        : 'Both Legs Active'
                    }
                  />
                </ListItem>
              </List>

              {/* Claim Reward Button */}
              {overallProgress >= 100 && !isMaxRank && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<EmojiEvents />}
                    onClick={() => nextRank && handleClaimReward(nextRank.name)}
                    sx={{
                      borderRadius: 50,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                        '100%': { transform: 'scale(1)' },
                      }
                    }}
                  >
                    Claim {nextRank?.oneTimeBonus ? formatCurrency(nextRank.oneTimeBonus) : 'Reward'}
                  </Button>
                </Box>
              )}

              {/* Locked Message */}
              {overallProgress < 100 && !isMaxRank && (
                <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock color="disabled" />
                  <Typography variant="caption" color="text.secondary">
                    Reward locked. Complete all requirements to unlock.
                  </Typography>
                </Box>
              )}

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RankProgress;
