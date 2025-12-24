import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    useTheme,
    Tooltip,
    CircularProgress,
    Stack
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';

interface BalanceGaugeProps {
    balancing: {
        strongestLeg: {
            volume: number;
            cappedVolume: number;
            required: number;
            percentage: number;
        };
        otherLegs: {
            volume: number;
            required: number;
            percentage: number;
        };
        totalValidVolume: number;
        target: number;
    };
}

const CircularGauge = ({
    value,
    max,
    color,
    label,
    subLabel,
    tooltip
}: {
    value: number;
    max: number;
    color: string;
    label: string;
    subLabel: string;
    tooltip: string;
}) => {
    const theme = useTheme();
    // Cap percentage at 100 for visual, but show real value
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                {/* Background Circle */}
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={8}
                    sx={{ color: theme.palette.grey[200] }}
                />
                {/* Foreground Circle */}
                <CircularProgress
                    variant="determinate"
                    value={percentage}
                    size={120}
                    thickness={8}
                    sx={{
                        color: color,
                        position: 'absolute',
                        left: 0,
                        strokeLinecap: 'round',
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
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                        {Math.round(percentage)}%
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>
                <Tooltip title={tooltip}>
                    <InfoOutlined fontSize="small" color="action" />
                </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">{subLabel}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, color: color }}>
                {formatCurrency(value)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Target: {formatCurrency(max)}
            </Typography>
        </Box>
    );
};

const BalanceGauge: React.FC<BalanceGaugeProps> = ({ balancing }) => {
    const theme = useTheme();

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Team Balance Health (40:60 Rule)
                </Typography>

                <Grid container spacing={4} justifyContent="center" alignItems="center">
                    {/* Strong Leg Gauge */}
                    <Grid item xs={12} sm={6} md={5}>
                        <CircularGauge
                            value={balancing.strongestLeg.cappedVolume}
                            max={balancing.strongestLeg.required}
                            color={theme.palette.primary.main}
                            label="Strong Leg"
                            subLabel="(Max 60% Contribution)"
                            tooltip={`Your strongest leg provides ${formatCurrency(balancing.strongestLeg.volume)}. Only ${formatCurrency(balancing.strongestLeg.cappedVolume)} counts towards the rank.`}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="text.secondary">+</Typography>
                    </Grid>

                    {/* Other Legs Gauge */}
                    <Grid item xs={12} sm={6} md={5}>
                        <CircularGauge
                            value={balancing.otherLegs.volume}
                            max={balancing.otherLegs.required}
                            color={theme.palette.secondary.main} // Or a specific green
                            label="Other Legs"
                            subLabel="(Min 40% Required)"
                            tooltip={`Combined volume from all other legs is ${formatCurrency(balancing.otherLegs.volume)}. You need at least ${formatCurrency(balancing.otherLegs.required)} from these legs to balance the strong leg.`}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Total Valid Volume Scored:
                        </Typography>
                        <Typography variant="h6" color="success.main">
                            {formatCurrency(balancing.totalValidVolume)} / {formatCurrency(balancing.target)}
                        </Typography>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default BalanceGauge;
