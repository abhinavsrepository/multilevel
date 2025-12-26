import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,

    CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getPackages, createTopup, Package } from '../../api/topup.api';
import { useAuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';


const NewTopup: React.FC = () => {
    const { user } = useAuthContext();

    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPackages = async () => {
            try {
                console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
                const res = await getPackages();
                if (res.success && res.data) {
                    setPackages(res.data);
                }
            } catch (error: any) {
                console.error('Packages Load Error:', error);
                if (error.config) {
                    console.error('Failed URL:', error.config.baseURL, error.config.url);
                }
            }
        };
        loadPackages();
    }, []);

    const formik = useFormik({
        initialValues: {
            packageId: '',
        },
        validationSchema: Yup.object({
            packageId: Yup.string().required('Package is required'),
        }),
        onSubmit: async (values) => {
            if (!user) return;
            setLoading(true);
            try {
                // User Panel defaulting to self-topup. 
                // If the API requires userId, we pass the current user's ID.
                const res = await createTopup({
                    userId: user.id,
                    packageId: parseInt(values.packageId)
                });

                if (res.success) {
                    toast.success('Topup successful');
                    formik.resetForm();
                } else {
                    toast.error(res.message || 'Topup failed');
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Topup failed');
            } finally {
                setLoading(false);
            }
        }
    });

    const selectedPackage = packages.find(p => p.id.toString() === formik.values.packageId);

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>New Topup</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="User ID"
                                            value={user?.userId || ''}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            value={user?.fullName || ''}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Package</InputLabel>
                                            <Select
                                                name="packageId"
                                                value={formik.values.packageId}
                                                label="Package"
                                                onChange={formik.handleChange}
                                            >
                                                {packages.map((pkg) => (
                                                    <MenuItem key={pkg.id} value={pkg.id}>
                                                        {pkg.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Available Fund"
                                            // Assuming user object has wallet balance or fetched elsewhere. 
                                            // For now static or from user context if available.
                                            value={'0.00'}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Paid Amount"
                                            value={selectedPackage?.amount || ''}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={loading}
                                            startIcon={loading && <CircularProgress size={20} />}
                                        >
                                            {loading ? 'Processing...' : 'Pay Now'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NewTopup;
