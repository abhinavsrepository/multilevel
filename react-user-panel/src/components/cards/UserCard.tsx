import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowRight,
} from 'react-icons/fi';
import { TeamMember } from '../../types';

interface UserCardProps {
  user: TeamMember;
  onView?: (userId: number) => void;
  onMessage?: (userId: number) => void;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onView,
  onMessage,
  loading = false,
  className = '',
  variant = 'default',
  showActions = true,
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: FiCheckCircle,
        label: 'Active',
        dotColor: 'bg-green-500',
      },
      INACTIVE: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        icon: FiXCircle,
        label: 'Inactive',
        dotColor: 'bg-gray-500',
      },
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: FiClock,
        label: 'Pending',
        dotColor: 'bg-yellow-500',
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

  const getInitials = (name: string | undefined | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const statusConfig = getStatusConfig(user.status);
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded-full" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded w-1/2" />
            </div>
          </div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md
          transition-all duration-200 cursor-pointer ${className}`}
        onClick={() => onView?.(user.id)}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {getInitials(user.fullName)}
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusConfig.dotColor} rounded-full border-2 border-white dark:border-gray-800`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {user.fullName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.userId}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {user.rank && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {user.rank.name}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Team Size</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{user.teamSize}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
          transition-all duration-300 overflow-hidden ${className}`}
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with gradient background */}
        <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-black/10" />
          {user.placement && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                {user.placement} Leg
              </span>
            </div>
          )}
        </div>

        <div className="p-5 pt-0">
          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            <div className="relative">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                  {getInitials(user.fullName)}
                </div>
              )}
              <div className={`absolute bottom-1 right-1 w-5 h-5 ${statusConfig.dotColor} rounded-full border-3 border-white dark:border-gray-800`} />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {user.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.userId}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConfig.label}
              </span>
              {user.rank && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold rounded-full">
                  <FiAward className="w-3.5 h-3.5" />
                  {user.rank.name}
                </span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiMail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiPhone className="w-4 h-4 flex-shrink-0" />
              <span>{user.mobile}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiCalendar className="w-4 h-4 flex-shrink-0" />
              <span>Joined {formatDate(user.joiningDate)}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FiDollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Investment</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(user.totalInvestment)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FiUsers className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Team Size</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{user.teamSize}</p>
            </div>
          </div>

          {/* BV Stats */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Business Volume
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Personal BV</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.bv?.personal?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Left Leg BV</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {user.bv?.left?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Right Leg BV</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {user.bv?.right?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="h-px bg-gray-300 dark:bg-gray-600 my-2" />
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-gray-900 dark:text-white">Total BV</span>
                <span className="text-green-600 dark:text-green-400">
                  {user.bv?.total?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Leg Distribution */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Leg Distribution</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {user.leftLeg + user.rightLeg} total
              </span>
            </div>
            <div className="flex gap-2 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(user.leftLeg / (user.leftLeg + user.rightLeg)) * 100}%` }}
              />
              <div
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${(user.rightLeg / (user.leftLeg + user.rightLeg)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Left: {user.leftLeg}
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Right: {user.rightLeg}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {onView && (
                <motion.button
                  onClick={() => onView(user.id)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                    rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Profile
                  <FiArrowRight className="w-4 h-4" />
                </motion.button>
              )}
              {onMessage && (
                <motion.button
                  onClick={() => onMessage(user.id)}
                  className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 dark:text-blue-400
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold rounded-lg
                    transition-colors duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="Send Message"
                >
                  <FiMail className="w-4 h-4" />
                </motion.button>
              )}
            </div>
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
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {getInitials(user.fullName)}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusConfig.dotColor} rounded-full border-2 border-white dark:border-gray-800`} />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1">
              {user.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.userId}</p>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {user.rank && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold rounded-full">
                  <FiAward className="w-3 h-3" />
                  {user.rank.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Investment</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(user.totalInvestment)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Team Size</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.teamSize}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total BV</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {user.bv?.total?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiMail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiPhone className="w-4 h-4 flex-shrink-0" />
            <span>{user.mobile}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {onView && (
              <motion.button
                onClick={() => onView(user.id)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                  rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Details
              </motion.button>
            )}
            {onMessage && (
              <motion.button
                onClick={() => onMessage(user.id)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700
                  dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg
                  transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiMail className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserCard;
