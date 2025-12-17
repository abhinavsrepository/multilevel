import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Avatar,
    Chip,
    CircularProgress,
    Button,
    Divider,
    Stack,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    ArrowBack as ArrowBackIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CalendarToday as CalendarIcon,
    EmojiEvents as TrophyIcon,
    AccountBalanceWallet as WalletIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import api from '@/api/config/axiosConfig';
import dayjs from 'dayjs';

interface TeamMemberDetails {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    rank: string;
    status: string;
    createdAt: string;
    profilePhotoUrl: string | null;
    sponsorId: number | null;
    placementUserId: number | null;
    personalBv: number;
    teamBv: number;
    leftBv: number;
    rightBv: number;
    carryForwardLeft: number;
    carryForwardRight: number;
    totalInvestment: number;
    directReferralsCount: number;
    teamSize: number;
    Sponsor?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
    PlacementUser?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
}

const TeamDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [member, setMember] = useState<TeamMemberDetails | null>(null);

    useEffect(() => {
        if (id) {
            fetchMemberDetails(id);
        }
    }, [id]);

    const fetchMemberDetails = async (memberId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/team/member/${memberId}`);
            if (response.data.success) {
                setMember(response.data.data);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch member details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    if (!member) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'INACTIVE': return 'error';
            case 'SUSPENDED': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back to Team
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar
                                src={member.profilePhotoUrl || undefined}
                                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                            >
                                <PersonIcon sx={{ fontSize: 60 }} />
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                                {member.firstName} {member.lastName}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                                @{member.username}
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                                <Chip label={member.status} color={getStatusColor(member.status) as any} size="small" />
                                <Chip icon={<TrophyIcon />} label={member.rank} color="primary" variant="outlined" size="small" />
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Stack spacing={2} alignItems="flex-start">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{member.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{member.phoneNumber || '-'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon color="action" fontSize="small" />
                                    <Typography variant="body2">
                                        Joined {dayjs(member.createdAt).format('DD MMM YYYY')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Upline Information</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">Sponsor</Typography>
                                    <Typography variant="body1">
                                        {member.Sponsor ? `${member.Sponsor.firstName} ${member.Sponsor.lastName} (@${member.Sponsor.username})` : '-'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">Placement</Typography>
                                    <Typography variant="body1">
                                        {member.PlacementUser ? `${member.PlacementUser.firstName} ${member.PlacementUser.lastName} (@${member.PlacementUser.username})` : '-'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stats & Details */}
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <WalletIcon color="success" fontSize="large" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Total Investment</Typography>
                                            <Typography variant="h6">₹{member.totalInvestment.toLocaleString()}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <GroupIcon color="primary" fontSize="large" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Team Size</Typography>
                                            <Typography variant="h6">{member.teamSize}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <PersonAddIcon color="secondary" fontSize="large" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Direct Referrals</Typography>
                                            <Typography variant="h6">{member.directReferralsCount}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Business Volume (BV)</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                Personal & Team
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Personal BV</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{member.personalBv}</Typography>
                                                </Box>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Team BV</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{member.teamBv}</Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                                                Binary Legs
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Left BV</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{member.leftBv}</Typography>
                                                </Box>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Right BV</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{member.rightBv}</Typography>
                                                </Box>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Carry Forward Left</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{member.carryForwardLeft}</Typography>
                                                </Box>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Carry Forward Right</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{member.carryForwardRight}</Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeamDetail;
