import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  MonetizationOn,
  Receipt,
  // Person,
  // Calculate,
  Send,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import { getProperties } from '@/api/property.api';
import { proclaimSale, calculateProjectedEarnings } from '@/api/propertySale.api';
import { apiUpload } from '@/api/config/axiosConfig';
import { Property } from '@/types';
import {
  PropertySaleForm,
  SALE_TYPE_OPTIONS,
  ProjectedEarnings,
} from '@/types/propertySale.types';
import { formatCurrency } from '@/utils/formatters';
import EarningsCalculator from '@/components/sales/EarningsCalculator';

const steps = ['Sale Details', 'Buyer Information', 'Payment Receipt', 'Review & Submit'];

const validationSchema = Yup.object({
  propertyId: Yup.number().required('Property is required'),
  plotSize: Yup.number()
    .required('Plot size is required')
    .positive('Plot size must be positive')
    .min(100, 'Minimum plot size is 100 sq ft'),
  pricePerSqFt: Yup.number()
    .required('Price per sq ft is required')
    .min(550, 'Minimum price is ₹550/sq ft')
    .max(1499, 'Maximum price is ₹1499/sq ft'),
  paymentReceipt: Yup.string(), // Optional
  buyerDetails: Yup.object({
    fullName: Yup.string().required('Buyer full name is required'),
    mobile: Yup.string()
      .required('Mobile number is required')
      .matches(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    email: Yup.string().email('Invalid email'),
  }),
});

const ProclaimSale: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectedEarnings, setProjectedEarnings] = useState<ProjectedEarnings | null>(null);

  const formik = useFormik<PropertySaleForm>({
    initialValues: {
      propertyId: null,
      saleType: 'PRIMARY_BOOKING',
      plotSize: '',
      pricePerSqFt: '',
      paymentReceipt: '',
      buyerDetails: {
        fullName: '',
        email: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      },
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);

        const data = {
          propertyId: values.propertyId!,
          saleType: values.saleType,
          plotSize: parseFloat(values.plotSize),
          pricePerSqFt: parseFloat(values.pricePerSqFt),
          paymentReceipt: values.paymentReceipt,
          buyerDetails: values.buyerDetails,
          remarks: values.remarks,
        };

        const response = await proclaimSale(data);

        if (response.success) {
          toast.success('Sale proclaimed successfully! Awaiting admin verification.');
          navigate('/sales/my-sales');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to proclaim sale');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Auto-calculate earnings when plot size and price change
    if (formik.values.plotSize && formik.values.pricePerSqFt) {
      handleCalculateEarnings();
    }
  }, [formik.values.plotSize, formik.values.pricePerSqFt, formik.values.saleType]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await getProperties({ page: 1, limit: 100 });
      setProperties(response.data?.content || []);
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleCalculateEarnings = async () => {
    try {
      setCalculating(true);
      const response = await calculateProjectedEarnings({
        plotSize: parseFloat(formik.values.plotSize),
        pricePerSqFt: parseFloat(formik.values.pricePerSqFt),
        saleType: formik.values.saleType,
      });

      if (response.success) {
        setProjectedEarnings(response.data || null);
      }
    } catch (error) {
      console.error('Failed to calculate earnings:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingReceipt(true);
      const response = await apiUpload('/upload/document', file);

      if (response.success && response.data.url) {
        formik.setFieldValue('paymentReceipt', response.data.url);
        toast.success('Payment receipt uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formik.values.propertyId && formik.values.plotSize && formik.values.pricePerSqFt;
      case 1:
        return formik.values.buyerDetails.fullName && formik.values.buyerDetails.mobile;
      case 2:
        return true; // Optional now
      default:
        return true;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOn sx={{ fontSize: 36, color: 'primary.main' }} />
          Proclaim Property Sale
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Register a property transaction and earn Direct Incentives & Team Sales Bonuses
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - Form */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              {/* Step 0: Sale Details */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Sale Details
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Property Selection */}
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Select Property"
                        name="propertyId"
                        value={formik.values.propertyId || ''}
                        onChange={formik.handleChange}
                        error={formik.touched.propertyId && Boolean(formik.errors.propertyId)}
                        helperText={formik.touched.propertyId && formik.errors.propertyId}
                        disabled={loadingProperties}
                      >
                        {loadingProperties ? (
                          <MenuItem disabled>Loading properties...</MenuItem>
                        ) : (
                          properties.map((property) => (
                            <MenuItem key={property.id} value={property.id}>
                              {property.title} - {property.location?.city || 'Unknown City'}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                    </Grid>

                    {/* Sale Type Toggle */}
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                        Sale Type
                      </Typography>
                      <ToggleButtonGroup
                        fullWidth
                        exclusive
                        value={formik.values.saleType}
                        onChange={(_, value) => value && formik.setFieldValue('saleType', value)}
                        sx={{ mb: 1 }}
                      >
                        {SALE_TYPE_OPTIONS.map((option) => (
                          <ToggleButton key={option.value} value={option.value}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {option.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      {formik.values.saleType === 'PRIMARY_BOOKING' && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          25% down payment required. Remaining amount payable in 24 monthly installments.
                        </Alert>
                      )}
                    </Grid>

                    {/* Plot Size */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Plot Size (sq ft)"
                        name="plotSize"
                        type="number"
                        value={formik.values.plotSize}
                        onChange={formik.handleChange}
                        error={formik.touched.plotSize && Boolean(formik.errors.plotSize)}
                        helperText={formik.touched.plotSize && formik.errors.plotSize}
                        inputProps={{ min: 100, step: 1 }}
                      />
                    </Grid>

                    {/* Price per Sq Ft */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price per Sq Ft (₹)"
                        name="pricePerSqFt"
                        type="number"
                        value={formik.values.pricePerSqFt}
                        onChange={formik.handleChange}
                        error={formik.touched.pricePerSqFt && Boolean(formik.errors.pricePerSqFt)}
                        helperText={formik.touched.pricePerSqFt && formik.errors.pricePerSqFt}
                        inputProps={{ min: 550, max: 1499, step: 1 }}
                      />
                    </Grid>

                    {/* Calculated Sale Amount */}
                    {formik.values.plotSize && formik.values.pricePerSqFt && (
                      <Grid item xs={12}>
                        <Card
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                            border: `2px solid ${theme.palette.primary.main}`,
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Total Sale Amount
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(parseFloat(formik.values.plotSize) * parseFloat(formik.values.pricePerSqFt))}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  {formik.values.saleType === 'PRIMARY_BOOKING' ? 'Down Payment (25%)' : 'Payment Amount'}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {formatCurrency(
                                    (parseFloat(formik.values.plotSize) * parseFloat(formik.values.pricePerSqFt)) *
                                    (formik.values.saleType === 'PRIMARY_BOOKING' ? 0.25 : 1)
                                  )}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Step 1: Buyer Information */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Buyer Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="buyerDetails.fullName"
                        value={formik.values.buyerDetails.fullName}
                        onChange={formik.handleChange}
                        error={formik.touched.buyerDetails?.fullName && Boolean(formik.errors.buyerDetails?.fullName)}
                        helperText={formik.touched.buyerDetails?.fullName && formik.errors.buyerDetails?.fullName}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        name="buyerDetails.mobile"
                        value={formik.values.buyerDetails.mobile}
                        onChange={formik.handleChange}
                        error={formik.touched.buyerDetails?.mobile && Boolean(formik.errors.buyerDetails?.mobile)}
                        helperText={formik.touched.buyerDetails?.mobile && formik.errors.buyerDetails?.mobile}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email (Optional)"
                        name="buyerDetails.email"
                        type="email"
                        value={formik.values.buyerDetails.email}
                        onChange={formik.handleChange}
                        error={formik.touched.buyerDetails?.email && Boolean(formik.errors.buyerDetails?.email)}
                        helperText={formik.touched.buyerDetails?.email && formik.errors.buyerDetails?.email}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address (Optional)"
                        name="buyerDetails.address"
                        multiline
                        rows={2}
                        value={formik.values.buyerDetails.address}
                        onChange={formik.handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="City (Optional)"
                        name="buyerDetails.city"
                        value={formik.values.buyerDetails.city}
                        onChange={formik.handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="State (Optional)"
                        name="buyerDetails.state"
                        value={formik.values.buyerDetails.state}
                        onChange={formik.handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Pincode (Optional)"
                        name="buyerDetails.pincode"
                        value={formik.values.buyerDetails.pincode}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 2: Payment Receipt */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Payment Receipt
                  </Typography>

                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Payment receipt is optional but recommended for faster verification
                    </Typography>
                    <Typography variant="caption">
                      Accepted formats: JPG, PNG, PDF (Max 5MB)
                    </Typography>
                  </Alert>

                  <Box
                    sx={{
                      border: `2px dashed ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                  >
                    <input
                      id="receipt-upload"
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileUpload}
                    />

                    {uploadingReceipt ? (
                      <CircularProgress />
                    ) : formik.values.paymentReceipt ? (
                      <Box>
                        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          Receipt Uploaded Successfully
                        </Typography>
                        <Button variant="outlined" size="small">
                          Change Receipt
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          Click to upload payment receipt
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          JPG, PNG, or PDF (Max 5MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      label="Remarks (Optional)"
                      name="remarks"
                      multiline
                      rows={3}
                      value={formik.values.remarks}
                      onChange={formik.handleChange}
                      placeholder="Add any additional notes or remarks about this sale..."
                    />
                  </Box>
                </Box>
              )}

              {/* Step 3: Review & Submit */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Review & Submit
                  </Typography>

                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Sale Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Sale Type:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formik.values.saleType === 'PRIMARY_BOOKING' ? 'Primary Booking (25%)' : 'Full Payment'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Plot Size:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formik.values.plotSize} sq ft
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Price per Sq Ft:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ₹{formik.values.pricePerSqFt}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatCurrency(parseFloat(formik.values.plotSize) * parseFloat(formik.values.pricePerSqFt))}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Buyer Information
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formik.values.buyerDetails.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formik.values.buyerDetails.mobile}
                        {formik.values.buyerDetails.email && ` • ${formik.values.buyerDetails.email}`}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Payment Receipt
                      </Typography>
                      {formik.values.paymentReceipt ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Receipt Uploaded"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="No Receipt (Optional)"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Alert severity="info" icon={<Info />}>
                    Your sale will be submitted for admin verification. You will be notified once approved.
                  </Alert>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {activeStep > 0 && (
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Box sx={{ flex: 1 }} />
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                  >
                    {submitting ? 'Submitting...' : 'Proclaim Sale'}
                  </Button>
                )}
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Right Column - Earnings Calculator */}
        <Grid item xs={12} lg={4}>
          {projectedEarnings && (
            <EarningsCalculator
              earnings={projectedEarnings}
              calculating={calculating}
              saleType={formik.values.saleType}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProclaimSale;
