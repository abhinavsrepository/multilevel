import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

import { FileUpload } from '@/components/forms';
import { createTicket } from '@/api/ticket.api';
import { TicketCategory, TicketPriority } from '@/types';
import DashboardLayout from '@/layouts/DashboardLayout';

interface CreateTicketForm {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
}

const CreateTicket: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTicketForm>({
    defaultValues: {
      category: 'GENERAL',
      priority: 'MEDIUM',
      subject: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateTicketForm) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await createTicket({
        ...data,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (response.data?.ticketId) {
        setCreatedTicketId(response.data.ticketId);
      }
      setSuccess(true);
      reset();
      setAttachments([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (success && createdTicketId) {
    return (
      <DashboardLayout title="Create Support Ticket">
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Ticket Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Your support ticket has been created.
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'monospace',
                color: 'primary.main',
                mb: 3,
              }}
            >
              Ticket ID: #{createdTicketId}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Our support team will review your ticket and respond within 24 hours.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/support/tickets')}
              >
                View All Tickets
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/support/tickets/${createdTicketId}`)}
              >
                View Ticket
              </Button>
            </Box>
          </CardContent>
        </Card>
        
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Support Ticket">
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Button
              onClick={() => navigate('/support/tickets')}
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create New Support Ticket
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out the form below to submit your support request
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Form */}
        <Card>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Category */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Category"
                        error={!!errors.category}
                        helperText={errors.category?.message}
                      >
                        <MenuItem value="INVESTMENT_QUERY">Investment Query</MenuItem>
                        <MenuItem value="PAYMENT_ISSUE">Payment Issue</MenuItem>
                        <MenuItem value="COMMISSION_DISPUTE">Commission Dispute</MenuItem>
                        <MenuItem value="PROPERTY_INFORMATION">Property Information</MenuItem>
                        <MenuItem value="TECHNICAL_SUPPORT">Technical Support</MenuItem>
                        <MenuItem value="ACCOUNT_ACCESS">Account Access</MenuItem>
                        <MenuItem value="KYC_ISSUE">KYC Issue</MenuItem>
                        <MenuItem value="GENERAL">General</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                {/* Priority */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: 'Priority is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Priority"
                        error={!!errors.priority}
                        helperText={errors.priority?.message}
                      >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="URGENT">Urgent</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                {/* Subject */}
                <Grid item xs={12}>
                  <Controller
                    name="subject"
                    control={control}
                    rules={{
                      required: 'Subject is required',
                      minLength: {
                        value: 10,
                        message: 'Subject must be at least 10 characters',
                      },
                      maxLength: {
                        value: 200,
                        message: 'Subject must not exceed 200 characters',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Subject"
                        placeholder="Brief description of your issue"
                        error={!!errors.subject}
                        helperText={errors.subject?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      required: 'Description is required',
                      minLength: {
                        value: 20,
                        message: 'Description must be at least 20 characters',
                      },
                      maxLength: {
                        value: 2000,
                        message: 'Description must not exceed 2000 characters',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={6}
                        label="Description"
                        placeholder="Please provide detailed information about your issue..."
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Attachments */}
                <Grid item xs={12}>
                  <FileUpload
                    label="Attachments (Optional)"
                    helperText="Upload screenshots or documents that may help us understand your issue"
                    onFilesChange={setAttachments}
                    maxFiles={5}
                    multiple={true}
                    acceptedFileTypes={{
                      'image/*': ['.png', '.jpg', '.jpeg'],
                      'application/pdf': ['.pdf'],
                    }}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/support/tickets')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      startIcon={<Send />}
                    >
                      {submitting ? 'Creating...' : 'Create Ticket'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Before creating a ticket:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Check our FAQ section for common questions and answers</li>
              <li>Provide as much detail as possible about your issue</li>
              <li>Include screenshots or relevant documents if applicable</li>
              <li>Select the correct category and priority for faster resolution</li>
            </ul>
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate('/support/faq')}
            sx={{ mt: 1 }}
          >
            View FAQs
          </Button>
        </Alert>
      </Box>
    </DashboardLayout>
    
  );
};

export default CreateTicket;
