import React from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiSend,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiCreditCard,
} from 'react-icons/fi';

interface WalletCardProps {
  walletType: 'COMMISSION' | 'INVESTMENT' | 'RENTAL' | 'ROI';
  balance: number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  onAddMoney?: () => void;
  onWithdraw?: () => void;
  onTransfer?: () => void;
  onViewTransactions?: () => void;
  showBalance?: boolean;
  onToggleBalance?: () => void;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  stats?: {
    thisMonth?: number;
    lastMonth?: number;
    totalTransactions?: number;
  };
}

const WalletCard: React.FC<WalletCardProps> = ({
  walletType,
  balance,
  label,
  icon: Icon = FiDollarSign,
  color = 'blue',
  onAddMoney,
  onWithdraw,
  onTransfer,
  onViewTransactions,
  showBalance = true,
  onToggleBalance,
  loading = false,
  className = '',
  variant = 'default',
  stats,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-500',
        light: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-600',
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-500',
        light: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-600',
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-500',
        light: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-600',
      },
      orange: {
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-500',
        light: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:bg-orange-600',
      },
      pink: {
        gradient: 'from-pink-500 to-pink-600',
        bg: 'bg-pink-500',
        light: 'bg-pink-100 dark:bg-pink-900/30',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-200 dark:border-pink-800',
        hover: 'hover:bg-pink-600',
      },
    };
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 ${className}`}>
        <div className="space-y-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded-full" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-1/2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-3/4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md
          transition-all duration-200 ${className}`}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${colorClasses.light}`}>
              <Icon className={`w-5 h-5 ${colorClasses.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {showBalance ? formatCurrency(balance) : '••••••'}
              </p>
            </div>
          </div>
          {onToggleBalance && (
            <button
              onClick={onToggleBalance}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <FiEye className="w-4 h-4 text-gray-500" />
              ) : (
                <FiEyeOff className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        className={`bg-gradient-to-br ${colorClasses.gradient} rounded-xl shadow-lg p-6 text-white ${className}`}
        whileHover={{ y: -4, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{label}</h3>
              <p className="text-sm text-white/80">{walletType} Wallet</p>
            </div>
          </div>
          {onToggleBalance && (
            <button
              onClick={onToggleBalance}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-sm text-white/80 mb-1">Available Balance</p>
          <p className="text-4xl font-bold tracking-tight">
            {showBalance ? formatCurrency(balance) : '•••••••'}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/20">
            <div>
              <p className="text-xs text-white/70 mb-1">This Month</p>
              <p className="text-lg font-semibold">
                {showBalance && stats.thisMonth !== undefined
                  ? formatCurrency(stats.thisMonth)
                  : '••••'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Last Month</p>
              <p className="text-lg font-semibold">
                {showBalance && stats.lastMonth !== undefined
                  ? formatCurrency(stats.lastMonth)
                  : '••••'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Transactions</p>
              <p className="text-lg font-semibold">{stats.totalTransactions || 0}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {onAddMoney && (
            <button
              onClick={onAddMoney}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm
                rounded-lg font-medium transition-all duration-200 flex items-center
                justify-center gap-2"
            >
              <FiArrowDownLeft className="w-4 h-4" />
              Add Money
            </button>
          )}
          {onWithdraw && (
            <button
              onClick={onWithdraw}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm
                rounded-lg font-medium transition-all duration-200 flex items-center
                justify-center gap-2"
            >
              <FiArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          )}
          {onTransfer && (
            <button
              onClick={onTransfer}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm
                rounded-lg font-medium transition-all duration-200 flex items-center
                justify-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              Transfer
            </button>
          )}
          {onViewTransactions && (
            <button
              onClick={onViewTransactions}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm
                rounded-lg font-medium transition-all duration-200 flex items-center
                justify-center gap-2"
            >
              <FiCreditCard className="w-4 h-4" />
              History
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
        transition-all duration-300 overflow-hidden ${className}`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${colorClasses.gradient}`} />

      <div className="p-5">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colorClasses.light}`}>
              <Icon className={`w-6 h-6 ${colorClasses.text}`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">{walletType} Wallet</p>
            </div>
          </div>
          {onToggleBalance && (
            <button
              onClick={onToggleBalance}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <FiEye className="w-4 h-4 text-gray-500" />
              ) : (
                <FiEyeOff className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {showBalance ? formatCurrency(balance) : '••••••••'}
          </p>
          {stats?.thisMonth !== undefined && showBalance && (
            <div className="flex items-center gap-1 mt-2">
              <FiTrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                +{formatCurrency(stats.thisMonth)} this month
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          {onAddMoney && (
            <motion.button
              onClick={onAddMoney}
              className={`w-full py-2.5 ${colorClasses.bg} ${colorClasses.hover} text-white
                font-semibold rounded-lg transition-colors duration-200 flex items-center
                justify-center gap-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiArrowDownLeft className="w-4 h-4" />
              Add Money
            </motion.button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {onWithdraw && (
              <motion.button
                onClick={onWithdraw}
                className="py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200
                  dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium
                  rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload className="w-4 h-4" />
                Withdraw
              </motion.button>
            )}
            {onTransfer && (
              <motion.button
                onClick={onTransfer}
                className="py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200
                  dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium
                  rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSend className="w-4 h-4" />
                Transfer
              </motion.button>
            )}
          </div>
          {onViewTransactions && (
            <button
              onClick={onViewTransactions}
              className={`w-full py-2 text-sm font-medium ${colorClasses.text}
                hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors
                duration-200 flex items-center justify-center gap-2`}
            >
              <FiCreditCard className="w-4 h-4" />
              View All Transactions
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WalletCard;
