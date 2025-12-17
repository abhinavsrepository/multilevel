import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Skeleton,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  LocationOn,
  ChevronRight,
  CheckCircle,
  Description,
  Share,
  NavigateBefore,
  NavigateNext,
  Calculate,
  TrendingUp,
  AttachMoney,
  CalendarToday,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPropertyByIdThunk } from '../store/slices/propertySlice';
import investmentApi, { CreateInvestmentData } from '../api/investmentApi';

const investmentSchema = yup.object().shape({
  shares: yup
    .number()
    .required('Number of shares is required')
    .min(1, 'Minimum 1 share required')
    .typeError('Must be a number'),
  paymentMethod: yup.string().required('Payment method is required'),
  nomineeFullName: yup.string(),
  nomineeRelation: yup.string(),
});

interface InvestmentFormData {
  shares: number;
  paymentMethod: string;
  nomineeFullName?: string;
  nomineeRelation?: string;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedProperty: property, loading } = useAppSelector((state) => state.property);
  const { balance } = useAppSelector((state) => state.wallet);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investing, setInvesting] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [projectedReturn, setProjectedReturn] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: yupResolver(investmentSchema),
    defaultValues: {
      shares: 1,
      paymentMethod: 'WALLET',
      nomineeFullName: '',
      nomineeRelation: '',
    },
  });

  const shares = watch('shares');

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyByIdThunk(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (property && shares) {
      const amount = shares * property.pricing.pricePerShare;
      setCalculatedAmount(amount);
      const returnAmount = (amount * property.returns.expectedReturn) / 100;
      setProjectedReturn(returnAmount);
    }
  }, [shares, property]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleNextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const handlePrevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleShare = () => {
    if (navigator.share && property) {
      navigator
        .share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const onSubmitInvestment = async (data: InvestmentFormData) => {
    if (!property) return;

    try {
      setInvesting(true);

      const investmentData: CreateInvestmentData = {
        propertyId: property.id,
        shares: data.shares,
        amount: calculatedAmount,
        paymentMethod: data.paymentMethod as any,
      };

      await investmentApi.createInvestment(investmentData);

      toast.success('Investment created successfully!');
      setInvestDialogOpen(false);
      navigate('/my-investments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create investment');
    } finally {
      setInvesting(false);
    }
  };

  if (loading || !property) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const fundingPercentage = ((property.pricing.totalShares - property.pricing.availableShares) / property.pricing.totalShares) * 100;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumbs separator={<ChevronRight fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/dashboard')}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/properties')}
          sx={{ cursor: 'pointer' }}
        >
          Properties
        </Link>
        <Typography color="text.primary">{property.title}</Typography>
      </Breadcrumbs>

      {/* Image Gallery */}
      <Card elevation={3} sx={{ mb: 4, position: 'relative' }}>
        <Box sx={{ position: 'relative', height: 450 }}>
          <img
            src={property.images[currentImageIndex] || '/placeholder-property.jpg'}
            alt={property.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {property.images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                }}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                }}
              >
                <NavigateNext />
              </IconButton>
            </>
          )}
          <IconButton
            onClick={handleShare}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
            }}
          >
            <Share />
          </IconButton>
        </Box>
        {/* Thumbnails */}
        {property.images.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, p: 2, overflowX: 'auto' }}>
            {property.images.map((img, index) => (
              <Box
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                sx={{
                  width: 100,
                  height: 80,
                  flexShrink: 0,
                  cursor: 'pointer',
                  border: currentImageIndex === index ? 3 : 1,
                  borderColor: currentImageIndex === index ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Details */}
        <Grid item xs={12} md={8}>
          {/* Basic Info */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {property.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      {property.location.address}, {property.location.city}, {property.location.state}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={property.propertyType} color="primary" />
              </Box>
              <Typography variant="body1" paragraph>
                {property.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Features & Amenities
                </Typography>
                <List>
                  <Grid container>
                    {property.features.map((feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      </Grid>
                    ))}
                  </Grid>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {property.documents && property.documents.length > 0 && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Property Documents
                </Typography>
                <List>
                  {property.documents.map((doc, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Button size="small" href={doc.url} target="_blank">
                          Download
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText primary={doc.name} secondary={doc.type} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Location Map Placeholder */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Location
              </Typography>
              <Box
                sx={{
                  height: 300,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Map will be integrated here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Pricing & Investment */}
        <Grid item xs={12} md={4}>
          {/* Pricing Card */}
          <Card elevation={3} sx={{ mb: 3, position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {formatCurrency(property.pricing.totalPrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {formatCurrency(property.pricing.pricePerShare)} per share
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Investment Stats */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Expected Return
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {property.returns.expectedReturn}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Return Period
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {property.returns.returnPeriod} months
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Min Investment
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(property.pricing.minInvestment)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Funding Progress */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Funding Progress
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {fundingPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={fundingPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {property.pricing.availableShares} shares available
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {property.pricing.totalShares}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setInvestDialogOpen(true)}
                disabled={property.status !== 'ACTIVE'}
                sx={{ mb: 2 }}
              >
                {property.status === 'ACTIVE' ? 'Invest Now' : property.status.replace('_', ' ')}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Calculate />}
                onClick={() => setInvestDialogOpen(true)}
              >
                Calculate Returns
              </Button>
            </CardContent>
          </Card>

          {/* ROI Calculator */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Return Projection
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'success.50',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2" color="success.main" fontWeight="600">
                      Projected Returns
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatCurrency((property.pricing.minInvestment * property.returns.expectedReturn) / 100)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    On minimum investment of {formatCurrency(property.pricing.minInvestment)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Return Type: {property.returns.returnType.replace('_', ' ')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Investment Dialog */}
      <Dialog
        open={investDialogOpen}
        onClose={() => setInvestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Invest in {property.title}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitInvestment)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Controller
                name="shares"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Number of Shares"
                    error={!!errors.shares}
                    helperText={errors.shares?.message}
                    inputProps={{ min: 1, max: property.pricing.availableShares }}
                  />
                )}
              />

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Investment Amount:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(calculatedAmount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Expected Return:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {formatCurrency(projectedReturn)}
                  </Typography>
                </Box>
              </Box>

              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Payment Method"
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                  >
                    <MenuItem value="WALLET">
                      Wallet (Balance: {formatCurrency(balance?.availableBalance || 0)})
                    </MenuItem>
                    <MenuItem value="ONLINE">Online Payment</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  </TextField>
                )}
              />

              <Divider />

              <Typography variant="subtitle2" fontWeight="bold">
                Nominee Details (Optional)
              </Typography>

              <Controller
                name="nomineeFullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nominee Full Name"
                    placeholder="Enter nominee name"
                  />
                )}
              />

              <Controller
                name="nomineeRelation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Relationship with Nominee"
                    placeholder="e.g., Spouse, Parent, Child"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setInvestDialogOpen(false)} disabled={investing}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={investing}
              sx={{ minWidth: 120 }}
            >
              {investing ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default PropertyDetail;
