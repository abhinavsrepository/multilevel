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
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Upload,
  CheckCircle,
  HourglassEmpty,
  Cancel,
} from '@mui/icons-material';
import {
  submitDepositRequest,
  uploadPaymentProof,
  getMyDeposits,
  cancelDeposit,
  Deposit,
} from '@/api/deposit.api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const MyDeposits: React.FC = () => {
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    if (severity === 'error') toast.error(message);
    else if (severity === 'success') toast.success(message);
    else if (severity === 'warning') toast.warning(message);
    else toast.info(message);
  };
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [total, setTotal] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
  });

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await getMyDeposits({ page: 1, limit: 100 });
      setDeposits(response.data?.data || []);
      setTotal(response.data?.total || 0);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to fetch deposits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showSnackbar('Please enter a valid amount', 'error');
      return;
    }

    try {
      setCreateLoading(true);
      const response = await submitDepositRequest({
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || undefined,
      });
      showSnackbar('Deposit request submitted successfully', 'success');
      setCreateModalOpen(false);
      setFormData({ amount: '', paymentMethod: 'BANK_TRANSFER', transactionId: '' });
      fetchDeposits();

      // Open upload modal for the new deposit
      if (response.data) {
        setSelectedDeposit(response.data);
        setUploadModalOpen(true);
      }
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to submit deposit', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !selectedDeposit) {
      showSnackbar('Please select a file to upload', 'error');
      return;
    }

    try {
      setUploadLoading(true);
      await uploadPaymentProof(selectedDeposit.id, selectedFile);
      showSnackbar('Payment proof uploaded successfully', 'success');
      setUploadModalOpen(false);
      setSelectedFile(null);
      setSelectedDeposit(null);
      fetchDeposits();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to upload payment proof', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelDeposit = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this deposit request?')) {
      return;
    }

    try {
      await cancelDeposit(id);
      showSnackbar('Deposit cancelled successfully', 'success');
      fetchDeposits();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to cancel deposit', 'error');
    }
  };

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
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
      case 'APPROVED':
        return <CheckCircle />;
      case 'REJECTED':
        return <Cancel />;
      default:
        return undefined;
    }
  };

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === 'PENDING').length,
    approved: deposits.filter(d => d.status === 'APPROVED').length,
    rejected: deposits.filter(d => d.status === 'REJECTED').length,
    totalAmount: deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0),
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
          My Deposits
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
        >
          New Deposit
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Deposits
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
                Approved
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {stats.rejected}
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
                ₹{stats.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deposits Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Deposit History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Payment Method</strong></TableCell>
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>E-Pin Generated</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>#{deposit.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        ${Number(deposit.amount || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={deposit.paymentMethod.replace('_', ' ')} size="small" />
                    </TableCell>
                    <TableCell>{deposit.transactionId || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(deposit.status)}
                        label={deposit.status}
                        color={getStatusColor(deposit.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {deposit.epinGenerated ? (
                        <Chip
                          label={`Yes - ${deposit.EPin?.pinCode}`}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip label="No" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{dayjs(deposit.createdAt).format('DD MMM YYYY HH:mm')}</TableCell>
                    <TableCell>
                      {deposit.status === 'PENDING' && !deposit.paymentProof && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Upload />}
                          onClick={() => {
                            setSelectedDeposit(deposit);
                            setUploadModalOpen(true);
                          }}
                        >
                          Upload Proof
                        </Button>
                      )}
                      {deposit.status === 'PENDING' && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancelDeposit(deposit.id)}
                          sx={{ ml: 1 }}
                        >
                          Cancel
                        </Button>
                      )}
                      {deposit.status === 'REJECTED' && deposit.rejectionReason && (
                        <Typography variant="caption" color="error">
                          {deposit.rejectionReason}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {deposits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">No deposits found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Deposit Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Deposit Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Payment Method"
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="CRYPTO">Cryptocurrency</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Transaction ID (Optional)"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="Enter transaction reference"
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              After submitting, please upload your payment proof for verification.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDeposit}
            disabled={createLoading || !formData.amount}
          >
            {createLoading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Proof Modal */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Payment Proof</DialogTitle>
        <DialogContent>
          {selectedDeposit && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Deposit ID: #{selectedDeposit.id} | Amount: ${Number(selectedDeposit.amount || 0).toFixed(2)}
              </Alert>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ marginBottom: 16 }}
              />
              {uploadLoading && <LinearProgress sx={{ mt: 2 }} />}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={handleUploadProof}
            disabled={uploadLoading || !selectedFile}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyDeposits;
