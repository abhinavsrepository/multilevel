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
    LinearProgress,
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
    People,
    AttachMoney,
    CheckCircle,
    Refresh,
    CalendarToday,
    Timer,
    Search,
} from '@mui/icons-material';
import { directBonusApi } from '../../api/direct-bonus.api';
import dayjs from 'dayjs';

interface Stats {
    totalRecruits: number;
    monthRecruits: number;
    totalBonus: number;
    monthBonus: number;
    pendingBonus: number;
}

interface BonusLog {
    id: number;
    newTeamMemberName: string;
    agentId: string;
    joinDate: string;
    bonusPaid: number;
    status: string;
}

interface FastStartBonus {
    targetSales: number;
    targetRecruits: number;
    currentSales: number;
    currentRecruits: number;
    bonusAmount: number;
    daysRemaining: number;
    salesProgress: number;
    recruitsProgress: number;
    overallProgress: number;
    isQualified: boolean;
}

const DirectBonus: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [bonusLog, setBonusLog] = useState<BonusLog[]>([]);
    const [fastStartBonus, setFastStartBonus] = useState<FastStartBonus | null>(null);
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

            const [statsRes, logRes, fsbRes] = await Promise.all([
                directBonusApi.getStats(),
                directBonusApi.getLog(params),
                directBonusApi.getFastStartBonus(),
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            if (logRes.data.success) {
                let logs = logRes.data.data.log || [];

                // Apply username filter
                if (usernameFilter) {
                    logs = logs.filter((log: BonusLog) =>
                        log.agentId.toLowerCase().includes(usernameFilter.toLowerCase()) ||
                        log.newTeamMemberName.toLowerCase().includes(usernameFilter.toLowerCase())
                    );
                }

                setBonusLog(logs);
            }

            if (fsbRes.data.success && fsbRes.data.data) {
                setFastStartBonus(fsbRes.data.data);
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
                    Direct Bonus
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track your direct referral bonuses and earnings
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={4}>
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
                                    <People sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Recruits
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats?.totalRecruits || 0}
                                    </Typography>
                                    <Typography variant="caption" color="success.main">
                                        {stats?.monthRecruits || 0} this month
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
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
                                        Total Bonus
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        ₹{stats?.totalBonus.toLocaleString() || 0}
                                    </Typography>
                                    <Typography variant="caption" color="success.main">
                                        ₹{stats?.monthBonus.toLocaleString() || 0} this month
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
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
                                    <TrendingUp sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending Bonus
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        ₹{stats?.pendingBonus.toLocaleString() || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Awaiting approval
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Fast Start Bonus */}
            {fastStartBonus && (
                <Card elevation={2} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={600} color="white">
                                    Fast Start Bonus Challenge
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Complete the challenge and earn ₹{fastStartBonus.bonusAmount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mt: 0.5 }}>
                                    Must achieve 1 D-SC (Direct Sale) to qualify for this bonus
                                </Typography>
                            </Box>
                            <Box textAlign="center" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, px: 2, py: 1 }}>
                                <Timer sx={{ color: 'white', fontSize: 32 }} />
                                <Typography variant="h5" fontWeight={700} color="white">
                                    {fastStartBonus.daysRemaining}
                                </Typography>
                                <Typography variant="caption" color="white">
                                    Days Left
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2" color="white" fontWeight={600}>
                                            Sales Target
                                        </Typography>
                                        <Typography variant="body2" color="white" fontWeight={600}>
                                            {fastStartBonus.currentSales} / {fastStartBonus.targetSales}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={fastStartBonus.salesProgress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: 'white',
                                            },
                                        }}
                                    />
                                    <Stack direction="row" spacing={1} mt={1}>
                                        {fastStartBonus.currentSales >= fastStartBonus.targetSales ? (
                                            <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                                        ) : null}
                                        <Typography variant="caption" color="white">
                                            {fastStartBonus.salesProgress.toFixed(0)}% Complete
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2" color="white" fontWeight={600}>
                                            Recruits Target
                                        </Typography>
                                        <Typography variant="body2" color="white" fontWeight={600}>
                                            {fastStartBonus.currentRecruits} / {fastStartBonus.targetRecruits}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={fastStartBonus.recruitsProgress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: 'white',
                                            },
                                        }}
                                    />
                                    <Stack direction="row" spacing={1} mt={1}>
                                        {fastStartBonus.currentRecruits >= fastStartBonus.targetRecruits ? (
                                            <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                                        ) : null}
                                        <Typography variant="caption" color="white">
                                            {fastStartBonus.recruitsProgress.toFixed(0)}% Complete
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Grid>
                        </Grid>

                        {fastStartBonus.isQualified && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    Congratulations! You've qualified for the Fast Start Bonus!
                                </Typography>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Direct Referral Bonus Log */}
            <Card elevation={2}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Direct Referral Bonus Log (DR-SB Log)
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
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Income</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>TDS Charge</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Processing Charge</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', py: 1.5 }}>Pay Income</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bonusLog.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No bonus records found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bonusLog.map((log, index) => {
                                        const tdsCharge = (log.bonusPaid * 0.05).toFixed(2);
                                        const processingCharge = (log.bonusPaid * 0.05).toFixed(2);
                                        const payIncome = (log.bonusPaid - parseFloat(tdsCharge) - parseFloat(processingCharge)).toFixed(2);

                                        return (
                                            <TableRow
                                                key={log.id}
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
                                                        {log.agentId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {log.newTeamMemberName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2">
                                                        {dayjs(log.joinDate).format('DD MMM YYYY')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {log.bonusPaid.toFixed(2)}
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

export default DirectBonus;
