import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  AccountBalanceWallet,
  CreditCard,
  Calculate,
  Person,
  Payment,
  CheckCircle,
  Info,
  TrendingUp,
  CalendarToday,
  Percent,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputField, SelectField, DatePicker } from '../forms';

interface InvestmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InvestmentFormData) => Promise<void>;
  walletBalance?: number;
  minInvestment?: number;
  maxInvestment?: number;
  interestRate?: number;
  lockPeriod?: number;
}

export interface InvestmentFormData {
  amount: number;
  nomineeName: string;
  nomineeRelation: string;
  nomineeContact: string;
  nomineeAddress: string;
  paymentMethod: 'wallet' | 'razorpay';
  acceptTerms: boolean;
}

const steps = ['Amount', 'Nominee Details', 'Payment Method', 'Review & Confirm'];

// Validation schemas for each step
const step1Schema = yup.object({
  amount: yup
    .number()
    .required('Investment amount is required')
    .positive('Amount must be positive')
    .min(1000, 'Minimum investment is ₹1,000')
    .max(10000000, 'Maximum investment is ₹1,00,00,000'),
});

const step2Schema = yup.object({
  nomineeName: yup.string().required('Nominee name is required').min(2, 'Name is too short'),
  nomineeRelation: yup.string().required('Relation is required'),
  nomineeContact: yup
    .string()
    .required('Contact number is required')
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  nomineeAddress: yup.string().required('Address is required').min(10, 'Address is too short'),
});

const step3Schema = yup.object({
  paymentMethod: yup.string().required('Please select a payment method').oneOf(['wallet', 'razorpay']),
});

