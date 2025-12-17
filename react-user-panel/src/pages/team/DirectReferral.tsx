import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  InputAdornment,
  Button,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  PersonAdd as PersonAddIcon,
  AccountTree as AccountTreeIcon,
  Note as NoteIcon,
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  Person,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDirectReferralPerformance, getDirectReferralsStats } from '@/api/team.api';
import { DirectReferralPerformance } from '@/types/team.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  thisMonth: number;
  totalInvestment: number;
  totalBV: number;
}

const DirectReferral: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<DirectReferralPerformance[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0,
    totalInvestment: 0,
    totalBV: 0,
  });

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [performanceFilter, setPerformanceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('joiningDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch Data
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDirectReferralPerformance({
        page,
        size: rowsPerPage,
        status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
        performanceFilter: performanceFilter === 'ALL' ? undefined : (performanceFilter as any),
        search: searchTerm || undefined,
        sortBy,
        sortDirection,
      });

      if (response.success && response.data) {
        setReferrals(response.data.content || []);
        setTotalCount(response.data.totalElements || 0);
      } else {
        setError('Failed to fetch direct referrals');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching data';
      setError(errorMessage);
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDirectReferralsStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [page, rowsPerPage, statusFilter, performanceFilter, sortBy, sortDirection]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Search Handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchReferrals();
      } else {
        setPage(0); // Reset to first page on search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Event Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handlePerformanceFilterChange = (event: SelectChangeEvent) => {
    setPerformanceFilter(event.target.value);
    setPage(0);
  };

  // Action Handlers
  const handleCall = (referral: DirectReferralPerformance) => {
    window.location.href = `tel:${referral.mobile}`;
  };

  const handleViewGenealogy = (referral: DirectReferralPerformance) => {
    navigate(`/team/binary-tree?userId=${referral.userId}`);
  };

  const handleCreateNote = (referral: DirectReferralPerformance) => {
    // Navigate to task/note creation (implement based on your CRM module)
    navigate(`/support/create-ticket?userId=${referral.userId}&userName=${referral.name}`);
  };

  const handleViewProfile = (referral: DirectReferralPerformance) => {
    navigate(`/team/member/${referral.id}`);
  };

  // Render Performance Status Badge
  const renderPerformanceStatus = (referral: DirectReferralPerformance) => {
    const statusConfig = {
      GREEN: { label: 'Top Performer', color: 'success' as const },
      YELLOW: { label: 'Needs Coaching', color: 'warning' as const },
      RED: { label: 'Inactive', color: 'error' as const },
    };

    const config = statusConfig[referral.performanceStatus];

    return (
      <Tooltip title={`${config.label} - ${referral.status}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: referral.performanceColor,
            }}
          />
          <Chip
            label={referral.status}
            color={config.color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Leadership Productivity Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your direct referrals' performance, sales volume, and team growth
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Referrals
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                +{stats.thisMonth} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Members
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.active}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
              <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% active rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Sales Volume
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {formatCurrency(stats.totalInvestment)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total BV
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.totalBV.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={handleStatusFilterChange} label="Status">
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Performance</InputLabel>
              <Select value={performanceFilter} onChange={handlePerformanceFilterChange} label="Performance">
                <MenuItem value="ALL">All Performance</MenuItem>
                <MenuItem value="TOP_PERFORMERS">Top Performers</MenuItem>
                <MenuItem value="NEEDS_COACHING">Needs Coaching</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setPerformanceFilter('ALL');
                setPage(0);
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell>S.No.</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joining Date</TableCell>
              <TableCell>Last Topup</TableCell>
              <TableCell align="right">RSV (₹)</TableCell>
              <TableCell align="center">L2 Count</TableCell>
              <TableCell align="right">Direct Commission (₹)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No direct referrals found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              referrals.map((referral, index) => (
                <TableRow
                  key={referral.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                  <TableCell onClick={() => handleViewProfile(referral)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={referral.profilePicture}
                        alt={referral.name}
                        sx={{ width: 40, height: 40 }}
                      >
                        {referral.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {referral.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {referral.userId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>{renderPerformanceStatus(referral)}</TableCell>

                  <TableCell>
                    <Typography variant="body2">{formatDate(referral.joiningDate)}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color={referral.lastTopupDate ? 'text.primary' : 'text.secondary'}>
                      {referral.lastTopupDate ? formatDate(referral.lastTopupDate) : 'Never'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color={referral.referralSalesVolume > 0 ? 'success.main' : 'text.secondary'}>
                      {formatCurrency(referral.referralSalesVolume)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={referral.l2DownlineCount}
                      size="small"
                      color={referral.l2DownlineCount > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {formatCurrency(referral.directCommission)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Call / Coaching">
                        <IconButton size="small" color="primary" onClick={() => handleCall(referral)}>
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="View Genealogy">
                        <IconButton size="small" color="info" onClick={() => handleViewGenealogy(referral)}>
                          <AccountTreeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Create Note / Task">
                        <IconButton size="small" color="warning" onClick={() => handleCreateNote(referral)}>
                          <NoteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default DirectReferral;
