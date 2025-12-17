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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Add,
  CheckCircle,
  HourglassEmpty,
  Lock,
} from '@mui/icons-material';
import {
  generateEPinFromWallet,
  getMyEPins,
  getMyEPinStats,
  activateUserWithEPin,
  EPin,
  EPinStats,
} from '@/api/epin.api';
import useNotification from '@/hooks/useNotification';
import dayjs from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MyEPins: React.FC = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [epins, setEpins] = useState<EPin[]>([]);
  const [stats, setStats] = useState<EPinStats | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  // Removed unused activateModalOpen
  const [generateAmount, setGenerateAmount] = useState('');
  const [activatePinCode, setActivatePinCode] = useState('');
  const [activateUserId, setActivateUserId] = useState('');
  const [generateLoading, setGenerateLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    notify(message, { type });
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [epinsRes, statsRes] = await Promise.all([
        getMyEPins({ page: 1, limit: 100, status: statusFilter || undefined }),
        getMyEPinStats(),
      ]);
      setEpins(epinsRes?.data?.data || []);
      setStats(statsRes?.data || null);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to fetch E-Pins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEPin = async () => {
    if (!generateAmount || parseFloat(generateAmount) <= 0) {
      showSnackbar('Please enter a valid amount', 'error');
      return;
    }

    try {
      setGenerateLoading(true);
      const response = await generateEPinFromWallet(parseFloat(generateAmount));
      showSnackbar(
        `E-Pin generated successfully! Fee: $${response.data?.transactionFee?.toFixed(2) || '0.00'}`,
        'success'
      );
      setGenerateModalOpen(false);
      setGenerateAmount('');
      fetchData();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to generate E-Pin', 'error');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleActivateUser = async () => {
    if (!activatePinCode || !activateUserId) {
      showSnackbar('Please enter both PIN code and User ID', 'error');
      return;
    }

    try {
      setActivateLoading(true);
      const response = await activateUserWithEPin(activatePinCode, parseInt(activateUserId));
      showSnackbar(response.data?.message || 'User activated successfully', 'success');
      // Removed setActivateModalOpen(false) as it is unused
      setActivatePinCode('');
      setActivateUserId('');
      fetchData();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to activate user', 'error');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleCopyPin = (pinCode: string) => {
    navigator.clipboard.writeText(pinCode);
    showSnackbar('E-Pin copied to clipboard', 'success');
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle color="success" />;
      case 'USED':
        return <CheckCircle color="primary" />;
      case 'EXPIRED':
        return <HourglassEmpty color="warning" />;
      case 'BLOCKED':
        return <Lock color="error" />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'USED':
        return 'primary';
      case 'EXPIRED':
        return 'warning';
      case 'BLOCKED':
        return 'error';
      default:
        return 'default';
    }
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
          My E-Pins
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setGenerateModalOpen(true)}
        >
          Generate E-Pin
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Generated
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalGenerated}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Available
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {stats.totalAvailable}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Used
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {stats.totalUsed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expired
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {stats.totalExpired}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Value
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  ${stats.totalValue?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="My E-Pins" onClick={() => setStatusFilter('')} />
            <Tab label="Available" onClick={() => setStatusFilter('AVAILABLE')} />
            <Tab label="Used" onClick={() => setStatusFilter('USED')} />
            <Tab label="Activate User" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Pin Code</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Source</strong></TableCell>
                  <TableCell><strong>Activated User</strong></TableCell>
                  <TableCell><strong>Expiry Date</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {epins.map((epin) => (
                  <TableRow key={epin.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <code style={{ fontWeight: 'bold' }}>{epin.pinCode}</code>
                        <Tooltip title="Copy">
                          <IconButton size="small" onClick={() => handleCopyPin(epin.pinCode)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        ${epin.amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(epin.status)}
                        label={epin.status}
                        color={getStatusColor(epin.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={epin.generatedFrom} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {epin.ActivatedUser ? (
                        <div>
                          <Typography variant="body2">
                            {epin.ActivatedUser.firstName} {epin.ActivatedUser.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{epin.ActivatedUser.username}
                          </Typography>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {epin.expiryDate ? (
                        <Typography
                          variant="body2"
                          color={dayjs(epin.expiryDate).isBefore(dayjs()) ? 'error' : 'inherit'}
                        >
                          {dayjs(epin.expiryDate).format('DD MMM YYYY')}
                        </Typography>
                      ) : (
                        'No Expiry'
                      )}
                    </TableCell>
                    <TableCell>{dayjs(epin.createdAt).format('DD MMM YYYY')}</TableCell>
                    <TableCell>
                      {epin.status === 'AVAILABLE' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setActivatePinCode(epin.pinCode);
                            setTabValue(3);
                          }}
                        >
                          Use
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {epins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">No E-Pins found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Pin Code</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Expiry Date</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {epins.filter(e => e.status === 'AVAILABLE').map((epin) => (
                  <TableRow key={epin.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <code style={{ fontWeight: 'bold' }}>{epin.pinCode}</code>
                        <Tooltip title="Copy">
                          <IconButton size="small" onClick={() => handleCopyPin(epin.pinCode)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="success">
                        ${epin.amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {epin.expiryDate ? dayjs(epin.expiryDate).format('DD MMM YYYY') : 'No Expiry'}
                    </TableCell>
                    <TableCell>{dayjs(epin.createdAt).format('DD MMM YYYY')}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setActivatePinCode(epin.pinCode);
                          setTabValue(3);
                        }}
                      >
                        Use to Activate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Pin Code</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Activated User</strong></TableCell>
                  <TableCell><strong>Used At</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {epins.filter(e => e.status === 'USED').map((epin) => (
                  <TableRow key={epin.id}>
                    <TableCell><code>{epin.pinCode}</code></TableCell>
                    <TableCell>${epin.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      {epin.ActivatedUser ? (
                        <div>
                          <Typography variant="body2">
                            {epin.ActivatedUser.firstName} {epin.ActivatedUser.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{epin.ActivatedUser.username}
                          </Typography>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{epin.usedAt ? dayjs(epin.usedAt).format('DD MMM YYYY HH:mm') : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box maxWidth={600} mx="auto">
            <Alert severity="info" sx={{ mb: 3 }}>
              Use an E-Pin to activate a user account. The E-Pin amount will be credited to the user's wallet.
            </Alert>
            <TextField
              fullWidth
              label="E-Pin Code"
              value={activatePinCode}
              onChange={(e) => setActivatePinCode(e.target.value)}
              placeholder="Enter E-Pin code"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="User ID to Activate"
              type="number"
              value={activateUserId}
              onChange={(e) => setActivateUserId(e.target.value)}
              placeholder="Enter user ID"
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleActivateUser}
              disabled={activateLoading || !activatePinCode || !activateUserId}
            >
              {activateLoading ? <CircularProgress size={24} /> : 'Activate User'}
            </Button>
          </Box>
        </TabPanel>
      </Card>

      {/* Generate E-Pin Modal */}
      <Dialog open={generateModalOpen} onClose={() => setGenerateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate E-Pin from Wallet</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            A transaction fee will be charged when generating E-Pin from wallet.
          </Alert>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={generateAmount}
            onChange={(e) => setGenerateAmount(e.target.value)}
            placeholder="Enter amount"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateEPin}
            disabled={generateLoading || !generateAmount}
          >
            {generateLoading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyEPins;
