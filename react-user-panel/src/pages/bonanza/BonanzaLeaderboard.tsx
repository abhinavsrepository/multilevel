import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  Grid,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  EmojiEvents,
  Star,
  TrendingUp,
  Refresh
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getBonanzaLeaderboard, getMyProgress, LeaderboardResponse } from '@/api/bonanza.api';

const BonanzaLeaderboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [bonanzaName, setBonanzaName] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leaderboardData, progressData] = await Promise.all([
        getBonanzaLeaderboard(Number(id), 50),
        getMyProgress(Number(id))
      ]);
      setLeaderboard(leaderboardData);
      setBonanzaName(progressData.bonanza.name);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'transparent';
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'QUALIFIED':
      case 'AWARDED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      default:
        return 'default';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !leaderboard) {
    return (
      <Box>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={fetchData}>
            <Refresh />
          </IconButton>
        }>
          {error || 'Failed to load leaderboard'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => navigate(`/bonanza/${id}`)}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1}>
            <EmojiEvents color="warning" />
            Leaderboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bonanzaName}
          </Typography>
        </Box>
        <IconButton onClick={fetchData}>
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* My Position Card */}
        {leaderboard.myPosition && (
          <Grid item xs={12}>
            <Card
              elevation={3}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3} textAlign="center">
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Your Rank
                    </Typography>
                    <Typography variant="h2" fontWeight="bold">
                      #{leaderboard.myPosition.rank}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(leaderboard.myPosition.overallProgress, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white'
                        }
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold" mt={0.5}>
                      {leaderboard.myPosition.overallProgress.toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} textAlign="center">
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={leaderboard.myPosition.status}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Top 3 Podium */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
              Top 3 Performers
            </Typography>
            <Grid container spacing={2} justifyContent="center" alignItems="flex-end" mt={2}>
              {/* 2nd Place */}
              {leaderboard.leaderboard[1] && (
                <Grid item xs={4}>
                  <Card
                    elevation={2}
                    sx={{
                      textAlign: 'center',
                      bgcolor: '#F5F5F5',
                      border: '2px solid #C0C0C0',
                      height: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#C0C0C0',
                          margin: '0 auto 8px',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        2
                      </Avatar>
                      <Typography variant="body1" fontWeight="bold" noWrap>
                        {leaderboard.leaderboard[1].name || leaderboard.leaderboard[1].username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {leaderboard.leaderboard[1].overallProgress.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* 1st Place */}
              {leaderboard.leaderboard[0] && (
                <Grid item xs={4}>
                  <Card
                    elevation={4}
                    sx={{
                      textAlign: 'center',
                      bgcolor: '#FFFBEA',
                      border: '3px solid #FFD700',
                      height: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <CardContent>
                      <Star sx={{ color: '#FFD700', fontSize: 40, mb: 1 }} />
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#FFD700',
                          margin: '0 auto 8px',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        1
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {leaderboard.leaderboard[0].name || leaderboard.leaderboard[0].username}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight="medium">
                        {leaderboard.leaderboard[0].overallProgress.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* 3rd Place */}
              {leaderboard.leaderboard[2] && (
                <Grid item xs={4}>
                  <Card
                    elevation={2}
                    sx={{
                      textAlign: 'center',
                      bgcolor: '#FFF8F0',
                      border: '2px solid #CD7F32',
                      height: '160px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: '#CD7F32',
                          margin: '0 auto 8px',
                          fontSize: '1.25rem',
                          fontWeight: 'bold'
                        }}
                      >
                        3
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {leaderboard.leaderboard[2].name || leaderboard.leaderboard[2].username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {leaderboard.leaderboard[2].overallProgress.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Full Leaderboard Table */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                All Participants
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Total: {leaderboard.totalParticipants} participants
              </Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="80px">
                      <strong>Rank</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Participant</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Progress</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Score</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.leaderboard.map((entry) => (
                    <TableRow
                      key={entry.userId}
                      sx={{
                        bgcolor: entry.rank <= 3 ? getMedalColor(entry.rank) + '10' : 'transparent',
                        '&:hover': {
                          bgcolor: entry.rank <= 3 ? getMedalColor(entry.rank) + '20' : 'action.hover'
                        }
                      }}
                    >
                      <TableCell align="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: getMedalColor(entry.rank) || 'grey.200',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            color: entry.rank <= 3 ? 'white' : 'text.primary'
                          }}
                        >
                          {entry.rank}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {entry.name || entry.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{entry.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box width="150px" mx="auto">
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" fontWeight="bold">
                              {entry.overallProgress.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(entry.overallProgress, 100)}
                            color={
                              entry.overallProgress >= 100 ? 'success' :
                              entry.overallProgress >= 75 ? 'primary' :
                              entry.overallProgress >= 50 ? 'info' : 'warning'
                            }
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={entry.status}
                          color={getStatusColor(entry.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {entry.leaderboardScore.toFixed(0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BonanzaLeaderboard;
