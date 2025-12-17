import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider,
  Alert,
  Stack,
  Box,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Chip,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  AccountBalanceWallet,
  AccountBalance,
  Security,
  Info,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputField, SelectField } from '../forms';

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WithdrawalFormData) => Promise<void>;
  walletBalance?: number;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  withdrawalFee?: number;
  processingTime?: string;
}

export interface WithdrawalFormData {
  amount: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: string;
  pin: string;
}

const accountTypeOptions = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'current', label: 'Current Account' },
];

const validationSchema = yup.object({
  amount: yup
    .number()
    .required('Withdrawal amount is required')
    .positive('Amount must be positive')
    .min(500, 'Minimum withdrawal is ₹500')
    .max(1000000, 'Maximum withdrawal is ₹10,00,000'),
  accountHolderName: yup
    .string()
    .required('Account holder name is required')
    .min(2, 'Name is too short')
    .matches(/^[a-zA-Z\s]+$/, 'Name should only contain letters'),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .matches(/^\d{9,18}$/, 'Please enter a valid account number (9-18 digits)'),
  ifscCode: yup
    .string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code (e.g., SBIN0001234)'),
  bankName: yup.string().required('Bank name is required'),
  accountType: yup.string().required('Account type is required'),
  pin: yup
    .string()
    .required('Transaction PIN is required')
    .matches(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
});

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  open,
  onClose,
  onSubmit,
  walletBalance = 0,
  minWithdrawal = 500,
  maxWithdrawal = 1000000,
  withdrawalFee = 0,
  processingTime = '2-3 business days',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPinField, setShowPinField] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<WithdrawalFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      amount: 0,
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountType: 'savings',
      pin: '',
    },
    mode: 'onChange',
  });

  const formData = watch();

  // Calculate net amount after fee
  const calculateNetAmount = (amount: number) => {
    const fee = (amount * withdrawalFee) / 100;
    const netAmount = amount - fee;
    return { fee, netAmount };
  };

  const { fee, netAmount } = calculateNetAmount(formData.amount || 0);

  const handleFormSubmit = async (data: WithdrawalFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate wallet balance
      if (data.amount > walletBalance) {
        throw new Error('Insufficient wallet balance');
      }

      await onSubmit(data);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setShowPinField(false);
    reset();
    onClose();
  };

  const handleProceed = () => {
    // First validate all fields except PIN
    const fieldsToValidate = [
      'amount',
      'accountHolderName',
      'accountNumber',
      'ifscCode',
      'bankName',
      'accountType',
    ];

    const hasErrors = fieldsToValidate.some((field) => errors[field as keyof WithdrawalFormData]);

    if (!hasErrors && formData.amount >= minWithdrawal && formData.amount <= walletBalance) {
      setShowPinField(true);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <AccountBalanceWallet color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Withdraw Funds
          </Typography>
        </Stack>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close withdrawal modal"
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={3}>
            {/* Wallet Balance Card */}
            <Card
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(
                    theme.palette.success.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
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
                      ₹{walletBalance.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min: ₹{minWithdrawal} | Max: ₹{maxWithdrawal.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <AccountBalanceWallet sx={{ fontSize: 64, color: 'success.main', opacity: 0.3 }} />
                </Stack>
              </CardContent>
            </Card>

            {/* Processing Info Alert */}
            <Alert severity="info" icon={<Info />}>
              Withdrawal requests are processed within {processingTime}
            </Alert>

            {/* Withdrawal Amount */}
            <Box>
              <InputField
                name="amount"
                control={control}
                label="Withdrawal Amount"
                type="number"
                placeholder="Enter amount"
                required
                autoFocus
                inputProps={{
                  min: minWithdrawal,
                  max: Math.min(maxWithdrawal, walletBalance),
                  step: 100,
                }}
                startIcon={<AccountBalanceWallet />}
              />

              {/* Quick Amount Buttons */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Quick Select:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {[1000, 5000, 10000, 25000, 50000].map((amt) => (
                    <Chip
                      key={amt}
                      label={`₹${(amt / 1000).toFixed(0)}K`}
                      onClick={() => setValue('amount', amt)}
                      disabled={amt > walletBalance}
                      color={formData.amount === amt ? 'primary' : 'default'}
                      variant={formData.amount === amt ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                  <Chip
                    label="Max"
                    onClick={() => setValue('amount', walletBalance)}
                    color={formData.amount === walletBalance ? 'primary' : 'default'}
                    variant={formData.amount === walletBalance ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                </Stack>
              </Box>

              {/* Fee Calculation */}
              {formData.amount >= minWithdrawal && (
                <Card
                  variant="outlined"
                  sx={{
                    mt: 2,
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.05),
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Withdrawal Amount
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          ₹{formData.amount.toLocaleString('en-IN')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Processing Fee ({withdrawalFee}%)
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="error.main">
                          -₹{fee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: 'success.main',
                            color: 'success.contrastText',
                          }}
                        >
                          <Typography variant="caption">Net Amount to Receive</Typography>
                          <Typography variant="h5" fontWeight={700}>
                            ₹{netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Bank Account Details */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance color="primary" />
                Bank Account Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2.5}>
                <InputField
                  name="accountHolderName"
                  control={control}
                  label="Account Holder Name"
                  placeholder="Enter name as per bank records"
                  required
                />

                <InputField
                  name="accountNumber"
                  control={control}
                  label="Account Number"
                  type="text"
                  placeholder="Enter account number"
                  required
                  inputProps={{
                    maxLength: 18,
                  }}
                />

                <InputField
                  name="ifscCode"
                  control={control}
                  label="IFSC Code"
                  placeholder="e.g., SBIN0001234"
                  required
                  inputProps={{
                    maxLength: 11,
                    style: { textTransform: 'uppercase' },
                  }}
                  helperText="11-character alphanumeric code (e.g., SBIN0001234)"
                />

                <InputField
                  name="bankName"
                  control={control}
                  label="Bank Name"
                  placeholder="Enter bank name"
                  required
                />

                <SelectField
                  name="accountType"
                  control={control}
                  label="Account Type"
                  options={accountTypeOptions}
                  required
                />
              </Stack>
            </Box>

            {/* PIN Verification Section */}
            {showPinField && (
              <Box>
                <Alert severity="warning" icon={<Security />} sx={{ mb: 2 }}>
                  Please enter your 4-6 digit transaction PIN to confirm this withdrawal
                </Alert>

                <InputField
                  name="pin"
                  control={control}
                  label="Transaction PIN"
                  type="password"
                  placeholder="Enter your transaction PIN"
                  required
                  autoFocus
                  startIcon={<Security />}
                  inputProps={{
                    maxLength: 6,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  helperText="Your 4-6 digit transaction PIN"
                />
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Validation Warnings */}
            {formData.amount > walletBalance && formData.amount > 0 && (
              <Alert severity="error" icon={<Warning />}>
                Insufficient balance. Your available balance is ₹
                {walletBalance.toLocaleString('en-IN')}
              </Alert>
            )}

            {formData.amount > 0 &&
              formData.amount < minWithdrawal &&
              formData.amount > 0 && (
                <Alert severity="warning" icon={<Warning />}>
                  Minimum withdrawal amount is ₹{minWithdrawal.toLocaleString('en-IN')}
                </Alert>
              )}

            {/* Success Preview */}
            {formData.amount >= minWithdrawal &&
              formData.amount <= walletBalance &&
              !showPinField && (
                <Alert severity="success" icon={<CheckCircle />}>
                  ₹{netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} will be
                  credited to your bank account within {processingTime}
                </Alert>
              )}
          </Stack>
        </form>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Cancel
        </Button>

        {!showPinField ? (
          <Button
            onClick={handleProceed}
            variant="contained"
            disabled={
              formData.amount < minWithdrawal ||
              formData.amount > walletBalance ||
              !formData.accountHolderName ||
              !formData.accountNumber ||
              !formData.ifscCode ||
              !formData.bankName ||
              !formData.accountType
            }
          >
            Proceed to Verification
          </Button>
        ) : (
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            variant="contained"
            color="success"
            disabled={loading || !formData.pin || formData.pin.length < 4}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
