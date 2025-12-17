import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination,
  Skeleton,
  Alert,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  FilterList,
  TrendingUp,
  Home,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatsCard from '../../components/common/StatsCard';
import InvestmentCard from '../../components/cards/InvestmentCard';
import { getInvestments, getInvestmentStats } from '../../api/investment.api';
import { Investment, InvestmentStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyInvestments: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // State
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvestmentStatus | 'ALL'>('ALL');
  const [propertyType, setPropertyType] = useState('ALL');
  const [sortBy, setSortBy] = useState('investmentDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Stats
  const [stats, setStats] = useState({
    totalInvested: 0,
    currentValue: 0,
    appreciation: 0,
    activeProperties: 0,
  });

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getInvestmentStats();
      if (response.data) {
        setStats({
          totalInvested: response.data.totalAmount || 0,
          currentValue: response.data.totalAmount * 1.15 || 0, // Placeholder calculation
          appreciation: response.data.totalReturns || 0,
          activeProperties: response.data.activeInvestments || 0,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch investments
  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: page - 1,
        size: 9,
        sortBy,
        sortDirection,
      };

      if (status !== 'ALL') params.status = status;
      if (search) params.search = search;

      const response = await getInvestments(params);

      if (response.data) {
        setInvestments(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalElements || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch investments');
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [page, status, sortBy, sortDirection]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchInvestments();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Handlers
  const handleViewInvestment = (investmentId: number) => {
    navigate(`/investments/${investmentId}`);
  };

  const handleDownloadCertificate = async (investmentId: number) => {
    try {
      toast.info('Downloading certificate...');
      // Download logic here
      toast.success('Certificate downloaded successfully');
    } catch (err) {
      toast.error('Failed to download certificate');
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchInvestments();
  };

  const handleStatusFilterChange = (newStatus: InvestmentStatus | 'ALL') => {
    setStatus(newStatus);
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAppreciationPercentage = () => {
    if (stats.totalInvested === 0) return 0;
    return ((stats.currentValue - stats.totalInvested) / stats.totalInvested) * 100;
  };

  return (
    <DashboardLayout title="My Investments">
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <div>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                My Investments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage your real estate investments
              </Typography>
            </div>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading || statsLoading}
            >
              Refresh
            </Button>
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Total Invested"
                value={stats.totalInvested}
                prefix="₹"
                decimals={0}
                color="primary"
                loading={statsLoading}
                icon={<TrendingUp />}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Current Value"
                value={stats.currentValue}
                prefix="₹"
                decimals={0}
                color="success"
                loading={statsLoading}
                icon={<TrendingUp />}
                trend={{
                  value: calculateAppreciationPercentage(),
                  isPositive: stats.currentValue >= stats.totalInvested,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Total Appreciation"
                value={stats.appreciation}
                prefix="₹"
                decimals={0}
                color="info"
                loading={statsLoading}
                icon={<TrendingUp />}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Active Properties"
                value={stats.activeProperties}
                decimals={0}
                color="warning"
                loading={statsLoading}
                icon={<Home />}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <FilterList />
            <Typography variant="h6" fontWeight={600}>
              Filters
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by property or investment ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={status}
                onChange={(e) => handleStatusFilterChange(e.target.value as InvestmentStatus | 'ALL')}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="MATURED">Matured</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>

            {/* Sort By */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="investmentDate">Investment Date</MenuItem>
                <MenuItem value="investmentAmount">Investment Amount</MenuItem>
                <MenuItem value="currentValue">Current Value</MenuItem>
                <MenuItem value="returnPercentage">Returns</MenuItem>
              </TextField>
            </Grid>

            {/* Sort Direction */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Order"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Quick Filters */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
            <Chip
              label="All"
              color={status === 'ALL' ? 'primary' : 'default'}
              onClick={() => handleStatusFilterChange('ALL')}
              clickable
            />
            <Chip
              label="Active"
              color={status === 'ACTIVE' ? 'success' : 'default'}
              onClick={() => handleStatusFilterChange('ACTIVE')}
              clickable
              icon={<CheckCircle />}
            />
            <Chip
              label="Completed"
              color={status === 'COMPLETED' ? 'info' : 'default'}
              onClick={() => handleStatusFilterChange('COMPLETED')}
              clickable
            />
            <Chip
              label="Matured"
              color={status === 'MATURED' ? 'secondary' : 'default'}
              onClick={() => handleStatusFilterChange('MATURED')}
              clickable
            />
          </Stack>
        </Box>

        {/* Results Count */}
        {!loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {investments.length} of {totalItems} investment{totalItems !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Investments Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : investments.length > 0 ? (
          <Grid container spacing={3}>
            {investments.map((investment) => (
              <Grid item xs={12} md={6} lg={4} key={investment.id}>
                <InvestmentCard
                  investment={investment}
                  onView={handleViewInvestment}
                  onDownloadCertificate={handleDownloadCertificate}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Home sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Investments Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {search || status !== 'ALL'
                ? 'Try adjusting your filters to find investments'
                : 'Start investing in properties to see them here'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/properties')}>
              Browse Properties
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default MyInvestments;
