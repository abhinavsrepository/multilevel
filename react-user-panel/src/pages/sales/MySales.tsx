import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  MenuItem,
  useTheme,
  Skeleton,
  Alert,
  InputAdornment,
  alpha,
  CardActionArea,
  Divider,
} from '@mui/material';
import {
  Add,
  Search,
  MonetizationOn,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  Info,
  TrendingUp,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import EmptyState from '@/components/common/EmptyState';
import { getMySales, getUserSaleStats } from '@/api/propertySale.api';
import { PropertySale, SaleStats } from '@/api/propertySale.api';
import { SALE_STATUS_COLORS, SALE_STATUS_LABELS } from '@/types/propertySale.types';
import { formatDate, formatCurrency } from '@/utils/formatters';

const MySales: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<PropertySale[]>([]);
  const [stats, setStats] = useState<SaleStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchSales();
    fetchStats();
  }, [statusFilter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: 1, limit: 50 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const response = await getMySales(params);
      setSales(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales');
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserSaleStats();
      if (response.success) setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      PENDING: <HourglassEmpty color="warning" />,
      APPROVED: <CheckCircle color="success" />,
      REJECTED: <Cancel color="error" />,
      COMPLETED: <CheckCircle color="success" />,
    };
    return icons[status] || <Info color="action" />;
  };

  if (loading && !sales.length) {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonetizationOn sx={{ fontSize: 36, color: 'primary.main' }} />
            My Property Sales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track all your proclaimed property sales and earnings
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sales/proclaim')} size="large">
          Proclaim New Sale
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MonetizationOn sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalSales || 0}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Total Sales</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HourglassEmpty sx={{ fontSize: 32, color: 'warning.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.pendingSales || 0}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Pending Approval</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ fontSize: 32, color: 'success.main', mr: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.approvedSales || 0}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Approved</Typography>
                <Chip label={`${stats.successRate}% Success`} size="small" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ fontSize: 32, mr: 1.5 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(stats.totalCommissionEarned)}</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Earned</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Chip icon={<Info />} label={`${stats?.thisMonthSales || 0} This Month`} color="primary" variant="outlined" />
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {sales.length === 0 && !loading ? (
        <EmptyState variant="no-data" title="No Sales Found" message="You haven't proclaimed any sales yet." actionLabel="Proclaim Sale" onAction={() => navigate('/sales/proclaim')} />
      ) : (
        <Grid container spacing={3}>
          {sales.map((sale) => (
            <Grid item xs={12} md={6} lg={4} key={sale.id}>
              <Card sx={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] } }}>
                <CardActionArea onClick={() => navigate(`/sales/details/${sale.saleId}`)}>
                  <CardContent>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: `${sale.saleStatus.toLowerCase()}.main` }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>#{sale.saleId}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{sale.property?.title || 'Property'}</Typography>
                      </Box>
                      <Chip icon={getStatusIcon(sale.saleStatus)} label={SALE_STATUS_LABELS[sale.saleStatus]} color={SALE_STATUS_COLORS[sale.saleStatus] as any} size="small" />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Sale Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(sale.saleAmount)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Down Payment</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(sale.downPayment)}</Typography>
                      </Grid>
                    </Grid>

                    {sale.saleStatus === 'PENDING' && (
                      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1), border: `1px dashed ${theme.palette.info.main}` }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Projected Earnings</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption">Direct + TSB:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{formatCurrency(sale.projectedDirectIncentive + sale.projectedTSB)}</Typography>
                        </Box>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>Created: {formatDate(sale.createdAt)}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MySales;
