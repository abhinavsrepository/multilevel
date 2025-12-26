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
  Alert,
  Chip,
} from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Person,
  PeopleAlt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import StatsCard from '@/components/common/StatsCard';
import UserCard from '@/components/cards/UserCard';
import { getTeamMembers, getTeamStats } from '@/api/team.api';
import type { TeamMember } from '@/types';

/**
 * TeamMembers Page
 *
 * Displays all team members (direct and indirect) with:
 * - Search and filters (status, sort by)
 * - Summary stats
 * - Member cards using UserCard
 * - Pagination
 */
const TeamMembers: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    direct: 0,
    active: 0,
    inactive: 0,
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
   * Fetch team members
   */
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          ...(filters.status && { status: filters.status }),
          ...(filters.search && { search: filters.search }),
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        };

        const response = await getTeamMembers(params);

        if (response.success && response.data) {
          setMembers(response.data.content || []);
          setTotalCount(response.data.totalElements || 0);
        } else {
          setError('Failed to fetch team members');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [paginationModel, filters]);

  /**
   * Fetch stats
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getTeamStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch team stats:', err);
      }
    };

    fetchStats();
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  /**
   * Handle search
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleFilterChange('search', value);
  };

  /**
   * Handle pagination
   */
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Members',
      value: stats.total,
      icon: <PeopleAlt fontSize="large" />,
      color: 'primary' as const,
    },
    {
      title: 'Direct Referrals',
      value: stats.direct,
      icon: <Person fontSize="large" />,
      color: 'success' as const,
    },
    {
      title: 'Active Members',
      value: stats.active,
      icon: <PeopleAlt fontSize="large" />,
      color: 'info' as const,
    },
    {
      title: 'Total Investment',
      value: `$${(stats.totalInvestment || 0).toFixed(2)}`,
      icon: <PeopleAlt fontSize="large" />,
      color: 'warning' as const,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Team Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your entire team network
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...card} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or username..."
              value={filters.search}
              onChange={handleSearch}
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Sort By"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <MenuItem value="joiningDate">Joining Date</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="totalInvestment">Investment</MenuItem>
              <MenuItem value="level">Level</MenuItem>
            </TextField>
          </Grid>

          {/* Sort Direction */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Order"
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Members List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography>Loading team members...</Typography>
          </Box>
        ) : members.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <PeopleAlt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No team members found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {filters.search || filters.status
                ? 'Try adjusting your filters'
                : 'Start building your team by referring new members'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {members.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserCard
                      user={member}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalCount > paginationModel.pageSize && (
              <Box mt={4} display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="outlined"
                  disabled={paginationModel.page === 0}
                  onClick={() =>
                    handlePaginationChange({
                      ...paginationModel,
                      page: paginationModel.page - 1,
                    })
                  }
                >
                  Previous
                </Button>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={`Page ${paginationModel.page + 1} of ${Math.ceil(
                      totalCount / paginationModel.pageSize
                    )}`}
                  />
                </Box>
                <Button
                  variant="outlined"
                  disabled={
                    (paginationModel.page + 1) * paginationModel.pageSize >= totalCount
                  }
                  onClick={() =>
                    handlePaginationChange({
                      ...paginationModel,
                      page: paginationModel.page + 1,
                    })
                  }
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default TeamMembers;
