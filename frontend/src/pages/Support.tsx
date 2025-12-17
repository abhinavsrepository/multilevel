import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Search,
  Close,
  AttachFile,
  Send,
  SupportAgent,
  Person,
  FilterList,
  ArrowBack,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAppDispatch, useAppSelector } from '../store';

dayjs.extend(relativeTime);

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
  attachments: string[];
}

interface Reply {
  id: string;
  message: string;
  sender: 'USER' | 'ADMIN';
  senderName: string;
  createdAt: string;
  attachments: string[];
}

interface CreateTicketForm {
  subject: string;
  category: string;
  priority: string;
  description: string;
}

// Validation schema
const createTicketSchema = yup.object().shape({
  subject: yup.string().required('Subject is required').min(5, 'Subject must be at least 5 characters'),
  category: yup.string().required('Category is required'),
  priority: yup.string().required('Priority is required'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
});

const Support: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Mock data - Replace with API calls
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TKT001',
      subject: 'Unable to withdraw funds',
      description: 'I am trying to withdraw funds but getting an error message.',
      category: 'Withdrawal',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: '2024-11-20T10:30:00',
      updatedAt: '2024-11-20T10:30:00',
      replies: [],
      attachments: [],
    },
    {
      id: 'TKT002',
      subject: 'KYC verification status',
      description: 'My KYC documents were submitted 3 days ago. What is the status?',
      category: 'KYC',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: '2024-11-19T14:20:00',
      updatedAt: '2024-11-20T09:15:00',
      replies: [
        {
          id: 'REP001',
          message: 'Thank you for contacting us. Your KYC documents are currently under review by our team.',
          sender: 'ADMIN',
          senderName: 'Support Team',
          createdAt: '2024-11-19T15:00:00',
          attachments: [],
        },
        {
          id: 'REP002',
          message: 'Thank you for the update. Approximately how long will it take?',
          sender: 'USER',
          senderName: user?.fullName || 'User',
          createdAt: '2024-11-19T16:30:00',
          attachments: [],
        },
        {
          id: 'REP003',
          message: 'KYC verification typically takes 24-48 hours. We will notify you once completed.',
          sender: 'ADMIN',
          senderName: 'Support Team',
          createdAt: '2024-11-20T09:15:00',
          attachments: [],
        },
      ],
      attachments: [],
    },
    {
      id: 'TKT003',
      subject: 'How to refer new members?',
      description: 'I want to know the process of referring new members to the platform.',
      category: 'General',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: '2024-11-18T11:00:00',
      updatedAt: '2024-11-18T14:30:00',
      replies: [
        {
          id: 'REP004',
          message:
            'You can refer new members by sharing your unique referral link. Go to Dashboard > Referral Link to copy it.',
          sender: 'ADMIN',
          senderName: 'Support Team',
          createdAt: '2024-11-18T12:00:00',
          attachments: [],
        },
      ],
      attachments: [],
    },
  ]);

  // Create Ticket Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTicketForm>({
    resolver: yupResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      category: '',
      priority: 'MEDIUM',
      description: '',
    },
  });

  // Handle create ticket
  const onCreateTicket = (data: CreateTicketForm) => {
    const newTicket: Ticket = {
      id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority as any,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      attachments: [],
    };

    setTickets([newTicket, ...tickets]);
    setCreateDialogOpen(false);
    reset();
  };

  // Handle send reply
  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    const newReply: Reply = {
      id: `REP${Date.now()}`,
      message: replyMessage,
      sender: 'USER',
      senderName: user?.fullName || 'User',
      createdAt: new Date().toISOString(),
      attachments: [],
    };

    const updatedTicket = {
      ...selectedTicket,
      replies: [...selectedTicket.replies, newReply],
      updatedAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === selectedTicket.id ? updatedTicket : ticket))
    );

    setSelectedTicket(updatedTicket);
    setReplyMessage('');
    setAttachments([]);
  };

  // Handle file attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments([...attachments, ...Array.from(files)]);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Warning />;
      case 'IN_PROGRESS':
        return <Schedule />;
      case 'RESOLVED':
        return <CheckCircle />;
      case 'CLOSED':
        return <CheckCircle />;
      default:
        return null;
    }
  };

  // Filter tickets
  const getFilteredTickets = () => {
    let filtered = tickets;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  // Ticket List View
  const TicketListView = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Support Tickets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get help from our support team
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ px: 3 }}
        >
          Create Ticket
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {tickets.filter((t) => t.status === 'OPEN').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              In Progress
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {tickets.filter((t) => t.status === 'RESOLVED').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Resolved
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="text.secondary">
              {tickets.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ALL">All Tickets</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Grid container spacing={2}>
        {filteredTickets.length === 0 ? (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SupportAgent sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No tickets found
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredTickets.map((ticket) => (
            <Grid item xs={12} key={ticket.id}>
              <Card
                elevation={2}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  borderLeft: 4,
                  borderColor: `${getStatusColor(ticket.status)}.main`,
                }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          #{ticket.id}
                        </Typography>
                        <Chip
                          label={ticket.priority}
                          size="small"
                          color={getPriorityColor(ticket.priority) as any}
                        />
                        <Chip
                          icon={getStatusIcon(ticket.status)}
                          label={ticket.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(ticket.status) as any}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {ticket.subject}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {ticket.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Category: {ticket.category}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(ticket.updatedAt).fromNow()}
                    </Typography>
                  </Box>
                  {ticket.replies.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Badge badgeContent={ticket.replies.length} color="primary">
                        <Chip label="Replies" size="small" variant="outlined" />
                      </Badge>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );

  // Ticket Detail View
  const TicketDetailView = () => {
    if (!selectedTicket) return null;

    return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setSelectedTicket(null)}
            sx={{ mb: 2 }}
          >
            Back to Tickets
          </Button>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Ticket #{selectedTicket.id}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {selectedTicket.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={selectedTicket.priority}
                      size="small"
                      color={getPriorityColor(selectedTicket.priority) as any}
                    />
                    <Chip
                      icon={getStatusIcon(selectedTicket.status)}
                      label={selectedTicket.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(selectedTicket.status) as any}
                    />
                    <Chip label={selectedTicket.category} size="small" variant="outlined" />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Created {dayjs(selectedTicket.createdAt).format('MMM D, YYYY h:mm A')}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">{selectedTicket.description}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Replies */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Conversation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {selectedTicket.replies.map((reply, index) => (
                <ListItem
                  key={reply.id}
                  alignItems="flex-start"
                  sx={{
                    flexDirection: reply.sender === 'USER' ? 'row-reverse' : 'row',
                    mb: 2,
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: reply.sender === 'USER' ? 'auto' : 56, ml: reply.sender === 'USER' ? 2 : 0 }}>
                    <Avatar sx={{ bgcolor: reply.sender === 'ADMIN' ? 'primary.main' : 'success.main' }}>
                      {reply.sender === 'ADMIN' ? <SupportAgent /> : <Person />}
                    </Avatar>
                  </ListItemAvatar>
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: reply.sender === 'USER' ? 'primary.lighter' : 'grey.100',
                    }}
                  >
                    <Typography variant="caption" fontWeight="600" color="text.secondary" gutterBottom>
                      {reply.senderName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {reply.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(reply.createdAt).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Reply Box */}
        {selectedTicket.status !== 'CLOSED' && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Add Reply
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your message..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button component="label" startIcon={<AttachFile />} size="small">
                  Attach File
                  <input type="file" hidden multiple onChange={handleFileAttachment} />
                </Button>
                <Button
                  variant="contained"
                  endIcon={<Send />}
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                >
                  Send Reply
                </Button>
              </Box>
              {attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      size="small"
                      onDelete={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {selectedTicket ? <TicketDetailView /> : <TicketListView />}

      {/* Create Ticket Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Create New Ticket
            </Typography>
            <IconButton onClick={() => setCreateDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit(onCreateTicket)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Subject"
                      error={!!errors.subject}
                      helperText={errors.subject?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category">
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Investment">Investment</MenuItem>
                        <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                        <MenuItem value="KYC">KYC</MenuItem>
                        <MenuItem value="Commission">Commission</MenuItem>
                        <MenuItem value="Technical">Technical</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.priority}>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={6}
                      label="Description"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Describe your issue in detail..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Ticket
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Support;
