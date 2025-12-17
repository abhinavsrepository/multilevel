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
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Download,
  ExpandMore,
  ExpandLess,
  PictureAsPdf,
  TableChart,
  Description,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { motion, AnimatePresence } from 'framer-motion';

import StatsCard from '@/components/common/StatsCard';
import CommissionCard from '@/components/cards/CommissionCard';
import { getCommissions, downloadCommissionReport } from '@/api/commission.api';
import type { Commission, CommissionType, CommissionStatus, PaginatedResponse } from '@/types';

/**
 * CommissionHistory Page
 *
 * Displays commission history with:
 * - Filters (type, status, date range, from user)
 * - Summary stats (total, pending, paid)
 * - Commission table/cards with expandable details
 * - Export functionality (PDF/Excel)
 * - Pagination
 */
const CommissionHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(isMobile ? 'cards' : 'table');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Filters
  const [filters, setFilters] = useState({
    type: '' as CommissionType | '',
    status: '' as CommissionStatus | '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    fromUser: '',
    search: '',
  });

  // Pagination
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
  });

  /**
   * Fetch commissions
   */
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: paginationModel.page,
          size: paginationModel.pageSize,
          ...(filters.type && { commissionType: filters.type }),
          ...(filters.status && { status: filters.status }),
          ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
          ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
          ...(filters.fromUser && { fromUser: filters.fromUser }),
        };

        const response = await getCommissions(params);

        if (response.success && response.data) {
          setCommissions(response.data.content);
          setTotalCount(response.data.totalElements);

          // Calculate stats
          const total = response.data.content.length;
          const pending = response.data.content.filter((c) => c.status === 'PENDING').length;
          const paid = response.data.content.filter((c) => c.status === 'PAID').length;
          const totalAmount = response.data.content.reduce((sum, c) => sum + c.commissionAmount, 0);
          const pendingAmount = response.data.content
            .filter((c) => c.status === 'PENDING')
            .reduce((sum, c) => sum + c.commissionAmount, 0);
          const paidAmount = response.data.content
            .filter((c) => c.status === 'PAID')
            .reduce((sum, c) => sum + c.commissionAmount, 0);

          setStats({ total, pending, paid, totalAmount, pendingAmount, paidAmount });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load commission history');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [paginationModel, filters]);

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

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Get status chip color
   */
  const getStatusColor = (status: CommissionStatus) => {
    const colorMap: Record<CommissionStatus, 'warning' | 'info' | 'success' | 'error'> = {
      PENDING: 'warning',
      APPROVED: 'info',
      PAID: 'success',
      REJECTED: 'error',
    };
    return colorMap[status];
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  /**
   * Clear filters
   */
  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
      startDate: null,
      endDate: null,
      fromUser: '',
      search: '',
    });
  };

  /**
   * Toggle row expansion
   */
  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  /**
   * Handle export
   */
  const handleExport = async (format: 'PDF' | 'EXCEL') => {
    try {
      const blob = await downloadCommissionReport({
        startDate: filters.startDate?.toISOString() || '',
        endDate: filters.endDate?.toISOString() || new Date().toISOString(),
        commissionType: filters.type || undefined,
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission-report-${Date.now()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportMenuAnchor(null);
    } catch (err: any) {
      setError(err.message || 'Failed to export report');
    }
  };

  /**
   * DataGrid columns
   */
  const columns: GridColDef[] = [
    {
      field: 'expand',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={() => toggleRowExpansion(params.row.id)}>
          {expandedRows.has(params.row.id) ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      ),
    },
    {
      field: 'commissionId',
      headerName: 'ID',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'commissionType',
      headerName: 'Type',
      width: 160,
      valueFormatter: (params) => params.value.replace(/_/g, ' '),
    },
    {
      field: 'fromUser',
      headerName: 'From',
      width: 150,
      valueGetter: (params) => params.row.fromUser?.name || '-',
    },
    {
      field: 'commissionAmount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="success.main">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
      ),
    },
  ];

  return (
    <DashboardLayout title="Commission History">
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Commission History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your commission records
          </Typography>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="Total"
              value={stats.totalAmount}
              prefix="₹"
              color="primary"
              decimals={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="Pending"
              value={stats.pendingAmount}
              prefix="₹"
              color="warning"
              decimals={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="Paid"
              value={stats.paidAmount}
              prefix="₹"
              color="success"
              decimals={0}
            />
          </Grid>
        </Grid>

        {/* Filters and Actions */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
            >
              Filters
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Download />}
                onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                variant="outlined"
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>

          {/* Filter Section */}
          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  size="small"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="DIRECT_REFERRAL">Direct Referral</MenuItem>
                  <MenuItem value="BINARY_PAIRING">Binary Pairing</MenuItem>
                  <MenuItem value="LEVEL_COMMISSION">Level Commission</MenuItem>
                  <MenuItem value="RENTAL_INCOME">Rental Income</MenuItem>
                  <MenuItem value="PROPERTY_APPRECIATION">Property Appreciation</MenuItem>
                  <MenuItem value="RANK_BONUS">Rank Bonus</MenuItem>
                  <MenuItem value="LEADERSHIP_BONUS">Leadership Bonus</MenuItem>
                </TextField>
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
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Commission Table/Cards */}
        {viewMode === 'table' && !isMobile ? (
          <Paper sx={{ borderRadius: 2 }}>
            <DataGrid
              rows={commissions}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              rowCount={totalCount}
              paginationMode="server"
              loading={loading}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
              getRowHeight={() => 'auto'}
              components={{
                NoRowsOverlay: () => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      p: 3,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No commissions found
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Paper>
        ) : (
          <Box>
            <Grid container spacing={2}>
              <AnimatePresence>
                {commissions.map((commission, index) => (
                  <Grid item xs={12} key={commission.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommissionCard commission={commission} variant="compact" />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                disabled={paginationModel.page === 0}
                onClick={() =>
                  setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
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
          </Box>
        )}

        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleExport('PDF')}>
            <ListItemIcon>
              <PictureAsPdf fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('EXCEL')}>
            <ListItemIcon>
              <TableChart fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </DashboardLayout>
  );
};

export default CommissionHistory;
