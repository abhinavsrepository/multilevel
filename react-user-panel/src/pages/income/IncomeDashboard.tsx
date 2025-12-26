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
  CircularProgress,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Paid,
  Check,
  Close,
  People,
  Timeline,
} from '@mui/icons-material';
import {
  getIncomeDashboard,
  getLevelOverview,
  getIncomeHistory,
  IncomeDashboard as IncomeDashboardType,
  LevelOverview,
  Income,
} from '@/api/income.api';
import { useSnackbar } from '@/hooks/useSnackbar';
import dayjs from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`income-tabpanel-${index}`}
      aria-labelledby={`income-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IncomeDashboard: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<IncomeDashboardType | null>(null);
  const [levelOverview, setLevelOverview] = useState<LevelOverview[]>([]);
  const [incomeHistory, setIncomeHistory] = useState<Income[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [historyPage] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({
    incomeType: '',
    level: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      fetchIncomeHistory();
    }
  }, [tabValue, historyPage, historyFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, levelRes] = await Promise.all([
        getIncomeDashboard(),
        getLevelOverview(),
      ]);
      setDashboard(dashboardRes.data || null);
      setLevelOverview(levelRes.data || []);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to fetch income data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeHistory = async () => {
    try {
      const params = {
        page: historyPage,
        limit: 10,
        ...(historyFilters.incomeType && { incomeType: historyFilters.incomeType }),
        ...(historyFilters.level && { level: parseInt(historyFilters.level) }),
      };
      const response = await getIncomeHistory(params);
      if (response.data) {
        setIncomeHistory(response.data.data || []);
      }
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to fetch income history', 'error');
    }
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Income Dashboard
      </Typography>

      {/* Overview Cards */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Paid color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Today's Income
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  ${dashboard.todayIncome?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Timeline color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    This Week
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  ${dashboard.thisWeekIncome?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUp color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  ${dashboard.thisMonthIncome?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccountBalance color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Earnings
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  ${dashboard.totalEarnings?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Wallet Balances */}
      {dashboard && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Wallet Balances
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Commission
                </Typography>
                <Typography variant="h6">
                  ${dashboard.walletBalances.commissionBalance?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Level Profit
                </Typography>
                <Typography variant="h6">
                  ${dashboard.walletBalances.levelProfitBalance?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Cashback
                </Typography>
                <Typography variant="h6">
                  ${dashboard.walletBalances.cashbackBalance?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Repurchase
                </Typography>
                <Typography variant="h6">
                  ${dashboard.walletBalances.repurchaseBalance?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Coin Balance
                </Typography>
                <Typography variant="h6">
                  ${dashboard.walletBalances.coinBalance?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Daily Income
                </Typography>
                <Typography variant="h6">
                  ${dashboard.walletBalances.dailyIncome?.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
            <Tab label="Income by Type" />
            <Tab label="Level Overview" />
            <Tab label="Income History" />
          </Tabs>
        </Box>

        {/* Income by Type Tab */}
        <TabPanel value={tabValue} index={0}>
          {dashboard && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Income Type</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(dashboard.incomeByType || {}).map(([type, amount]) => (
                    <TableRow key={type}>
                      <TableCell>{type.replace(/_/g, ' ')}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          ${(amount as number)?.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {Object.keys(dashboard.incomeByType || {}).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography color="text.secondary">No income data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Level Overview Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Level</strong></TableCell>
                  <TableCell><strong>Commission</strong></TableCell>
                  <TableCell align="center"><strong>Team Members</strong></TableCell>
                  <TableCell align="center"><strong>Active Members</strong></TableCell>
                  <TableCell align="right"><strong>Total Income</strong></TableCell>
                  <TableCell align="center"><strong>Eligible</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levelOverview.map((level) => (
                  <TableRow key={level.level}>
                    <TableCell>
                      <Chip
                        label={`Level ${level.level}`}
                        color="primary"
                        size="small"
                        icon={<People />}
                      />
                    </TableCell>
                    <TableCell>
                      {level.commissionType === 'PERCENTAGE'
                        ? `${level.commissionPercentage}%`
                        : `$${level.commissionPercentage}`}
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body1">
                          {level.totalTeamMembers}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min: {level.minTeamRequired}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body1">
                          {level.activeTeamMembers}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min: {level.minActiveRequired}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        ${level.totalIncome?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {level.isEligible ? (
                        <Chip
                          icon={<Check />}
                          label="Yes"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<Close />}
                          label={level.eligibilityReason || 'No'}
                          color="error"
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {levelOverview.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No level data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Income History Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Income Type</InputLabel>
                  <Select
                    value={historyFilters.incomeType}
                    label="Income Type"
                    onChange={(e) =>
                      setHistoryFilters({ ...historyFilters, incomeType: e.target.value })
                    }
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="LEVEL_COMMISSION">Level Commission</MenuItem>
                    <MenuItem value="REFERRAL">Referral</MenuItem>
                    <MenuItem value="CASHBACK">Cashback</MenuItem>
                    <MenuItem value="ROI">ROI</MenuItem>
                    <MenuItem value="REPURCHASE">Repurchase</MenuItem>
                    <MenuItem value="BINARY">Binary</MenuItem>
                    <MenuItem value="MATCHING">Matching</MenuItem>
                    <MenuItem value="RANK_BONUS">Rank Bonus</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={historyFilters.level}
                    label="Level"
                    onChange={(e) =>
                      setHistoryFilters({ ...historyFilters, level: e.target.value })
                    }
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    {[...Array(10)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        Level {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Level</strong></TableCell>
                  <TableCell><strong>From User</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeHistory.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      {dayjs(income.createdAt).format('DD MMM YYYY HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={income.incomeType.replace(/_/g, ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {income.level ? `Level ${income.level}` : '-'}
                    </TableCell>
                    <TableCell>
                      {income.FromUser
                        ? `${income.FromUser.firstName} ${income.FromUser.lastName} (@${income.FromUser.username})`
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        ${income.amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={income.status}
                        size="small"
                        color={income.status === 'APPROVED' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {incomeHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No income history available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default IncomeDashboard;
