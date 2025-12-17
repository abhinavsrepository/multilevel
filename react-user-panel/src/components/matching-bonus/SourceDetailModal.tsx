import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Close,
  TrendingUp,
  Person,
  Percent
} from '@mui/icons-material';
import { getMatchingBonusSourceDetails, MatchingBonusSourceDetail } from '@/api/matching-bonus.api';

interface SourceDetailModalProps {
  open: boolean;
  onClose: () => void;
  incomeId: number | null;
}

const SourceDetailModal: React.FC<SourceDetailModalProps> = ({ open, onClose, incomeId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatchingBonusSourceDetail | null>(null);

  useEffect(() => {
    if (open && incomeId) {
      fetchSourceDetails();
    }
  }, [open, incomeId]);

  const fetchSourceDetails = async () => {
    if (!incomeId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getMatchingBonusSourceDetails(incomeId);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load source details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'PAID': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Matching Bonus Source Details
        </Typography>
        <Button onClick={onClose} size="small" color="inherit">
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {data && !loading && (
          <Box>
            {/* Summary Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {formatCurrency(data.totalAmount)}
                </Typography>
                <Chip
                  label={data.status}
                  color={getStatusColor(data.status)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(data.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contributors
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {data.totalContributors}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Income ID
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    #{data.incomeId}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Level Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Level Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {data.levelSummary.map((level) => (
                  <Paper key={level.level} sx={{ p: 2, flex: '1 1 200px', minWidth: 200 }}>
                    <Typography variant="caption" color="text.secondary">
                      Level {level.level}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {formatCurrency(level.totalContribution)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption">
                        {level.count} contributors
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        {level.averagePercentage}%
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Detailed Contributors Table */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Contributor Details
              </Typography>

              {/* Group by level */}
              {data.levelSummary.map((levelSummary) => {
                const levelContributors = data.contributors.filter(c => c.level === levelSummary.level);

                return (
                  <Accordion key={levelSummary.level} defaultExpanded={levelSummary.level === 1}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography fontWeight={600}>
                          Level {levelSummary.level}
                        </Typography>
                        <Chip
                          label={`${levelContributors.length} contributors`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="success.main" sx={{ ml: 'auto' }}>
                          {formatCurrency(levelSummary.totalContribution)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Downline Agent</TableCell>
                              <TableCell>Rank</TableCell>
                              <TableCell align="right">Base Commission</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell align="right">Match %</TableCell>
                              <TableCell align="right">Contribution</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {levelContributors.map((contributor, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {contributor.downlineName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      @{contributor.downlineUsername}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={contributor.downlineRank}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatCurrency(contributor.baseCommissionAmount)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={contributor.baseCommissionType}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                    <Percent fontSize="small" color="success" />
                                    <Typography variant="body2" color="success.main" fontWeight={600}>
                                      {contributor.matchedPercentage}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={700} color="primary">
                                    {formatCurrency(contributor.contributionAmount)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>

            {/* Total Match Summary */}
            <Paper elevation={3} sx={{ p: 2, mt: 3, bgcolor: 'success.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={600}>
                  Total Matching Bonus
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.dark">
                  {formatCurrency(data.totalAmount)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Sum of all contribution amounts
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SourceDetailModal;
