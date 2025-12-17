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
  Pagination,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  AttachMoney,
  Add,
  Delete,
  Edit,
  CheckCircle,
  Schedule,
  Cancel,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store';
import payoutApi, { Payout, WithdrawalRequestData } from '../api/payoutApi';

const MIN_WITHDRAWAL_AMOUNT = 1000;
const TDS_PERCENTAGE = 5;
const ADMIN_CHARGE_PERCENTAGE = 2;

const withdrawalSchema = yup.object().shape({
  amount: yup
    .number()
    .required('Amount is required')
    .min(MIN_WITHDRAWAL_AMOUNT, `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`)
    .typeError('Must be a number'),
  paymentMethod: yup.string().required('Payment method is required'),
  accountNumber: yup.string().when('paymentMethod', {
    is: 'BANK_TRANSFER',
    then: (schema) => schema.required('Account number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  ifscCode: yup.string().when('paymentMethod', {
    is: 'BANK_TRANSFER',
    then: (schema) => schema.required('IFSC code is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  accountHolderName: yup.string().when('paymentMethod', {
    is: 'BANK_TRANSFER',
    then: (schema) => schema.required('Account holder name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  bankName: yup.string().when('paymentMethod', {
    is: 'BANK_TRANSFER',
    then: (schema) => schema.required('Bank name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  upiId: yup.string().when('paymentMethod', {
    is: 'UPI',
    then: (schema) =>
      schema.required('UPI ID is required').matches(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

interface WithdrawalFormData {
  amount: number;
  paymentMethod: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  bankName?: string;
  upiId?: string;
}

interface SavedBankAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  isDefault: boolean;
}

const PayoutPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { balance } = useAppSelector((state) => state.wallet);

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);

  const [calculatedCharges, setCalculatedCharges] = useState({
    tds: 0,
    adminCharge: 0,
    netAmount: 0,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WithdrawalFormData>({
    resolver: yupResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'BANK_TRANSFER',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      upiId: '',
    },
  });

  const amount = watch('amount');
  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    fetchPayouts();
    // Load saved bank accounts from localStorage
    const accounts = localStorage.getItem('savedBankAccounts');
    if (accounts) {
      setSavedAccounts(JSON.parse(accounts));
    }
  }, [page]);

  useEffect(() => {
    if (amount && amount > 0) {
      const tds = (amount * TDS_PERCENTAGE) / 100;
      const adminCharge = (amount * ADMIN_CHARGE_PERCENTAGE) / 100;
      const netAmount = amount - tds - adminCharge;

      setCalculatedCharges({
        tds,
        adminCharge,
        netAmount: netAmount > 0 ? netAmount : 0,
      });
    } else {
      setCalculatedCharges({ tds: 0, adminCharge: 0, netAmount: 0 });
    }
  }, [amount]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await payoutApi.getHistory({ page, limit: 10 });
      setPayouts(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch payout history');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitWithdrawal = async (data: WithdrawalFormData) => {
    if (!balance || data.amount > balance.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setSubmitting(true);

      const withdrawalData: WithdrawalRequestData = {
        amount: data.amount,
        paymentMethod: data.paymentMethod as any,
      };

      if (data.paymentMethod === 'BANK_TRANSFER') {
        withdrawalData.bankDetails = {
          accountNumber: data.accountNumber!,
          ifscCode: data.ifscCode!,
          accountHolderName: data.accountHolderName!,
          bankName: data.bankName!,
        };
      } else if (data.paymentMethod === 'UPI') {
        withdrawalData.upiId = data.upiId;
      }

      await payoutApi.requestWithdrawal(withdrawalData);
      toast.success('Withdrawal request submitted successfully!');

      // Reset form
      setValue('amount', 0);
      setValue('accountNumber', '');
      setValue('ifscCode', '');
      setValue('accountHolderName', '');
      setValue('bankName', '');
      setValue('upiId', '');

      // Refresh payout list
      fetchPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSavedAccount = (account: SavedBankAccount) => {
    setValue('accountNumber', account.accountNumber);
    setValue('ifscCode', account.ifscCode);
    setValue('accountHolderName', account.accountHolderName);
    setValue('bankName', account.bankName);
    setBankDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle />;
      case 'PENDING':
        return <Schedule />;
      case 'PROCESSING':
        return <Schedule />;
      case 'REJECTED':
        return <ErrorIcon />;
      case 'CANCELLED':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Withdrawals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request withdrawals and manage your payouts
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Withdrawal Form */}
        <Grid item xs={12} md={5}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Request Withdrawal
              </Typography>

              {/* Available Balance */}
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Available Balance
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {formatCurrency(balance?.availableBalance || 0)}
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(onSubmitWithdrawal)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Amount */}
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Withdrawal Amount"
                        error={!!errors.amount}
                        helperText={errors.amount?.message || `Minimum amount: ₹${MIN_WITHDRAWAL_AMOUNT}`}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                        }}
                      />
                    )}
                  />

                  {/* Payment Method */}
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Payment Method"
                        error={!!errors.paymentMethod}
                        helperText={errors.paymentMethod?.message}
                      >
                        <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                        <MenuItem value="UPI">UPI</MenuItem>
                      </TextField>
                    )}
                  />

                  {/* Bank Transfer Fields */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <>
                      {savedAccounts.length > 0 && (
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<AccountBalance />}
                          onClick={() => setBankDialogOpen(true)}
                        >
                          Select Saved Account
                        </Button>
                      )}

                      <Controller
                        name="accountHolderName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Account Holder Name"
                            error={!!errors.accountHolderName}
                            helperText={errors.accountHolderName?.message}
                          />
                        )}
                      />

                      <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Account Number"
                            error={!!errors.accountNumber}
                            helperText={errors.accountNumber?.message}
                          />
                        )}
                      />

                      <Controller
                        name="ifscCode"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="IFSC Code"
                            error={!!errors.ifscCode}
                            helperText={errors.ifscCode?.message}
                          />
                        )}
                      />

                      <Controller
                        name="bankName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Bank Name"
                            error={!!errors.bankName}
                            helperText={errors.bankName?.message}
                          />
                        )}
                      />
                    </>
                  )}

                  {/* UPI Fields */}
                  {paymentMethod === 'UPI' && (
                    <Controller
                      name="upiId"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="UPI ID"
                          placeholder="yourname@upi"
                          error={!!errors.upiId}
                          helperText={errors.upiId?.message}
                        />
                      )}
                    />
                  )}

                  {/* Charge Breakdown */}
                  {amount > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Charge Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Withdrawal Amount:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {formatCurrency(amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          TDS ({TDS_PERCENTAGE}%):
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="error.main">
                          - {formatCurrency(calculatedCharges.tds)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Admin Charge ({ADMIN_CHARGE_PERCENTAGE}%):
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="error.main">
                          - {formatCurrency(calculatedCharges.adminCharge)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight="bold">
                          Net Amount:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {formatCurrency(calculatedCharges.netAmount)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Validation Messages */}
                  {amount > 0 && balance && amount > balance.availableBalance && (
                    <Alert severity="error">Insufficient balance</Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={
                      submitting ||
                      !amount ||
                      amount < MIN_WITHDRAWAL_AMOUNT ||
                      (balance && amount > balance.availableBalance)
                    }
                    sx={{ mt: 1 }}
                  >
                    {submitting ? 'Processing...' : 'Request Withdrawal'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Payout History */}
        <Grid item xs={12} md={7}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payout History
              </Typography>

              {loading ? (
                <>
                  {[...Array(5)].map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      height={80}
                      sx={{ mb: 2, borderRadius: 1 }}
                    />
                  ))}
                </>
              ) : payouts.length > 0 ? (
                <>
                  {isMobile ? (
                    // Mobile Card View
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      {payouts.map((payout) => (
                        <Card key={payout.id} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {formatCurrency(payout.amount)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(payout.requestDate).toLocaleDateString('en-IN')}
                                </Typography>
                              </Box>
                              <Chip
                                label={payout.status}
                                size="small"
                                color={getStatusColor(payout.status) as any}
                                icon={getStatusIcon(payout.status)}
                              />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Payment Method
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {payout.paymentMethod.replace('_', ' ')}
                              </Typography>
                            </Box>
                            {payout.transactionId && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Transaction ID
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {payout.transactionId}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    // Desktop Table View
                    <TableContainer sx={{ mt: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Payment Method</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Transaction ID</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payouts.map((payout) => (
                            <TableRow
                              key={payout.id}
                              hover
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight="600">
                                  {new Date(payout.requestDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(payout.requestDate).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="bold">
                                  {formatCurrency(payout.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={payout.paymentMethod.replace('_', ' ')}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={payout.status}
                                  size="small"
                                  color={getStatusColor(payout.status) as any}
                                  icon={getStatusIcon(payout.status)}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  {payout.transactionId || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No payout history
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your withdrawal requests will appear here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Saved Bank Accounts Dialog */}
      <Dialog open={bankDialogOpen} onClose={() => setBankDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Saved Bank Account</DialogTitle>
        <DialogContent>
          <List>
            {savedAccounts.map((account) => (
              <ListItem
                key={account.id}
                button
                onClick={() => handleSelectSavedAccount(account)}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="600">
                        {account.bankName}
                      </Typography>
                      {account.isDefault && <Chip label="Default" size="small" color="primary" />}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {account.accountHolderName}
                      </Typography>
                      <br />
                      <Typography variant="caption" component="span" color="text.secondary">
                        {account.accountNumber} | {account.ifscCode}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PayoutPage;
