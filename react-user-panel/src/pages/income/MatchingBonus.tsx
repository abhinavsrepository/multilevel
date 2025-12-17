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
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Info,
  Download,
  Refresh,
  TrendingUp,
  AccountBalance,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getMatchingBonusHistory,
  exportMatchingBonus,
  MatchingBonusRecord
} from '@/api/matching-bonus.api';
import SourceDetailModal from '@/components/matching-bonus/SourceDetailModal';
import RankEligibilityWidget from '@/components/matching-bonus/RankEligibilityWidget';
import * as XLSX from 'xlsx';

// Date range presets
const DATE_PRESETS = [
  { value: 'this_cycle', label: 'This Cycle (Current Month)' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_cycle', label: 'Last Cycle (Previous Month)' },
  { value: 'quarter_to_date', label: 'Quarter to Date' },
  { value: 'year_to_date', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Date Range' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' }
];

const MatchingBonus: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [records, setRecords] = useState<MatchingBonusRecord[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({
    totalMatchingBonus: 0,
    totalPayable: 0,
    totalPending: 0,
    totalWithdrawn: 0
  });

  // Filters
  const [datePreset, setDatePreset] = useState('this_cycle');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<number | null>(null);

  useEffect(() => {
    fetchMatchingBonusData();
  }, [page, rowsPerPage, datePreset, startDate, endDate, status]);

  const fetchMatchingBonusData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage
      };

      if (datePreset === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      } else if (datePreset) {
        params.cyclePreset = datePreset;
      }

      if (status) {
        params.status = status;
      }

      const response = await getMatchingBonusHistory(params);
      setRecords(response.data);
      setTotalRecords(response.pagination.total);
      setSummary(response.summary);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load matching bonus data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: any = {
        includeDetails: true
      };

      if (datePreset === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      } else if (datePreset) {
        params.cyclePreset = datePreset;
      }

      const response = await exportMatchingBonus(params);

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(response.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Matching Bonus');

      // Generate filename with date
      const filename = `matching-bonus-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      toast.success('Export completed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (incomeId: number) => {
    setSelectedIncomeId(incomeId);
    setModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusChip = (status: string) => {
    const colorMap: Record<string, any> = {
      PENDING: 'warning',
      APPROVED: 'success',
      PAID: 'info'
    };

    return (
      <Chip
        label={status}
        color={colorMap[status] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Matching Bonus
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your matching bonuses earned from downline commissions
        </Typography>
      </Box>

      {/* Rank Eligibility Widget */}
      <RankEligibilityWidget />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Matching Bonus
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                {formatCurrency(summary.totalMatchingBonus)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalance color="success" />
                <Typography variant="body2" color="text.secondary">
                  Total Payable
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {formatCurrency(summary.totalPayable)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Schedule color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {formatCurrency(summary.totalPending)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle color="info" />
                <Typography variant="body2" color="text.secondary">
                  Withdrawn
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {formatCurrency(summary.totalWithdrawn)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Date Range"
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              size="small"
            >
              {DATE_PRESETS.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {datePreset === 'custom' && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              size="small"
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={datePreset === 'custom' ? 3 : 5}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchMatchingBonusData}
                fullWidth
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={exporting ? <CircularProgress size={16} /> : <Download />}
                onClick={handleExport}
                disabled={exporting}
                fullWidth
              >
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Matching Bonus</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Payable</TableCell>
                <TableCell align="center">Contributors</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No matching bonus records found for the selected period
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatCurrency(record.matchingBonus)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{getStatusChip(record.status)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={record.payable > 0 ? 'success.main' : 'text.secondary'}
                      >
                        {formatCurrency(record.payable)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={record.contributorsCount} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View source details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(record.id)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Source Detail Modal */}
      <SourceDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        incomeId={selectedIncomeId}
      />

      {/* Info Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Understanding Matching Bonus:</strong>
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Matching bonus is earned when your direct downline earns commissions</li>
          <li>The depth of matching depends on your current rank</li>
          <li>Click the info icon to see detailed breakdown of contributors</li>
          <li>Export includes a cycle summary with total matching bonus and payable amounts</li>
        </ul>
      </Alert>
    </Box>
  );
};

export default MatchingBonus;
