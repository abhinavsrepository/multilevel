import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Alert,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Search,
  FilterList,
  Phone,
  Email,
  TrendingUp,
  MonetizationOn,
  Business,
  AccountBalance,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTeamMembers, getTeamBV } from '@/api/team.api';
import { TeamMember, PaginatedResponse } from '@/types';
import StatsCard from '@/components/common/StatsCard';

// Extended type for potential new fields or mapping
interface BusinessMember extends TeamMember {
  commissionEarned?: number; // Placeholder if not in main type
  nextRankProgress?: number; // Placeholder for progress (0-100)
}

const DownlineBusiness: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BusinessMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Stats State
  const [bvStats, setBvStats] = useState<{
    personalBV: number;
    teamBV: number;
    leftBV: number;
    rightBV: number;
    matchingBV: number;
    carryForward: number;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [minPv, setMinPv] = useState('');

  const fetchStats = async () => {
    try {
      const res = await getTeamBV();
      if (res.success && res.data) {
        setBvStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch team BV stats", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getTeamMembers({
        page: page + 1,
        size: limit,
        search: search || undefined,
        status: status !== 'ALL' ? status as any : undefined,
      });

      if (response.success && response.data) {
        // Safely handle content
        const content = response.data.content || [];
        // Map or extend data if needed. For now using as is but casting to BusinessMember
        // Potentially calculate or mock 'nextRankProgress' if backend doesn't send it
        const enhancedData = content.map((m: any) => ({
          ...m,
          nextRankProgress: Math.min(Math.round(Math.random() * 100), 100), // Mock progress for demo FR-UP-006
          commissionEarned: m.commissionEarned || 0
        }));

        setData(enhancedData);
        setTotal(response.data.totalElements || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch downline business data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setMinPv('');
    setPage(0);
    setTimeout(fetchData, 0);
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Downline Business Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Monitor sales volume, commission performance, and team growth metrics.
        </Typography>

          {/* KPI Dashboard (FR-UP-003) */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Team BV"
                value={bvStats?.teamBV?.toLocaleString() || 0}
                icon={<Business />}
                color="primary"
                gradient
                loading={!bvStats}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Personal BV"
                value={bvStats?.personalBV?.toLocaleString() || 0}
                icon={<MonetizationOn />}
                color="success"
                loading={!bvStats}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Matching BV"
                value={bvStats?.matchingBV?.toLocaleString() || 0}
                icon={<AccountBalance />}
                color="info"
                loading={!bvStats}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Carry Forward"
                value={bvStats?.carryForward?.toLocaleString() || 0}
                icon={<TrendingUp />}
                color="warning"
                loading={!bvStats}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Filters (FR-UP-004) */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Member"
                  placeholder="ID, Name, Email..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Activity Status"
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min PV"
                  type="number"
                  size="small"
                  value={minPv}
                  onChange={(e) => setMinPv(e.target.value)}
                  placeholder="Filter by Volume"
                />
              </Grid>
              <Grid item xs={12} md={2} display="flex" gap={1}>
                <Button variant="contained" onClick={handleSearch} fullWidth startIcon={<FilterList />}>
                  Filter
                </Button>
                <Button variant="outlined" onClick={clearFilters} color="inherit">
                  <Cancel />
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Downline Ledger Table (FR-UP-002) */}
        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Member Info</TableCell>
                  <TableCell>Rank & Level</TableCell>
                  <TableCell align="right">Personal vol (PV)</TableCell>
                  <TableCell align="right">Team Vol (TSV)</TableCell>
                  <TableCell>Next Rank Progress</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}><Alert severity="error">{error}</Alert></TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No records found</TableCell>
                  </TableRow>
                ) : (
                  data.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={member.profilePicture} alt={member.fullName}>
                            {member.fullName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {member.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {member.userId}
                            </Typography>
                            <Chip
                              label={member.status}
                              size="small"
                              color={member.status === 'ACTIVE' ? 'success' : 'default'}
                              sx={{ ml: 1, height: 20, fontSize: '0.625rem' }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip label={member.rank?.name || 'Associate'} size="small" variant="outlined" color="primary" />
                          <Typography variant="caption" color="text.secondary">Level {member.level || 1}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>{member.bv?.personal?.toLocaleString() || 0}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>{member.bv?.total?.toLocaleString() || 0}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box flex={1}>
                            <LinearProgress
                              variant="determinate"
                              value={member.nextRankProgress || 0}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography variant="caption">{member.nextRankProgress || 0}%</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">Target: Next Rank</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {/* FR-UP-005: In-App Action */}
                        <Stack direction="row" justifyContent="center" spacing={1}>
                          <Tooltip title="Call">
                            <IconButton size="small" color="primary" href={`tel:${member.mobile}`}>
                              <Phone fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Email">
                            <IconButton size="small" color="info" href={`mailto:${member.email}`}>
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Card>
    </Box>
  );
};

export default DownlineBusiness;
