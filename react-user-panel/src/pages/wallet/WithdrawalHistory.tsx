import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Refresh,
  Download,
  Cancel,
  CheckCircle,
  PendingActions,
  Error as ErrorIcon,
  Info,
  AccountBalance,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getWithdrawals, cancelWithdrawal, downloadWithdrawalReceipt } from '../../api/payout.api';
import { Withdrawal, WithdrawalStatus } from '../../types';
import { toast } from 'react-toastify';

const WithdrawalHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<WithdrawalStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(3, 'months'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params: any = {
        sortBy: 'requestDate',
        sortDirection: 'desc',
      };

      if (status !== 'ALL') params.status = status;
      if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
      if (endDate) params.endDate = endDate.format('YYYY-MM-DD');

      const response = await getWithdrawals(params);
      if (response.data) {
        setWithdrawals(response.data.content || []);
      }
    } catch (err: any) {
      toast.error('Failed to load withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [status, startDate, endDate]);

  const handleRefresh = () => {
    fetchWithdrawals();
  };

  const handleCancelWithdrawal = async () => {
    if (!selectedWithdrawal || !cancelReason) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      await cancelWithdrawal(selectedWithdrawal.id, cancelReason);
      toast.success('Withdrawal request cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedWithdrawal(null);
      setCancelReason('');
      fetchWithdrawals();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel withdrawal');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadReceipt = async (withdrawal: Withdrawal) => {
    try {
      toast.info('Downloading receipt...');
      const blob = await downloadWithdrawalReceipt(withdrawal.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `withdrawal-receipt-${withdrawal.withdrawalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Receipt downloaded successfully');
    } catch (err) {
      toast.error('Failed to download receipt');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      REQUESTED: {
        color: 'info',
        icon: PendingActions,
        label: 'Requested',
      },
      APPROVED: {
        color: 'primary',
        icon: CheckCircle,
        label: 'Approved',
      },
      PROCESSING: {
        color: 'warning',
        icon: PendingActions,
        label: 'Processing',
      },
      COMPLETED: {
        color: 'success',
        icon: CheckCircle,
        label: 'Completed',
      },
      REJECTED: {
        color: 'error',
        icon: ErrorIcon,
        label: 'Rejected',
      },
      CANCELLED: {
        color: 'default',
        icon: Cancel,
        label: 'Cancelled',
      },
    };
    return configs[status as keyof typeof configs] || configs.REQUESTED;
  };

  const getStatusSteps = (withdrawal: Withdrawal) => {
    const steps = [
      { label: 'Requested', date: withdrawal.requestDate },
      { label: 'Approved', date: withdrawal.approvedDate },
      { label: 'Processing', date: withdrawal.approvedDate },
      { label: 'Completed', date: withdrawal.completedDate },
    ];

    if (withdrawal.status === 'REJECTED') {
      return [
        { label: 'Requested', date: withdrawal.requestDate },
        { label: 'Rejected', date: withdrawal.approvedDate },
      ];
    }

    if (withdrawal.status === 'CANCELLED') {
      return [
        { label: 'Requested', date: withdrawal.requestDate },
        { label: 'Cancelled', date: withdrawal.completedDate },
      ];
    }

    const activeSteps: Record<string, number> = {
      REQUESTED: 0,
      APPROVED: 1,
      PROCESSING: 2,
      COMPLETED: 3,
    };

    const activeStep = activeSteps[withdrawal.status] || 0;

    return steps.slice(0, activeStep + 1);
  };

  return (
    <DashboardLayout title="Withdrawal History">
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <div>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Withdrawal History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage your withdrawal requests
            </Typography>
          </div>
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
            Refresh
          </Button>
        </Stack>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WithdrawalStatus | 'ALL')}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="REQUESTED">Requested</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Withdrawals List */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} key={item}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : withdrawals.length > 0 ? (
          <Grid container spacing={3}>
            {withdrawals.map((withdrawal) => {
              const statusConfig = getStatusConfig(withdrawal.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Grid item xs={12} key={withdrawal.id}>
                  <Card>
                    <CardContent>
                      {/* Header */}
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                        sx={{ mb: 3 }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {withdrawal.withdrawalId}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Requested on {formatDate(withdrawal.requestDate)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Chip
                          icon={<StatusIcon />}
                          label={statusConfig.label}
                          color={statusConfig.color as any}
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>

                      <Grid container spacing={3}>
                        {/* Left: Amount Details */}
                        <Grid item xs={12} md={5}>
                          <Card variant="outlined">
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Requested Amount
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatCurrency(withdrawal.requestedAmount)}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    TDS
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600} color="error.main">
                                    -{formatCurrency(withdrawal.tds)}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Admin Charge
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600} color="error.main">
                                    -{formatCurrency(withdrawal.adminCharge)}
                                  </Typography>
                                </Stack>
                                <Box
                                  sx={{
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: 'success.main',
                                    color: 'success.contrastText',
                                  }}
                                >
                                  <Typography variant="caption">Net Amount</Typography>
                                  <Typography variant="h6" fontWeight={700}>
                                    {formatCurrency(withdrawal.netAmount)}
                                  </Typography>
                                </Box>
                              </Stack>

                              {/* Payment Details */}
                              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                  <AccountBalance fontSize="small" color="primary" />
                                  <Typography variant="caption" fontWeight={600}>
                                    Payment Method: {withdrawal.paymentMethod.replace('_', ' ')}
                                  </Typography>
                                </Stack>
                                {withdrawal.bankDetails && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {withdrawal.bankDetails.accountHolderName}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      {withdrawal.bankDetails.bankName} - {withdrawal.bankDetails.accountNumber.slice(-4).padStart(withdrawal.bankDetails.accountNumber.length, '*')}
                                    </Typography>
                                  </Box>
                                )}
                                {withdrawal.upiId && (
                                  <Typography variant="caption" color="text.secondary">
                                    UPI: {withdrawal.upiId}
                                  </Typography>
                                )}
                              </Box>

                              {/* UTR Number */}
                              {withdrawal.utrNumber && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                  <Typography variant="caption" fontWeight={600}>
                                    UTR Number: {withdrawal.utrNumber}
                                  </Typography>
                                </Alert>
                              )}

                              {/* Rejection Reason */}
                              {withdrawal.rejectionReason && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                  <Typography variant="caption" fontWeight={600}>
                                    Reason: {withdrawal.rejectionReason}
                                  </Typography>
                                </Alert>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Right: Timeline */}
                        <Grid item xs={12} md={7}>
                          <Stepper orientation="vertical" activeStep={getStatusSteps(withdrawal).length - 1}>
                            {getStatusSteps(withdrawal).map((step, index) => (
                              <Step key={index} completed={true}>
                                <StepLabel>
                                  <Typography variant="body2" fontWeight={600}>
                                    {step.label}
                                  </Typography>
                                </StepLabel>
                                <StepContent>
                                  <Typography variant="caption" color="text.secondary">
                                    {step.date ? formatDate(step.date) : 'Pending'}
                                  </Typography>
                                </StepContent>
                              </Step>
                            ))}
                          </Stepper>

                          {/* Actions */}
                          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            {withdrawal.status === 'REQUESTED' && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<Cancel />}
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                Cancel Request
                              </Button>
                            )}
                            {withdrawal.status === 'COMPLETED' && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Download />}
                                onClick={() => handleDownloadReceipt(withdrawal)}
                              >
                                Download Receipt
                              </Button>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Info sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Withdrawal History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {status !== 'ALL'
                    ? 'No withdrawals found with this status'
                    : "You haven't made any withdrawal requests yet"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cancel Withdrawal Request</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to cancel this withdrawal request?
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this request"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>Keep Request</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelWithdrawal}
              disabled={cancelling || !cancelReason}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default WithdrawalHistory;
