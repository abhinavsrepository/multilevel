import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  People,
  CheckCircle,
  Info,
  Lock,
  LockOpen
} from '@mui/icons-material';
import { getMatchingEligibility, MatchingEligibility } from '@/api/matching-bonus.api';

const RankEligibilityWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<MatchingEligibility | null>(null);

  useEffect(() => {
    fetchEligibility();
  }, []);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMatchingEligibility();
      setEligibility(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load eligibility data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error || !eligibility) {
    return (
      <Alert severity="error">
        {error || 'Failed to load eligibility information'}
      </Alert>
    );
  }

  const progressPercentage = eligibility.nextRank
    ? Math.min(
        (eligibility.nextRank.progress.directReferrals.current /
          eligibility.nextRank.progress.directReferrals.required) *
          100,
        100
      )
    : 100;

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden', mb: 3 }}>
      {/* Header */}
      <Box
        sx={{
          background: eligibility.eligible
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          p: 3,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEvents sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Current Rank
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {eligibility.currentRank}
              </Typography>
            </Box>
          </Box>
          {eligibility.eligible ? (
            <LockOpen sx={{ fontSize: 40, opacity: 0.7 }} />
          ) : (
            <Lock sx={{ fontSize: 40, opacity: 0.7 }} />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {eligibility.eligible ? (
            <>
              <CheckCircle fontSize="small" />
              <Typography variant="body2">
                Matching Bonus Active - Depth: {eligibility.matchingDepth} Level
                {eligibility.matchingDepth > 1 ? 's' : ''}
              </Typography>
            </>
          ) : (
            <>
              <Info fontSize="small" />
              <Typography variant="body2">{eligibility.reason || 'Not eligible for matching bonus'}</Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Matching Depth Info */}
      {eligibility.eligible && (
        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Matching Percentages by Level
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(eligibility.matchingPercentages).map(([level, percentage]) => (
              <Grid item xs={6} sm={4} md={3} key={level}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Level {level}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {percentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Divider />

      {/* Next Rank Goal */}
      {eligibility.nextRank ? (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Next Rank Goal
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {eligibility.nextRank.name}
              </Typography>
            </Box>
            <Chip
              icon={<TrendingUp />}
              label={`${eligibility.nextRank.matchingDepth} Levels`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Progress for Direct Referrals */}
          {eligibility.nextRank.requirements.minPersonallySponsored > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    Personally Sponsored Agents
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {eligibility.nextRank.progress.directReferrals.current} /{' '}
                  {eligibility.nextRank.progress.directReferrals.required}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {eligibility.nextRank.requirements.minPersonallySponsored -
                  eligibility.nextRank.progress.directReferrals.current}{' '}
                more agents needed
              </Typography>
            </Box>
          )}

          {/* Requirements List */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Requirements to Unlock:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {eligibility.nextRank.progress.directReferrals.current >=
                eligibility.nextRank.requirements.minPersonallySponsored ? (
                  <CheckCircle fontSize="small" color="success" />
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'grey.400'
                    }}
                  />
                )}
                <Typography variant="body2">
                  {eligibility.nextRank.requirements.minPersonallySponsored} Personally Sponsored Agents
                </Typography>
              </Box>

              {eligibility.nextRank.requirements.requiresDirectSale && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'grey.400'
                    }}
                  />
                  <Typography variant="body2">Complete at least one direct sale</Typography>
                </Box>
              )}

              {eligibility.nextRank.requirements.requiresActiveLegs && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'grey.400'
                    }}
                  />
                  <Typography variant="body2">Maintain active left and right legs</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Benefits Card */}
          <Card
            variant="outlined"
            sx={{
              mt: 2,
              borderColor: 'primary.main',
              bgcolor: 'primary.50'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                Benefits When You Achieve {eligibility.nextRank.name}:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Match on {eligibility.nextRank.matchingDepth} levels deep (currently{' '}
                {eligibility.matchingDepth})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Earn from {eligibility.nextRank.matchingDepth - eligibility.matchingDepth} more generation
                {eligibility.nextRank.matchingDepth - eligibility.matchingDepth > 1 ? 's' : ''} of downline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Increased earning potential from your team's commissions
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Congratulations!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have reached the highest rank with maximum matching bonus depth.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RankEligibilityWidget;
