import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
  changePercentage?: number;
  trend?: 'up' | 'down';
  loading?: boolean;
  variant?: 'default' | 'gradient' | 'outlined';
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = '#667eea',
  bgColor,
  changePercentage,
  trend,
  loading = false,
  variant = 'default',
  onClick,
}) => {
  // Determine background color if not provided
  const backgroundColor = bgColor || `${color}20`;

  // Determine if trend is positive or negative based on changePercentage
  const isPositiveTrend = changePercentage !== undefined ? changePercentage >= 0 : trend === 'up';
  const trendColor = isPositiveTrend ? 'success.main' : 'error.main';
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  // Card styles based on variant
  const getCardStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: 'white',
          '& .MuiTypography-root': {
            color: 'white',
          },
        };
      case 'outlined':
        return {
          border: 2,
          borderColor: color,
          bgcolor: 'background.paper',
        };
      default:
        return {
          borderLeft: 4,
          borderColor: color,
          bgcolor: 'background.paper',
        };
    }
  };

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="circular" width={56} height={56} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        ...getCardStyles(),
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            }
          : {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            {/* Title */}
            <Typography
              variant="body2"
              color={variant === 'gradient' ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary'}
              gutterBottom
              fontWeight={500}
            >
              {title}
            </Typography>

            {/* Value */}
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                mb: 1,
                color: variant === 'gradient' ? 'white' : color,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>

            {/* Change Percentage / Trend */}
            {(changePercentage !== undefined || trend) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendIcon
                  sx={{
                    fontSize: 18,
                    color: variant === 'gradient' ? 'white' : trendColor,
                  }}
                />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    color: variant === 'gradient' ? 'white' : trendColor,
                  }}
                >
                  {changePercentage !== undefined
                    ? `${changePercentage > 0 ? '+' : ''}${changePercentage}%`
                    : trend === 'up'
                    ? 'Trending up'
                    : 'Trending down'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Icon */}
          <Avatar
            sx={{
              bgcolor: variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : backgroundColor,
              color: variant === 'gradient' ? 'white' : color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
