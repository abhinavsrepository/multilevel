const express = require('express');
const {
    getAllProperties,
    getFeaturedProperties,
    getNewLaunchProperties,
    getTrendingProperties,
    getRecommendedProperties,
    getPropertyById,
    getPropertyByPropertyId,
    getSimilarProperties,
    searchProperties,
    getPropertiesByType,
    getPropertiesByStatus,
    getPropertiesByCity,
    getPropertiesByState,
    getPropertiesByPriceRange,
    getPropertiesByInvestmentRange,
    getPropertyTypes,
    getAvailableCities,
    getAvailableStates,
    getAvailableAmenities,
    getPriceRangeStats,
    getInvestmentRangeStats,
    getPropertyStats,
    getPropertyRecentInvestments,
    getPropertyDocuments,
    getPropertyImages,
    getPropertyVideos,
    getFavoriteProperties,
    addToFavorites,
    removeFromFavorites,
    isPropertyFavorite,
    compareProperties,
    getPropertiesByDeveloper,
    getDeveloperDetails,
    createProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/property.controller');
const { uploadPropertyImage } = require('../controllers/upload.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const propertyUpload = require('../middleware/property-upload.middleware');

const router = express.Router();

// ==================== Public Routes ====================

// Property Listing
router.get('/', getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get('/new-launches', getNewLaunchProperties);
router.get('/trending', getTrendingProperties);

// Search & Filters
router.get('/search', searchProperties);
router.post('/search', searchProperties); // Support POST for search with body params
router.get('/type/:type', getPropertiesByType);
router.get('/status/:status', getPropertiesByStatus);
router.get('/city/:city', getPropertiesByCity);
router.get('/state/:state', getPropertiesByState);
router.get('/price-range', getPropertiesByPriceRange);
router.get('/investment-range', getPropertiesByInvestmentRange);

// Filter Facets
router.get('/metadata/types', getPropertyTypes);
router.get('/metadata/cities', getAvailableCities);
router.get('/metadata/states', getAvailableStates);
router.get('/metadata/amenities', getAvailableAmenities);
router.get('/metadata/price-range', getPriceRangeStats);
router.get('/metadata/investment-range', getInvestmentRangeStats);

// Property Comparison
router.get('/compare', compareProperties);

// Developer
router.get('/developer/:developerId', getPropertiesByDeveloper);
router.get('/developers/:developerId', getDeveloperDetails);

// Property Details (must be after specific routes to avoid conflicts)
router.get('/code/:propertyId', getPropertyByPropertyId);
router.get('/:id', getPropertyById);
router.get('/:id/similar', getSimilarProperties);
router.get('/:id/stats', getPropertyStats);
router.get('/:id/recent-investments', getPropertyRecentInvestments);
router.get('/:id/investments', getPropertyRecentInvestments); // Alias for recent-investments
router.get('/:id/documents', getPropertyDocuments);
router.get('/:id/images', getPropertyImages);
router.get('/:id/videos', getPropertyVideos);
router.post('/:id/view', getPropertyById); // Track property view - using getPropertyById as placeholder

// ==================== Protected Routes ====================

// Recommended (requires auth to get user preferences)
router.get('/recommended', protect, getRecommendedProperties);

// Favorites/Wishlist
router.get('/favorites', protect, getFavoriteProperties);
router.get('/:id/favorite/add', protect, addToFavorites);
router.get('/:id/favorite/remove', protect, removeFromFavorites);
router.get('/:id/favorite/check', protect, isPropertyFavorite);

// ==================== Admin Routes ====================

// Property image upload (must be before generic routes to avoid conflicts)
router.post('/upload', protect, authorize('ADMIN'), propertyUpload.single('file'), uploadPropertyImage);

router.post('/', protect, authorize('ADMIN'), createProperty);
router.put('/:id', protect, authorize('ADMIN'), updateProperty);
router.delete('/:id', protect, authorize('ADMIN'), deleteProperty);

module.exports = router;
