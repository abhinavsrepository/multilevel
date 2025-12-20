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
    Alert,
    CircularProgress,
} from '@mui/material';
import api from '../../api/config/axiosConfig';

interface LevelData {
    level: number;
    amount: number;
    count: number;
}

const LevelIncome: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [directReferrals, setDirectReferrals] = useState(0);
    const [levelData, setLevelData] = useState<LevelData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Dashboard Stats for Direct Referrals
                const dashboardRes = await api.get('/user/dashboard');
                if (dashboardRes.data.success) {
                    setDirectReferrals(dashboardRes.data.data.stats.directReferrals);
                }

                // Fetch Commission Summary for Level Breakdown
                const commissionRes = await api.get('/commissions/summary');
                if (commissionRes.data.success) {
                    const byType = commissionRes.data.data.byType;
                    const levels: LevelData[] = [];

                    // Initialize levels 1-10
                    for (let i = 1; i <= 10; i++) {
                        levels.push({ level: i, amount: 0, count: 0 });
                    }

                    byType.forEach((item: any) => {
                        if (item.type.startsWith('LEVEL_')) {
                            const levelNum = parseInt(item.type.split('_')[1]);
                            if (!isNaN(levelNum) && levelNum >= 1 && levelNum <= 10) {
                                levels[levelNum - 1].amount = item.totalEarned;
                                levels[levelNum - 1].count = item.count;
                            }
                        }
                    });
                    setLevelData(levels);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch level income data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate unlock progress
    // 3 Directs = 5 Levels
    // 5 Directs = 10 Levels
    const getUnlockStatus = () => {
        if (directReferrals >= 5) return { unlocked: 10, nextTarget: 5, progress: 100 };
        if (directReferrals >= 3) return { unlocked: 5, nextTarget: 5, progress: (directReferrals / 5) * 100 };
        return { unlocked: 2, nextTarget: 3, progress: (directReferrals / 3) * 100 }; // Assuming 1-2 directs unlock L1-L2
    };

    const { unlocked, nextTarget, progress } = getUnlockStatus();

    if (loading) {
        return (
      <Box>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            
        );
    }

    return (
      <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Level Income
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Earn commissions from your team's sales up to 10 levels deep.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Progress Section */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Level Unlock Progress
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                You have <strong>{directReferrals}</strong> Direct Referrals.
                                {directReferrals < 5 ? ` Reach ${nextTarget} directs to unlock Level ${nextTarget === 3 ? 5 : 10}.` : ' You have unlocked all levels!'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {unlocked}
                                </Typography>
                                <Typography variant="subtitle2">Levels Unlocked</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Breakdown Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Income Breakdown
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Commission %</TableCell>
                                    <TableCell>Total Earnings</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {levelData.map((row) => (
                                    <TableRow key={row.level} hover>
                                        <TableCell>
                                            <Typography fontWeight="bold">Level {row.level}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {row.level <= unlocked ? (
                                                <Typography color="success.main" fontWeight="bold">Unlocked</Typography>
                                            ) : (
                                                <Typography color="text.disabled">Locked</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {row.level === 1 ? '30%' :
                                                row.level === 2 ? '20%' :
                                                    row.level === 3 ? '15%' : '5%'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="bold">
                                                ₹{row.amount.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        
    );
};

export default LevelIncome;
