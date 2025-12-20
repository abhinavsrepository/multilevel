import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../api/config/axiosConfig';

interface Commission {
    id: number;
    amount: string;
    baseAmount: string;
    percentage: string;
    createdAt: string;
    status: string;
    fromUser: {
        username: string;
        firstName: string;
        lastName: string;
    };
}

const ReferralBonus: React.FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommissions = async () => {
            try {
                const response = await api.get('/commissions/type/DIRECT_REFERRAL');
                if (response.data.success) {
                    setCommissions(response.data.data.content);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError('Error fetching referral bonus data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommissions();
    }, []);

    if (loading) {
        return (
            
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            
        );
    }

    return (
        
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Direct Referral Bonus
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Earn 5% on every direct referral booking.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Referral</TableCell>
                                    <TableCell>Booking Amount</TableCell>
                                    <TableCell>Percentage</TableCell>
                                    <TableCell>Commission Earned</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {commissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No referral bonuses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    commissions.map((comm) => (
                                        <TableRow key={comm.id} hover>
                                            <TableCell>{format(new Date(comm.createdAt), 'dd MMM yyyy')}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {comm.fromUser?.firstName} {comm.fromUser?.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    @{comm.fromUser?.username}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>₹{parseFloat(comm.baseAmount).toLocaleString()}</TableCell>
                                            <TableCell>{comm.percentage}%</TableCell>
                                            <TableCell>
                                                <Typography color="success.main" fontWeight="bold">
                                                    ₹{parseFloat(comm.amount).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={comm.status}
                                                    color={comm.status === 'EARNED' || comm.status === 'PAID' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        
    );
};

export default ReferralBonus;
