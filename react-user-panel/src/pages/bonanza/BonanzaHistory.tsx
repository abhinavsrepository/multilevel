import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Refresh,
  Visibility,
  EmojiEvents,
  TrendingUp,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMyAchievements, BonanzaQualification } from '@/api/bonanza.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const BonanzaHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualifications, setQualifications] = useState<BonanzaQualification[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyAchievements({
        status: statusFilter || undefined,
        page: page + 1,
        limit: rowsPerPage
      });
      setQualifications(response.data);
      setTotalCount(response.pagination.total);
      setSummary(response.summary);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bonanza history');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const statusMap = ['', 'IN_PROGRESS', 'QUALIFIED', 'AWARDED'];
    setStatusFilter(statusMap[newValue]);
    setPage(0);
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'QUALIFIED':
      case 'AWARDED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'PENDING':
        return 'default';
      case 'DISQUALIFIED':
      case 'EXPIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'QUALIFIED':
      case 'AWARDED':
        return <CheckCircle fontSize="small" />;
      case 'IN_PROGRESS':
        return <HourglassEmpty fontSize="small" />;
      case 'DISQUALIFIED':
      case 'EXPIRED':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && qualifications.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Bonanza History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your bonanza participations, qualifications, and rewards
        </Typography>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Participations
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.totalAchievements}
                    </Typography>
                  </Box>
                  <EmojiEvents sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {summary.inProgress}
                    </Typography>
                  </Box>
                  <HourglassEmpty sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Qualified
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {summary.qualified}
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Earned
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.dark">
                      {formatCurrency(summary.totalEarned)}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.dark', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper elevation={3}>
        {/* Tabs and Filters */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All" />
              <Tab label="In Progress" />
              <Tab label="Qualified" />
              <Tab label="Awarded" />
            </Tabs>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Box p={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bonanza Name</TableCell>
                <TableCell>Period</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Progress</TableCell>
                <TableCell align="right">Reward</TableCell>
                <TableCell align="center">Qualified Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : qualifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No bonanza records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                qualifications.map((qualification) => (
                  <TableRow
                    key={qualification.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {qualification.bonanza.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {qualification.bonanza.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(qualification.bonanza.startDate)} -{' '}
                        {formatDate(qualification.bonanza.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={qualification.status}
                        color={getStatusColor(qualification.status)}
                        size="small"
                        icon={getStatusIcon(qualification.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary">
                            {qualification.overallProgress.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(qualification.rewardAmount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {qualification.bonanza.rewardDescription}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatDate(qualification.qualifiedDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/bonanza/${qualification.bonanzaId}`)}
                          >
                            <Visibility fontSize="small" />
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

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default BonanzaHistory;
