import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import {
  AttachMoney,
  Refresh,
  Search,
  TrendingUp,
} from '@mui/icons-material';
import { getIncomeHistory, getIncomeDashboard, Income } from '../../api/income.api';
import dayjs from 'dayjs';
import StatsCard from '../../components/common/StatsCard';

const ROIBonus: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalROI: number } | null>(null);
  const [history, setHistory] = useState<Income[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Prepare params for history
      const params: any = {
        incomeType: 'ROI',
        limit: 100,
        page: page
      };
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;

      // Fetch Dashboard Stats and History in parallel
      const [dashboardRes, historyRes] = await Promise.all([
        getIncomeDashboard(),
        getIncomeHistory(params),
      ]);

      // Process Dashboard Data for ROI Stats
      const totalROI = dashboardRes.data?.incomeByType?.['ROI'] || 0;

      setStats({
        totalROI,
      });

      // Process History Data
      if (historyRes.data) {
        setHistory(historyRes.data.data || []);
        const total = historyRes.data.total || 0;
        setTotalPages(Math.ceil(total / 100));
      }

    } catch (error) {
      console.error('Failed to fetch ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  if (loading) {
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
        <Typography variant="h4" gutterBottom fontWeight={600}>
          ROI Bonus
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View your Return on Investment earnings from properties
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total ROI Earned"
            value={stats?.totalROI || 0}
            prefix="₹"
            icon={<AttachMoney fontSize="large" />}
            color="success"
            decimals={2}
            trend={{
              value: 0,
              isPositive: true,
              label: 'Lifetime Earnings'
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Active Returns"
            value="Active"
            icon={<TrendingUp fontSize="large" />}
            color="info"
            gradient
            onClick={() => { }} // Placeholder for interactivity
          />
        </Grid>
      </Grid>

      {/* Manual Payout Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600}>
          Investment Returns
        </Typography>
        <Typography variant="caption" display="block" mt={0.5}>
          ROI bonuses are credited to your wallet according to the specific terms of each property investment.
        </Typography>
      </Alert>

      {/* ROI History */}
      <Card elevation={2}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              ROI History
            </Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Filters */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  sx={{ height: 40 }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ border: '2px solid #e0e0e0' }}>
            <Table sx={{ '& .MuiTableCell-root': { border: '1px solid #e0e0e0' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>SNo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Description</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Amount</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No ROI records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((record, index) => (
                    <TableRow
                      key={record.id}
                      sx={{
                        '&:nth-of-type(even)': { backgroundColor: '#f5f5f5' },
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={500}>{(page - 1) * 100 + index + 1}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2">
                          {dayjs(record.createdAt).format('DD MMM YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(record.createdAt).format('HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          ROI Earning
                        </Typography>
                        {record.referenceType && (
                          <Typography variant="caption" color="text.secondary">
                            Ref: {record.referenceType}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          +₹{record.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Chip
                          label={record.status}
                          size="small"
                          color={record.status === 'APPROVED' ? 'success' : record.status === 'PENDING' ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ROIBonus;
