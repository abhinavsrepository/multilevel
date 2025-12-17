import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  IconButton,
  Pagination,
  useMediaQuery,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Search,
  AccountBalance,
  ShowChart,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../store';
import investmentApi, { Investment, Portfolio } from '../api/investmentApi';

const MyInvestments: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    status: '',
    propertyType: '',
    search: '',
  });

  useEffect(() => {
    fetchPortfolio();
    fetchInvestments();
  }, [page, filters]);

  const fetchPortfolio = async () => {
    try {
      const response = await investmentApi.getPortfolio();
      setPortfolio(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch portfolio');
    }
  };

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };

      if (filters.status) params.status = filters.status;
      if (filters.propertyType) params.propertyType = filters.propertyType;

      const response = await investmentApi.getMyInvestments(params);
      setInvestments(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch investments');
    } finally {
      setLoading(false);
    }
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
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'EXIT_REQUESTED':
        return 'warning';
      case 'EXITED':
        return 'default';
      default:
        return 'default';
    }
  };

  const calculateROI = (investment: Investment) => {
    const roi = ((investment.currentValue - investment.investmentAmount) / investment.investmentAmount) * 100;
    return roi.toFixed(2);
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
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
              {value}
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Investments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage your property investments
        </Typography>
      </Box>

      {/* Portfolio Summary */}
      {loading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Invested"
              value={formatCurrency(portfolio?.totalInvested || 0)}
              icon={<AccountBalance />}
              color="#667eea"
              subtitle={`${portfolio?.activeInvestments || 0} active investments`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Current Value"
              value={formatCurrency(portfolio?.currentValue || 0)}
              icon={<ShowChart />}
              color="#06d6a0"
              subtitle="Portfolio valuation"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Returns"
              value={formatCurrency(portfolio?.totalReturns || 0)}
              icon={<TrendingUp />}
              color="#06d6a0"
              subtitle="Earnings to date"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="ROI"
              value={`${portfolio?.roi.toFixed(2) || 0}%`}
              icon={
                (portfolio?.roi || 0) >= 0 ? (
                  <TrendingUp />
                ) : (
                  <TrendingDown />
                )
              }
              color={(portfolio?.roi || 0) >= 0 ? '#06d6a0' : '#f77f00'}
              subtitle="Overall return rate"
            />
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by property name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="EXIT_REQUESTED">Exit Requested</MenuItem>
                <MenuItem value="EXITED">Exited</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Property Type"
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="RESIDENTIAL">Residential</MenuItem>
                <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                <MenuItem value="INDUSTRIAL">Industrial</MenuItem>
                <MenuItem value="LAND">Land</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setFilters({ status: '', propertyType: '', search: '' });
                  setPage(1);
                }}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Investments Table/Cards */}
      {loading ? (
        <Card elevation={2}>
          <CardContent>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 1 }} />
            ))}
          </CardContent>
        </Card>
      ) : investments.length > 0 ? (
        <>
          {isMobile ? (
            // Mobile Card View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {investments.map((investment) => (
                <Card key={investment.id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                      <Avatar
                        variant="rounded"
                        src={investment.property.images[0]}
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {investment.property.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {investment.property.location.city}, {investment.property.location.state}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Investment
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(investment.investmentAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Current Value
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(investment.currentValue)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Returns
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(investment.returns)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          ROI
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {calculateROI(investment)}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={investment.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(investment.status) as any}
                      />
                      <Button
                        size="small"
                        endIcon={<Visibility />}
                        onClick={() => navigate(`/investment/${investment.id}`)}
                      >
                        View Details
                      </Button>
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
                    <TableCell>Property</TableCell>
                    <TableCell>Shares</TableCell>
                    <TableCell align="right">Investment</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Returns</TableCell>
                    <TableCell align="right">ROI</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.map((investment) => {
                    const roi = calculateROI(investment);
                    const isPositive = parseFloat(roi) >= 0;

                    return (
                      <TableRow
                        key={investment.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              variant="rounded"
                              src={investment.property.images[0]}
                              sx={{ width: 50, height: 50, mr: 2 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {investment.property.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {investment.property.location.city}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {investment.shares}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {formatCurrency(investment.investmentAmount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(investment.investmentDate).toLocaleDateString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {formatCurrency(investment.currentValue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color={investment.returns > 0 ? 'success.main' : 'text.primary'}
                          >
                            {investment.returns > 0 ? '+' : ''}
                            {formatCurrency(investment.returns)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {isPositive ? (
                              <TrendingUp sx={{ fontSize: 18, color: 'success.main', mr: 0.5 }} />
                            ) : (
                              <TrendingDown sx={{ fontSize: 18, color: 'error.main', mr: 0.5 }} />
                            )}
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              color={isPositive ? 'success.main' : 'error.main'}
                            >
                              {roi}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={investment.status.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(investment.status) as any}
                            icon={
                              investment.status === 'ACTIVE' ? (
                                <CheckCircle />
                              ) : investment.status === 'COMPLETED' ? (
                                <CheckCircle />
                              ) : (
                                <Schedule />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/investment/${investment.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
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
                No investments found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start investing in properties to build your portfolio
              </Typography>
              <Button variant="contained" onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default MyInvestments;
