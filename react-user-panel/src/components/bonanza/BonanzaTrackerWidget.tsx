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
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  EmojiEvents,
  Timer,
  TrendingUp,
  CheckCircle,
  Refresh,
  ArrowForward,
  Star,
  LocalFireDepartment,
  Groups
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getActiveBonanzas, getBonanzaSummary, checkQualification, Bonanza, BonanzaSummary } from '@/api/bonanza.api';

const BonanzaTrackerWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBonanzas, setActiveBonanzas] = useState<Bonanza[]>([]);
  const [summary, setSummary] = useState<BonanzaSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bonanzasData, summaryData] = await Promise.all([
        getActiveBonanzas(),
        getBonanzaSummary()
      ]);
      setActiveBonanzas(bonanzasData.slice(0, 3)); // Show top 3 on dashboard
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bonanza data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await checkQualification();
      await fetchData();
    } catch (err: any) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUALIFIED':
      case 'AWARDED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'PENDING':
        return 'default';
      case 'DISQUALIFIED':
      case 'EXPIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading Bonanza Campaigns...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (activeBonanzas.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <EmojiEvents sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Active Bonanzas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check back later for new exciting bonanza campaigns!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden', mb: 3 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2.5
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <LocalFireDepartment />
            <Typography variant="h6" fontWeight="bold">
              Active Bonanza Campaigns
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Progress">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ color: 'white' }}
              >
                <Refresh className={refreshing ? 'rotating' : ''} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Stats */}
        {summary && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                  {summary.activeBonanzas}
                </Typography>
                <Typography variant="caption">Active</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                  {summary.participating}
                </Typography>
                <Typography variant="caption">Participating</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                  {summary.qualified}
                </Typography>
                <Typography variant="caption">Qualified</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.totalEarned)}
                </Typography>
                <Typography variant="caption">Earned</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Bonanza Cards */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {activeBonanzas.map((bonanza) => (
            <Card
              key={bonanza.id}
              elevation={2}
              sx={{
                border: bonanza.myProgress?.status === 'QUALIFIED' ? '2px solid' : 'none',
                borderColor: 'success.main',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                {/* Bonanza Header */}
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {bonanza.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {bonanza.description}
                    </Typography>
                  </Box>
                  {bonanza.myProgress && (
                    <Chip
                      label={bonanza.myProgress.status}
                      color={getStatusColor(bonanza.myProgress.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>

                {/* Time Remaining */}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Timer fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {bonanza.daysRemaining !== undefined && bonanza.daysRemaining > 0
                      ? `${bonanza.daysRemaining} days remaining`
                      : 'Ending soon!'}
                  </Typography>
                  {bonanza.slotsRemaining !== null && bonanza.slotsRemaining !== undefined && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      <Groups fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {bonanza.slotsRemaining} slots left
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Reward Info */}
                <Box
                  sx={{
                    bgcolor: 'success.50',
                    border: '1px solid',
                    borderColor: 'success.200',
                    borderRadius: 1,
                    p: 1.5,
                    mb: 2
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Reward
                  </Typography>
                  <Typography variant="h6" color="success.dark" fontWeight="bold">
                    {bonanza.rewardDescription ||
                     (bonanza.rewardAmount ? formatCurrency(bonanza.rewardAmount) : 'Special Prize')}
                  </Typography>
                </Box>

                {/* Progress Section */}
                {bonanza.myProgress ? (
                  <>
                    <Box mb={1}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          Overall Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={getProgressColor(bonanza.myProgress.overallProgress)}>
                          {bonanza.myProgress.overallProgress.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(bonanza.myProgress.overallProgress, 100)}
                        color={getProgressColor(bonanza.myProgress.overallProgress)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>

                    {/* Individual Progress Bars */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {bonanza.myProgress.salesProgress > 0 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Sales: {bonanza.myProgress.salesProgress.toFixed(0)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(bonanza.myProgress.salesProgress, 100)}
                            sx={{ height: 4, borderRadius: 1 }}
                          />
                        </Grid>
                      )}
                      {bonanza.myProgress.referralProgress > 0 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Referrals: {bonanza.myProgress.referralProgress.toFixed(0)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(bonanza.myProgress.referralProgress, 100)}
                            sx={{ height: 4, borderRadius: 1 }}
                          />
                        </Grid>
                      )}
                      {bonanza.myProgress.teamVolumeProgress > 0 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Team: {bonanza.myProgress.teamVolumeProgress.toFixed(0)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(bonanza.myProgress.teamVolumeProgress, 100)}
                            sx={{ height: 4, borderRadius: 1 }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Start participating to track your progress!
                    </Typography>
                  </Alert>
                )}

                {/* Actions */}
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/bonanza/${bonanza.id}/leaderboard`)}
                    startIcon={<TrendingUp />}
                  >
                    Leaderboard
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/bonanza/${bonanza.id}`)}
                    endIcon={<ArrowForward />}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* View All Button */}
        {activeBonanzas.length > 0 && (
          <Box textAlign="center" mt={2}>
            <Button
              variant="text"
              onClick={() => navigate('/bonanza')}
              endIcon={<ArrowForward />}
            >
              View All Bonanzas
            </Button>
          </Box>
        )}
      </Box>

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
    </Paper>
  );
};

export default BonanzaTrackerWidget;
