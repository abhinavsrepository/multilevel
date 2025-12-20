import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Skeleton,
  Alert,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Lock,
  EmojiEvents,
  CardGiftcard,
  MonetizationOn,
  TrendingUp,
  Star,
} from '@mui/icons-material';

import { getAvailableRanks, getRankProgress } from '@/api/user.api';
import { Rank } from '@/types';
import { formatCurrency } from '@/utils/formatters';
const AllRanks: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [currentRankId, setCurrentRankId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllRanks();
  }, []);

  const fetchAllRanks = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ranksResponse, progressResponse] = await Promise.all([
        getAvailableRanks(),
        getRankProgress(),
      ]);

      setRanks(ranksResponse.data || []);
      setCurrentRankId(progressResponse.data?.currentRank?.id || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ranks');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (displayOrder: number) => {
    const icons = ['🥉', '🥈', '🥇', '💎', '👑', '⭐', '🏆', '🌟'];
    return icons[displayOrder - 1] || '🏅';
  };

  const getRankColor = (displayOrder: number, isCurrentRank: boolean) => {
    if (isCurrentRank) return theme.palette.primary.main;

    const colors = [
      '#cd7f32', // Bronze
      '#c0c0c0', // Silver
      '#ffd700', // Gold
      '#b9f2ff', // Diamond
      '#800080', // Purple (Crown)
      '#ff6b6b', // Red
      '#ee5a6f', // Pink
      '#f9ca24', // Yellow
    ];
    return colors[displayOrder - 1] || theme.palette.grey[500];
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Rank Achievement System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Progress through ranks to unlock exclusive benefits and rewards
        </Typography>
      </Box>

      {/* Ranks Grid */}
      <Grid container spacing={3}>
        {ranks.map((rank) => {
          const isCurrentRank = rank.id === currentRankId;
          const isAchieved = rank.displayOrder <= (ranks.find((r) => r.id === currentRankId)?.displayOrder || 0);
          const rankColor = getRankColor(rank.displayOrder, isCurrentRank);

          return (
            <Grid item xs={12} md={6} lg={4} key={rank.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  border: 2,
                  borderColor: isCurrentRank ? 'primary.main' : 'transparent',
                  boxShadow: isCurrentRank
                    ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                    : undefined,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                {/* Current Rank Badge */}
                {isCurrentRank && (
                  <Chip
                    label="Current Rank"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      fontWeight: 700,
                    }}
                  />
                )}

                {/* Locked/Unlocked Badge */}
                {!isAchieved && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      zIndex: 1,
                      bgcolor: 'background.paper',
                      borderRadius: '50%',
                      p: 1,
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <Lock color="action" />
                  </Box>
                )}

                <CardContent>
                  {/* Rank Icon & Name */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        bgcolor: alpha(rankColor, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 2,
                        fontSize: 48,
                        border: 3,
                        borderColor: alpha(rankColor, 0.3),
                      }}
                    >
                      {getRankIcon(rank.displayOrder)}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: rankColor,
                        mb: 0.5,
                      }}
                    >
                      {rank.name}
                    </Typography>
                    <Chip
                      icon={<Star />}
                      label={`Level ${rank.displayOrder}`}
                      size="small"
                      sx={{
                        bgcolor: alpha(rankColor, 0.1),
                        color: rankColor,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Requirements */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Requirements
                  </Typography>
                  <List dense sx={{ mb: 2 }}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <EmojiEvents fontSize="small" color={isAchieved ? 'success' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${rank.requiredDirectReferrals} Direct Referrals`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <TrendingUp fontSize="small" color={isAchieved ? 'success' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${formatCurrency(rank.requiredTeamInvestment)} Team Investment`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MonetizationOn fontSize="small" color={isAchieved ? 'success' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${formatCurrency(rank.requiredPersonalInvestment)} Personal Investment`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    {rank.requireActiveLegs && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle fontSize="small" color={isAchieved ? 'success' : 'action'} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Active Legs Required"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Divider sx={{ mb: 2 }} />

                  {/* Benefits */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Benefits
                  </Typography>

                  {/* Bonuses */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {rank.oneTimeBonus > 0 && (
                      <Grid item xs={6}>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'success.lighter',
                            borderRadius: 1.5,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            One-Time
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: 'success.main' }}
                          >
                            {formatCurrency(rank.oneTimeBonus)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {rank.monthlyBonus > 0 && (
                      <Grid item xs={6}>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'primary.lighter',
                            borderRadius: 1.5,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            Monthly
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
                            {formatCurrency(rank.monthlyBonus)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {rank.commissionBoost > 0 && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'warning.lighter',
                            borderRadius: 1.5,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            Commission Boost
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: 'warning.main' }}
                          >
                            +{rank.commissionBoost}%
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Benefits List */}
                  {rank.benefits && rank.benefits.length > 0 && (
                    <List dense>
                      {rank.benefits.slice(0, 3).map((benefit, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CardGiftcard
                              fontSize="small"
                              color={isAchieved ? 'success' : 'action'}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={benefit}
                            primaryTypographyProps={{
                              variant: 'caption',
                              sx: { opacity: isAchieved ? 1 : 0.7 },
                            }}
                          />
                        </ListItem>
                      ))}
                      {rank.benefits.length > 3 && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4.5 }}>
                          +{rank.benefits.length - 3} more benefits
                        </Typography>
                      )}
                    </List>
                  )}

                  {/* Achievement Status */}
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    {isAchieved ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Achieved"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        icon={<Lock />}
                        label="Locked"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer Note */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Ranks are achieved automatically when you meet all requirements.
          Keep working towards your next rank to unlock amazing benefits and rewards!
        </Typography>
      </Alert>
    </Box>
  );
};

export default AllRanks;
