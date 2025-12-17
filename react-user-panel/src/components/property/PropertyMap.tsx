import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiMaximize,
  FiLayers,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import { PropertyLocation, NearbyFacility } from '../../types';

interface PropertyMapProps {
  location: PropertyLocation;
  className?: string;
}

// Facility icons mapping
const facilityIcons: Record<string, string> = {
  school: '🏫',
  hospital: '🏥',
  mall: '🏬',
  metro: '🚇',
  park: '🌳',
  restaurant: '🍴',
  gym: '💪',
  atm: '🏧',
  market: '🛒',
  default: '📍',
};

const PropertyMap: React.FC<PropertyMapProps> = ({ location, className = '' }) => {
  const [selectedFacility, setSelectedFacility] = useState<NearbyFacility | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showSatellite, setShowSatellite] = useState<boolean>(false);

  const facilities = location.nearbyFacilities || [];

  // Filter facilities
  const filteredFacilities =
    activeFilter === 'all'
      ? facilities
      : facilities.filter((f) => f.type.toLowerCase() === activeFilter.toLowerCase());

  // Get unique facility types
  const facilityTypes = ['all', ...Array.from(new Set(facilities.map((f) => f.type.toLowerCase())))];

  // Generate Google Maps embed URL
  const getMapUrl = (): string => {
    const { latitude, longitude, address } = location;
    if (latitude && longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${latitude},${longitude}&zoom=15${
        showSatellite ? '&maptype=satellite' : ''
      }`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
      address
    )}&zoom=15${showSatellite ? '&maptype=satellite' : ''}`;
  };

  const getDirectionsUrl = (): string => {
    const { latitude, longitude, address } = location;
    if (latitude && longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const getFacilityIcon = (type: string): string => {
    return facilityIcons[type.toLowerCase()] || facilityIcons.default;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiMapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Location & Nearby</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {location.city}, {location.state}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSatellite(!showSatellite)}
              className={`p-2 rounded-lg transition-colors ${
                showSatellite
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title="Toggle Satellite View"
            >
              <FiLayers className="w-5 h-5" />
            </button>
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Get Directions"
            >
              <FiNavigation className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-200 dark:bg-gray-900">
        <iframe
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />

        {/* Fallback for demo - Remove in production */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <FiMapPin className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {location.address}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {location.city}, {location.state} - {location.pincode}
            </p>
            {location.latitude && location.longitude && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <FiNavigation className="w-4 h-4" />
              View on Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Nearby Facilities */}
      {facilities.length > 0 && (
        <div className="p-4">
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <FiFilter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {facilityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredFacilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedFacility(facility)}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <span className="text-2xl flex-shrink-0">{getFacilityIcon(facility.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {facility.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {facility.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {facility.distance}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFacilities.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No {activeFilter} facilities found nearby
            </div>
          )}
        </div>
      )}

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFacility(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getFacilityIcon(selectedFacility.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {selectedFacility.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{selectedFacility.distance} away</span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  selectedFacility.name + ', ' + location.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg transition-colors"
              >
                Get Directions
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyMap;
