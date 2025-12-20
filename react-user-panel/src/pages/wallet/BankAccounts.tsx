import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Skeleton,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  AccountBalance,
  CheckCircle,
  Edit,
  Delete,
  Star,
  StarOutline,
  Verified,
  Pending,
  Refresh,
} from '@mui/icons-material';
import { BankAccount } from '../../types';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const bankAccountSchema = yup.object({
  accountHolderName: yup
    .string()
    .required('Account holder name is required')
    .min(2, 'Name is too short')
    .matches(/^[a-zA-Z\s]+$/, 'Name should only contain letters'),
  bankName: yup.string().required('Bank name is required'),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .matches(/^\d{9,18}$/, 'Please enter a valid account number (9-18 digits)'),
  ifscCode: yup
    .string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code (e.g., SBIN0001234)'),
  branchName: yup.string(),
  accountType: yup.string().required('Account type is required'),
  upiId: yup.string().matches(/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID'),
});

type BankAccountFormData = yup.InferType<typeof bankAccountSchema>;

const BankAccounts: React.FC = () => {
  const theme = useTheme();

  // State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountFormData>({
    resolver: yupResolver(bankAccountSchema),
    defaultValues: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      accountType: 'SAVINGS',
      upiId: '',
    },
  });

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      setTimeout(() => {
        setBankAccounts([
          {
            id: 1,
            accountHolderName: 'John Doe',
            bankName: 'State Bank of India',
            accountNumber: '1234567890',
            ifscCode: 'SBIN0001234',
            branchName: 'Main Branch',
            accountType: 'SAVINGS',
            upiId: 'john@paytm',
            isPrimary: true,
            isVerified: true,
            createdDate: '2024-01-15',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      toast.error('Failed to load bank accounts');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedAccount(null);
    reset({
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      accountType: 'SAVINGS',
      upiId: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setEditMode(true);
    setSelectedAccount(account);
    reset({
      accountHolderName: account.accountHolderName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      ifscCode: account.ifscCode,
      branchName: account.branchName || '',
      accountType: account.accountType,
      upiId: account.upiId || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (account: BankAccount) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleSetPrimary = async (accountId: number) => {
    try {
      toast.info('Setting as primary account...');
      // API call here
      toast.success('Primary account updated successfully');
      fetchBankAccounts();
    } catch (err) {
      toast.error('Failed to update primary account');
    }
  };

  const onSubmit = async (_data: BankAccountFormData) => {
    try {
      setSaving(true);
      // API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editMode) {
        toast.success('Bank account updated successfully');
      } else {
        toast.success('Bank account added successfully');
      }

      setDialogOpen(false);
      fetchBankAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;

    try {
      setDeleting(true);
      // API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Bank account deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedAccount(null);
      fetchBankAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bank account');
    } finally {
      setDeleting(false);
    }
  };

  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.slice(-4).padStart(accountNumber.length, '*');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
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
              Bank Accounts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your bank accounts for withdrawals
            </Typography>
          </div>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBankAccounts}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
              Add Account
            </Button>
          </Stack>
        </Stack>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Important Information
          </Typography>
          <Typography variant="caption" component="div">
            • Add bank accounts to receive withdrawal payments
          </Typography>
          <Typography variant="caption" component="div">
            • Bank accounts will be verified before first withdrawal
          </Typography>
          <Typography variant="caption" component="div">
            • Ensure account details match your KYC documents
          </Typography>
          <Typography variant="caption" component="div">
            • You can set one account as primary for faster withdrawals
          </Typography>
        </Alert>

        {/* Bank Accounts List */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2].map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : bankAccounts.length > 0 ? (
          <Grid container spacing={3}>
            {bankAccounts.map((account) => (
              <Grid item xs={12} md={6} lg={4} key={account.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: 2,
                    borderColor: account.isPrimary ? 'primary.main' : 'divider',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  {/* Primary Badge */}
                  {account.isPrimary && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                      }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Star sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={700}>
                          Primary
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  <CardContent>
                    {/* Bank Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>

                    {/* Account Details */}
                    <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                      {account.bankName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {account.accountHolderName}
                    </Typography>

                    <Stack spacing={1.5} sx={{ mt: 2, mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {formatAccountNumber(account.accountNumber)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          IFSC Code
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {account.ifscCode}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Account Type
                        </Typography>
                        <Chip
                          label={account.accountType}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      </Stack>
                      {account.upiId && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            UPI ID
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {account.upiId}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* Verification Status */}
                    <Chip
                      icon={account.isVerified ? <Verified /> : <Pending />}
                      label={account.isVerified ? 'Verified' : 'Pending Verification'}
                      size="small"
                      color={account.isVerified ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Added on {formatDate(account.createdDate)}
                    </Typography>

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                      {!account.isPrimary && (
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<StarOutline />}
                          onClick={() => handleSetPrimary(account.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(account)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(account)}
                        disabled={account.isPrimary}
                        title={account.isPrimary ? 'Cannot delete primary account' : 'Delete'}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AccountBalance sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Bank Accounts Added
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add a bank account to receive withdrawal payments
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
                  Add Bank Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              {editMode ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Controller
                    name="accountHolderName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Account Holder Name"
                        placeholder="Enter name as per bank records"
                        error={!!errors.accountHolderName}
                        helperText={errors.accountHolderName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="bankName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bank Name"
                        placeholder="Enter bank name"
                        error={!!errors.bankName}
                        helperText={errors.bankName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="branchName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Branch Name (Optional)"
                        placeholder="Enter branch name"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="accountNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Account Number"
                        placeholder="Enter account number"
                        error={!!errors.accountNumber}
                        helperText={errors.accountNumber?.message}
                        inputProps={{ maxLength: 18 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="ifscCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="IFSC Code"
                        placeholder="e.g., SBIN0001234"
                        error={!!errors.ifscCode}
                        helperText={errors.ifscCode?.message}
                        inputProps={{
                          maxLength: 11,
                          style: { textTransform: 'uppercase' },
                        }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="accountType"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Account Type"
                        error={!!errors.accountType}
                        helperText={errors.accountType?.message}
                      >
                        <MenuItem value="SAVINGS">Savings Account</MenuItem>
                        <MenuItem value="CURRENT">Current Account</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="upiId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="UPI ID (Optional)"
                        placeholder="yourname@upi"
                        error={!!errors.upiId}
                        helperText={errors.upiId?.message || 'Link your UPI ID for faster withdrawals'}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                Please ensure the account details match your KYC documents for verification.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving...' : editMode ? 'Update Account' : 'Add Account'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
          <DialogTitle>Delete Bank Account</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete this bank account? This action cannot be undone.
            </Alert>
            {selectedAccount && (
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {selectedAccount.bankName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAccount.accountHolderName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatAccountNumber(selectedAccount.accountNumber)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default BankAccounts;
