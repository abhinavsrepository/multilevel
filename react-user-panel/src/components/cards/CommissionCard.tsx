import React from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiAward,
  FiStar,
} from 'react-icons/fi';
import { Commission, CommissionType } from '../../types';

interface CommissionCardProps {
  commission: Commission;
  onView?: (commissionId: number) => void;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

const CommissionCard: React.FC<CommissionCardProps> = ({
  commission,
  onView,
  loading = false,
  className = '',
  variant = 'default',
}) => {
  const getCommissionTypeConfig = (type: CommissionType) => {
    const configs = {
      DIRECT_REFERRAL: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: FiUsers,
        gradient: 'from-blue-500 to-blue-600',
      },
      BINARY_PAIRING: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        icon: FiTrendingUp,
        gradient: 'from-purple-500 to-purple-600',
      },
      LEVEL_COMMISSION: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: FiUsers,
        gradient: 'from-green-500 to-green-600',
      },
      RENTAL_INCOME: {
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        icon: FiHome,
        gradient: 'from-orange-500 to-orange-600',
      },
      PROPERTY_APPRECIATION: {
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        icon: FiTrendingUp,
        gradient: 'from-emerald-500 to-emerald-600',
      },
      RANK_BONUS: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: FiAward,
        gradient: 'from-yellow-500 to-yellow-600',
      },
      LEADERSHIP_BONUS: {
        color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        icon: FiStar,
        gradient: 'from-pink-500 to-pink-600',
      },
    };
    return configs[type] || configs.DIRECT_REFERRAL;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: FiClock,
        label: 'Pending',
        dotColor: 'bg-yellow-500',
      },
      APPROVED: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: FiCheckCircle,
        label: 'Approved',
        dotColor: 'bg-blue-500',
      },
      PAID: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: FiCheckCircle,
        label: 'Paid',
        dotColor: 'bg-green-500',
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: FiXCircle,
        label: 'Rejected',
        dotColor: 'bg-red-500',
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCommissionType = (type: CommissionType) => {
    return type.replace(/_/g, ' ');
  };

  const typeConfig = getCommissionTypeConfig(commission.commissionType);
  const statusConfig = getStatusConfig(commission.status);
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 ${className}`}>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-2/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-1/2" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md
          transition-all duration-200 cursor-pointer border-l-4 ${className}`}
        style={{ borderColor: typeConfig.gradient.split(' ')[0].replace('from-', '') }}
        onClick={() => onView?.(commission.id)}
        whileHover={{ x: 4 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
              <TypeIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {formatCommissionType(commission.commissionType)}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {commission.description}
              </p>
            </div>
          </div>
          <div className="text-right ml-3">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(commission.commissionAmount)}
            </p>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
          <div className="flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {formatDate(commission.date)}
          </div>
          {commission.fromUser && (
            <div className="flex items-center">
              <FiUser className="w-3 h-3 mr-1" />
              {commission.fromUser.name}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
        transition-all duration-300 overflow-hidden ${className}`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Gradient */}
      <div className={`h-2 bg-gradient-to-r ${typeConfig.gradient}`} />

      <div className="p-5">
        {/* Commission Type and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-3 rounded-xl ${typeConfig.color}`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {formatCommissionType(commission.commissionType)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {commission.commissionId}
              </p>
            </div>
          </div>
          <div className="ml-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${statusConfig.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {commission.description}
          </p>
        </div>

        {/* Amount Section */}
        <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Commission Amount
            </span>
            {commission.percentage && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {commission.percentage}% of {formatCurrency(commission.baseAmount)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(commission.commissionAmount)}
            </span>
          </div>
          {commission.bv && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Business Volume: {commission.bv.toLocaleString()} BV
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
            <div className="flex items-center text-gray-900 dark:text-white">
              <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm font-semibold">{formatDate(commission.date)}</span>
            </div>
          </div>
          {commission.fromUser && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From</p>
              <div className="flex items-center text-gray-900 dark:text-white">
                <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm font-semibold truncate">{commission.fromUser.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Property Info (if applicable) */}
        {commission.property && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center text-blue-900 dark:text-blue-200">
              <FiHome className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Property: {commission.property.title}
              </span>
            </div>
          </div>
        )}

        {/* Calculation Details */}
        {commission.calculation && (
          <div className="mb-4">
            <button
              className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-left
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                group"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle calculation details visibility
                const details = e.currentTarget.nextElementSibling;
                if (details) {
                  details.classList.toggle('hidden');
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiInfo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Calculation Details
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform group-hover:text-gray-700 dark:group-hover:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <div className="hidden mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Base Amount:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(commission.calculation.baseAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {commission.calculation.rate}%
                </span>
              </div>
              {commission.calculation.level && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Level:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Level {commission.calculation.level}
                  </span>
                </div>
              )}
              {commission.calculation.cappingApplied && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <FiAlertCircle className="inline w-3 h-3 mr-1" />
                    Capping applied
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                {commission.calculation.details}
              </p>
            </div>
          </div>
        )}

        {/* Payment Info (if paid) */}
        {commission.status === 'PAID' && commission.paymentInfo && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                Payment Details
              </span>
              <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1 text-xs text-green-800 dark:text-green-300">
              <p>Wallet: {commission.paymentInfo.walletType}</p>
              <p>Transaction ID: {commission.paymentInfo.transactionId}</p>
              <p>Paid on: {formatDate(commission.paymentInfo.paidDate)}</p>
            </div>
          </div>
        )}

        {/* View Details Button */}
        {onView && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onView(commission.id);
            }}
            className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
              text-gray-900 dark:text-white font-semibold rounded-lg transition-colors duration-200
              flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Full Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default CommissionCard;
