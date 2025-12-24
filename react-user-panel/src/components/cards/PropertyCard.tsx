import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiHeart,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiArrowRight,
  FiStar,
} from 'react-icons/fi';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onView?: (propertyId: number) => void;
  onFavorite?: (propertyId: number) => void;
  isFavorite?: boolean;
  loading?: boolean;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onView,
  onFavorite,
  isFavorite = false,
  loading = false,
  className = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(property.id);
  };

  const handleCardClick = () => {
    onView?.(property.id);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      BOOKING_OPEN: 'bg-blue-100 text-blue-800',
      FEW_SLOTS_LEFT: 'bg-orange-100 text-orange-800',
      SOLD_OUT: 'bg-red-100 text-red-800',
      UPCOMING: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColorDark = (status: string) => {
    const colors = {
      AVAILABLE: 'dark:bg-green-900 dark:text-green-200',
      BOOKING_OPEN: 'dark:bg-blue-900 dark:text-blue-200',
      FEW_SLOTS_LEFT: 'dark:bg-orange-900 dark:text-orange-200',
      SOLD_OUT: 'dark:bg-red-900 dark:text-red-200',
      UPCOMING: 'dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[status as keyof typeof colors] || 'dark:bg-gray-700 dark:text-gray-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        <div className="h-56 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-full" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
        transition-all duration-300 overflow-hidden cursor-pointer group ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        {/* Main Image */}
        <img
          src={imageError ? '/placeholder-property.jpg' : property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {property.isFeatured && (
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full flex items-center gap-1">
              <FiStar className="w-3 h-3" />
              Featured
            </span>
          )}
          {property.isNewLaunch && (
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
              New Launch
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full
            ${getStatusColor(property.status)} ${getStatusColorDark(property.status)}`}
          >
            {property.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 mt-8 p-2 bg-white/90 dark:bg-gray-800/90
            rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700
            transition-all duration-200 group/fav"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FiHeart
            className={`w-5 h-5 transition-all duration-200
              ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover/fav:text-red-500'}`}
          />
        </button>

        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50
                text-white rounded-full hover:bg-black/70 transition-all opacity-0
                group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50
                text-white rounded-full hover:bg-black/70 transition-all opacity-0
                group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200
                    ${index === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs font-semibold rounded-full">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FiMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {property.city || property.location?.city || 'Unknown'}, {property.state || property.location?.state || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Price and ROI */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Price</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {property.price ? formatCurrency(property.price) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expected ROI</p>
            <div className="flex items-center">
              <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {property.expectedROI || property.expectedRoiPercent || '0'}%
              </p>
            </div>
          </div>
        </div>

        {/* Min Investment and BV */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min Investment</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {property.minInvestment ? formatCurrency(property.minInvestment) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">BV Value</p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {property.bvValue ? property.bvValue.toLocaleString() : '0'} BV
            </p>
          </div>
        </div>

        {/* Booking Progress */}
        {property.bookingInfo && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Booking Progress
              </p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {property.bookingInfo.bookingProgress || 0}%
              </p>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${property.bookingInfo.bookingProgress || 0}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {property.bookingInfo.bookedSlots || 0} / {property.bookingInfo.totalSlots || 0} slots booked
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {property.bookingInfo.availableSlots || 0} left
              </p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <FiUsers className="w-3.5 h-3.5 mr-1" />
            <span>{property.investmentStats?.totalInvestorsCount || 0} investors</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="w-3.5 h-3.5 mr-1" />
            <span>{property.roiTenure || property.roiTenureMonths ? Math.round((property.roiTenure || property.roiTenureMonths) / 12) : 0}Y tenure</span>
          </div>
          <div className="flex items-center">
            <FiDollarSign className="w-3.5 h-3.5 mr-1" />
            <span>{property.annualAppreciation || property.appreciationRateAnnual || 0}% p.a.</span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold
            rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
            group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={property.status === 'SOLD_OUT'}
        >
          {property.status === 'SOLD_OUT' ? (
            'Sold Out'
          ) : (
            <>
              View Details
              <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
