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
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  GetApp,
  Visibility,
  Phone,
  Email,
  AccountTree,
  Person,
  CheckCircle,
  Cancel,
  People,
  TrendingUp
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { getTeamMembers, getTeamStats } from '@/api/team.api';
import { TeamMember, PaginatedResponse, TeamStats } from '@/types';
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from '@/utils/constants';
import StatsCard from '@/components/common/StatsCard';

// Extended type to include new backend fields
interface TotalDownlineMember extends TeamMember {
  name?: string;
  sponsorName?: string;
  depthLevel?: number;
  rsv?: number;
  ranking?: string;
}

const TotalDownline: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TotalDownlineMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Stats State
  const [stats, setStats] = useState<TeamStats | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [rank, setRank] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const fetchDownline = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTeamMembers({
        page: page + 1, // API uses 1-based indexing
        size: limit,
        search: search || undefined,
        status: status !== 'ALL' ? status as any : undefined,
        // rank and date filters would be passed here if API type def allowed, casting to any for now to bypass strict checks if type isn't updated
        ...({
          rank: rank !== 'ALL' ? rank : undefined,
          level: level !== 'ALL' ? parseInt(level) : undefined,
          dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
          dateTo: dateTo ? dateTo.toISOString() : undefined
        } as any)
      });

      if (response.success && response.data) {
        // Safely handle potentially undefined content
        const content = response.data.content || [];
        setData(content as TotalDownlineMember[]);
        setTotal(response.data.totalElements || 0);
      } else {
        // Handle case where success is true but data might be missing or different structure
        setData([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch downline data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getTeamStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch team stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDownline();
  }, [page, limit]); // Re-fetch on pagination

  const handleSearch = () => {
    setPage(0);
    fetchDownline();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setRank('ALL');
    setLevel('ALL');
    setDateFrom(null);
    setDateTo(null);
    setPage(0);
    setTimeout(fetchDownline, 0); // Allow state update then fetch
  };

  return (
    <DashboardLayout title="Total Downline">
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Total Downline
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            View and manage your entire network organization
          </Typography>

          {/* Stats Widgets */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Members"
                value={stats?.totalTeam || 0}
                icon={<People />}
                color="primary"
                gradient
                loading={!stats}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Active Members"
                value={stats?.active || 0}
                icon={<CheckCircle />}
                color="success"
                loading={!stats}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Inactive Members"
                value={stats?.inactive || 0}
                icon={<Cancel />}
                color="error"
                loading={!stats}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Business"
                value={stats?.teamBV?.toLocaleString() || 0}
                suffix=" BV"
                icon={<TrendingUp />}
                color="info"
                loading={!stats}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search ID / Name"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Rank"
                  size="small"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                >
                  <MenuItem value="ALL">All Ranks</MenuItem>
                  <MenuItem value="Associate">Associate</MenuItem>
                  <MenuItem value="Star">Star</MenuItem>
                  <MenuItem value="Silver">Silver</MenuItem>
                  <MenuItem value="Gold">Gold</MenuItem>
                  {/* Add dynamic ranks if available */}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Level"
                  size="small"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <MenuItem value="ALL">All Levels</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => (
                    <MenuItem key={l} value={l}>Level {l}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" gap={1}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="From"
                      value={dateFrom}
                      onChange={(newValue) => setDateFrom(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <DatePicker
                      label="To"
                      value={dateTo}
                      onChange={(newValue) => setDateTo(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={handleSearch}
                >
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table */}
        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>User ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Sponsor</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Rank</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">RSV</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Alert severity="error">{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No members found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {member.userId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Joined: {new Date(member.joiningDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {/* Avatar placeholder */}
                          <Person sx={{ color: 'action.active' }} />
                          <Typography variant="body2">{member.name || member.fullName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{member.sponsorName || member.sponsorId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`L${member.depthLevel || '?'}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.rank?.name || (member as any).rank || 'Associate'}
                          size="small"
                          sx={{
                            bgcolor: '#f5f5f5',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={USER_STATUS_LABELS[member.status as keyof typeof USER_STATUS_LABELS] || member.status}
                          size="small"
                          color={USER_STATUS_COLORS[member.status as keyof typeof USER_STATUS_COLORS] || 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₹{(member.rsv || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
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
                          <Tooltip title="View Tree">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => navigate(`/team/unilevel-tree?userId=${member.userId}`)}
                            >
                              <AccountTree fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
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
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default TotalDownline;
