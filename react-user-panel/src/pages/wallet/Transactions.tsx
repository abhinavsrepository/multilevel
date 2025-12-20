import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Receipt,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import StatsCard from '../../components/common/StatsCard';
import { getTransactions, getTransactionSummary } from '../../api/wallet.api';
import { Transaction, TransactionSummary, TransactionType, TransactionCategory, WalletType } from '../../types';
import { toast } from 'react-toastify';

const Transactions: React.FC = () => {
  const theme = useTheme();

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalCredits: 0,
    totalDebits: 0,
    netChange: 0,
  });

  // Pagination
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TransactionType | 'ALL'>('ALL');
  const [category, setCategory] = useState<TransactionCategory | 'ALL'>('ALL');
  const [wallet, setWallet] = useState<WalletType | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'days'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [showFilters, setShowFilters] = useState(true);

  // Fetch transaction summary
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
      if (endDate) params.endDate = endDate.format('YYYY-MM-DD');
      if (wallet !== 'ALL') params.walletType = wallet;

      const response = await getTransactionSummary(params);
      if (response.data) {
        setSummary(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: paginationModel.page + 1,
        size: paginationModel.pageSize,
        sortBy: 'date',
        sortDirection: 'desc',
      };

      if (search) params.search = search;
      if (type !== 'ALL') params.type = type;
      if (category !== 'ALL') params.category = category;
      if (wallet !== 'ALL') params.wallet = wallet;
      if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
      if (endDate) params.endDate = endDate.format('YYYY-MM-DD');

      const response = await getTransactions(params);
      if (response.data) {
        setTransactions(response.data.content || []);
        setRowCount(response.data.totalElements || 0);
      }
    } catch (err: any) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate, wallet]);

  useEffect(() => {
    fetchTransactions();
  }, [paginationModel, type, category, wallet, startDate, endDate]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = () => {
    fetchSummary();
    fetchTransactions();
  };

  const handleExport = () => {
    toast.info('Exporting transactions...');
    // Export logic here
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
      CANCELLED: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    return type === 'CREDIT' ? 'success' : 'error';
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'transactionId',
      headerName: 'Transaction ID',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getTypeColor(params.value) as any}
          icon={params.value === 'CREDIT' ? <TrendingUp /> : <TrendingDown />}
        />
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'wallet',
      headerName: 'Wallet',
      width: 130,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={700}
          color={params.row.type === 'CREDIT' ? 'success.main' : 'error.main'}
        >
          {params.row.type === 'CREDIT' ? '+' : '-'}
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value) as any}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: () => (
        <IconButton size="small" title="View Receipt">
          <Receipt fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <div>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Transaction History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all your wallet transactions
            </Typography>
          </div>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatsCard
              title="Total Credits"
              value={summary.totalCredits}
              prefix="₹"
              decimals={2}
              color="success"
              loading={summaryLoading}
              icon={<TrendingUp />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatsCard
              title="Total Debits"
              value={summary.totalDebits}
              prefix="₹"
              decimals={2}
              color="error"
              loading={summaryLoading}
              icon={<TrendingDown />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatsCard
              title="Net Change"
              value={summary.netChange}
              prefix="₹"
              decimals={2}
              color={summary.netChange >= 0 ? 'success' : 'error'}
              loading={summaryLoading}
              icon={summary.netChange >= 0 ? <TrendingUp /> : <TrendingDown />}
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: showFilters ? 2 : 0 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FilterList />
                <Typography variant="h6" fontWeight={600}>
                  Filters
                </Typography>
              </Stack>
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <ExpandMore
                  sx={{
                    transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                />
              </IconButton>
            </Stack>

            <Collapse in={showFilters}>
              <Grid container spacing={2}>
                {/* Search */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by transaction ID or description..."
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

                {/* Type */}
                <Grid item xs={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Type"
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType | 'ALL')}
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="CREDIT">Credit</MenuItem>
                    <MenuItem value="DEBIT">Debit</MenuItem>
                  </TextField>
                </Grid>

                {/* Wallet */}
                <Grid item xs={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Wallet"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value as WalletType | 'ALL')}
                  >
                    <MenuItem value="ALL">All Wallets</MenuItem>
                    <MenuItem value="COMMISSION">Commission</MenuItem>
                    <MenuItem value="INVESTMENT">Investment</MenuItem>
                    <MenuItem value="RENTAL">Rental</MenuItem>
                    <MenuItem value="ROI">ROI</MenuItem>
                  </TextField>
                </Grid>

                {/* Category */}
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory | 'ALL')}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    <MenuItem value="COMMISSION">Commission</MenuItem>
                    <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
                    <MenuItem value="INVESTMENT">Investment</MenuItem>
                    <MenuItem value="REFUND">Refund</MenuItem>
                    <MenuItem value="TRANSFER">Transfer</MenuItem>
                    <MenuItem value="RENTAL">Rental</MenuItem>
                    <MenuItem value="ROI">ROI</MenuItem>
                    <MenuItem value="BONUS">Bonus</MenuItem>
                    <MenuItem value="PENALTY">Penalty</MenuItem>
                    <MenuItem value="DEPOSIT">Deposit</MenuItem>
                  </TextField>
                </Grid>

                {/* Date Range */}
                <Grid item xs={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>

              {/* Quick Date Filters */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
                <Chip
                  label="Today"
                  onClick={() => {
                    setStartDate(dayjs());
                    setEndDate(dayjs());
                  }}
                  clickable
                />
                <Chip
                  label="Last 7 Days"
                  onClick={() => {
                    setStartDate(dayjs().subtract(7, 'days'));
                    setEndDate(dayjs());
                  }}
                  clickable
                />
                <Chip
                  label="Last 30 Days"
                  onClick={() => {
                    setStartDate(dayjs().subtract(30, 'days'));
                    setEndDate(dayjs());
                  }}
                  clickable
                />
                <Chip
                  label="This Month"
                  onClick={() => {
                    setStartDate(dayjs().startOf('month'));
                    setEndDate(dayjs());
                  }}
                  clickable
                />
                <Chip
                  label="Last Month"
                  onClick={() => {
                    setStartDate(dayjs().subtract(1, 'month').startOf('month'));
                    setEndDate(dayjs().subtract(1, 'month').endOf('month'));
                  }}
                  clickable
                />
              </Stack>
            </Collapse>
          </CardContent>
        </Card>

        {/* Results Count */}
        {!loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {transactions.length} of {rowCount} transaction{rowCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Transactions Table */}
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={rowCount}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode="server"
              disableRowSelectionOnClick
              sx={{
                border: 0,
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-cell:focus-within': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        </Card>
      </Box>
    
  );
};

export default Transactions;
