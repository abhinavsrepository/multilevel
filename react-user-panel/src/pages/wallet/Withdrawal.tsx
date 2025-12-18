import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Divider,
  Alert,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccountBalanceWallet,
  AccountBalance,
  Security,
  Info,
  CheckCircle,
  ArrowBack,
  MonetizationOn,
} from '@mui/icons-material';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getWalletBalance } from '../../api/wallet.api';
import {
  getWithdrawalRules,
  checkWithdrawalEligibility,
  calculateWithdrawalCharges,
  createWithdrawalRequest,
} from '../../api/payout.api';
import { WalletBalance, WithdrawalRules } from '../../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Withdrawal: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [rules, setRules] = useState<WithdrawalRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<'COMMISSION' | 'RENTAL' | 'ROI'>('COMMISSION');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'UPI'>('BANK_TRANSFER');
  const [transactionPin, setTransactionPin] = useState('');
  const [charges, setCharges] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Bank details for demo
  const [bankAccount, setBankAccount] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const [upiId, setUpiId] = useState('');

  // Fetch wallet balance and rules
  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, rulesRes] = await Promise.all([
        getWalletBalance(),
        getWithdrawalRules(),
      ]);

      if (balanceRes.data) setWalletBalance(balanceRes.data);
      if (rulesRes.data) setRules(rulesRes.data);
    } catch (err: any) {
      toast.error('Failed to load withdrawal information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate charges when amount changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount && parseFloat(amount) > 0) {
        try {
          const response = await calculateWithdrawalCharges(parseFloat(amount));
          if (response.data) {
            setCharges(response.data);
          }
        } catch (err) {
          setCharges(null);
        }
      } else {
        setCharges(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount]);

  // Check eligibility
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount && parseFloat(amount) > 0) {
        try {
          const response = await checkWithdrawalEligibility(parseFloat(amount));
          if (response.data) {
            setEligibility(response.data);
          }
        } catch (err) {
          setEligibility(null);
        }
      } else {
        setEligibility(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount]);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!transactionPin) {
      toast.error('Please enter your transaction PIN');
      return;
    }

    if (paymentMethod === 'BANK_TRANSFER') {
      if (!bankAccount.accountHolderName || !bankAccount.accountNumber || !bankAccount.ifscCode || !bankAccount.bankName) {
        toast.error('Please fill in all bank details');
        return;
      }
    } else {
      if (!upiId) {
        toast.error('Please enter your UPI ID');
        return;
      }
    }

    if (eligibility && !eligibility.eligible) {
      toast.error(eligibility.reason || 'Withdrawal not eligible');
      return;
    }

    try {
      setSubmitting(true);
      const requestData: any = {
        amount: parseFloat(amount),
        paymentMethod,
        transactionPin,
      };

      if (paymentMethod === 'BANK_TRANSFER') {
        // In production, this should use bankAccountId from selected account
        requestData.bankAccountId = 1; // Demo
      } else {
        requestData.upiId = upiId;
      }

      const response = await createWithdrawalRequest(requestData);

      if (response.data) {
        toast.success('Withdrawal request submitted successfully');
        navigate('/wallet/withdrawal-history');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSelectedWalletBalance = () => {
    if (!walletBalance) return 0;
    switch (selectedWallet) {
      case 'COMMISSION':
        return walletBalance.commissionWallet || 0;
      case 'RENTAL':
        return walletBalance.rentalIncomeWallet || 0;
      case 'ROI':
        return walletBalance.roiWallet || 0;
      default:
        return 0;
    }
  };

  const availableBalance = getSelectedWalletBalance() || 0;

  if (loading) {
    return (
      <DashboardLayout title="Withdrawal">
        <Box>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Withdrawal">
      <Box>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/wallet')}>
            Back
          </Button>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700}>
              Withdraw Funds
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Request withdrawal from your wallet
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column - Form */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Available Balance */}
                <Card
                  sx={{
                    mb: 4,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Available Balance
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {formatCurrency(availableBalance)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedWallet} Wallet
                        </Typography>
                      </Box>
                      <AccountBalanceWallet sx={{ fontSize: 64, color: 'success.main', opacity: 0.3 }} />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Select Wallet */}
                <Box sx={{ mb: 3 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Select Wallet</FormLabel>
                    <RadioGroup
                      row
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value as any)}
                    >
                      <FormControlLabel
                        value="COMMISSION"
                        control={<Radio />}
                        label={`Commission (${formatCurrency((walletBalance?.commissionWallet || 0))})`}
                      />
                      <FormControlLabel
                        value="RENTAL"
                        control={<Radio />}
                        label={`Rental (${formatCurrency((walletBalance?.rentalIncomeWallet || 0))})`}
                      />
                      <FormControlLabel
                        value="ROI"
                        control={<Radio />}
                        label={`ROI (${formatCurrency((walletBalance?.roiWallet || 0))})`}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Withdrawal Amount */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Withdrawal Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MonetizationOn />
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      rules
                        ? `Min: ${formatCurrency(rules.minimumWithdrawal || 0)} | Max: ${formatCurrency(rules.maximumDailyWithdrawal || 0)}`
                        : 'Loading withdrawal limits...'
                    }
                  />

                  {/* Quick Amount Buttons */}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
                    {[1000, 5000, 10000, 25000, 50000].map((amt) => (
                      <Chip
                        key={amt}
                        label={formatCurrency(amt)}
                        onClick={() => setAmount(amt.toString())}
                        disabled={amt > availableBalance}
                        color={amount === amt.toString() ? 'primary' : 'default'}
                        variant={amount === amt.toString() ? 'filled' : 'outlined'}
                        clickable
                      />
                    ))}
                    <Chip
                      label="Max"
                      onClick={() => setAmount(availableBalance.toString())}
                      color={amount === availableBalance.toString() ? 'primary' : 'default'}
                      variant={amount === availableBalance.toString() ? 'filled' : 'outlined'}
                      clickable
                    />
                  </Stack>
                </Box>

                {/* Charges Breakdown */}
                {charges && (
                  <Card variant="outlined" sx={{ mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                        Deduction Summary
                      </Typography>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Requested Amount
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(charges.requestedAmount)}
                          </Typography>
                        </Stack>
                        {charges.applicableTDS && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              TDS ({charges.tdsPercentage}%)
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              -{formatCurrency(charges.tds)}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Admin Charge ({charges.adminChargePercentage}%)
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            -{formatCurrency(charges.adminCharge)}
                          </Typography>
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body1" fontWeight={700}>
                            Net Amount
                          </Typography>
                          <Typography variant="body1" fontWeight={700} color="success.main">
                            {formatCurrency(charges.netAmount)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Eligibility Status */}
                {eligibility && !eligibility.eligible && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {eligibility.reason}
                  </Alert>
                )}

                {eligibility && eligibility.eligible && charges && (
                  <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                    {formatCurrency(charges.netAmount)} will be credited to your account within{' '}
                    {rules?.processingTime || '2-3 business days'}
                  </Alert>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Payment Method */}
                <Box sx={{ mb: 3 }}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">Payment Method</FormLabel>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <FormControlLabel
                        value="BANK_TRANSFER"
                        control={<Radio />}
                        label="Bank Transfer"
                      />
                      <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Bank Details */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <AccountBalance color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Bank Account Details
                      </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Account Holder Name"
                          value={bankAccount.accountHolderName}
                          onChange={(e) =>
                            setBankAccount({ ...bankAccount, accountHolderName: e.target.value })
                          }
                          placeholder="Enter name as per bank records"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Account Number"
                          value={bankAccount.accountNumber}
                          onChange={(e) =>
                            setBankAccount({ ...bankAccount, accountNumber: e.target.value })
                          }
                          placeholder="Enter account number"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="IFSC Code"
                          value={bankAccount.ifscCode}
                          onChange={(e) =>
                            setBankAccount({ ...bankAccount, ifscCode: e.target.value.toUpperCase() })
                          }
                          placeholder="e.g., SBIN0001234"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bank Name"
                          value={bankAccount.bankName}
                          onChange={(e) =>
                            setBankAccount({ ...bankAccount, bankName: e.target.value })
                          }
                          placeholder="Enter bank name"
                        />
                      </Grid>
                    </Grid>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Don't have a saved bank account?{' '}
                      <Button size="small" onClick={() => navigate('/wallet/bank-accounts')}>
                        Add Bank Account
                      </Button>
                    </Alert>
                  </Box>
                )}

                {/* UPI Details */}
                {paymentMethod === 'UPI' && (
                  <Box>
                    <TextField
                      fullWidth
                      label="UPI ID"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      helperText="Enter your UPI ID (e.g., yourname@paytm, yourname@okaxis)"
                    />
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Transaction PIN */}
                <Box sx={{ mb: 3 }}>
                  <Alert severity="warning" icon={<Security />} sx={{ mb: 2 }}>
                    Please enter your 4-6 digit transaction PIN to confirm this withdrawal
                  </Alert>
                  <TextField
                    fullWidth
                    label="Transaction PIN"
                    type="password"
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value)}
                    placeholder="Enter your transaction PIN"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 6,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    !transactionPin ||
                    (eligibility && !eligibility.eligible)
                  }
                  startIcon={submitting ? null : <CheckCircle />}
                >
                  {submitting ? 'Processing...' : 'Submit Withdrawal Request'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Info */}
          <Grid item xs={12} lg={4}>
            {/* Withdrawal Rules */}
            {rules && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Info color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Withdrawal Rules
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Minimum Withdrawal
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(rules.minimumWithdrawal)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Maximum Daily Withdrawal
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(rules.maximumDailyWithdrawal)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        TDS
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {rules.tdsPercentage}% (on amount above {formatCurrency(rules.tdsThreshold)})
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Admin Charge
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {rules.adminChargePercentage}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Processing Time
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {rules.processingTime}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Important Notes */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Important Notes
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Ensure your bank details are correct before submitting
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • TDS is applicable on withdrawals above the threshold
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Processing time may vary based on bank holidays
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Once submitted, withdrawal requests cannot be cancelled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Check withdrawal history for status updates
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Withdrawal;
