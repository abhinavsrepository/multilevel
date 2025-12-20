import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  AccountTree,
  Person,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import StatsCard from '@/components/common/StatsCard';
import UserCard from '@/components/cards/UserCard';
import { getDirectReferrals, getDirectReferralsStats } from '@/api/team.api';
import type { DirectReferral } from '@/types';

/**
 * DirectReferrals Page
 *
 * Displays direct referrals with:
 * - Search and filters (status, sort by)
 * - Summary stats
 * - Referrals cards using UserCard
 * - Actions: View Profile, View Tree
 */
const DirectReferrals: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<DirectReferral[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0,
    totalInvestment: 0,
    totalBV: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '' as 'ACTIVE' | 'INACTIVE' | '',
    sortBy: 'joiningDate' as string,
    sortDirection: 'desc' as 'asc' | 'desc',
    search: '',
  });

  // Pagination
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 12,
  });

  /**
   * Fetch referrals
   */
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        setError(null);

        const [referralsRes, statsRes] = await Promise.all([
          getDirectReferrals({
            page: paginationModel.page,
            size: paginationModel.pageSize,
            ...(filters.status && { status: filters.status }),
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
          }),
          getDirectReferralsStats(),
        ]);

        if (referralsRes.success && referralsRes.data) {
          setReferrals(referralsRes.data.content);
          setTotalCount(referralsRes.data.totalElements);
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load direct referrals');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [paginationModel, filters]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  /**
   * Handle view profile
   */
  const handleViewProfile = (userId: number) => {
    navigate(`/team/member/${userId}`);
  };

  /**
   * Handle view tree
   */
  const handleViewTree = (userId: number) => {
    const user = referrals.find((r) => r.id === userId);
    if (user) {
      navigate(`/team/binary-tree?userId=${user.userId}`);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Direct Referrals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your direct referrals
          </Typography>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Referrals"
              value={stats.total}
              icon={<Person />}
              color="primary"
              gradient
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active"
              value={stats.active}
              icon={<Person />}
              color="success"
              trend={{
                value: stats.thisMonth,
                isPositive: true,
                label: 'this month',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Investment"
              value={stats.totalInvestment}
              prefix="₹"
              icon={<Person />}
              color="info"
              decimals={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total BV"
              value={stats.totalBV.toLocaleString()}
              icon={<Person />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                size="small"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Sort By"
                size="small"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="joiningDate">Joining Date</MenuItem>
                <MenuItem value="fullName">Name</MenuItem>
                <MenuItem value="totalInvestment">Investment</MenuItem>
                <MenuItem value="teamSize">Team Size</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Order"
                size="small"
                value={filters.sortDirection}
                onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Referrals Grid */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                  <UserCard user={{} as DirectReferral} loading />
                </Grid>
              ))
            ) : referrals.length > 0 ? (
              // Referral cards
              referrals.map((referral, index) => (
                <Grid item xs={12} sm={6} md={4} key={referral.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserCard
                      user={referral}
                      onView={handleViewProfile}
                      variant="default"
                      showActions={true}
                    />
                  </motion.div>
                </Grid>
              ))
            ) : (
              // Empty state
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 8,
                    textAlign: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No referrals found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You don't have any direct referrals yet
                  </Typography>
                </Paper>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>

        {/* Pagination */}
        {!loading && referrals.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              disabled={paginationModel.page === 0}
              onClick={() =>
                setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </Button>
            <Typography sx={{ mx: 3, display: 'flex', alignItems: 'center' }}>
              Page {paginationModel.page + 1} of {Math.ceil(totalCount / paginationModel.pageSize)}
            </Typography>
            <Button
              disabled={
                paginationModel.page >= Math.ceil(totalCount / paginationModel.pageSize) - 1
              }
              onClick={() =>
                setPaginationModel((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    
  );
};

export default DirectReferrals;
