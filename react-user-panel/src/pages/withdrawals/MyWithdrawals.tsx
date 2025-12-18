import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Sync,
} from '@mui/icons-material';
import {
  requestWithdrawal,
  getMyWithdrawals,
  getWithdrawalLimits,
  calculateCharges,
  cancelWithdrawal,
  Withdrawal,
  WithdrawalLimits,
} from '@/api/withdrawal.api';
import { useSnackbar } from '@/hooks/useSnackbar';
import dayjs from 'dayjs';

const MyWithdrawals: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [limits, setLimits] = useState<WithdrawalLimits | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [calculatedCharges, setCalculatedCharges] = useState<{
    amount: number;
    transactionCharge: number;
    netAmount: number;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    withdrawalType: 'BANK_TRANSFER',
    bankAccountId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.amount && parseFloat(formData.amount) > 0) {
      calculateWithdrawalCharges();
    } else {
      setCalculatedCharges(null);
    }
  }, [formData.amount]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [withdrawalsRes, limitsRes] = await Promise.all([
        getMyWithdrawals({ page: 1, limit: 100 }),
        getWithdrawalLimits(),
      ]);
      setWithdrawals(withdrawalsRes.data?.data || []);
      setLimits(limitsRes.data || null);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to fetch withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateWithdrawalCharges = async () => {
    try {
      const response = await calculateCharges(parseFloat(formData.amount));
      setCalculatedCharges(response.data || null);
    } catch (error) {
      setCalculatedCharges(null);
    }
  };

  const handleCreateWithdrawal = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showSnackbar('Please enter a valid amount', 'error');
      return;
    }

    if (limits && parseFloat(formData.amount) < limits.minAmount) {
      showSnackbar(`Minimum withdrawal amount is $${limits.minAmount}`, 'error');
      return;
    }

    if (limits && parseFloat(formData.amount) > limits.maxAmount) {
      showSnackbar(`Maximum withdrawal amount is $${limits.maxAmount}`, 'error');
      return;
    }

    try {
      setCreateLoading(true);
      await requestWithdrawal({
        amount: parseFloat(formData.amount),
        withdrawalType: formData.withdrawalType,
        bankAccountId: formData.bankAccountId ? parseInt(formData.bankAccountId) : undefined,
      });
      showSnackbar('Withdrawal request submitted successfully', 'success');
      setCreateModalOpen(false);
      setFormData({ amount: '', withdrawalType: 'BANK_TRANSFER', bankAccountId: '' });
      setCalculatedCharges(null);
      fetchData();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to request withdrawal', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelWithdrawal = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this withdrawal? The amount will be refunded to your wallet.')) {
      return;
    }

    try {
      await cancelWithdrawal(id);
      showSnackbar('Withdrawal cancelled and amount refunded', 'success');
      fetchData();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to cancel withdrawal', 'error');
    }
  };

  const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'APPROVED':
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <HourglassEmpty />;
      case 'PROCESSING':
        return <Sync />;
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircle />;
      case 'REJECTED':
        return <Cancel />;
      default:
        return null;
    }
  };

  const _getStatusStep = (status: string): number => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'APPROVED':
        return 2;
      case 'COMPLETED':
        return 3;
      case 'REJECTED':
        return -1;
      default:
        return 0;
    }
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'PENDING').length,
    processing: withdrawals.filter(w => w.status === 'PROCESSING').length,
    completed: withdrawals.filter(w => w.status === 'COMPLETED').length,
    rejected: withdrawals.filter(w => w.status === 'REJECTED').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          My Withdrawals
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
        >
          Request Withdrawal
        </Button>
      </Box>

      {/* Limits Card */}
      {limits && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Withdrawal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Available Balance</Typography>
                <Typography variant="h6" color="success.main">${limits.availableBalance.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Minimum Amount</Typography>
                <Typography variant="h6">${limits.minAmount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Maximum Amount</Typography>
                <Typography variant="h6">${limits.maxAmount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">Transaction Charge</Typography>
                <Typography variant="h6">
                  {limits.chargeType === 'PERCENTAGE' ? `${limits.chargeValue}%` : `$${limits.chargeValue}`}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Processing
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">
                {stats.processing}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                ${stats.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Withdrawals Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Withdrawal History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Charge</strong></TableCell>
                  <TableCell><strong>Net Amount</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>#{withdrawal.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        ${withdrawal.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>${withdrawal.transactionCharge.toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="success">
                        ${withdrawal.netAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={withdrawal.withdrawalType.replace('_', ' ')} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        {...(getStatusIcon(withdrawal.status) && { icon: getStatusIcon(withdrawal.status) })}
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{withdrawal.transactionId || '-'}</TableCell>
                    <TableCell>{dayjs(withdrawal.createdAt).format('DD MMM YYYY HH:mm')}</TableCell>
                    <TableCell>
                      {withdrawal.status === 'PENDING' && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancelWithdrawal(withdrawal.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {withdrawal.status === 'REJECTED' && withdrawal.rejectionReason && (
                        <Typography variant="caption" color="error">
                          {withdrawal.rejectionReason}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary">No withdrawals found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Withdrawal Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Withdrawal</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {limits && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Available Balance: ${limits.availableBalance.toFixed(2)} | Min: ${limits.minAmount} | Max: ${limits.maxAmount}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{ mb: 2 }}
            />
            {calculatedCharges && (
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Request Amount</Typography>
                    <Typography variant="body1" fontWeight="bold">${calculatedCharges.amount.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Transaction Charge</Typography>
                    <Typography variant="body1" fontWeight="bold" color="error">-${calculatedCharges.transactionCharge.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Net Amount</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success">${calculatedCharges.netAmount.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Card>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Withdrawal Type</InputLabel>
              <Select
                value={formData.withdrawalType}
                label="Withdrawal Type"
                onChange={(e) => setFormData({ ...formData, withdrawalType: e.target.value })}
              >
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CRYPTO">Cryptocurrency</MenuItem>
                <MenuItem value="CHECK">Check</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Withdrawal requests will be processed within 24-48 hours. Amount will be deducted from your wallet immediately.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateWithdrawal}
            disabled={createLoading || !formData.amount || !calculatedCharges}
          >
            {createLoading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyWithdrawals;
