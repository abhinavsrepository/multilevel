import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AttachMoney,
  AccountBalanceWallet,
  TrendingUp,
  CalendarToday,
  Download
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { getIncomeDashboard, getIncomeHistory, IncomeDashboard, Income } from '@/api/income.api';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const IncomeSummary: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<IncomeDashboard | null>(null);
  const [history, setHistory] = useState<Income[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, historyRes] = await Promise.all([
        getIncomeDashboard(),
        getIncomeHistory({ limit: 10 })
      ]);
      setDashboard(dashboardRes.data || null);
      setHistory(historyRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!history.length) return;

    const exportData = history.map(item => ({
      Date: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      Type: item.incomeType,
      Amount: item.amount,
      Status: item.status,
      From: item.FromUser ? `${item.FromUser.firstName} ${item.FromUser.lastName}` : 'System',
      Level: item.level || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Summary");
    XLSX.writeFile(wb, `Income_Summary_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const pieData = dashboard?.incomeByType
    ? Object.entries(dashboard.incomeByType).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const barData = dashboard?.levelWiseIncome || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="600">
          Income Summary
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={!history.length}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {dashboard && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Earnings</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${dashboard.totalEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <AttachMoney fontSize="large" sx={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">This Month</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ${dashboard.thisMonthIncome?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <CalendarToday color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Today</Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      ${dashboard.todayIncome?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <TrendingUp color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Balance</Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      ${dashboard.walletBalances.commissionBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <AccountBalanceWallet color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Income Distribution</Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="text.secondary">No income data yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Level Wise Income</Typography>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" label={{ value: 'Level', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="income" fill="#8884d8" name="Income" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="text.secondary">No level income data yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box p={2}>
          <Typography variant="h6">Recent Transactions</Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell>
                    <Chip label={row.incomeType?.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="500" color="success.main">
                      +${row.amount?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.FromUser ? (
                      <Box>
                        <Typography variant="body2">{row.FromUser.firstName} {row.FromUser.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">@{row.FromUser.username}</Typography>
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{row.level || '-'}</TableCell>
                  <TableCell>{dayjs(row.createdAt).format('DD MMM YYYY')}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === 'APPROVED' ? 'success' : row.status === 'PAID' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default IncomeSummary;
