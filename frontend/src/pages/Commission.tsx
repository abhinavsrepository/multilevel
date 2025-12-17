import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Button,
  TextField,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  Download,
  CalendarToday,
  Groups,
  Star,
  EmojiEvents,
  Refresh,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../store';
import dayjs from 'dayjs';

interface Commission {
  id: string;
  date: string;
  type: 'DIRECT' | 'BINARY' | 'LEVEL' | 'BONUS';
  fromUser: string;
  fromUserId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
  description: string;
}

interface CommissionStats {
  totalEarned: number;
  thisMonth: number;
  direct: number;
  binary: number;
  level: number;
  bonus: number;
}

const Commission: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [dateTo, setDateTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with API calls
  const [stats, setStats] = useState<CommissionStats>({
    totalEarned: 245000,
    thisMonth: 45000,
    direct: 85000,
    binary: 95000,
    level: 50000,
    bonus: 15000,
  });

  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: 'COM001',
      date: '2024-11-20',
      type: 'DIRECT',
      fromUser: 'Rahul Kumar',
      fromUserId: 'USER002',
      amount: 5000,
      status: 'PAID',
      description: 'Direct referral commission',
    },
    {
      id: 'COM002',
      date: '2024-11-19',
      type: 'BINARY',
      fromUser: 'Team Binary',
      fromUserId: 'SYSTEM',
      amount: 8000,
      status: 'PAID',
      description: 'Weekly binary matching commission',
    },
    {
      id: 'COM003',
      date: '2024-11-18',
      type: 'LEVEL',
      fromUser: 'Priya Sharma',
      fromUserId: 'USER004',
      amount: 2500,
      status: 'PAID',
      description: 'Level 2 commission',
    },
    {
      id: 'COM004',
      date: '2024-11-17',
      type: 'BONUS',
      fromUser: 'Achievement Bonus',
      fromUserId: 'SYSTEM',
      amount: 10000,
      status: 'PROCESSING',
      description: 'Monthly achievement bonus',
    },
    {
      id: 'COM005',
      date: '2024-11-16',
      type: 'DIRECT',
      fromUser: 'Sneha Verma',
      fromUserId: 'USER003',
      amount: 7500,
      status: 'PAID',
      description: 'Direct referral commission',
    },
    {
      id: 'COM006',
      date: '2024-11-15',
      type: 'BINARY',
      fromUser: 'Team Binary',
      fromUserId: 'SYSTEM',
      amount: 6000,
      status: 'PAID',
      description: 'Weekly binary matching commission',
    },
    {
      id: 'COM007',
      date: '2024-11-14',
      type: 'LEVEL',
      fromUser: 'Amit Patel',
      fromUserId: 'USER005',
      amount: 3000,
      status: 'PAID',
      description: 'Level 3 commission',
    },
    {
      id: 'COM008',
      date: '2024-11-13',
      type: 'DIRECT',
      fromUser: 'Vikram Singh',
      fromUserId: 'USER006',
      amount: 5000,
      status: 'PENDING',
      description: 'Direct referral commission',
    },
  ]);

  const [chartData] = useState([
    { month: 'Jun', Direct: 15000, Binary: 18000, Level: 8000, Bonus: 5000 },
    { month: 'Jul', Direct: 18000, Binary: 20000, Level: 10000, Bonus: 3000 },
    { month: 'Aug', Direct: 20000, Binary: 22000, Level: 12000, Bonus: 8000 },
    { month: 'Sep', Direct: 22000, Binary: 25000, Level: 9000, Bonus: 6000 },
    { month: 'Oct', Direct: 19000, Binary: 21000, Level: 11000, Bonus: 4000 },
    { month: 'Nov', Direct: 25000, Binary: 28000, Level: 15000, Bonus: 10000 },
  ]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get commission type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DIRECT':
        return 'primary';
      case 'BINARY':
        return 'success';
      case 'LEVEL':
        return 'info';
      case 'BONUS':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get commission type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DIRECT':
        return <Groups />;
      case 'BINARY':
        return <TrendingUp />;
      case 'LEVEL':
        return <Star />;
      case 'BONUS':
        return <EmojiEvents />;
      default:
        return <AccountBalanceWallet />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      default:
        return 'default';
    }
  };

  // Filter commissions by type
  const getFilteredCommissions = () => {
    const types = ['ALL', 'DIRECT', 'BINARY', 'LEVEL', 'BONUS'];
    const selectedType = types[activeTab];

    if (selectedType === 'ALL') return commissions;
    return commissions.filter((c) => c.type === selectedType);
  };

  const filteredCommissions = getFilteredCommissions();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export to Excel
  const handleExport = () => {
    // Implement Excel export logic
    alert('Exporting to Excel...');
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Stats Card Component
  const StatsCard = ({
    title,
    value,
    icon,
    color,
    bgColor,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        borderLeft: 4,
        borderColor: color,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color }}>
              {formatCurrency(value)}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: bgColor,
              color: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Commission History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track all your earnings and commission details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ px: 3 }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Total Earned"
            value={stats.totalEarned}
            icon={<AccountBalanceWallet />}
            color="#667eea"
            bgColor="#667eea20"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="This Month"
            value={stats.thisMonth}
            icon={<CalendarToday />}
            color="#06d6a0"
            bgColor="#06d6a020"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Direct"
            value={stats.direct}
            icon={<Groups />}
            color="#667eea"
            bgColor="#667eea20"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Binary"
            value={stats.binary}
            icon={<TrendingUp />}
            color="#06d6a0"
            bgColor="#06d6a020"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Level"
            value={stats.level}
            icon={<Star />}
            color="#118ab2"
            bgColor="#118ab220"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Bonus"
            value={stats.bonus}
            icon={<EmojiEvents />}
            color="#ffd166"
            bgColor="#ffd16620"
          />
        </Grid>
      </Grid>

      {/* Commission Trends Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Commission Trends (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBinary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06d6a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Direct"
                    stroke="#667eea"
                    fillOpacity={1}
                    fill="url(#colorDirect)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Binary"
                    stroke="#06d6a0"
                    fillOpacity={1}
                    fill="url(#colorBinary)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Commission Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Direct', value: stats.direct },
                    { name: 'Binary', value: stats.binary },
                    { name: 'Level', value: stats.level },
                    { name: 'Bonus', value: stats.bonus },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Range Filter */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" fullWidth>
                Apply Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Commission Table */}
      <Card elevation={2}>
        <CardContent>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="All" />
            <Tab label="Direct" />
            <Tab label="Binary" />
            <Tab label="Level" />
            <Tab label="Bonus" />
          </Tabs>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>From User</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCommissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((commission) => (
                    <TableRow key={commission.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(commission.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTypeIcon(commission.type)}
                          label={commission.type}
                          color={getTypeColor(commission.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {commission.fromUser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {commission.fromUserId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{commission.description}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(commission.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={commission.status}
                          color={getStatusColor(commission.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCommissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No commissions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCommissions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Commission;
