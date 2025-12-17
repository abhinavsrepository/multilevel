import React from 'react';
import { Card, CardContent, Box, Typography, useTheme, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import CountUp from 'react-countup';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  decimals?: number;
  onClick?: () => void;
  gradient?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  prefix = '',
  suffix = '',
  loading = false,
  decimals = 0,
  onClick,
  gradient = false,
}) => {
  const theme = useTheme();

  const colorMap = {
    primary: {
      main: theme.palette.primary.main,
      light: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    success: {
      main: theme.palette.success.main,
      light: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    error: {
      main: theme.palette.error.main,
      light: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    warning: {
      main: theme.palette.warning.main,
      light: theme.palette.mode === 'dark' ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
      gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    },
    info: {
      main: theme.palette.info.main,
      light: theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    },
    secondary: {
      main: theme.palette.secondary.main,
      light:
        theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    },
  };

  const currentColor = colorMap[color];

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  const isValidNumber = !isNaN(numericValue);

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
        border: `1px solid ${theme.palette.divider}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: gradient
          ? currentColor.gradient
          : theme.palette.mode === 'dark'
          ? '#1e293b'
          : '#ffffff',
        color: gradient ? '#ffffff' : 'inherit',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 16px rgba(0,0,0,0.4)'
                  : '0 8px 16px rgba(0,0,0,0.15)',
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Title */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: gradient
                  ? 'rgba(255,255,255,0.9)'
                  : theme.palette.mode === 'dark'
                  ? '#94a3b8'
                  : '#64748b',
                fontWeight: 500,
                fontSize: '0.875rem',
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>

            {/* Value */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: gradient ? '#ffffff' : theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              {prefix}
              {isValidNumber ? (
                <CountUp
                  end={numericValue}
                  decimals={decimals}
                  duration={2}
                  separator=","
                  preserveValue
                />
              ) : (
                value
              )}
              {suffix}
            </Typography>

            {/* Trend */}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend.isPositive ? (
                  <TrendingUp
                    sx={{
                      fontSize: '1rem',
                      color: gradient ? 'rgba(255,255,255,0.9)' : theme.palette.success.main,
                    }}
                  />
                ) : (
                  <TrendingDown
                    sx={{
                      fontSize: '1rem',
                      color: gradient ? 'rgba(255,255,255,0.9)' : theme.palette.error.main,
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: gradient
                      ? 'rgba(255,255,255,0.9)'
                      : trend.isPositive
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  }}
                >
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </Typography>
                {trend.label && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: gradient
                        ? 'rgba(255,255,255,0.7)'
                        : theme.palette.mode === 'dark'
                        ? '#64748b'
                        : '#94a3b8',
                      ml: 0.5,
                    }}
                  >
                    {trend.label}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Icon */}
          {icon && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : currentColor.light,
                color: gradient ? '#ffffff' : currentColor.main,
                fontSize: '1.75rem',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
