import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DashboardLayout } from '@/layouts';
import ReferralRegistrationForm from '@/components/referral/ReferralRegistrationForm';

const ReferralRegistration: React.FC = () => {
    return (
        <DashboardLayout title="Direct Registration">
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Direct Registration
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Register a new member directly under your downline
                    </Typography>
                </Box>

                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <ReferralRegistrationForm />
                </Paper>
            </Box>
        </DashboardLayout>
    );
};

export default ReferralRegistration;
