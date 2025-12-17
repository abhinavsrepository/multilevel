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
  IconButton,
  Fab,
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
  FilterList,
  SupportAgent,
  HelpOutline,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Info,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';

import EmptyState from '@/components/common/EmptyState';
import { getTickets, getTicketStats } from '@/api/ticket.api';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/types';
import { formatDate } from '@/utils/formatters';

const Tickets: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: 0,
        size: 50,
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getTickets(params);
      setTickets(response.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTicketStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = () => {
    fetchTickets();
  };

  const handleCreateTicket = () => {
    navigate('/support/create-ticket');
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/support/tickets/${ticketId}`);
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <HourglassEmpty color="warning" />;
      case 'IN_PROGRESS':
        return <Info color="info" />;
      case 'RESOLVED':
        return <CheckCircle color="success" />;
      case 'CLOSED':
        return <CheckCircle color="success" />;
      case 'REOPENED':
        return <HourglassEmpty color="error" />;
      default:
        return <HelpOutline color="action" />;
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      case 'REOPENED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return theme.palette.error.main;
      case 'HIGH':
        return theme.palette.warning.main;
      case 'MEDIUM':
        return theme.palette.info.main;
      case 'LOW':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCategoryLabel = (category: TicketCategory) => {
    return category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  if (loading && !tickets.length) {
    return (
      <DashboardLayout title="Support Tickets">
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Support Tickets">
      <Box>
        {/* Stats Overview */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SupportAgent sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.total || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tickets
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HourglassEmpty sx={{ fontSize: 32, color: 'warning.main', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.open || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Open
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Info sx={{ fontSize: 32, color: 'info.main', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.inProgress || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle sx={{ fontSize: 32, color: 'success.main', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.resolved || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Resolved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'ALL')}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
                <MenuItem value="REOPENED">Reopened</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | 'ALL')}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                <MenuItem value="INVESTMENT_QUERY">Investment Query</MenuItem>
                <MenuItem value="PAYMENT_ISSUE">Payment Issue</MenuItem>
                <MenuItem value="COMMISSION_DISPUTE">Commission Dispute</MenuItem>
                <MenuItem value="PROPERTY_INFORMATION">Property Information</MenuItem>
                <MenuItem value="TECHNICAL_SUPPORT">Technical Support</MenuItem>
                <MenuItem value="ACCOUNT_ACCESS">Account Access</MenuItem>
                <MenuItem value="KYC_ISSUE">KYC Issue</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'ALL')}
              >
                <MenuItem value="ALL">All Priorities</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Tickets List */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {tickets.length === 0 && !loading ? (
          <EmptyState
            variant="no-data"
            title="No Tickets Found"
            message="You haven't created any support tickets yet. Click the button below to create your first ticket."
            actionLabel="Create Ticket"
            onAction={handleCreateTicket}
          />
        ) : (
          <Grid container spacing={3}>
            {tickets.map((ticket) => (
              <Grid item xs={12} md={6} key={ticket.id}>
                <Card
                  sx={{
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleViewTicket(ticket.ticketId)}>
                    <CardContent>
                      {/* Priority Indicator */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 4,
                          height: '100%',
                          bgcolor: getPriorityColor(ticket.priority),
                        }}
                      />

                      {/* Ticket Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pl: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            #{ticket.ticketId}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {ticket.subject}
                          </Typography>
                        </Box>
                        {ticket.hasUnreadReplies && (
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                            }}
                          />
                        )}
                      </Box>

                      {/* Ticket Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          pl: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {ticket.description}
                      </Typography>

                      {/* Ticket Metadata */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pl: 2 }}>
                        <Chip
                          icon={getStatusIcon(ticket.status)}
                          label={ticket.status.replace('_', ' ')}
                          color={getStatusColor(ticket.status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          label={getCategoryLabel(ticket.category)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={ticket.priority}
                          size="small"
                          sx={{
                            bgcolor: alpha(getPriorityColor(ticket.priority), 0.1),
                            color: getPriorityColor(ticket.priority),
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Ticket Footer */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          pl: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(ticket.createdDate)}
                        </Typography>
                        <IconButton size="small" color="primary">
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Ticket FAB */}
        <Fab
          color="primary"
          aria-label="create ticket"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: theme.zIndex.speedDial,
          }}
          onClick={handleCreateTicket}
        >
          <Add />
        </Fab>

        {/* Help Button */}
        <Fab
          color="secondary"
          aria-label="view faq"
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 96 },
            right: { xs: 16, sm: 24 },
            zIndex: theme.zIndex.speedDial,
          }}
          onClick={() => navigate('/support/faq')}
        >
          <HelpOutline />
        </Fab>
      </Box>
    </DashboardLayout>
  );
};

export default Tickets;
