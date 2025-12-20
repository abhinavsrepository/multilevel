import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiUser, FiPhone, FiCalendar, FiMapPin } from 'react-icons/fi';
import { InputField } from '../../components/forms/InputField';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getUserProfile, updateUserProfile } from '../../api/user.api';
import { User } from '../../types';
import { toast } from 'react-toastify';

// Validation Schema
const profileSchema = yup.object().shape({
    fullName: yup.string().required('Full name is required'),
    mobile: yup
        .string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    dateOfBirth: yup.string().nullable(),
    gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER'], 'Invalid gender').nullable(),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    pincode: yup
        .string()
        .required('Pincode is required')
        .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: yupResolver(profileSchema),
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            const user = response.data;

            if (user) {
                reset({
                    fullName: user.fullName,
                    mobile: user.mobile,
                    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: user.gender as 'MALE' | 'FEMALE' | 'OTHER' | null | undefined,
                    address: user.address || '',
                    city: user.city || '',
                    state: user.state || '',
                    country: user.country || '',
                    pincode: user.pincode || '',
                });
            } else {
                toast.error('Failed to load profile data');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        try {
            setSubmitting(true);

            // Sanitize data to match User type (remove nulls)
            const updatePayload: Partial<User> = {
                ...data,
                dateOfBirth: data.dateOfBirth || undefined,
                gender: (data.gender as 'MALE' | 'FEMALE' | 'OTHER') || undefined,
            };

            await updateUserProfile(updatePayload);
            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            
                <LoadingSpinner />
            
        );
    }

    return (
        
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Edit Personal Information
                        </h2>
                        <button
                            onClick={() => navigate('/profile')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        {/* Personal Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiUser className="w-5 h-5" />
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    name="fullName"
                                    control={control}
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    startIcon={<FiUser className="text-gray-400" />}
                                />
                                <InputField
                                    name="mobile"
                                    control={control}
                                    label="Mobile Number"
                                    placeholder="Enter your mobile number"
                                    startIcon={<FiPhone className="text-gray-400" />}
                                />
                                <InputField
                                    name="dateOfBirth"
                                    control={control}
                                    label="Date of Birth"
                                    type="date"
                                    startIcon={<FiCalendar className="text-gray-400" />}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Gender
                                    </label>
                                    <div className="relative">
                                        <select
                                            {...control.register('gender')}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.gender && (
                                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiMapPin className="w-5 h-5" />
                                Address Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputField
                                        name="address"
                                        control={control}
                                        label="Street Address"
                                        placeholder="Enter your street address"
                                        startIcon={<FiMapPin className="text-gray-400" />}
                                    />
                                </div>
                                <InputField
                                    name="city"
                                    control={control}
                                    label="City"
                                    placeholder="Enter city"
                                />
                                <InputField
                                    name="state"
                                    control={control}
                                    label="State"
                                    placeholder="Enter state"
                                />
                                <InputField
                                    name="country"
                                    control={control}
                                    label="Country"
                                    placeholder="Enter country"
                                />
                                <InputField
                                    name="pincode"
                                    control={control}
                                    label="Pincode"
                                    placeholder="Enter pincode"
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <LoadingSpinner size="small" color="white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        
    );
};

export default EditProfile;
