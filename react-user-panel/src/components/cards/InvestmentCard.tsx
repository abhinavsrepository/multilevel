import React from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
} from 'react-icons/fi';
import { Investment } from '../../types';

interface InvestmentCardProps {
  investment: Investment;
  onView?: (investmentId: number) => void;
  onDownloadCertificate?: (investmentId: number) => void;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onView,
  onDownloadCertificate,
  loading = false,
  className = '',
  variant = 'default',
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: FiCheckCircle,
        label: 'Active',
      },
      COMPLETED: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: FiCheckCircle,
        label: 'Completed',
      },
      MATURED: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        icon: FiCheckCircle,
        label: 'Matured',
      },
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: FiClock,
        label: 'Pending',
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: FiAlertCircle,
        label: 'Cancelled',
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

  const calculateAppreciation = () => {
    const appreciation = investment.currentValue - investment.investmentAmount;
    const percentage = (appreciation / investment.investmentAmount) * 100;
    return { appreciation, percentage };
  };

  const statusConfig = getStatusConfig(investment.status);
  const StatusIcon = statusConfig.icon;
  const { appreciation, percentage } = calculateAppreciation();

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 ${className}`}>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-1/2" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md
          transition-all duration-200 cursor-pointer ${className}`}
        onClick={() => onView?.(investment.id)}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start gap-3">
          <img
            src={investment.property.image}
            alt={investment.property.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1">
              {investment.property.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {investment.property.location}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Invested</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(investment.investmentAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Returns</p>
                <p className={`text-sm font-bold ${percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
        transition-all duration-300 overflow-hidden group ${className}`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Property Image Header */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={investment.property.image}
          alt={investment.property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5
              ${statusConfig.color}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
        </div>

        {/* Property Type */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs font-semibold rounded-full">
            {investment.property.propertyType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Investment ID */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {investment.property.title}
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              ID: {investment.investmentId}
            </span>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FiCalendar className="w-3.5 h-3.5 mr-1" />
              {formatDate(investment.investmentDate)}
            </div>
          </div>
        </div>

        {/* Investment Amount and Current Value */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Invested Amount</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(investment.investmentAmount)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {investment.bvAllocated.toLocaleString()} BV
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(investment.currentValue)}
            </p>
            <div className="flex items-center mt-1">
              <FiTrendingUp className="w-3 h-3 text-green-600 dark:text-green-400 mr-1" />
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                +{formatCurrency(appreciation)} ({percentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Returns Breakdown */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Returns Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Capital Appreciation</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(appreciation)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">ROI Earned</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(investment.roiEarned)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Rental Income</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(investment.rentalIncomeEarned)}
              </span>
            </div>
            <div className="h-px bg-gray-300 dark:bg-gray-600 my-2" />
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-900 dark:text-white">Total Returns</span>
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(investment.totalReturns)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Return Rate</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {investment.returnPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Installment Info (if applicable) */}
        {investment.investmentType === 'INSTALLMENT' && investment.installmentPlan && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                Installment Plan
              </span>
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                {investment.installmentPlan.paidInstallments}/{investment.installmentPlan.totalInstallments} Paid
              </span>
            </div>
            <div className="h-1.5 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-yellow-500 dark:bg-yellow-400 rounded-full transition-all duration-500"
                style={{
                  width: `${(investment.installmentPlan.paidInstallments / investment.installmentPlan.totalInstallments) * 100}%`,
                }}
              />
            </div>
            {investment.installmentPlan.nextDueDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-700 dark:text-yellow-300">Next Due</span>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {formatDate(investment.installmentPlan.nextDueDate)} - {formatCurrency(investment.installmentPlan.nextDueAmount || 0)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lock-in Period (if applicable) */}
        {investment.lockInEndDate && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <FiClock className="w-4 h-4 flex-shrink-0" />
            <span>Lock-in ends: {formatDate(investment.lockInEndDate)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => onView?.(investment.id)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold
              rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
              group/btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
            <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
          {onDownloadCertificate && investment.status === 'ACTIVE' && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadCertificate(investment.id);
              }}
              className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 dark:text-blue-400
                hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold rounded-lg
                transition-colors duration-200 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Download Certificate"
            >
              <FiDownload className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InvestmentCard;
