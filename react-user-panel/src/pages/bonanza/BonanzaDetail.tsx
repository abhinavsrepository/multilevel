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
  Button,
  CircularProgress,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  EmojiEvents,
  Timer,
  CheckCircle,
  Cancel,
  TrendingUp,
  People,
  AccountBalance,
  Star,
  Refresh,
  ArrowBack,
  LocalFireDepartment,
  Groups,
  Business
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProgress, getBonanzaLeaderboard, checkQualification, DetailedProgress, LeaderboardResponse } from '@/api/bonanza.api';

const BonanzaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DetailedProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progressData, leaderboardData] = await Promise.all([
        getMyProgress(Number(id)),
        getBonanzaLeaderboard(Number(id), 10)
      ]);
      setProgress(progressData);
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bonanza details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await checkQualification();
      await fetchData();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !progress) {
    return (
      <Box>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchData}>
            Retry
          </Button>
        }>
          {error || 'Failed to load bonanza details'}
        </Alert>
      </Box>
    );
  }

  const { bonanza, qualification, requirements, isQualified } = progress;

  return (
    <Box>
      {/* Header with Back Button */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => navigate('/bonanza')}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            {bonanza.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bonanza.description}
          </Typography>
        </Box>
        <Tooltip title="Refresh Progress">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh className={refreshing ? 'rotating' : ''} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Progress Tracking */}
        <Grid item xs={12} md={8}>
          {/* Main Progress Card */}
          <Paper
            elevation={3}
            sx={{
              background: isQualified
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              p: 3,
              mb: 3
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  {isQualified ? 'Congratulations! You Qualified!' : 'Track Your Progress'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {isQualified
                    ? `Qualified on ${formatDate(qualification.qualifiedDate || '')}`
                    : `${bonanza.daysRemaining} days remaining to qualify`}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" fontWeight="bold">
                  {qualification.overallProgress.toFixed(0)}%
                </Typography>
                <Typography variant="caption">Complete</Typography>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(qualification.overallProgress, 100)}
              sx={{
                height: 12,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white'
                }
              }}
            />

            {isQualified && qualification.rank && (
              <Box mt={2} textAlign="center">
                <Chip
                  icon={<Star />}
                  label={`Leaderboard Rank: #${qualification.rank}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                />
              </Box>
            )}
          </Paper>

          {/* Individual Requirements Progress */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <LocalFireDepartment color="error" />
              Qualification Requirements
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* Sales Volume Requirement */}
              {requirements.salesVolume && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Business color="primary" />
                      <Typography variant="body1" fontWeight="medium">
                        Personal Sales Volume
                      </Typography>
                      {requirements.salesVolume.met && <CheckCircle color="success" fontSize="small" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(requirements.salesVolume.current)} / {formatCurrency(requirements.salesVolume.required)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(requirements.salesVolume.percentage, 100)}
                    color={getProgressColor(requirements.salesVolume.percentage)}
                    sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {requirements.salesVolume.percentage.toFixed(1)}% Complete
                    {requirements.salesVolume.remaining > 0 &&
                      ` • ${formatCurrency(requirements.salesVolume.remaining)} remaining`}
                  </Typography>
                </Box>
              )}

              {/* Direct Referrals Requirement */}
              {requirements.directReferrals && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <People color="primary" />
                      <Typography variant="body1" fontWeight="medium">
                        New Direct Referrals
                      </Typography>
                      {requirements.directReferrals.met && <CheckCircle color="success" fontSize="small" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {requirements.directReferrals.current} / {requirements.directReferrals.required}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(requirements.directReferrals.percentage, 100)}
                    color={getProgressColor(requirements.directReferrals.percentage)}
                    sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {requirements.directReferrals.percentage.toFixed(1)}% Complete
                    {requirements.directReferrals.remaining > 0 &&
                      ` • ${requirements.directReferrals.remaining} more needed`}
                  </Typography>
                </Box>
              )}

              {/* Team Volume Requirement */}
              {requirements.teamVolume && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Groups color="primary" />
                      <Typography variant="body1" fontWeight="medium">
                        Team Business Volume
                      </Typography>
                      {requirements.teamVolume.met && <CheckCircle color="success" fontSize="small" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(requirements.teamVolume.current)} / {formatCurrency(requirements.teamVolume.required)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(requirements.teamVolume.percentage, 100)}
                    color={getProgressColor(requirements.teamVolume.percentage)}
                    sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {requirements.teamVolume.percentage.toFixed(1)}% Complete
                    {requirements.teamVolume.remaining > 0 &&
                      ` • ${formatCurrency(requirements.teamVolume.remaining)} remaining`}
                  </Typography>
                </Box>
              )}

              {/* Rank Requirement */}
              {requirements.rank && (
                <Box sx={{ p: 2, bgcolor: requirements.rank.met ? 'success.50' : 'grey.100', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {requirements.rank.met ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                    <Typography variant="body2">
                      <strong>Rank Requirement:</strong> {requirements.rank.required}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Your current rank: {requirements.rank.current || 'No rank'}
                  </Typography>
                </Box>
              )}

              {/* Club Requirement */}
              {requirements.club && (
                <Box sx={{ p: 2, bgcolor: requirements.club.met ? 'success.50' : 'grey.100', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {requirements.club.met ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                    <Typography variant="body2">
                      <strong>Club Requirement:</strong> {requirements.club.required}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Your current club: {requirements.club.current || 'No club'}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Milestones */}
          {progress.milestones && progress.milestones.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Milestones Achieved
              </Typography>
              <List>
                {progress.milestones.map((milestone, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={milestone.name}
                      secondary={`Achieved on ${formatDate(milestone.achievedDate)} • Value: ${milestone.value}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Info & Leaderboard */}
        <Grid item xs={12} md={4}>
          {/* Bonanza Info Card */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <EmojiEvents color="warning" />
              Bonanza Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              {/* Time Remaining */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Time Remaining
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Timer color="action" />
                  <Typography variant="h6" fontWeight="bold" color={bonanza.daysRemaining <= 7 ? 'error.main' : 'text.primary'}>
                    {bonanza.daysRemaining} Days
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Ends on {formatDate(bonanza.endDate)}
                </Typography>
              </Box>

              {/* Reward */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Reward
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'success.50',
                    border: '1px solid',
                    borderColor: 'success.200',
                    borderRadius: 1,
                    p: 1.5,
                    mt: 1
                  }}
                >
                  <Typography variant="h5" color="success.dark" fontWeight="bold">
                    {bonanza.rewardDescription ||
                     (bonanza.rewardAmount ? formatCurrency(bonanza.rewardAmount) : 'Special Prize')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Type: {bonanza.rewardType}
                  </Typography>
                </Box>
              </Box>

              {/* Status */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Your Status
                </Typography>
                <Chip
                  label={qualification.status}
                  color={qualification.status === 'QUALIFIED' || qualification.status === 'AWARDED' ? 'success' : 'primary'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<TrendingUp />}
                onClick={() => navigate(`/bonanza/${id}/leaderboard`)}
              >
                View Full Leaderboard
              </Button>
            </Stack>
          </Paper>

          {/* Top 10 Leaderboard Preview */}
          {leaderboard && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <Star color="warning" />
                Top Performers
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {leaderboard.myPosition && (
                <Box
                  sx={{
                    bgcolor: 'primary.50',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    p: 1.5,
                    mb: 2
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Your Position
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    #{leaderboard.myPosition.rank}
                  </Typography>
                  <Typography variant="caption">
                    {leaderboard.myPosition.overallProgress.toFixed(1)}% progress
                  </Typography>
                </Box>
              )}

              <List dense>
                {leaderboard.leaderboard.slice(0, 5).map((entry) => (
                  <ListItem
                    key={entry.userId}
                    sx={{
                      bgcolor: entry.rank <= 3 ? 'warning.50' : 'transparent',
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? '#CD7F32' : 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      >
                        {entry.rank}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={entry.name || entry.username}
                      secondary={`${entry.overallProgress.toFixed(1)}% progress`}
                    />
                  </ListItem>
                ))}
              </List>

              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                Total Participants: {leaderboard.totalParticipants}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes rotating {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .rotating {
            animation: rotating 1s linear infinite;
          }
        `}
      </style>
    </Box>
  );
};

export default BonanzaDetail;
