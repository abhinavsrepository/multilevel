import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  ShowChart,
  AttachMoney,
  ArrowUpward,
  ArrowDownward,
  FileDownload,
  Refresh,
  SwapHoriz,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchBalanceThunk,
  fetchTransactionsThunk,
  fetchSummaryThunk,
} from '../store/slices/walletSlice';
import { WalletTransaction } from '../api/walletApi';

const transferSchema = yup.object().shape({
  fromWallet: yup.string().required('Source wallet is required'),
  toWallet: yup.string().required('Destination wallet is required'),
  amount: yup
    .number()
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0')
    .typeError('Must be a number'),
});

interface TransferFormData {
  fromWallet: string;
  toWallet: string;
  amount: number;
}

const Wallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { balance, transactions, summary, pagination, loading } = useAppSelector(
    (state) => state.wallet
  );

  const [page, setPage] = useState(1);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const [filters, setFilters] = useState({
    type: '',
    transactionType: '',
    status: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: yupResolver(transferSchema),
    defaultValues: {
      fromWallet: '',
      toWallet: '',
      amount: 0,
    },
  });

  useEffect(() => {
    dispatch(fetchBalanceThunk());
    dispatch(fetchSummaryThunk());
    handleFetchTransactions();
  }, [dispatch, page]);

  const handleFetchTransactions = () => {
    const params: any = {
      page,
      limit: 10,
    };

    if (filters.type) params.type = filters.type;
    if (filters.transactionType) params.transactionType = filters.transactionType;
    if (filters.status) params.status = filters.status;
    if (filters.fromDate) params.fromDate = filters.fromDate.toISOString().split('T')[0];
    if (filters.toDate) params.toDate = filters.toDate.toISOString().split('T')[0];

    dispatch(fetchTransactionsThunk(params));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionIcon = (type: string, transactionType: string) => {
    if (type === 'CREDIT') {
      return <ArrowDownward sx={{ color: 'success.main' }} />;
    }
    return <ArrowUpward sx={{ color: 'error.main' }} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const onSubmitTransfer = async (data: TransferFormData) => {
    try {
      setTransferring(true);
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Transfer successful!');
      setTransferDialogOpen(false);
      reset();
      dispatch(fetchBalanceThunk());
      dispatch(fetchTransactionsThunk());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const handleExportTransactions = () => {
    toast.info('Exporting transactions...');
    // Export logic would go here
  };

  const handleRefresh = () => {
    dispatch(fetchBalanceThunk());
    dispatch(fetchTransactionsThunk());
    dispatch(fetchSummaryThunk());
    toast.success('Wallet data refreshed!');
  };

  const BalanceCard: React.FC<{
    title: string;
    amount: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, amount, icon, color, subtitle }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        borderLeft: 4,
        borderColor: color,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
              {formatCurrency(amount)}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}20`,
              color: color,
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Wallet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your funds and transactions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Balance Summary */}
        {loading ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <BalanceCard
                  title="Total Balance"
                  amount={balance?.balance || 0}
                  icon={<AccountBalanceWallet />}
                  color="#667eea"
                  subtitle="All wallets combined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <BalanceCard
                  title="Available Balance"
                  amount={balance?.availableBalance || 0}
                  icon={<AttachMoney />}
                  color="#06d6a0"
                  subtitle="Ready to use"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <BalanceCard
                  title="Commission Wallet"
                  amount={summary?.totalCommissions || 0}
                  icon={<TrendingUp />}
                  color="#f77f00"
                  subtitle="Total commissions earned"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <BalanceCard
                  title="ROI Wallet"
                  amount={summary?.totalReturns || 0}
                  icon={<ShowChart />}
                  color="#06d6a0"
                  subtitle="Investment returns"
                />
              </Grid>
            </Grid>

            {/* Total Balance Card */}
            <Card
              elevation={3}
              sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Grid container alignItems="center" spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                      Total Wallet Balance
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
                      {formatCurrency(balance?.balance || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Available
                        </Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: 'white' }}>
                          {formatCurrency(balance?.availableBalance || 0)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Locked
                        </Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: 'white' }}>
                          {formatCurrency(balance?.lockedBalance || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<SwapHoriz />}
                        onClick={() => setTransferDialogOpen(true)}
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                        }}
                      >
                        Transfer Funds
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FileDownload />}
                        onClick={handleExportTransactions}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        Export Statement
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* Filters */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="CREDIT">Credit</MenuItem>
                  <MenuItem value="DEBIT">Debit</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Transaction Type"
                  value={filters.transactionType}
                  onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="INVESTMENT">Investment</MenuItem>
                  <MenuItem value="RETURN">Return</MenuItem>
                  <MenuItem value="COMMISSION">Commission</MenuItem>
                  <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
                  <MenuItem value="REFUND">Refund</MenuItem>
                  <MenuItem value="DEPOSIT">Deposit</MenuItem>
                  <MenuItem value="BONUS">Bonus</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="From Date"
                  value={filters.fromDate}
                  onChange={(date) => setFilters({ ...filters, fromDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="To Date"
                  value={filters.toDate}
                  onChange={(date) => setFilters({ ...filters, toDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setFilters({
                      type: '',
                      transactionType: '',
                      status: '',
                      fromDate: null,
                      toDate: null,
                    });
                    setPage(1);
                  }}
                  sx={{ height: '56px' }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {loading ? (
          <Card elevation={2}>
            <CardContent>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={70} sx={{ mb: 2, borderRadius: 1 }} />
              ))}
            </CardContent>
          </Card>
        ) : transactions.length > 0 ? (
          <>
            {isMobile ? (
              // Mobile Card View
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {transactions.map((transaction) => (
                  <Card key={transaction.id} elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                        <Avatar sx={{ mr: 2 }}>
                          {getTransactionIcon(transaction.type, transaction.transactionType)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {transaction.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.createdAt).toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={getStatusColor(transaction.status) as any}
                        />
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop Table View
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell>Transaction</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Balance After</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              {getTransactionIcon(transaction.type, transaction.transactionType)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {transaction.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {transaction.id.substring(0, 12)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.transactionType}
                            size="small"
                            variant="outlined"
                            color={transaction.type === 'CREDIT' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                          >
                            {transaction.type === 'CREDIT' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {formatCurrency(transaction.balanceAfter)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            size="small"
                            color={getStatusColor(transaction.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(transaction.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        ) : (
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No transactions found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your transaction history will appear here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Transfer Dialog */}
        <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Transfer Between Wallets
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitTransfer)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller
                  name="fromWallet"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="From Wallet"
                      error={!!errors.fromWallet}
                      helperText={errors.fromWallet?.message}
                    >
                      <MenuItem value="commission">Commission Wallet</MenuItem>
                      <MenuItem value="roi">ROI Wallet</MenuItem>
                      <MenuItem value="investment">Investment Wallet</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="toWallet"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="To Wallet"
                      error={!!errors.toWallet}
                      helperText={errors.toWallet?.message}
                    >
                      <MenuItem value="commission">Commission Wallet</MenuItem>
                      <MenuItem value="roi">ROI Wallet</MenuItem>
                      <MenuItem value="investment">Investment Wallet</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Amount"
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                      }}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setTransferDialogOpen(false)} disabled={transferring}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={transferring} sx={{ minWidth: 120 }}>
                {transferring ? 'Processing...' : 'Transfer'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Wallet;
