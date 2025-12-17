import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Download,
  Refresh,
  AttachMoney,
  AccountBalance,
  ShowChart,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatsCard from '../../components/common/StatsCard';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import { getPortfolio } from '../../api/investment.api';
import { Portfolio as PortfolioType } from '../../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Portfolio: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPortfolio();
      if (response.data) {
        setPortfolio(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio');
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleRefresh = () => {
    fetchPortfolio();
  };

  const handleExportReport = () => {
    toast.info('Exporting portfolio report...');
    // Export logic here
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Prepare chart data
  const performanceChartData = portfolio?.performanceData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    invested: item.invested,
    current: item.currentValue,
  })) || [];

  const assetAllocationData = portfolio?.assetAllocation.map(item => ({
    name: item.propertyType,
    value: item.value,
  })) || [];

  if (loading) {
    return (
      <DashboardLayout title="Portfolio">
        <Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} lg={3} key={item}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 2 }} />
        </Box>
      </>
    );
  }

  if (error || !portfolio) {
    return (
      <DashboardLayout title="Portfolio">
        <Alert severity="error">{error || 'Failed to load portfolio'}</Alert>
        <Button startIcon={<Refresh />} onClick={handleRefresh} sx={{ mt: 2 }}>
          Retry
        </Button>
      </>
    );
  }

  return (
    <DashboardLayout title="Portfolio Summary">
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
              Portfolio Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive overview of your investment portfolio
            </Typography>
          </div>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Download />} onClick={handleExportReport}>
              Export Report
            </Button>
          </Stack>
        </Stack>

        {/* Overall Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard
              title="Total Investment"
              value={portfolio.totalInvestment}
              prefix="₹"
              decimals={0}
              color="primary"
              icon={<AttachMoney />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard
              title="Current Value"
              value={portfolio.currentValue}
              prefix="₹"
              decimals={0}
              color="success"
              icon={<TrendingUp />}
              trend={{
                value: portfolio.appreciationPercentage,
                isPositive: portfolio.appreciationPercentage >= 0,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard
              title="Total Appreciation"
              value={portfolio.totalAppreciation}
              prefix="₹"
              decimals={0}
              color="info"
              icon={<ShowChart />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard
              title="Total Properties"
              value={portfolio.totalProperties}
              decimals={0}
              color="warning"
              icon={<AccountBalance />}
            />
          </Grid>
        </Grid>

        {/* Performance Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Investment Growth Chart */}
          <Grid item xs={12} lg={8}>
            <LineChart
              data={performanceChartData}
              lines={[
                { dataKey: 'invested', name: 'Invested Amount', stroke: '#2563eb' },
                { dataKey: 'current', name: 'Current Value', stroke: '#10b981' },
              ]}
              xAxisKey="date"
              height={350}
              title="Investment Growth Over Time"
              tooltipFormatter={(value) => formatCurrency(value)}
            />
          </Grid>

          {/* Asset Allocation Pie Chart */}
          <Grid item xs={12} lg={4}>
            <PieChart
              data={assetAllocationData}
              height={350}
              title="Asset Allocation"
              valueFormatter={(value) => formatCurrency(value)}
              innerRadius={60}
              centerLabel={{
                value: portfolio.totalProperties,
                label: 'Properties',
              }}
            />
          </Grid>
        </Grid>

        {/* Returns Breakdown */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Capital Appreciation
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {formatCurrency(portfolio.returns.capitalAppreciation)}
                  </Typography>
                  <Chip
                    label="Property Value Growth"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    ROI Earned
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {formatCurrency(portfolio.returns.roiEarned)}
                  </Typography>
                  <Chip
                    label="Return on Investment"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Rental Income
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="info.main">
                    {formatCurrency(portfolio.returns.rentalIncome)}
                  </Typography>
                  <Chip
                    label="Rental Returns"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Commissions Earned
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="secondary.main">
                    {formatCurrency(portfolio.returns.commissions)}
                  </Typography>
                  <Chip
                    label="Referral Earnings"
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Total Returns Summary */}
        <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`, color: 'white' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Total Portfolio Returns
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {formatCurrency(portfolio.totalReturns)}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <Chip
                    label={formatPercentage(portfolio.returnsRate)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Overall Return Rate
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <ShowChart sx={{ fontSize: 80, opacity: 0.3 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Asset Allocation Breakdown */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <PieChartIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Asset Allocation Breakdown
              </Typography>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property Type</TableCell>
                    <TableCell align="center">Count</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.assetAllocation.map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {asset.propertyType}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={asset.count} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(asset.value)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${asset.percentage.toFixed(1)}%`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={700}>
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={portfolio.totalProperties}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={700}>
                        {formatCurrency(portfolio.currentValue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label="100%"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Property-wise Performance */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <AccountBalance color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Property-wise Performance
              </Typography>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Invested</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Appreciation</TableCell>
                    <TableCell align="right">ROI</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.properties.map((property, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {property.propertyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={property.propertyType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(property.invested)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(property.currentValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <TrendingUp
                            sx={{
                              fontSize: 16,
                              color: property.appreciation >= 0 ? 'success.main' : 'error.main',
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={property.appreciation >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(property.appreciation)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formatPercentage(property.appreciationPercentage)}
                          size="small"
                          color={property.appreciationPercentage >= 0 ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={property.status}
                          size="small"
                          color={property.status === 'ACTIVE' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => navigate(`/properties/${property.propertyId}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Portfolio;