const step4Schema = yup.object({
  acceptTerms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const relationOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  open,
  onClose,
  onSubmit,
  walletBalance = 0,
  minInvestment = 1000,
  maxInvestment = 10000000,
  interestRate = 12,
  lockPeriod = 365,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<InvestmentFormData>({
    resolver: yupResolver(
      activeStep === 0
        ? step1Schema
        : activeStep === 1
        ? step2Schema
        : activeStep === 2
        ? step3Schema
        : step4Schema
    ),
    defaultValues: {
      amount: 0,
      nomineeName: '',
      nomineeRelation: '',
      nomineeContact: '',
      nomineeAddress: '',
      paymentMethod: 'wallet',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const formData = watch();

  // Calculate returns
  const calculateReturns = (amount: number) => {
    const principal = amount;
    const rate = interestRate / 100;
    const time = lockPeriod / 365;
    const maturityAmount = principal * (1 + rate * time);
    const returns = maturityAmount - principal;
    return { maturityAmount, returns };
  };

  const { maturityAmount, returns } = calculateReturns(formData.amount || 0);

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (activeStep === steps.length - 1) {
        await handleFinalSubmit();
      } else {
        setActiveStep((prev) => prev + 1);
        setError(null);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate final step
      const isValid = await trigger();
      if (!isValid) return;

      // If using Razorpay, integrate payment gateway here
      if (formData.paymentMethod === 'razorpay') {
        // Razorpay integration would go here
        // For now, we'll simulate the payment
        await simulateRazorpayPayment(formData.amount);
      }

      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulateRazorpayPayment = async (amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      // In production, implement actual Razorpay integration:
      // const options = {
      //   key: process.env.REACT_APP_RAZORPAY_KEY,
      //   amount: amount * 100,
      //   currency: 'INR',
      //   name: 'MLM Real Estate',
      //   description: 'Investment Transaction',
      //   handler: function (response: any) {
      //     resolve();
      //   },
      //   modal: {
      //     ondismiss: function () {
      //       reject(new Error('Payment cancelled'));
      //     }
      //   }
      // };
      // const razorpay = new (window as any).Razorpay(options);
      // razorpay.open();

      // Simulating payment for demo
      setTimeout(() => resolve(), 1000);
    });
  };

  const handleClose = () => {
    setActiveStep(0);
    setError(null);
    reset();
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Alert severity="info" icon={<Info />}>
              Minimum investment: ₹{minInvestment.toLocaleString('en-IN')} | Maximum: ₹
              {maxInvestment.toLocaleString('en-IN')}
            </Alert>

            <InputField
              name="amount"
              control={control}
              label="Investment Amount"
              type="number"
              placeholder="Enter amount"
              required
              startIcon={<TrendingUp />}
              autoFocus
              inputProps={{
                min: minInvestment,
                max: maxInvestment,
                step: 1000,
              }}
            />

            {/* Quick Amount Buttons */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Quick Select:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                  <Chip
                    key={amt}
                    label={`₹${(amt / 1000).toFixed(0)}K`}
                    onClick={() => setValue('amount', amt)}
                    color={formData.amount === amt ? 'primary' : 'default'}
                    variant={formData.amount === amt ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Investment Calculator */}
            {formData.amount >= minInvestment && (
              <Card
                sx={{
                  background: (theme) =>
                    `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Calculate color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Investment Returns Calculator
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Principal Amount
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          ₹{formData.amount.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Interest Rate
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Percent fontSize="small" color="success" />
                          <Typography variant="h6" fontWeight={600} color="success.main">
                            {interestRate}% p.a.
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Lock Period
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarToday fontSize="small" color="info" />
                          <Typography variant="h6" fontWeight={600} color="info.main">
                            {lockPeriod} days
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Estimated Returns
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          +₹{returns.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                        }}
                      >
                        <Typography variant="caption">Maturity Amount</Typography>
                        <Typography variant="h5" fontWeight={700}>
                          ₹{maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Alert severity="info" icon={<Person />}>
              Add a nominee who will receive the investment in case of unforeseen circumstances.
            </Alert>

            <InputField
              name="nomineeName"
              control={control}
              label="Nominee Full Name"
              placeholder="Enter nominee's full name"
              required
              autoFocus
            />

            <SelectField
              name="nomineeRelation"
              control={control}
              label="Relation with Nominee"
              options={relationOptions}
              placeholder="Select relation"
              required
            />

            <InputField
              name="nomineeContact"
              control={control}
              label="Nominee Contact Number"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              required
              inputProps={{
                maxLength: 10,
              }}
            />

            <InputField
              name="nomineeAddress"
              control={control}
              label="Nominee Address"
              placeholder="Enter complete address"
              required
              multiline
              rows={3}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Alert severity="info" icon={<Payment />}>
              Choose your preferred payment method to complete the investment.
            </Alert>

            {/* Wallet Balance */}
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
                      Available Wallet Balance
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      ₹{walletBalance.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <AccountBalanceWallet sx={{ fontSize: 48, color: 'success.main', opacity: 0.5 }} />
                </Stack>
              </CardContent>
            </Card>

            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                Select Payment Method
              </FormLabel>
              <RadioGroup
                value={formData.paymentMethod}
                onChange={(e) => setValue('paymentMethod', e.target.value as 'wallet' | 'razorpay')}
              >
                <Card
                  sx={{
                    mb: 2,
                    border: 2,
                    borderColor:
                      formData.paymentMethod === 'wallet' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => setValue('paymentMethod', 'wallet')}
                >
                  <CardContent>
                    <FormControlLabel
                      value="wallet"
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <AccountBalanceWallet color="primary" />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              Pay from Wallet
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Instant payment using your wallet balance
                            </Typography>
                            {formData.amount > walletBalance && (
                              <Typography variant="caption" color="error" display="block">
                                Insufficient balance
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    border: 2,
                    borderColor:
                      formData.paymentMethod === 'razorpay' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => setValue('paymentMethod', 'razorpay')}
                >
                  <CardContent>
                    <FormControlLabel
                      value="razorpay"
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <CreditCard color="primary" />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              Pay via Razorpay
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Credit/Debit Card, UPI, Net Banking
                            </Typography>
                          </Box>
                        </Stack>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
              </RadioGroup>
            </FormControl>

            {formData.paymentMethod === 'wallet' && formData.amount > walletBalance && (
              <Alert severity="error">
                Insufficient wallet balance. Please add funds or choose Razorpay payment.
              </Alert>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Alert severity="success" icon={<CheckCircle />}>
              Please review your investment details before confirming.
            </Alert>

            {/* Investment Summary */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Investment Details
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Investment Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ₹{formData.amount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Interest Rate
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {interestRate}% p.a.
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Lock Period
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {lockPeriod} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Expected Returns
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="success.main">
                      ₹{returns.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
                    >
                      <Typography variant="caption">Maturity Amount</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        ₹{maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Nominee Details */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Nominee Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{formData.nomineeName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Relation
                    </Typography>
                    <Typography variant="body1">
                      {relationOptions.find((r) => r.value === formData.nomineeRelation)?.label}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography variant="body1">{formData.nomineeContact}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">{formData.nomineeAddress}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Payment Method
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} alignItems="center">
                  {formData.paymentMethod === 'wallet' ? (
                    <>
                      <AccountBalanceWallet color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Wallet Payment
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Amount will be deducted from your wallet
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <CreditCard color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Razorpay Payment Gateway
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Secure payment via Razorpay
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <FormControlLabel
              control={
                <Radio
                  checked={formData.acceptTerms}
                  onChange={(e) => setValue('acceptTerms', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    terms and conditions
                  </Typography>{' '}
                  for this investment
                </Typography>
              }
            />
          </Stack>
        );

      default:
        return null;
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
        <Typography variant="h5" fontWeight={700}>
          New Investment
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close investment modal"
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-completed': {
                      color: 'success.main',
                    },
                    '&.Mui-active': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button
          onClick={activeStep === 0 ? handleClose : handleBack}
          disabled={loading}
          variant="outlined"
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={
            loading ||
            (activeStep === 2 &&
              formData.paymentMethod === 'wallet' &&
              formData.amount > walletBalance)
          }
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading
            ? 'Processing...'
            : activeStep === steps.length - 1
            ? 'Confirm & Invest'
            : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
