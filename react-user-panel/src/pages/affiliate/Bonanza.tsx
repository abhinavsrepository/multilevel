import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Tabs,
  Tab
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { getActiveBonanzas, getMyBonanzaAchievements, Bonanza, BonanzaAchievement } from '../../api/bonanza.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BonanzaPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeBonanzas, setActiveBonanzas] = useState<Bonanza[]>([]);
  const [achievements, setAchievements] = useState<BonanzaAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bonanzasRes, achievementsRes] = await Promise.all([
        getActiveBonanzas(),
        getMyBonanzaAchievements()
      ]);

      if (bonanzasRes.success) {
        setActiveBonanzas(bonanzasRes.data);
      }

      if (achievementsRes.success) {
        setAchievements(achievementsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bonanza data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" display="flex" alignItems="center">
          <TrophyIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          Bonanza Offers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Achieve targets and win exciting rewards!
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Active Bonanzas" />
          <Tab label="My Achievements" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {activeBonanzas.length === 0 ? (
          <Alert severity="info">
            No active bonanza offers at the moment. Check back soon for exciting opportunities!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {activeBonanzas.map((bonanza) => (
              <Grid item xs={12} key={bonanza.id}>
                <Card
                  elevation={3}
                  sx={{
                    border: bonanza.userProgress?.qualified ? '2px solid #4caf50' : 'none',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  {bonanza.userProgress?.qualified && (
                    <Chip
                      icon={<CheckIcon />}
                      label="Qualified!"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 16,
                        fontWeight: 'bold'
                      }}
                    />
                  )}

                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {bonanza.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {bonanza.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${getDaysRemaining(bonanza.endDate)} days left`}
                        color="warning"
                        size="small"
                      />
                    </Box>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Target Amount
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(bonanza.targetAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Reward
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {bonanza.reward}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Period
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(bonanza.startDate)} - {formatDate(bonanza.endDate)}
                        </Typography>
                      </Grid>
                    </Grid>

                    {bonanza.userProgress && (
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" fontWeight="medium">
                            Your Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {bonanza.userProgress.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(bonanza.userProgress.percentage, 100)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            mb: 1,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: bonanza.userProgress.qualified ? '#4caf50' : undefined
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(bonanza.userProgress.currentAmount)} / {formatCurrency(bonanza.userProgress.targetAmount)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {achievements.length === 0 ? (
          <Alert severity="info">
            You haven't achieved any bonanza rewards yet. Keep investing to unlock exciting rewards!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {achievements.map((achievement) => (
              <Grid item xs={12} key={achievement.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2}>
                        <TrophyIcon color="primary" fontSize="large" />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {achievement.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Achieved on {formatDate(achievement.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          {formatCurrency(achievement.amount)}
                        </Typography>
                        <Chip
                          label={achievement.status}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Container>
  );
};

export default BonanzaPage;
