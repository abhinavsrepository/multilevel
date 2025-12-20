import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiShare2,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiAward,
  FiCalendar,
  FiArrowLeft,
} from 'react-icons/fi';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { User } from '../../types';
import { getUserProfile } from '../../api/user.api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DigitalIDCard: React.FC = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFront, setShowFront] = useState<boolean>(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setUser(response.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || !user) return;

    try {
      setDownloading(true);

      // Capture front side
      const frontCanvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Switch to back side
      setShowFront(false);

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture back side
      const backCanvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Switch back to front
      setShowFront(true);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98], // Standard credit card size
      });

      // Add front side
      const frontImgData = frontCanvas.toDataURL('image/png');
      pdf.addImage(frontImgData, 'PNG', 0, 0, 85.6, 53.98);

      // Add new page for back side
      pdf.addPage();
      const backImgData = backCanvas.toDataURL('image/png');
      pdf.addImage(backImgData, 'PNG', 0, 0, 85.6, 53.98);

      // Download PDF
      pdf.save(`${user.userId}_ID_Card.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to download ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || !user) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${user.userId}_ID_Card_${showFront ? 'Front' : 'Back'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Failed to download ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || !user) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `${user.userId}_ID_Card.png`, {
          type: 'image/png',
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My MLM ID Card',
              text: `Check out my MLM ID Card - ${user.fullName}`,
              files: [file],
            });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Error sharing:', err);
              alert('Failed to share ID card');
            }
          }
        } else {
          // Fallback: Copy to clipboard
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              }),
            ]);
            alert('ID card image copied to clipboard!');
          } catch (err) {
            console.error('Error copying to clipboard:', err);
            alert('Sharing not supported. Please use download instead.');
          }
        }
      });
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Failed to share ID card');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box>
        <LoadingSpinner />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box>
        <EmptyState
          title="Failed to load ID card"
          message={error || 'Please try again later'}
          icon={<FiUser className="w-16 h-16" />}
        />
      </Box>
    );
  }

  return (
    <Box>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Profile</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download PNG'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <FiShare2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Card Preview */}
        <div className="flex flex-col items-center gap-4">
          {/* Flip Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFront(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${showFront
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              Front
            </button>
            <button
              onClick={() => setShowFront(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${!showFront
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              Back
            </button>
          </div>

          {/* ID Card */}
          <motion.div
            ref={cardRef}
            className="relative"
            style={{
              width: '856px',
              height: '540px',
              transformStyle: 'preserve-3d',
            }}
            animate={{ rotateY: showFront ? 0 : 180 }}
            transition={{ duration: 0.6 }}
          >
            {showFront ? (
              // Front Side
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl shadow-2xl p-8 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-1">MLM Real Estate</h1>
                      <p className="text-blue-100 text-lg">Member ID Card</p>
                    </div>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-10 h-10 text-blue-600" />
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Member Name</p>
                      <p className="text-2xl font-bold">{user.fullName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Member ID</p>
                        <p className="text-xl font-semibold">{user.userId}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Rank</p>
                        <p className="text-xl font-semibold flex items-center gap-2">
                          <FiAward className="w-5 h-5" />
                          {user.rank.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-400">
                    <div className="flex items-center gap-2 text-sm">
                      <FiCalendar className="w-4 h-4" />
                      <span>Member Since: {formatDate(user.memberSince)}</span>
                    </div>
                    <div className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      {user.kycStatus}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Back Side
              <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-blue-700 to-blue-600 rounded-3xl shadow-2xl p-8 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -ml-32 -mt-32" />
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full -mr-24 -mb-24" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between">
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Contact Information</h2>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <FiMail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-blue-100 text-sm">Email</p>
                          <p className="font-semibold">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <FiPhone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-blue-100 text-sm">Mobile</p>
                          <p className="font-semibold">{user.mobile}</p>
                        </div>
                      </div>

                      {user.address && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-1">
                            <FiMapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-blue-100 text-sm">Address</p>
                            <p className="font-semibold">
                              {user.city && user.state
                                ? `${user.city}, ${user.state} - ${user.pincode}`
                                : 'Not provided'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sponsor Info */}
                  {user.sponsorName && (
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <p className="text-blue-100 text-sm mb-2">Sponsored By</p>
                      <p className="text-lg font-bold">
                        {user.sponsorName} ({user.sponsorId})
                      </p>
                    </div>
                  )}

                  {/* QR Code Placeholder & Footer */}
                  <div className="flex items-end justify-between">
                    <div className="w-24 h-24 bg-white rounded-lg p-2">
                      <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center text-xs text-white">
                        QR CODE
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-blue-100">This card is the property of</p>
                      <p className="font-bold text-lg">MLM Real Estate</p>
                      <p className="text-blue-100 mt-1">www.mlmrealestate.com</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to use your Digital ID Card
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Download as PNG for digital use or sharing on social media</li>
              <li>• Download as PDF for printing both sides of the ID card</li>
              <li>• Use the Share button to send directly to others</li>
              <li>• Toggle between Front and Back views to see all information</li>
              <li>• Keep your digital ID card handy for verification purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default DigitalIDCard;
