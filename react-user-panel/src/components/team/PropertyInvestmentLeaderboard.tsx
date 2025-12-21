import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  useTheme,
  Stack,
  LinearProgress,
} from '@mui/material';
import { EmojiEvents, TrendingUp, Home } from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface LeaderboardEntry {
  id: number;
  name: string;
  userId: string;
  profilePicture?: string;
  rank: string;
  totalInvestment: number;
  propertiesCount: number;
  performanceScore: number;
  bv: number;
}

interface PropertyInvestmentLeaderboardProps {
  data: LeaderboardEntry[];
  maxEntries?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const PropertyInvestmentLeaderboard: React.FC<PropertyInvestmentLeaderboardProps> = ({
  data,
  maxEntries = 10,
  showHeader = true,
  compact = false,
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRankColor = (position: number) => {
    if (position === 1) return theme.palette.warning.main;
    if (position === 2) return theme.palette.grey[400];
    if (position === 3) return '#CD7F32';
    return theme.palette.primary.main;
  };

  const getRankIcon = (position: number) => {
    const color = getRankColor(position);
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.125rem',
        }}
      >
        {position <= 3 ? <EmojiEvents /> : position}
      </Box>
    );
  };

  const displayData = data.slice(0, maxEntries);

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {showHeader && (
        <Box
          sx={{
            p: 3,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <EmojiEvents sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Property Investment Leaders
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Top performers in real estate investments
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ p: compact ? 2 : 3 }}>
        <Stack spacing={compact ? 1.5 : 2}>
          {displayData.map((entry, index) => {
            const position = index + 1;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: compact ? 1.5 : 2,
                    borderRadius: 2,
                    bgcolor: position <= 3 ? `${getRankColor(position)}15` : 'background.default',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  {/* Rank Badge */}
                  {getRankIcon(position)}

                  {/* Avatar */}
                  <Avatar
                    src={entry.profilePicture}
                    alt={entry.name}
                    sx={{
                      width: compact ? 44 : 56,
                      height: compact ? 44 : 56,
                      border: `2px solid ${getRankColor(position)}`,
                    }}
                  >
                    {entry.name.charAt(0)}
                  </Avatar>

                  {/* Member Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant={compact ? 'body2' : 'body1'}
                      fontWeight={600}
                      noWrap
                      sx={{ mb: 0.5 }}
                    >
                      {entry.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {entry.userId}
                      </Typography>
                      <Chip
                        label={entry.rank}
                        size="small"
                        sx={{ height: 20, fontSize: '0.625rem' }}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {/* Stats */}
                  {!compact && (
                    <Box sx={{ display: 'flex', gap: 3, mr: 2 }}>
                      <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                          <Home sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Properties
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {entry.propertiesCount}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                          <TrendingUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Investment
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(entry.totalInvestment)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Performance Score */}
                  <Box sx={{ minWidth: compact ? 60 : 100 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5, textAlign: 'center' }}
                    >
                      Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!compact && (
                        <LinearProgress
                          variant="determinate"
                          value={entry.performanceScore}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getRankColor(position),
                            },
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: getRankColor(position), minWidth: 35, textAlign: 'right' }}
                      >
                        {entry.performanceScore}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Stack>

        {displayData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <EmojiEvents sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Leaderboard Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start investing in properties to appear on the leaderboard
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PropertyInvestmentLeaderboard;
