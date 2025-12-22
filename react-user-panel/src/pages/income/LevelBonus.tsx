import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Stack,
    Divider,
    TextField,
    Button,
} from '@mui/material';
import {
    TrendingUp,
    AttachMoney,
    CheckCircle,
    Lock,
    Refresh,
    Search,
} from '@mui/icons-material';
import { levelBonusApi } from '../../api/level-bonus.api';
import dayjs from 'dayjs';

interface Eligibility {
    hasDirectSale: boolean;
    levelBonusEligible: boolean;
    directSaleDate: string | null;
    status: 'UNLOCKED' | 'LOCKED';
    directSalesCount: number;
    activeDirectsCount: number;
    maxUnlockedLevel: number;
}

interface Stats {
    totalCount: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
}

interface BonusHistory {
    id: number;
    amount: number;
    status: string;
    level: number;
    fromUser: {
        username: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    remarks: string;
}

const LevelBonus: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState<Eligibility | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<BonusHistory[]>([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = { limit: 100 };

            if (fromDate) params.startDate = fromDate;
            if (toDate) params.endDate = toDate;

            const [eligibilityRes, historyRes] = await Promise.all([
                levelBonusApi.getEligibility(),
                levelBonusApi.getHistory(params),
            ]);

            if (eligibilityRes.data.success) {
                setEligibility(eligibilityRes.data.data.eligibility);
                setStats(eligibilityRes.data.data.stats);
            }

            if (historyRes.data.success) {
                let historyData = historyRes.data.data.history || [];

                // Apply username filter
                if (usernameFilter) {
                    historyData = historyData.filter((item: BonusHistory) =>
                        item.fromUser.username.toLowerCase().includes(usernameFilter.toLowerCase()) ||
                        item.fromUser.firstName.toLowerCase().includes(usernameFilter.toLowerCase()) ||
                        item.fromUser.lastName.toLowerCase().includes(usernameFilter.toLowerCase())
                    );
                }

                setHistory(historyData);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchData();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    // Milestones
    const milestones = [
        { level: '1-2', required: 1, unlocked: (eligibility?.activeDirectsCount || 0) >= 1 },
        { level: '3-5', required: 3, unlocked: (eligibility?.activeDirectsCount || 0) >= 3 },
        { level: 'All', required: 5, unlocked: (eligibility?.activeDirectsCount || 0) >= 5 },
    ];

    return (
        <Box>
            {/* Page Header */}
            <Box mb={3}>
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    Level Bonus (LB)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Earn bonuses from downline recruitment activity
                </Typography>
            </Box>

            {/* Eligibility Status Card */}
            <Card
                elevation={3}
                sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                    color: 'white',
                    borderRadius: 3
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        mb: 2
                                    }}
                                >
                                    <CircularProgress
                                        variant="determinate"
                                        value={100}
                                        size={120}
                                        thickness={4}
                                        sx={{ color: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <CircularProgress
                                        variant="determinate"
                                        value={Math.min(((eligibility?.activeDirectsCount || 0) / 5) * 100, 100)}
                                        size={120}
                                        thickness={4}
                                        sx={{
                                            color: '#4caf50',
                                            position: 'absolute',
                                            left: 0,
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            top: 0,
                                            left: 0,
                                            bottom: 0,
                                            right: 0,
                                            position: 'absolute',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight={700}>
                                            {eligibility?.activeDirectsCount || 0}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            Active Directs
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Current Status: {eligibility?.activeDirectsCount ? `Unlocked up to Level ${eligibility?.maxUnlockedLevel}` : 'No Levels Unlocked'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" gutterBottom>
                                Unlock Progress
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {milestones.map((milestone, index) => (
                                    <Paper
                                        key={index}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            bgcolor: milestone.unlocked ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid',
                                            borderColor: milestone.unlocked ? '#4caf50' : 'rgba(255,255,255,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Levels {milestone.level}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                Requires {milestone.required} Active Direct(s)
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {milestone.unlocked ? (
                                                <Chip
                                                    label="UNLOCKED"
                                                    size="small"
                                                    sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 700 }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="LOCKED"
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                                />
                                            )}
                                            {milestone.unlocked ? <CheckCircle color="success" /> : <Lock sx={{ opacity: 0.5 }} />}
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                            <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(3, 169, 244, 0.1)', color: '#e3f2fd' }}>
                                Recruitment counts only include "Active" members who have made a purchase.
                            </Alert>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <TrendingUp sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Bonuses
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {stats?.totalCount || 0}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        backgroundColor: 'success.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AttachMoney sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        ₹{stats?.totalAmount.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        backgroundColor: 'warning.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AttachMoney sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        ₹{stats?.pendingAmount.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        backgroundColor: 'info.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AttachMoney sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Paid
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        ₹{stats?.paidAmount.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Manual Payout Notice */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                    Manual Payout System
                </Typography>
                <Typography variant="caption" display="block" mt={0.5}>
                    Level Bonuses are calculated automatically but require manual admin approval before payout.
                    Check the status column to track your bonus approval process.
                </Typography>
            </Alert>

            {/* Level Bonus History */}
            <Card elevation={2}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Level Bonus History
                        </Typography>
                        <Tooltip title="Refresh">
                            <IconButton onClick={fetchData} size="small">
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {/* Filters */}
                    <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="From Date"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="To Date"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Username"
                                    placeholder="Search by username or name"
                                    value={usernameFilter}
                                    onChange={(e) => setUsernameFilter(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<Search />}
                                    onClick={handleSearch}
                                    sx={{ height: 40 }}
                                >
                                    Search
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ border: '2px solid #e0e0e0' }}>
                        <Table sx={{ '& .MuiTableCell-root': { border: '1px solid #e0e0e0' } }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>SNo</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>By UserId</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>By Name</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Income Date</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Level</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Income</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>TDS Charge</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Processing Charge</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Pay Income</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No bonus records found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((record, index) => {
                                        const tdsCharge = (record.amount * 0.05).toFixed(2);
                                        const processingCharge = (record.amount * 0.05).toFixed(2);
                                        const payIncome = (record.amount - parseFloat(tdsCharge) - parseFloat(processingCharge)).toFixed(2);

                                        return (
                                            <TableRow
                                                key={record.id}
                                                sx={{
                                                    '&:nth-of-type(even)': { backgroundColor: '#f5f5f5' },
                                                    '&:hover': { backgroundColor: '#e3f2fd' }
                                                }}
                                            >
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={500}>{index + 1}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                                        {record.fromUser.username}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {record.fromUser.firstName} {record.fromUser.lastName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2">
                                                        {dayjs(record.createdAt).format('DD MMM YYYY')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Chip
                                                        label={record.level}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {record.amount.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600} color="error.main">
                                                        {tdsCharge}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600} color="warning.main">
                                                        {processingCharge}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={700} color="success.main">
                                                        {payIncome}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LevelBonus;
