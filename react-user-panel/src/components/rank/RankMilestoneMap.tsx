import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Tooltip,
    useTheme,
    Zoom,
    Paper
} from '@mui/material';
import { CheckCircle, Lock, Star } from '@mui/icons-material';
import { Rank } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface RankMilestoneMapProps {
    ranks: Rank[];
    currentRank: Rank;
    nextRank?: Rank;
    currentVolume: number; // accumulated valid volume
}

const RankMilestoneMap: React.FC<RankMilestoneMapProps> = ({
    ranks,
    currentRank,
    nextRank,
    currentVolume
}) => {
    const theme = useTheme();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setAnimate(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // Sort ranks by order
    const sortedRanks = [...ranks].sort((a, b) => a.displayOrder - b.displayOrder);

    // Find index of current and next
    const currentRankIndex = sortedRanks.findIndex(r => r.name === currentRank.name); // Using name as ID might vary
    // If currentRank corresponds to "Unranked", index might be -1 or 0 depending on data.

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                overflowX: 'auto',
                bgcolor: 'background.neutral',
                borderRadius: 2,
                mb: 3,
                '&::-webkit-scrollbar': {
                    height: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.grey[400],
                    borderRadius: 4,
                },
            }}
        >
            <Box sx={{ minWidth: sortedRanks.length * 160, pb: 2, pt: 1 }}>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

                    {/* Background Line */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 50,
                            right: 50,
                            top: 24,
                            height: 6,
                            bgcolor: theme.palette.grey[300],
                            borderRadius: 3,
                            zIndex: 0
                        }}
                    />

                    {/* Progress Line (Animated) */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 50,
                            top: 24,
                            height: 6,
                            bgcolor: theme.palette.success.main,
                            borderRadius: 3,
                            zIndex: 1,
                            width: animate ? calculateProgressWidth(sortedRanks, currentRankIndex, currentVolume, nextRank) : '0%',
                            transition: 'width 2s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
                        }}
                    />

                    {/* Rank Nodes */}
                    {sortedRanks.map((rank, index) => {
                        const isAchieved = index <= currentRankIndex;
                        const isNext = index === currentRankIndex + 1;

                        return (
                            <Box
                                key={rank.id}
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    zIndex: 2,
                                    position: 'relative'
                                }}
                            >
                                <Tooltip
                                    title={
                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                            <Typography variant="subtitle2">{rank.name}</Typography>
                                            <Typography variant="body2">Target: {formatCurrency(rank.requiredTeamInvestment)}</Typography>
                                            <Typography variant="caption" color="secondary.light">Reward: {rank.oneTimeBonus > 0 ? formatCurrency(rank.oneTimeBonus) : 'Rewards'}</Typography>
                                        </Box>
                                    }
                                    arrow
                                    TransitionComponent={Zoom}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: isAchieved ? theme.palette.success.main : (isNext ? 'white' : theme.palette.grey[300]),
                                            border: `4px solid ${isAchieved ? theme.palette.success.main : (isNext ? theme.palette.primary.main : theme.palette.grey[300])}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isAchieved ? 'white' : (isNext ? theme.palette.primary.main : theme.palette.grey[500]),
                                            transition: 'all 0.3s ease',
                                            boxShadow: isNext ? `0 0 15px ${theme.palette.primary.main}60` : 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isAchieved ? <CheckCircle /> : (isNext ? <Star /> : <Lock />)}
                                    </Box>
                                </Tooltip>

                                <Box sx={{ mt: 2, textAlign: 'center', px: 1 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: isNext ? 700 : 500,
                                            color: isAchieved ? 'success.main' : (isNext ? 'primary.main' : 'text.disabled'),
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {rank.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                                        {formatCurrency(rank.requiredTeamInvestment)}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Paper>
    );
};

// Helper: Calculate width percentage for the progress bar
function calculateProgressWidth(ranks: Rank[], currentIndex: number, currentVolume: number, nextRank?: Rank) {
    if (ranks.length <= 1) return '100%';

    const totalNodes = ranks.length;

    // Base progress: Completed ranks
    let widthPct = (currentIndex / (totalNodes - 1)) * 100;

    // Add partial progress to next rank
    if (nextRank && currentIndex < totalNodes - 1) {
        const nextRankTarget = parseFloat(nextRank.requiredTeamInvestment as any) || 0;
        const prevRankTarget = currentIndex >= 0 ? parseFloat(ranks[currentIndex].requiredTeamInvestment as any) || 0 : 0;

        // Volume accumulation logic is usually total, not reset per rank.
        // So currentVolume is total valid volume.

        const gap = nextRankTarget - prevRankTarget;
        const progressInGap = Math.max(0, currentVolume - prevRankTarget);

        if (gap > 0) {
            const gapPct = Math.min(progressInGap / gap, 1);
            // Add fraction of one segment
            // The distance between nodes is roughly 100 / (n-1)%
            const segmentSize = 100 / (totalNodes - 1); // If we align center-to-center

            // Wait, width logic:
            // 0% = Center of 1st node
            // 100% = Center of last node

            // So width = (currentIndex * segmentSize) + (gapPct * segmentSize)
            // Check bounds
            const extraWidth = gapPct * segmentSize;
            widthPct = (currentIndex * segmentSize) + extraWidth;
        }
    }

    return `${Math.min(widthPct, 100)}%`; // Relative to the container inner width (minus padding)
    // Actually simplest is absolute position or calculate properly. 
    // Above heuristic 'segmentSize = 100/(N-1)' works if N > 1.
}

export default RankMilestoneMap;
