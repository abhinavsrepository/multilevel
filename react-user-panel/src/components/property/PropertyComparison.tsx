import React from 'react';
import { motion } from 'framer-motion';
import {
  FiX,
  FiCheck,
  FiMinus,
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiHome,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';
import { Property } from '../../types';

interface PropertyComparisonProps {
  properties: Property[];
  onRemoveProperty: (propertyId: number) => void;
  onClose?: () => void;
  className?: string;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  properties,
  onRemoveProperty,
  onClose,
  className = '',
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderValue = (value: any): React.ReactNode => {
    if (typeof value === 'boolean') {
      return value ? (
        <FiCheck className="w-5 h-5 text-green-500" />
      ) : (
        <FiMinus className="w-5 h-5 text-gray-400" />
      );
    }
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">N/A</span>;
    }
    return <span>{value}</span>;
  };

  const comparisonRows = [
    {
      category: 'Basic Information',
      items: [
        { label: 'Property ID', key: 'propertyId', icon: <FiHome /> },
        { label: 'Title', key: 'title', icon: <FiHome /> },
        { label: 'Type', key: 'propertyType', icon: <FiHome /> },
        { label: 'Status', key: 'status', icon: <FiAward /> },
      ],
    },
    {
      category: 'Location',
      items: [
        { label: 'City', key: 'location.city', icon: <FiMapPin /> },
        { label: 'State', key: 'location.state', icon: <FiMapPin /> },
        { label: 'Address', key: 'location.address', icon: <FiMapPin /> },
      ],
    },
    {
      category: 'Pricing',
      items: [
        { label: 'Price', key: 'price', icon: <FiDollarSign />, formatter: formatCurrency },
        { label: 'Min. Investment', key: 'minInvestment', icon: <FiDollarSign />, formatter: formatCurrency },
        { label: 'BV Value', key: 'bvValue', icon: <FiDollarSign />, formatter: formatCurrency },
      ],
    },
    {
      category: 'Returns',
      items: [
        { label: 'Expected ROI', key: 'expectedROI', icon: <FiTrendingUp />, suffix: '%' },
        { label: 'ROI Tenure', key: 'roiTenure', icon: <FiCalendar />, suffix: ' months' },
        { label: 'Appreciation', key: 'annualAppreciation', icon: <FiTrendingUp />, suffix: '%' },
        { label: 'Rental Yield', key: 'rentalYield', icon: <FiTrendingUp />, suffix: '%' },
      ],
    },
    {
      category: 'Property Details',
      items: [
        { label: 'Total Area', key: 'details.totalArea', suffix: ' sq ft' },
        { label: 'Built-up Area', key: 'details.builtUpArea', suffix: ' sq ft' },
        { label: 'Carpet Area', key: 'details.carpetArea', suffix: ' sq ft' },
        { label: 'Bedrooms', key: 'details.bedrooms' },
        { label: 'Bathrooms', key: 'details.bathrooms' },
        { label: 'Facing', key: 'details.facing' },
        { label: 'Furnishing', key: 'details.furnishing' },
      ],
    },
    {
      category: 'Booking',
      items: [
        { label: 'Total Slots', key: 'bookingInfo.totalSlots' },
        { label: 'Available Slots', key: 'bookingInfo.availableSlots' },
        { label: 'Booking Progress', key: 'bookingInfo.bookingProgress', suffix: '%' },
      ],
    },
    {
      category: 'Investment Stats',
      items: [
        { label: 'Total Investors', key: 'investmentStats.totalInvestorsCount' },
        { label: 'Avg. Investment', key: 'investmentStats.averageInvestment', formatter: formatCurrency },
        { label: 'Total Investments', key: 'investmentStats.totalInvestments', formatter: formatCurrency },
      ],
    },
  ];

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Property Comparison</h2>
            <p className="text-blue-100 mt-1">Compare up to {properties.length} properties side by side</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 min-w-[200px]">
                Feature
              </th>
              {properties.map((property) => (
                <th
                  key={property.id}
                  className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 min-w-[250px] relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium truncate">{property.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {property.propertyId}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveProperty(property.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                      title="Remove from comparison"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {comparisonRows.map((category, categoryIndex) => (
              <React.Fragment key={categoryIndex}>
                {/* Category Header */}
                <tr className="bg-gray-100 dark:bg-gray-900/30">
                  <td
                    colSpan={properties.length + 1}
                    className="px-4 py-3 font-semibold text-gray-900 dark:text-white"
                  >
                    {category.category}
                  </td>
                </tr>
                {/* Category Items */}
                {category.items.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <span className="text-gray-400">{item.icon}</span>
                        )}
                        {item.label}
                      </div>
                    </td>
                    {properties.map((property) => {
                      const value = getNestedValue(property, item.key);
                      const formattedValue = item.formatter
                        ? item.formatter(value)
                        : value;
                      const displayValue = item.suffix
                        ? `${formattedValue}${item.suffix}`
                        : formattedValue;

                      return (
                        <td
                          key={property.id}
                          className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                        >
                          {renderValue(displayValue)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Compare key features and make an informed investment decision. Data shown is for comparison
          purposes and subject to change.
        </p>
      </div>
    </div>
  );
};

export default PropertyComparison;
