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
    LockOpen,
    Refresh,
    CalendarToday,
    Person,
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
                return 'info';
            case 'PAID':
                return 'success';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

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
                    background: eligibility?.levelBonusEligible
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #757575 0%, #424242 100%)',
                    border: eligibility?.levelBonusEligible ? '2px solid #4caf50' : '2px solid #9e9e9e'
                }}
            >
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Box
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {eligibility?.levelBonusEligible ? (
                                <LockOpen sx={{ color: 'white', fontSize: 48 }} />
                            ) : (
                                <Lock sx={{ color: 'white', fontSize: 48 }} />
                            )}
                        </Box>
                        <Box flex={1}>
                            <Typography variant="h5" fontWeight={700} color="white">
                                Level Bonus Eligibility Status
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                                <Typography variant="h3" fontWeight={700} color="white">
                                    {eligibility?.status || 'LOCKED'}
                                </Typography>
                                {eligibility?.levelBonusEligible && (
                                    <CheckCircle sx={{ color: '#4caf50', fontSize: 40 }} />
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', my: 2 }} />

                    {eligibility?.levelBonusEligible ? (
                        <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    Congratulations! You are eligible to earn Level Bonus from your downline's recruitment activity.
                                </Typography>
                            </Alert>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                                        <Typography variant="body2" color="white" gutterBottom>
                                            Direct Sales Completed
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="white">
                                            {eligibility.directSalesCount}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                                        <Typography variant="body2" color="white" gutterBottom>
                                            Qualification Date
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} color="white">
                                            {eligibility.directSaleDate
                                                ? dayjs(eligibility.directSaleDate).format('MMM DD, YYYY')
                                                : 'N/A'
                                            }
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Alert severity="warning">
                            <Typography variant="body2" fontWeight={600}>
                                You need to complete at least 1 Direct Property Sale (D-SC) to unlock Level Bonus earning.
                            </Typography>
                            <Typography variant="caption" display="block" mt={1}>
                                Level Bonus is paid on downline recruitment activity, but requires a personal direct sale first.
                            </Typography>
                        </Alert>
                    )}
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
