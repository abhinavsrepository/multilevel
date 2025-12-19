import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiSearch,
  FiChevronDown,
  FiSliders,
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiHome,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PropertyCard from '../../components/cards/PropertyCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  PropertyFilters,
  PropertyType,
  PropertyStatus,
} from '../../types';
import {
  useSearchPropertiesMutation,
  useGetAvailableCitiesQuery,
  useGetPropertyTypesQuery,
  useGetPropertyAmenitiesQuery,
} from '../../redux/services/propertyService';

type ViewMode = 'grid' | 'list';
type SortOption = 'LATEST' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'POPULAR' | 'HIGHEST_ROI';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'LATEST', label: 'Latest First' },
  { value: 'PRICE_LOW_TO_HIGH', label: 'Price: Low to High' },
  { value: 'PRICE_HIGH_TO_LOW', label: 'Price: High to Low' },
  { value: 'POPULAR', label: 'Most Popular' },
  { value: 'HIGHEST_ROI', label: 'Highest ROI' },
];

const propertyStatuses: PropertyStatus[] = [
  'AVAILABLE',
  'BOOKING_OPEN',
  'FEW_SLOTS_LEFT',
  'SOLD_OUT',
  'UPCOMING',
];

const PropertiesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Filter state
  const [filters, setFilters] = useState<PropertyFilters>({
    propertyType: [],
    city: [],
    minPrice: undefined,
    maxPrice: undefined,
    minInvestment: undefined,
    maxInvestment: undefined,
    status: [],
    minROI: undefined,
    amenities: [],
    sortBy: 'LATEST',
  });

  // API hooks
  const [searchProperties, { data: propertiesData, isLoading }] = useSearchPropertiesMutation();
  const { data: citiesData } = useGetAvailableCitiesQuery();
  const { data: typesData } = useGetPropertyTypesQuery();
  const { data: amenitiesData } = useGetPropertyAmenitiesQuery();

  const properties = propertiesData?.data || [];
  const total = propertiesData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: PropertyFilters = {
      propertyType: searchParams.get('types')?.split(',') as PropertyType[] | undefined,
      city: searchParams.get('cities')?.split(','),
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minInvestment: searchParams.get('minInvestment') ? Number(searchParams.get('minInvestment')) : undefined,
      maxInvestment: searchParams.get('maxInvestment') ? Number(searchParams.get('maxInvestment')) : undefined,
      status: searchParams.get('status')?.split(',') as PropertyStatus[] | undefined,
      minROI: searchParams.get('minROI') ? Number(searchParams.get('minROI')) : undefined,
      amenities: searchParams.get('amenities')?.split(','),
      sortBy: (searchParams.get('sortBy') as SortOption) || 'LATEST',
    };

    setFilters(urlFilters);
  }, [searchParams]);

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [filters, page]);

  const fetchProperties = async () => {
    try {
      await searchProperties({
        filters,
        page,
        pageSize,
      }).unwrap();
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const updateFilters = (newFilters: Partial<PropertyFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    setPage(1);

    // Update URL params
    const params: Record<string, string> = {};
    if (updated.propertyType?.length) params.types = updated.propertyType.join(',');
    if (updated.city?.length) params.cities = updated.city.join(',');
    if (updated.minPrice) params.minPrice = String(updated.minPrice);
    if (updated.maxPrice) params.maxPrice = String(updated.maxPrice);
    if (updated.minInvestment) params.minInvestment = String(updated.minInvestment);
    if (updated.maxInvestment) params.maxInvestment = String(updated.maxInvestment);
    if (updated.status?.length) params.status = updated.status.join(',');
    if (updated.minROI) params.minROI = String(updated.minROI);
    if (updated.amenities?.length) params.amenities = updated.amenities.join(',');
    if (updated.sortBy) params.sortBy = updated.sortBy;

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      propertyType: [],
      city: [],
      minPrice: undefined,
      maxPrice: undefined,
      minInvestment: undefined,
      maxInvestment: undefined,
      status: [],
      minROI: undefined,
      amenities: [],
      sortBy: 'LATEST',
    });
    setSearchParams({});
    setPage(1);
  };

  const toggleArrayFilter = (key: keyof PropertyFilters, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateFilters({ [key]: newValues.length > 0 ? newValues : undefined });
  };

  const handlePropertyView = (propertyId: number) => {
    navigate(`/properties/${propertyId}`);
  };

  const handlePropertyFavorite = (propertyId: number) => {
    // Handle favorite toggle - would integrate with API
    console.log('Toggle favorite:', propertyId);
  };

  const activeFilterCount = [
    filters.propertyType?.length || 0,
    filters.city?.length || 0,
    filters.status?.length || 0,
    filters.amenities?.length || 0,
    filters.minPrice ? 1 : 0,
    filters.maxPrice ? 1 : 0,
    filters.minInvestment ? 1 : 0,
    filters.maxInvestment ? 1 : 0,
    filters.minROI ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <DashboardLayout title="Properties Marketplace">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Properties Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {total} {total === 1 ? 'property' : 'properties'} available
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                title="Grid view"
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                title="List view"
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="lg:w-80 flex-shrink-0"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiSliders className="w-5 h-5" />
                      Filters
                    </h2>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search properties..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Property Type
                      </label>
                      <div className="space-y-2">
                        {(typesData?.data || []).map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="relative">
                              {filters.propertyType?.includes(type as PropertyType) ? (
                                <FiCheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <FiSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                              )}
                              <input
                                type="checkbox"
                                checked={filters.propertyType?.includes(type as PropertyType)}
                                onChange={() => toggleArrayFilter('propertyType', type)}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Cities */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <FiMapPin className="inline w-4 h-4 mr-1" />
                        Location
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(citiesData?.data || []).map((city) => (
                          <label
                            key={city}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="relative">
                              {filters.city?.includes(city) ? (
                                <FiCheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <FiSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                              )}
                              <input
                                type="checkbox"
                                checked={filters.city?.includes(city)}
                                onChange={() => toggleArrayFilter('city', city)}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {city}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <FiDollarSign className="inline w-4 h-4 mr-1" />
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ''}
                          onChange={(e) =>
                            updateFilters({
                              minPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) =>
                            updateFilters({
                              maxPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Investment Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Min Investment
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minInvestment || ''}
                          onChange={(e) =>
                            updateFilters({
                              minInvestment: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxInvestment || ''}
                          onChange={(e) =>
                            updateFilters({
                              maxInvestment: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* ROI */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <FiTrendingUp className="inline w-4 h-4 mr-1" />
                        Minimum ROI (%)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 12"
                        value={filters.minROI || ''}
                        onChange={(e) =>
                          updateFilters({
                            minROI: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Availability Status
                      </label>
                      <div className="space-y-2">
                        {propertyStatuses.map((status) => (
                          <label
                            key={status}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="relative">
                              {filters.status?.includes(status) ? (
                                <FiCheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <FiSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                              )}
                              <input
                                type="checkbox"
                                checked={filters.status?.includes(status)}
                                onChange={() => toggleArrayFilter('status', status)}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {status.replace(/_/g, ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <FiHome className="inline w-4 h-4 mr-1" />
                        Amenities
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(amenitiesData?.data || []).map((amenity) => (
                          <label
                            key={amenity}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="relative">
                              {filters.amenities?.includes(amenity) ? (
                                <FiCheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <FiSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                              )}
                              <input
                                type="checkbox"
                                checked={filters.amenities?.includes(amenity)}
                                onChange={() => toggleArrayFilter('amenities', amenity)}
                                className="sr-only"
                              />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {amenity}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {properties.length} of {total} properties
              </p>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as SortOption })}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Properties Grid/List */}
            {isLoading ? (
              <LoadingSpinner />
            ) : properties.length === 0 ? (
              <EmptyState
                title="No properties found"
                message="Try adjusting your filters or search criteria"
                icon={<FiHome className="w-16 h-16" />}
              />
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-6'
                  }
                >
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onView={handlePropertyView}
                      onFavorite={handlePropertyFavorite}
                      className={viewMode === 'list' ? 'flex' : ''}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertiesList;
