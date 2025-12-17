import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  Skeleton,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  AttachFile,
  MoreVert,
  Person,
  SupportAgent,
  Schedule,
  Category,
  Flag,
  CheckCircle,
  HourglassEmpty,
  Star,
  StarBorder,
  Download,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import { FileUpload } from '@/components/forms';
import {
  getTicketByTicketId,
  replyToTicket,
  closeTicket,
  reopenTicket,
  rateTicket,
} from '@/api/ticket.api';
import { Ticket, TicketStatus } from '@/types';
import { formatDate } from '@/utils/formatters';

const TicketDetail: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetail();
    }
  }, [ticketId]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!ticketId) return;

      const response = await getTicketByTicketId(ticketId);
      setTicket(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!ticket || !replyMessage.trim()) return;

    try {
      setSending(true);
      await replyToTicket(ticket.id, replyMessage, attachments);
      setReplyMessage('');
      setAttachments([]);
      await fetchTicketDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;

    try {
      await closeTicket(ticket.id);
      await fetchTicketDetail();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handleReopenTicket = async () => {
    if (!ticket) return;

    try {
      await reopenTicket(ticket.id, 'Reopening ticket for further assistance');
      await fetchTicketDetail();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reopen ticket');
    }
  };

  const handleRateTicket = async () => {
    if (!ticket || selectedRating === 0) return;

    try {
      await rateTicket(ticket.id, selectedRating, ratingFeedback);
      setRatingDialogOpen(false);
      setSelectedRating(0);
      setRatingFeedback('');
      await fetchTicketDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rate ticket');
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

  const getPriorityColor = (priority: string) => {
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

  if (loading) {
    return (
      <DashboardLayout title="Ticket Details">
        <Box>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  if (error && !ticket) {
    return (
      <DashboardLayout title="Ticket Details">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/support/tickets')} startIcon={<ArrowBack />}>
          Back to Tickets
        </Button>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <DashboardLayout title={`Ticket #${ticket.ticketId}`}>
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton onClick={() => navigate('/support/tickets')} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  #{ticket.ticketId}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {ticket.subject}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={ticket.status.replace('_', ' ')}
                  color={getStatusColor(ticket.status) as any}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={ticket.category.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                  variant="outlined"
                />
                <Chip
                  icon={<Flag />}
                  label={ticket.priority}
                  sx={{
                    bgcolor: alpha(getPriorityColor(ticket.priority), 0.1),
                    color: getPriorityColor(ticket.priority),
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Conversation Thread */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Conversation
                </Typography>

                {/* Messages */}
                <Box sx={{ mb: 3 }}>
                  {ticket.replies && ticket.replies.length > 0 ? (
                    ticket.replies.map((reply, index) => {
                      const isUser = reply.sender === 'USER';
                      return (
                        <Box
                          key={reply.id}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 3,
                            flexDirection: isUser ? 'row-reverse' : 'row',
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: isUser ? 'primary.main' : 'secondary.main',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {isUser ? <Person /> : <SupportAgent />}
                          </Avatar>
                          <Box sx={{ flex: 1, maxWidth: '70%' }}>
                            <Box
                              sx={{
                                bgcolor: isUser ? 'primary.lighter' : 'background.default',
                                borderRadius: 2,
                                p: 2,
                                border: 1,
                                borderColor: isUser ? 'primary.light' : 'divider',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 1,
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {reply.senderName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(reply.timestamp)}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {reply.message}
                              </Typography>

                              {/* Attachments */}
                              {reply.attachments && reply.attachments.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  {reply.attachments.map((attachment, i) => (
                                    <Chip
                                      key={i}
                                      icon={<AttachFile />}
                                      label={attachment.fileName}
                                      size="small"
                                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                                      sx={{ mr: 1, mb: 1 }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No replies yet
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Reply Section */}
                {ticket.status !== 'CLOSED' && (
                  <Box>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                      Reply to Ticket
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Type your message here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 2 }}>
                      <FileUpload
                        label="Attachments (Optional)"
                        helperText="Attach files if needed"
                        onFilesChange={setAttachments}
                        maxFiles={3}
                        multiple={true}
                        acceptedFileTypes={{
                          'image/*': ['.png', '.jpg', '.jpeg'],
                          'application/pdf': ['.pdf'],
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || sending}
                      startIcon={<Send />}
                    >
                      {sending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </Box>
                )}

                {ticket.status === 'CLOSED' && (
                  <Alert severity="info">
                    This ticket is closed. You can reopen it if you need further assistance.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ticket Info Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Ticket Information
                </Typography>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created"
                      secondary={formatDate(ticket.createdDate)}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>
                  {ticket.lastReplyDate && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Reply"
                        secondary={formatDate(ticket.lastReplyDate)}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                  {ticket.closedDate && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText
                        primary="Closed"
                        secondary={formatDate(ticket.closedDate)}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Category />
                    </ListItemIcon>
                    <ListItemText
                      primary="Category"
                      secondary={ticket.category.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Flag />
                    </ListItemIcon>
                    <ListItemText
                      primary="Priority"
                      secondary={ticket.priority}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Actions
                </Typography>
                {ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? (
                  <>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleReopenTicket}
                      sx={{ mb: 1 }}
                    >
                      Reopen Ticket
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setRatingDialogOpen(true)}
                      startIcon={<Star />}
                    >
                      Rate Support
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    onClick={handleCloseTicket}
                  >
                    Close Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {ticket.status !== 'CLOSED' ? (
            <MenuItem onClick={handleCloseTicket}>Close Ticket</MenuItem>
          ) : (
            <MenuItem onClick={handleReopenTicket}>Reopen Ticket</MenuItem>
          )}
          <MenuItem onClick={() => navigate('/support/tickets')}>Back to Tickets</MenuItem>
        </Menu>

        {/* Rating Dialog */}
        <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Rate Support Experience</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                How satisfied are you with the support you received?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <IconButton
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    sx={{ fontSize: 40 }}
                  >
                    {rating <= selectedRating ? (
                      <Star sx={{ fontSize: 40, color: 'warning.main' }} />
                    ) : (
                      <StarBorder sx={{ fontSize: 40 }} />
                    )}
                  </IconButton>
                ))}
              </Box>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Feedback (Optional)"
              placeholder="Tell us about your experience..."
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleRateTicket}
              disabled={selectedRating === 0}
            >
              Submit Rating
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default TicketDetail;
