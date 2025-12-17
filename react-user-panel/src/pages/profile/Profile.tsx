import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiShield,
  FiCamera,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiClock,
  FiMonitor,
  FiLock,
  FiKey,
  FiToggleLeft,
  FiToggleRight,
  FiDownload,
  FiShare2,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import { ProfileEditModal } from '../../components/modals/ProfileEditModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  User,
  UserStats,
  BankAccount,
  KYCDocument,
  Session,
  LoginHistory,
} from '../../types';
import {
  getUserProfile,
  getUserStats,
  getBankAccounts,
  getKYCStatus,
  getActiveSessions,
  getLoginHistory,
  uploadProfilePicture,
  uploadCoverPhoto,
} from '../../api/user.api';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { id: 'personal', label: 'Personal Info', icon: <FiUser className="w-4 h-4" /> },
  { id: 'mlm', label: 'MLM Info', icon: <FiUsers className="w-4 h-4" /> },
  { id: 'financial', label: 'Financial Summary', icon: <FiDollarSign className="w-4 h-4" /> },
  { id: 'bank', label: 'Bank Details', icon: <FiCreditCard className="w-4 h-4" /> },
  { id: 'kyc', label: 'KYC Status', icon: <FiFileText className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <FiShield className="w-4 h-4" /> },
];

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [uploadingPicture, setUploadingPicture] = useState<boolean>(false);
  const [uploadingCover, setUploadingCover] = useState<boolean>(false);

  // State for profile data
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        profileRes,
        statsRes,
        bankAccountsRes,
        kycRes,
        sessionsRes,
        loginHistoryRes,
      ] = await Promise.all([
        getUserProfile(),
        getUserStats(),
        getBankAccounts(),
        getKYCStatus(),
        getActiveSessions(),
        getLoginHistory({ page: 0, size: 5 }),
      ]);

      setUser(profileRes.data || null);
      setStats(statsRes.data || null);
      setBankAccounts(bankAccountsRes.data || []);
      setKycDocuments(kycRes.data?.documents || []);
      setSessions(sessionsRes.data || []);
      setLoginHistory(loginHistoryRes.data?.content || []);
      setTwoFactorEnabled(profileRes.data?.twoFactorEnabled || false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPicture(true);
      const response = await uploadProfilePicture(file);
      if (user && response.data) {
        setUser({ ...user, profilePicture: response.data.profilePicture });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const response = await uploadCoverPhoto(file);
      if (user && response.data) {
        setUser({ ...user, coverPhoto: response.data.coverPhoto });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleEditProfile = async (data: any) => {
    // Handle profile update
    await fetchProfileData();
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    const length = accountNumber.length;
    return `XXXX${accountNumber.substring(length - 4)}`;
  };

  const getKYCStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      VERIFIED: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
      PENDING: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
      REJECTED: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200',
      NOT_UPLOADED: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
      UPLOADED: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[status] || colors.NOT_UPLOADED;
  };

  const getKYCStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      VERIFIED: <FiCheck className="w-4 h-4" />,
      PENDING: <FiClock className="w-4 h-4" />,
      REJECTED: <FiX className="w-4 h-4" />,
      NOT_UPLOADED: <FiAlertCircle className="w-4 h-4" />,
      UPLOADED: <FiClock className="w-4 h-4" />,
    };
    return icons[status] || icons.NOT_UPLOADED;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout title="My Profile">
        <EmptyState
          title="Failed to load profile"
          message={error || 'Please try again later'}
          icon={<FiAlertCircle className="w-16 h-16" />}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        {/* Header Section with Cover Photo and Profile Picture */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Cover Photo */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
            {user.coverPhoto && (
              <img
                src={user.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            {uploadingCover && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <LoadingSpinner size="medium" />
              </div>
            )}
            <label
              htmlFor="cover-upload"
              className="absolute bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiCamera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoUpload}
                disabled={uploadingCover}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-xl">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {uploadingPicture && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <LoadingSpinner size="small" />
                    </div>
                  )}
                  <label
                    htmlFor="picture-upload"
                    className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <FiCamera className="w-4 h-4 text-white" />
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureUpload}
                      disabled={uploadingPicture}
                    />
                  </label>
                </div>

                <div className="md:mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {user.fullName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    User ID: {user.userId}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold flex items-center gap-1">
                      <FiAward className="w-4 h-4" />
                      {user.rank.name}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 md:mt-0 md:mb-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </button>
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
                  className={`flex-shrink-0 px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 border-b-2 ${activeTab === tab.id
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
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiUser className="w-4 h-4" />
                      Full Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiMail className="w-4 h-4" />
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                      {user.emailVerified && (
                        <span className="text-green-600" title="Verified">
                          <FiCheck className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiPhone className="w-4 h-4" />
                      Mobile
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 dark:text-white">{user.mobile}</p>
                      {user.mobileVerified && (
                        <span className="text-green-600" title="Verified">
                          <FiCheck className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiCalendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Gender
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {user.gender?.toLowerCase() || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiCalendar className="w-4 h-4" />
                      Member Since
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(user.memberSince)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiMapPin className="w-4 h-4" />
                      Address
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.address && user.city && user.state
                        ? `${user.address}, ${user.city}, ${user.state} - ${user.pincode}, ${user.country}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MLM Information Tab */}
            {activeTab === 'mlm' && stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  MLM Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      User ID
                    </label>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {user.userId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Sponsor
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.sponsorName || 'N/A'} ({user.sponsorId || 'N/A'})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiAward className="w-4 h-4" />
                      Current Rank
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.rank.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Level in Tree
                    </label>
                    <p className="text-gray-900 dark:text-white">Level {user.levelInTree}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <FiUsers className="w-4 h-4" />
                      Total Team Size
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.teamSize.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Direct Referrals
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.directReferrals}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Left Leg
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {stats.leftLeg.toLocaleString()} members
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Right Leg
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {stats.rightLeg.toLocaleString()} members
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Financial Summary Tab */}
            {activeTab === 'financial' && stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Financial Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                      <FiTrendingUp className="w-4 h-4" />
                      Total Investment
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.totalInvestment)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <label className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-2">
                      <FiActivity className="w-4 h-4" />
                      Portfolio Value
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.currentPortfolioValue)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-2">
                      <FiDollarSign className="w-4 h-4" />
                      Total Earnings
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.totalEarnings)}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <label className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2 block">
                      Available Balance
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.availableBalance)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <label className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 block">
                      Total Withdrawn
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.totalWithdrawn)}
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <label className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 block">
                      Today's Income
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.todayIncome)}
                    </p>
                  </div>
                </div>

                {/* Wallet Breakdown Table */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Wallet Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                            Wallet Type
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Main Wallet
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">
                            {formatCurrency(stats.availableBalance)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Commission Wallet
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">
                            {formatCurrency(stats.totalEarnings - stats.totalWithdrawn)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bank Details Tab */}
            {activeTab === 'bank' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bank Accounts
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                    Add Account
                  </button>
                </div>
                {bankAccounts.length > 0 ? (
                  <div className="space-y-4">
                    {bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {account.bankName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {account.accountHolderName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {account.isPrimary && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                                Primary
                              </span>
                            )}
                            {account.isVerified && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded flex items-center gap-1">
                                <FiCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-gray-600 dark:text-gray-400">
                              Account Number
                            </label>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {maskAccountNumber(account.accountNumber)}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600 dark:text-gray-400">IFSC Code</label>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {account.ifscCode}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600 dark:text-gray-400">
                              Account Type
                            </label>
                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                              {account.accountType.toLowerCase()}
                            </p>
                          </div>
                          {account.upiId && (
                            <div>
                              <label className="text-gray-600 dark:text-gray-400">UPI ID</label>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {account.upiId}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No bank accounts"
                    message="Add a bank account to receive payments"
                    icon={<FiCreditCard className="w-16 h-16" />}
                  />
                )}
              </motion.div>
            )}

            {/* KYC Status Tab */}
            {activeTab === 'kyc' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    KYC Documents
                  </h2>
                  <span
                    className={`px-4 py-2 rounded-lg font-semibold ${getKYCStatusColor(
                      user.kycStatus
                    )}`}
                  >
                    {user.kycStatus} - {user.kycLevel}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Document Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Document Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Uploaded Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {kycDocuments.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {doc.documentType.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {doc.documentNumber || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getKYCStatusColor(
                                doc.status
                              )}`}
                            >
                              {getKYCStatusIcon(doc.status)}
                              {doc.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {doc.uploadedDate ? formatDate(doc.uploadedDate) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {doc.status === 'NOT_UPLOADED' ? (
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                Upload
                              </button>
                            ) : (
                              <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-semibold">
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Security Settings
                </h2>

                {/* Last Login */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Recent Login Activity
                  </h3>
                  <div className="space-y-2">
                    {loginHistory.slice(0, 3).map((login) => (
                      <div
                        key={login.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FiMonitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {login.deviceName} - {login.browser}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {login.location || login.ipAddress} • {formatDateTime(login.loginDate)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${login.status === 'SUCCESS'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                        >
                          {login.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Sessions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Active Sessions
                  </h3>
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FiMonitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {session.deviceName} - {session.browser}
                              </p>
                              {session.isCurrent && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {session.location || session.ipAddress} • Last active:{' '}
                              {formatDateTime(session.lastActive)}
                            </p>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button className="text-red-600 hover:text-red-700 text-sm font-semibold">
                            Terminate
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Security Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <FiLock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Change Password
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Update your account password
                          </p>
                        </div>
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <FiKey className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Change Transaction PIN
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Update your transaction PIN
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiShield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className="flex items-center gap-2"
                    >
                      {twoFactorEnabled ? (
                        <FiToggleRight className="w-10 h-10 text-green-600" />
                      ) : (
                        <FiToggleLeft className="w-10 h-10 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.a
            href="/profile/digital-id"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Digital ID Card
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and download
              </p>
            </div>
          </motion.a>

          <motion.button
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FiDownload className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                Download Reports
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export your data
              </p>
            </div>
          </motion.button>

          <motion.button
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FiShare2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Share Profile
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share with others
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditProfile}
        currentData={{
          firstName: user.fullName.split(' ')[0],
          lastName: user.fullName.split(' ').slice(1).join(' '),
          email: user.email,
          phone: user.mobile,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
          gender: user.gender?.toLowerCase() || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          country: user.country || 'India',
        }}
      />
    </DashboardLayout>
  );
};

export default Profile;
