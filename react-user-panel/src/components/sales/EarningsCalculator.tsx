import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  MonetizationOn,
  Groups,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ProjectedEarnings } from '@/types/propertySale.types';
import { formatCurrency } from '@/utils/formatters';

interface EarningsCalculatorProps {
  earnings: ProjectedEarnings;
  calculating: boolean;
  saleType: 'PRIMARY_BOOKING' | 'FULL_PAYMENT';
}

const EarningsCalculator: React.FC<EarningsCalculatorProps> = ({
  earnings,
  calculating,
  saleType,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          position: 'sticky',
          top: 80,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          border: `2px solid ${theme.palette.primary.main}`,
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              Projected Earnings
            </Typography>
            <Tooltip title="Real-time calculation based on your inputs">
              <IconButton size="small">
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {calculating && <LinearProgress sx={{ mb: 2 }} />}

          {/* Sale Summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Commission Base Amount
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {formatCurrency(earnings.downPayment)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {saleType === 'PRIMARY_BOOKING' ? '25% of total sale amount' : 'Full payment amount'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Direct Incentive */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn fontSize="small" color="success" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Direct Incentive (5%)
                </Typography>
              </Box>
              <Chip label="To Sponsor" size="small" color="success" variant="outlined" />
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Gross</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(earnings.directIncentive.gross)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">TDS (5%)</Typography>
                <Typography variant="body2" color="error">
                  -{formatCurrency(earnings.directIncentive.tds)}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Net Amount</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(earnings.directIncentive.net)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Team Sales Bonus */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Groups fontSize="small" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Team Sales Bonus (15%)
                </Typography>
              </Box>
              <Chip label="Level 1-10" size="small" color="primary" variant="outlined" />
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Pool Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(earnings.tsbPool.gross)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">TDS (5%)</Typography>
                <Typography variant="body2" color="error">
                  -{formatCurrency(earnings.tsbPool.tds)}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Net Pool</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(earnings.tsbPool.net)}
                </Typography>
              </Box>

              {/* Level Breakdown */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Distribution Breakdown:
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Level 1 (30%) • 1 direct required
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(earnings.tsbPool.breakdown.level1.amount)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Level 2 (20%) • 1 direct required
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(earnings.tsbPool.breakdown.level2.amount)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Level 3 (15%) • 2 directs required
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(earnings.tsbPool.breakdown.level3.amount)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Level 4-10 (5% each) • 3 directs required
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(earnings.tsbPool.breakdown.level4to10.amount)} each
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Total Earnings */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
              Total Network Earnings
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="body2">Gross Amount:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(earnings.totalEarnings.gross)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="body2">Total TDS:</Typography>
              <Typography variant="body2">
                -{formatCurrency(earnings.totalEarnings.tds)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1, bgcolor: alpha('#fff', 0.2) }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>Net Earnings:</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(earnings.totalEarnings.net)}
              </Typography>
            </Box>
          </Box>

          {/* Info Notes */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            }}
          >
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <CheckCircle fontSize="small" sx={{ fontSize: 14 }} />
              {earnings.notes.saleType}
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <CheckCircle fontSize="small" sx={{ fontSize: 14 }} />
              {earnings.notes.tdsRate}% TDS auto-deducted
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle fontSize="small" sx={{ fontSize: 14 }} />
              Monthly distribution basis
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EarningsCalculator;
