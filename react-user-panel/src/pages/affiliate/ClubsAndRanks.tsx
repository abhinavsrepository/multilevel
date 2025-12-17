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
    LinearProgress,
    Grid,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/config/axiosConfig';

interface ClubProgress {
    group1: number;
    group2: number;
    group3: number;
}

interface RankRequirement {
    name: string;
    businessRequired: string;
    reward: string;
    color: string;
}

const RANKS: RankRequirement[] = [
    { name: 'Associate', businessRequired: '0', reward: '-', color: 'default' },
    { name: 'Manager', businessRequired: '10 Lakh', reward: 'Recognition', color: 'primary' },
    { name: 'Area Manager', businessRequired: '50 Lakh', reward: 'Bullet Bike', color: 'secondary' },
    { name: 'Zonal Head', businessRequired: '3 Crore', reward: 'Car', color: 'info' },
    { name: 'Director', businessRequired: '10 Crore', reward: 'Fortuner', color: 'warning' },
];

const CLUBS = [
    { name: 'Silver', target: 5000000, label: '50 Lakhs' },
    { name: 'Gold', target: 20000000, label: '2 Crores' },
    { name: 'Diamond', target: 50000000, label: '5 Crores' },
];

const ClubsAndRanks: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clubProgress, setClubProgress] = useState<ClubProgress>({ group1: 0, group2: 0, group3: 0 });
    const [currentRank, setCurrentRank] = useState('Associate');
    const [clubStatus, setClubStatus] = useState('NONE');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/user/dashboard');
                if (response.data.success) {
                    const userData = response.data.data.user;
                    setClubProgress(userData.clubProgress || { group1: 0, group2: 0, group3: 0 });
                    setCurrentRank(userData.rank);
                    setClubStatus(userData.clubStatus);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch club and rank data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Determine next club target
    const getNextClubTarget = () => {
        if (clubStatus === 'DIAMOND') return CLUBS[2];
        if (clubStatus === 'GOLD') return CLUBS[2];
        if (clubStatus === 'SILVER') return CLUBS[1];
        return CLUBS[0];
    };

    const target = getNextClubTarget();

    const calculateProgress = (value: number, total: number) => {
        return Math.min((value / total) * 100, 100);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Clubs & Ranks
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track your journey to the top. Unlock exclusive rewards and royalties.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Club Status Tracker */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            Club Qualification Tracker ({target.name} Club Target: {target.label})
                        </Typography>
                        <Chip
                            label={`Current Status: ${clubStatus}`}
                            color={clubStatus !== 'NONE' ? 'success' : 'default'}
                        />
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Group 1 (40%)</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={calculateProgress(clubProgress.group1, target.target * 0.4)}
                                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                                color="primary"
                            />
                            <Typography variant="caption" color="text.secondary">
                                ₹{clubProgress.group1.toLocaleString()} / ₹{(target.target * 0.4).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Group 2 (40%)</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={calculateProgress(clubProgress.group2, target.target * 0.4)}
                                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                                color="info"
                            />
                            <Typography variant="caption" color="text.secondary">
                                ₹{clubProgress.group2.toLocaleString()} / ₹{(target.target * 0.4).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Group 3 (20%)</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={calculateProgress(clubProgress.group3, target.target * 0.2)}
                                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                                color="secondary"
                            />
                            <Typography variant="caption" color="text.secondary">
                                ₹{clubProgress.group3.toLocaleString()} / ₹{(target.target * 0.2).toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            * Qualification requires 40:40:20 ratio contribution from your top 3 groups.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Ranks & Rewards Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ranks & Rewards
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>Business Requirement</TableCell>
                                    <TableCell>Reward</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {RANKS.map((rank) => (
                                    <TableRow
                                        key={rank.name}
                                        selected={currentRank === rank.name}
                                        sx={{
                                            bgcolor: currentRank === rank.name ? 'action.selected' : 'inherit',
                                            '&.Mui-selected': { bgcolor: 'rgba(25, 118, 210, 0.08)' }
                                        }}
                                    >
                                        <TableCell>
                                            <Typography fontWeight="bold" color={rank.name === currentRank ? 'primary' : 'text.primary'}>
                                                {rank.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{rank.businessRequired}</TableCell>
                                        <TableCell>{rank.reward}</TableCell>
                                        <TableCell>
                                            {currentRank === rank.name ? (
                                                <Chip label="Current Rank" color="primary" size="small" />
                                            ) : (
                                                <Chip label="Locked" variant="outlined" size="small" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default ClubsAndRanks;
