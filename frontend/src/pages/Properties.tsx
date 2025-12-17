import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Skeleton,
  InputAdornment,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Pagination,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  TrendingUp,
  Close,
  Star,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPropertiesThunk,
  fetchFeaturedPropertiesThunk,
  updateFilters,
  clearFilters,
} from '../store/slices/propertySlice';
import { Property } from '../api/propertyApi';

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { properties, featuredProperties, filters, pagination, loading } = useAppSelector(
    (state) => state.property
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Filter states
  const [localFilters, setLocalFilters] = useState({
    propertyType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    status: '',
  });

  useEffect(() => {
    dispatch(fetchFeaturedPropertiesThunk());
    handleFetchProperties();
  }, [dispatch, page]);

  const handleFetchProperties = () => {
    const params: any = {
      page,
      limit: 12,
      ...filters,
    };

    if (searchQuery) {
      params.q = searchQuery;
    }

    dispatch(fetchPropertiesThunk(params));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    handleFetchProperties();
  };

  const handleApplyFilters = () => {
    const appliedFilters: any = {};

    if (localFilters.propertyType) appliedFilters.propertyType = localFilters.propertyType;
    if (localFilters.city) appliedFilters.city = localFilters.city;
    if (localFilters.minPrice) appliedFilters.minPrice = Number(localFilters.minPrice);
    if (localFilters.maxPrice) appliedFilters.maxPrice = Number(localFilters.maxPrice);
    if (localFilters.status) appliedFilters.status = localFilters.status;

    dispatch(updateFilters(appliedFilters));
    setPage(1);
    setFilterDrawerOpen(false);
    handleFetchProperties();
  };

  const handleClearFilters = () => {
    setLocalFilters({
      propertyType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      status: '',
    });
    dispatch(clearFilters());
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMING_SOON':
        return 'info';
      case 'FULLY_FUNDED':
        return 'warning';
      case 'COMPLETED':
        return 'default';
      default:
        return 'default';
    }
  };

  const PropertyCard: React.FC<{ property: Property; featured?: boolean }> = ({
    property,
    featured = false,
  }) => (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        position: 'relative',
      }}
    >
      {featured && (
        <Chip
          icon={<Star />}
          label="Featured"
          color="warning"
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            fontWeight: 600,
          }}
        />
      )}
      <CardMedia
        component="img"
        height="200"
        image={property.images[0] || '/placeholder-property.jpg'}
        alt={property.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 'auto' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {property.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {property.location.city}, {property.location.state}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {property.description.substring(0, 100)}
            {property.description.length > 100 ? '...' : ''}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Price
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(property.pricing.totalPrice)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Expected Return
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                {property.returns.expectedReturn}%
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Chip
              label={property.propertyType}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={property.status.replace('_', ' ')}
              size="small"
              color={getStatusColor(property.status) as any}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate(`/property/${property.id}`)}
            sx={{ mt: 1 }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const FilterSidebar = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          select
          fullWidth
          label="Property Type"
          value={localFilters.propertyType}
          onChange={(e) => setLocalFilters({ ...localFilters, propertyType: e.target.value })}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="RESIDENTIAL">Residential</MenuItem>
          <MenuItem value="COMMERCIAL">Commercial</MenuItem>
          <MenuItem value="INDUSTRIAL">Industrial</MenuItem>
          <MenuItem value="LAND">Land</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="City"
          value={localFilters.city}
          onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
          placeholder="Enter city name"
        />

        <TextField
          fullWidth
          type="number"
          label="Min Price"
          value={localFilters.minPrice}
          onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />

        <TextField
          fullWidth
          type="number"
          label="Max Price"
          value={localFilters.maxPrice}
          onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />

        <TextField
          select
          fullWidth
          label="Status"
          value={localFilters.status}
          onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="COMING_SOON">Coming Soon</MenuItem>
          <MenuItem value="FULLY_FUNDED">Fully Funded</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
        </TextField>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="contained" fullWidth onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outlined" fullWidth onClick={handleClearFilters}>
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Properties
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore investment opportunities in real estate
        </Typography>
      </Box>

      {/* Search and Sort Bar */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="roi">Highest ROI</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<FilterList />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ height: '56px' }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Star sx={{ color: 'warning.main', mr: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              Featured Properties
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {featuredProperties.slice(0, 3).map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <PropertyCard property={property} featured />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Properties */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Card elevation={2} sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <FilterSidebar />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : properties.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} lg={4} key={property.id}>
                    <PropertyCard property={property} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No properties found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your search or filters
                  </Typography>
                  <Button variant="contained" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 300 }}>
          <FilterSidebar />
        </Box>
      </Drawer>
    </Container>
  );
};

export default Properties;
