import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Divider,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Edit,
  CheckCircle,
  PendingActions,
  Error,
  AttachMoney,
  Description,
  Share,
  Phone,
  ExitToApp,
  Info,
  Payment,
  TrendingUp,
  CalendarToday,
  AccountBalance,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LineChart from '../../components/charts/LineChart';
import { getInvestmentById, updateNominee, payInstallment } from '../../api/investment.api';
import { Investment, NomineeDetails } from '../../types';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`investment-tabpanel-${index}`}
      aria-labelledby={`investment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const InvestmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editNomineeOpen, setEditNomineeOpen] = useState(false);
  const [nomineeData, setNomineeData] = useState<NomineeDetails | null>(null);
  const [savingNominee, setSavingNominee] = useState(false);

  // Fetch investment details
  const fetchInvestment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInvestmentById(Number(id));
      if (response.data) {
        setInvestment(response.data);
        setNomineeData(response.data.nominee);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load investment details');
      toast.error('Failed to load investment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvestment();
    }
  }, [id]);

  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditNominee = () => {
    setEditNomineeOpen(true);
  };

  const handleSaveNominee = async () => {
    if (!nomineeData || !investment) return;

    try {
      setSavingNominee(true);
      await updateNominee(investment.id, nomineeData);
      toast.success('Nominee details updated successfully');
      setEditNomineeOpen(false);
      fetchInvestment();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update nominee details');
    } finally {
      setSavingNominee(false);
    }
  };

  const handlePayInstallment = async (installmentNumber: number) => {
    if (!investment) return;

    try {
      toast.info('Processing payment...');
      const response = await payInstallment({
        investmentId: investment.id,
        installmentNumber,
        paymentMethod: 'WALLET',
      });

      if (response.data) {
        toast.success('Installment paid successfully');
        fetchInvestment();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process payment');
    }
  };

  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    toast.info(`Downloading ${documentName}...`);
    // Download logic here
  };

  const handleDownloadCertificate = () => {
    toast.info('Downloading certificate...');
    // Download logic here
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
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
      ACTIVE: { color: 'success', icon: CheckCircle, label: 'Active' },
      COMPLETED: { color: 'info', icon: CheckCircle, label: 'Completed' },
      MATURED: { color: 'secondary', icon: CheckCircle, label: 'Matured' },
      PENDING: { color: 'warning', icon: PendingActions, label: 'Pending' },
      CANCELLED: { color: 'error', icon: Error, label: 'Cancelled' },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const getInstallmentStatusColor = (status: string) => {
    const colors = {
      PAID: 'success',
      PENDING: 'warning',
      OVERDUE: 'error',
      UPCOMING: 'info',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Mock ROI chart data
  const roiChartData = [
    { month: 'Jan', invested: 5000000, current: 5050000 },
    { month: 'Feb', invested: 5000000, current: 5150000 },
    { month: 'Mar', invested: 5000000, current: 5300000 },
    { month: 'Apr', invested: 5000000, current: 5450000 },
    { month: 'May', invested: 5000000, current: 5600000 },
    { month: 'Jun', invested: 5000000, current: 5750000 },
  ];

  if (loading) {
    return (
      <>
        <Box>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </>
    );
  }

  if (error || !investment) {
    return (
      <>
        <Alert severity="error">{error || 'Investment not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/investments')} sx={{ mt: 2 }}>
          Back to Investments
        </Button>
      </>
    );
  }

  const statusConfig = getStatusConfig(investment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Box>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/investments')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              Investment Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {investment.investmentId}
            </Typography>
          </Box>
          <Chip
            icon={<StatusIcon />}
            label={statusConfig.label}
            color={statusConfig.color as any}
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        {/* Investment Header Card */}
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'relative',
              height: 200,
              backgroundImage: `url(${investment.property.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 3,
                color: 'white',
              }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {investment.property.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={investment.property.propertyType}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Typography variant="body2">{investment.property.location}</Typography>
              </Stack>
            </Box>
          </Box>

          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Investment Amount
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatCurrency(investment.investmentAmount)}
                </Typography>
                <Typography variant="caption" color="primary">
                  {investment.bvAllocated.toLocaleString()} BV
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Current Value
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {formatCurrency(investment.currentValue)}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    +{investment.appreciationPercentage.toFixed(2)}%
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Investment Date
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatDate(investment.investmentDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Investment Type
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {investment.investmentType === 'FULL_PAYMENT' ? 'Full Payment' : 'Installment'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
            >
              <Tab label="Investment Summary" />
              <Tab label="Payment Details" />
              <Tab label="Nominee Details" />
              <Tab label="Property Details" />
              <Tab label="Documents" />
              <Tab label="Commissions" />
            </Tabs>
          </Box>

          {/* Tab 0: Investment Summary */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Returns Breakdown */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Returns Breakdown
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Capital Appreciation
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(investment.appreciation)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          ROI Earned
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(investment.roiEarned)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Rental Income
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(investment.rentalIncomeEarned)}
                        </Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" fontWeight={700}>
                          Total Returns
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="success.main">
                          {formatCurrency(investment.totalReturns)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Return Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {investment.returnPercentage.toFixed(2)}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Investment Dates */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Important Dates
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CalendarToday color="primary" />
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary">
                            Investment Date
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(investment.investmentDate)}
                          </Typography>
                        </Box>
                      </Stack>
                      {investment.lockInEndDate && (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <CalendarToday color="warning" />
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Lock-in End Date
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(investment.lockInEndDate)}
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* ROI Growth Chart */}
              <Grid item xs={12}>
                <LineChart
                  data={roiChartData}
                  lines={[
                    { dataKey: 'invested', name: 'Invested', stroke: '#2563eb' },
                    { dataKey: 'current', name: 'Current Value', stroke: '#10b981' },
                  ]}
                  xAxisKey="month"
                  height={300}
                  title="Investment Growth"
                  tooltipFormatter={(value) => formatCurrency(value)}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Payment Details */}
          <TabPanel value={activeTab} index={1}>
            {investment.investmentType === 'FULL_PAYMENT' ? (
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Full Payment Completed
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Payment made on {formatDate(investment.investmentDate)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Amount Paid
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {formatCurrency(investment.investmentAmount)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Payment Status
                      </Typography>
                      <Chip label="Completed" color="success" size="small" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ) : investment.installmentPlan ? (
              <Box>
                {/* Installment Progress */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Installment Progress
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {investment.installmentPlan.paidInstallments} of{' '}
                        {investment.installmentPlan.totalInstallments} Paid
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {((investment.installmentPlan.paidInstallments / investment.installmentPlan.totalInstallments) * 100).toFixed(0)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(investment.installmentPlan.paidInstallments / investment.installmentPlan.totalInstallments) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Paid
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="success.main">
                          {formatCurrency(investment.installmentPlan.totalPaid)}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">
                          Remaining
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="warning.main">
                          {formatCurrency(investment.installmentPlan.remainingAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Installment Schedule */}
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Installment #</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Paid Date</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {investment.installmentPlan.installments.map((installment) => (
                        <TableRow key={installment.installmentNumber}>
                          <TableCell>{installment.installmentNumber}</TableCell>
                          <TableCell>{formatDate(installment.dueDate)}</TableCell>
                          <TableCell>{formatCurrency(installment.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={installment.status}
                              color={getInstallmentStatusColor(installment.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {installment.paidDate ? formatDate(installment.paidDate) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {installment.status === 'PENDING' || installment.status === 'OVERDUE' ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Payment />}
                                onClick={() => handlePayInstallment(installment.installmentNumber)}
                              >
                                Pay Now
                              </Button>
                            ) : (
                              <Chip icon={<CheckCircle />} label="Paid" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : null}
          </TabPanel>

          {/* Tab 2: Nominee Details */}
          <TabPanel value={activeTab} index={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Nominee Information
                  </Typography>
                  <Button startIcon={<Edit />} onClick={handleEditNominee}>
                    Edit
                  </Button>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {investment.nominee.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Relationship
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {investment.nominee.relationship}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Contact Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {investment.nominee.contactNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(investment.nominee.dateOfBirth)}
                    </Typography>
                  </Grid>
                  {investment.nominee.address && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {investment.nominee.address}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab 3: Property Details */}
          <TabPanel value={activeTab} index={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Property Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Property Name
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {investment.property.title}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Property Type
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {investment.property.propertyType}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {investment.property.location}
                    </Typography>
                  </Stack>
                </Stack>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={() => navigate(`/properties/${investment.property.id}`)}
                >
                  View Full Property Details
                </Button>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab 4: Documents */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={2}>
              {investment.documents && investment.documents.length > 0 ? (
                investment.documents.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Description color="primary" sx={{ fontSize: 40 }} />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {doc.documentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.documentType}
                            </Typography>
                          </Box>
                        </Stack>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                          sx={{ mt: 2 }}
                          onClick={() => handleDownloadDocument(doc.documentUrl, doc.documentName)}
                        >
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">No documents available for this investment</Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Tab 5: Commissions */}
          <TabPanel value={activeTab} index={5}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Commission details for this investment will be displayed here
            </Alert>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        No commission data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* Actions Panel */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Actions
            </Typography>
            <Grid container spacing={2}>
              {investment.installmentPlan?.nextDueDate && (
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={() => handlePayInstallment(investment.installmentPlan!.paidInstallments + 1)}
                  >
                    Pay Installment
                  </Button>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadCertificate}
                >
                  Download Certificate
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<ExitToApp />}>
                  Request Exit
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<Phone />}>
                  Contact Support
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Edit Nominee Dialog */}
        <Dialog open={editNomineeOpen} onClose={() => setEditNomineeOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Nominee Details</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                value={nomineeData?.name || ''}
                onChange={(e) => setNomineeData({ ...nomineeData!, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Relationship"
                value={nomineeData?.relationship || ''}
                onChange={(e) => setNomineeData({ ...nomineeData!, relationship: e.target.value })}
              />
              <TextField
                fullWidth
                label="Contact Number"
                value={nomineeData?.contactNumber || ''}
                onChange={(e) => setNomineeData({ ...nomineeData!, contactNumber: e.target.value })}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={nomineeData?.dateOfBirth || ''}
                onChange={(e) => setNomineeData({ ...nomineeData!, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={nomineeData?.address || ''}
                onChange={(e) => setNomineeData({ ...nomineeData!, address: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditNomineeOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveNominee} disabled={savingNominee}>
              {savingNominee ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default InvestmentDetail;
