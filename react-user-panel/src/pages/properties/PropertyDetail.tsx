import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiHeart,
  FiShare2,
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiFileText,
  FiImage,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiCheckCircle,
  FiActivity,
  FiPhone,
  FiMail,
  FiAward,
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PropertyCard from '../../components/cards/PropertyCard';
import { InvestmentModal } from '../../components/modals/InvestmentModal';
import {
  useGetPropertyByIdQuery,
  useLazyGetSimilarPropertiesQuery,
  useGetPropertyDocumentsQuery,
  useGetPropertyInvestmentsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useTrackPropertyViewMutation,
} from '../../redux/services/propertyService';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: <FiHome className="w-4 h-4" /> },
  { id: 'investment', label: 'Investment Details', icon: <FiDollarSign className="w-4 h-4" /> },
  { id: 'location', label: 'Location', icon: <FiMapPin className="w-4 h-4" /> },
  { id: 'developer', label: 'Developer', icon: <FiUsers className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FiFileText className="w-4 h-4" /> },
  { id: 'gallery', label: 'Gallery', icon: <FiImage className="w-4 h-4" /> },
  { id: 'history', label: 'Investment History', icon: <FiActivity className="w-4 h-4" /> },
];

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showInvestmentModal, setShowInvestmentModal] = useState<boolean>(false);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [calculatedReturns, setCalculatedReturns] = useState<number>(0);

  // API hooks
  const { data: propertyData, isLoading, error } = useGetPropertyByIdQuery(id || '');
  const { data: documentsData } = useGetPropertyDocumentsQuery(id || '');
  const { data: investmentsData } = useGetPropertyInvestmentsQuery({
    propertyId: id || '',
    page: 1,
    pageSize: 10,
  });
  const [getSimilarProperties, { data: similarPropertiesData }] = useLazyGetSimilarPropertiesQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [trackView] = useTrackPropertyViewMutation();

  const property = propertyData?.data;
  const images = property?.images || [];
  const documents = documentsData?.data || [];
  const investments = investmentsData?.data || [];
  const similarProperties = similarPropertiesData?.data || [];

  useEffect(() => {
    if (id) {
      trackView(id);
      getSimilarProperties(id);
    }
  }, [id]);

  useEffect(() => {
    if (property && investmentAmount >= property.minInvestment) {
      const returns = (investmentAmount * property.expectedROI) / 100;
      setCalculatedReturns(returns);
    } else {
      setCalculatedReturns(0);
    }
  }, [investmentAmount, property]);

  const handlePropertyView = (propertyId: number) => {
    navigate(`/properties/${propertyId}`);
    window.scrollTo(0, 0);
  };

  const handleToggleFavorite = async () => {
    if (!id) return;

    try {
      if (isFavorite) {
        await removeFromWishlist(id).unwrap();
      } else {
        await addToWishlist(id).unwrap();
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (!property) return;

    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const nextImage = () => {
    if (!property) return;
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!property) return;
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleInvestNow = () => {
    setShowInvestmentModal(true);
  };

  const onSimilarPropertyFavorite = async (propertyId: number) => {
    try {
      await addToWishlist(propertyId.toString()).unwrap();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleInvestmentSubmit = async (data: any) => {
    console.log('Investment submitted:', data);
    // Would integrate with investment API here
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      
        <LoadingSpinner />
      
    );
  }

  if (error || !property) {
    return (
      <EmptyState
        title="Property not found"
        message="The property you're looking for doesn't exist or has been removed"
        icon={<FiHome className="w-16 h-16" />}
      />
    );
  }

  // TypeScript: property is guaranteed to be defined after the null check above
  const currentProperty = property;

  return (
    <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Properties</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative h-96">
                <img
                  src={images[0]}
                  alt={currentProperty.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(0)}
                />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiHeart
                      className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiShare2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                {images.length > 1 && (
                  <button
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-black bg-opacity-60 text-white rounded-lg font-semibold hover:bg-opacity-80 transition-all flex items-center gap-2"
                  >
                    <FiImage className="w-4 h-4" />
                    View All {images.length} Photos
                  </button>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-24 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <img
                        src={image}
                        alt={`${currentProperty.title} - ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {index === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-bold">
                          +{images.length - 5}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Header */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${currentProperty.status === 'AVAILABLE'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : currentProperty.status === 'FEW_SLOTS_LEFT'
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}
                    >
                      {currentProperty.status.replace(/_/g, ' ')}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                      {currentProperty.propertyType}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentProperty.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    {currentProperty.location.address}, {currentProperty.location.city}, {currentProperty.location.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currentProperty.price)}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Investment</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currentProperty.minInvestment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected ROI</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <FiTrendingUp className="w-4 h-4" />
                    {currentProperty.expectedROI}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tenure</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentProperty.roiTenure} Years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">BV Value</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {currentProperty.bvValue.toLocaleString()} BV
                  </p>
                </div>
              </div>

              {/* Booking Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Booking Progress
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentProperty.bookingInfo.bookingProgress}%
                  </p>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentProperty.bookingInfo.bookingProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentProperty.bookingInfo.bookedSlots} / {currentProperty.bookingInfo.totalSlots} slots booked
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    {currentProperty.bookingInfo.availableSlots} slots available
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-4 py-3 font-semibold text-sm transition-colors flex items-center gap-2 border-b-2 ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Description
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentProperty.description}
                      </p>
                    </div>

                    {currentProperty.details && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          Property Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {currentProperty.details.totalArea && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total Area</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {currentProperty.details.totalArea} sq.ft
                              </p>
                            </div>
                          )}
                          {currentProperty.details.bedrooms !== undefined && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {currentProperty.details.bedrooms}
                              </p>
                            </div>
                          )}
                          {currentProperty.details.bathrooms !== undefined && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {currentProperty.details.bathrooms}
                              </p>
                            </div>
                          )}
                          {currentProperty.details.facing && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Facing</p>
                              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {currentProperty.details.facing.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            </div>
                          )}
                          {currentProperty.details.furnishing && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Furnishing</p>
                              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {currentProperty.details.furnishing.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            </div>
                          )}
                          {currentProperty.details.possession && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Possession</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {currentProperty.details.possession}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentProperty.amenities.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          Amenities
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {currentProperty.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Investment Details Tab */}
                {activeTab === 'investment' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                          Minimum Investment
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(currentProperty.minInvestment)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                          Expected ROI
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currentProperty.expectedROI}% p.a.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                          ROI Tenure
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currentProperty.roiTenure} Years
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                          Annual Appreciation
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currentProperty.annualAppreciation}%
                        </p>
                      </div>
                    </div>

                    {/* Commission Structure */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Commission Structure
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-gray-700 dark:text-gray-300">Direct Referral</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {currentProperty.commissionStructure.directReferralEnabled
                              ? `${currentProperty.commissionStructure.directReferralPercentage}%`
                              : 'Not Available'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-gray-700 dark:text-gray-300">Level Commission</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {currentProperty.commissionStructure.levelCommissionEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-gray-700 dark:text-gray-300">Binary Commission</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {currentProperty.commissionStructure.binaryCommissionEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Investment Statistics */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Investment Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Total Investments
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(currentProperty.investmentStats.totalInvestments)}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Total Investors
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {currentProperty.investmentStats.totalInvestorsCount}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Average Investment
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(currentProperty.investmentStats.averageInvestment)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Address
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentProperty.location.address}
                        <br />
                        {currentProperty.location.city}, {currentProperty.location.state} - {currentProperty.location.pincode}
                        <br />
                        {currentProperty.location.country}
                      </p>
                    </div>

                    {/* Map Placeholder */}
                    <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Map integration would go here
                      </p>
                    </div>

                    {/* Nearby Facilities */}
                    {currentProperty.location.nearbyFacilities && currentProperty.location.nearbyFacilities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                          Nearby Facilities
                        </h3>
                        <div className="space-y-2">
                          {currentProperty.location.nearbyFacilities.map((facility, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {facility.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {facility.type}
                                </p>
                              </div>
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                {facility.distance}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Developer Tab */}
                {activeTab === 'developer' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FiAward className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {currentProperty.developer.name}
                        </h2>
                        {currentProperty.developer.reraNumber && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            RERA: {currentProperty.developer.reraNumber}
                          </p>
                        )}
                        {currentProperty.developer.about && (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            {currentProperty.developer.about}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <a
                            href={`tel:${currentProperty.developer.contactNumber}`}
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <FiPhone className="w-4 h-4" />
                            {currentProperty.developer.contactNumber}
                          </a>
                          <a
                            href={`mailto:${currentProperty.developer.email}`}
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <FiMail className="w-4 h-4" />
                            {currentProperty.developer.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {doc.documentName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {doc.documentType}
                              </p>
                            </div>
                          </div>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            <FiDownload className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No documents available"
                        message="Documents will be added soon"
                        icon={<FiFileText className="w-16 h-16" />}
                      />
                    )}
                  </motion.div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(index)}
                      >
                        <img
                          src={image}
                          alt={`${currentProperty.title} - ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Investment History Tab */}
                {activeTab === 'history' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {investments.length > 0 ? (
                      <div className="space-y-3">
                        {investments.map((investment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <FiUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {investment.investorName || 'Anonymous'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {investment.date && formatDate(investment.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(investment.amount)}
                              </p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                {investment.bv} BV
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No  investment history"
                        message="Be the first to invest in this property"
                        icon={<FiActivity className="w-16 h-16" />}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Investment Calculator */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Investment Calculator
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Investment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={investmentAmount || ''}
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                        min={currentProperty.minInvestment}
                        max={currentProperty.maxInvestmentPerUser}
                        step="1000"
                        placeholder={`Min ${currentProperty.minInvestment.toLocaleString()}`}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Min: {formatCurrency(currentProperty.minInvestment)} | Max:{' '}
                      {formatCurrency(currentProperty.maxInvestmentPerUser)}
                    </p>
                  </div>

                  {investmentAmount >= currentProperty.minInvestment && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                        Estimated Returns ({currentProperty.expectedROI}% for {currentProperty.roiTenure} years)
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        +{formatCurrency(calculatedReturns)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                          Total Maturity Value
                        </p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(investmentAmount + calculatedReturns)}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleInvestNow}
                    disabled={
                      currentProperty.status === 'SOLD_OUT' ||
                      investmentAmount < currentProperty.minInvestment
                    }
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {currentProperty.status === 'SOLD_OUT' ? (
                      'Sold Out'
                    ) : (
                      <>
                        <FiDollarSign className="w-5 h-5" />
                        Invest Now
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    Safe and secure investment
                  </p>
                </div>
              </motion.div>

              {/* Property Stats */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentProperty.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Listed On</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(currentProperty.listedDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Property ID</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentProperty.propertyId}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.slice(0, 3).map((similarProperty) => (
                <PropertyCard
                  key={similarProperty.id}
                  property={similarProperty}
                  onView={handlePropertyView}
                  onFavorite={onSimilarPropertyFavorite}
                />
              ))}
            </div>
          </div>
        )}

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <FiX className="w-8 h-8" />
            </button>
            

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <FiChevronRight className="w-8 h-8" />
            </button>

            <img
              src={currentProperty.images[lightboxIndex]}
              alt={`${currentProperty.title} - ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {lightboxIndex + 1} / {currentProperty.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investment Modal */}
      <InvestmentModal
        open={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        onSubmit={handleInvestmentSubmit}
        walletBalance={50000} // Would come from user state
        minInvestment={currentProperty.minInvestment}
        maxInvestment={currentProperty.maxInvestmentPerUser}
        interestRate={currentProperty.expectedROI}
        lockPeriod={currentProperty.roiTenure * 365}
      />
    </div>
  );
};

export default PropertyDetail;
