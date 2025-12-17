import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface RankReward {
  id: number;
  userId: number;
  rankId: number;
  rewardType: string;
  rewardAmount: number;
  periodMonth?: number;
  periodYear?: number;
  status: string;
  processedAt?: string;
  paidAt?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  User?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };
  Rank?: {
    id: number;
    name: string;
    displayOrder: number;
  };
}

const RankRewards: React.FC = () => {
  const [rewards, setRewards] = useState<RankReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  useEffect(() => {
    fetchRewards();
  }, [filterStatus, filterMonth, filterYear]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterMonth) params.append('periodMonth', filterMonth);
      if (filterYear) params.append('periodYear', filterYear);

      const response = await axios.get(`/api/v1/rank-rewards/all?${params.toString()}`);
      setRewards(response.data.data.rewards);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch rewards' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyRewards = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/rank-rewards/generate-monthly', {
        periodMonth: selectedMonth,
        periodYear: selectedYear,
      });
      setMessage({ type: 'success', text: response.data.message });
      setGenerateDialogOpen(false);
      fetchRewards();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate rewards' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessMonthlyRewards = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/rank-rewards/process-monthly', {
        periodMonth: selectedMonth,
        periodYear: selectedYear,
      });
      setMessage({ type: 'success', text: response.data.message });
      setProcessDialogOpen(false);
      fetchRewards();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process rewards' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSED':
        return 'info';
      case 'PAID':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPending = rewards
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.toString()), 0);

  const totalProcessed = rewards
    .filter((r) => r.status === 'PROCESSED')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.toString()), 0);

  const totalPaid = rewards
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.toString()), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rank Rewards Management
      </Typography>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Rewards
                  </Typography>
                  <Typography variant="h5">{formatCurrency(totalPending)}</Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Processed Rewards
                  </Typography>
                  <Typography variant="h5">{formatCurrency(totalProcessed)}</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Paid Rewards
                  </Typography>
                  <Typography variant="h5">{formatCurrency(totalPaid)}</Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSED">Processed</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchRewards}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CalendarIcon />}
              onClick={() => setGenerateDialogOpen(true)}
            >
              Generate Monthly Rewards
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CheckCircleIcon />}
              onClick={() => setProcessDialogOpen(true)}
            >
              Process Monthly Rewards
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Reward Records
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {reward.User?.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {reward.User?.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{reward.Rank?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={reward.rewardType.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(parseFloat(reward.rewardAmount.toString()))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reward.periodMonth && reward.periodYear
                          ? `${months.find((m) => m.value === reward.periodMonth)?.label} ${reward.periodYear}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reward.status}
                          color={getStatusColor(reward.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rewards.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No rewards found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Generate Monthly Rewards Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle>Generate Monthly Rewards</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              fullWidth
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Year"
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerateMonthlyRewards} variant="contained" disabled={loading}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Monthly Rewards Dialog */}
      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)}>
        <DialogTitle>Process Monthly Rewards</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              fullWidth
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Year"
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProcessMonthlyRewards} variant="contained" disabled={loading}>
            Process
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RankRewards;
