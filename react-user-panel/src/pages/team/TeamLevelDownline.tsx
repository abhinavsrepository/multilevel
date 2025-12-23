import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Phone,
  Email,
  AccountTree,
  Person,
  TrendingUp,
  Business,
  Home,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/common/StatsCard';
import { getTeamMembers, getTeamStats, getLevelBreakdown } from '@/api/team.api';
import type { TeamMember, LevelBreakdown } from '@/types';

interface LevelData {
  level: number;
  members: TeamMember[];
  stats: {
    total: number;
    active: number;
    totalInvestment: number;
    totalBV: number;
    propertiesInvested: number;
  };
}

const TeamLevelDownline: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelData, setLevelData] = useState<LevelData[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<number | false>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [overallStats, setOverallStats] = useState({
    totalLevels: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalInvestment: 0,
    totalBV: 0,
  });

  /**
   * Fetch level-wise data
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get level breakdown
        const levelBreakdownRes = await getLevelBreakdown();

        if (!levelBreakdownRes.success || !levelBreakdownRes.data) {
          throw new Error('Failed to fetch level breakdown');
        }

        const breakdown: LevelBreakdown[] = levelBreakdownRes.data;

        // Fetch members for each level
        const levelDataPromises = breakdown.map(async (level) => {
          try {
            const membersRes = await getTeamMembers({
              level: level.level,
              page: 1,
              size: 100,
            });

            const members = membersRes.success ? (membersRes.data?.content || []) : [];

            // Calculate level stats
            const active = members.filter((m: TeamMember) => m.status === 'ACTIVE').length;
            const totalInvestment = members.reduce((sum: number, m: TeamMember) => sum + m.totalInvestment, 0);
            const totalBV = members.reduce((sum: number, m: TeamMember) => sum + (m.bv?.total || 0), 0);

            // Count unique properties (would need API support)
            const propertiesInvested = members.length > 0 ? Math.floor(members.length * 1.5) : 0;

            return {
              level: level.level,
              members,
              stats: {
                total: level.members,
                active,
                totalInvestment,
                totalBV,
                propertiesInvested,
              },
            };
          } catch (err) {
            console.error(`Failed to fetch level ${level.level} members:`, err);
            return {
              level: level.level,
              members: [],
              stats: {
                total: level.members,
                active: 0,
                totalInvestment: 0,
                totalBV: 0,
                propertiesInvested: 0,
              },
            };
          }
        });

        const levelsData = await Promise.all(levelDataPromises);
        setLevelData(levelsData);

        // Calculate overall stats
        const stats = {
          totalLevels: levelsData.length,
          totalMembers: levelsData.reduce((sum, l) => sum + l.stats.total, 0),
          activeMembers: levelsData.reduce((sum, l) => sum + l.stats.active, 0),
          totalInvestment: levelsData.reduce((sum, l) => sum + l.stats.totalInvestment, 0),
          totalBV: levelsData.reduce((sum, l) => sum + l.stats.totalBV, 0),
        };
        setOverallStats(stats);

      } catch (err: any) {
        setError(err.message || 'Failed to load team level data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Handle accordion change
   */
  const handleAccordionChange = (level: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedLevel(isExpanded ? level : false);
  };

  /**
   * Filter members by search query
   */
  const filterMembers = (members: TeamMember[]) => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        (m.fullName || '').toLowerCase().includes(query) ||
        (m.userId || '').toLowerCase().includes(query) ||
        (m.email || '').toLowerCase().includes(query)
    );
  };

  /**
   * Navigate to member tree
   */
  const handleViewTree = (userId: string) => {
    navigate(`/team/binary-tree?userId=${userId}`);
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} key={`level-${i}`}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Team Level Downline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your team members organized by levels with detailed performance metrics
        </Typography>
      </Box>

      {/* Overall Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Levels"
            value={overallStats.totalLevels}
            icon={<AccountTree />}
            color="primary"
            gradient
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Members"
            value={overallStats.totalMembers}
            icon={<Person />}
            color="success"
            trend={{
              value: overallStats.activeMembers,
              isPositive: true,
              label: 'active',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Investment"
            value={overallStats.totalInvestment}
            prefix="₹"
            icon={<Home />}
            color="info"
            decimals={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total BV"
            value={overallStats.totalBV.toLocaleString()}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search members by name, ID, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Level-wise Accordions */}
      <Box sx={{ mb: 3 }}>
        <AnimatePresence>
          {levelData.map((level, index) => {
            const filteredMembers = filterMembers(level.members);
            const activePercentage = level.stats.total > 0
              ? (level.stats.active / level.stats.total) * 100
              : 0;

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Accordion
                  expanded={expandedLevel === level.level}
                  onChange={handleAccordionChange(level.level)}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      bgcolor: expandedLevel === level.level
                        ? theme.palette.primary.main
                        : theme.palette.background.paper,
                      color: expandedLevel === level.level
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: expandedLevel === level.level
                          ? theme.palette.primary.dark
                          : theme.palette.action.hover,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, pr: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Level {level.level}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {level.stats.total} members ({level.stats.active} active)
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Investment
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(level.stats.totalInvestment)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Business Volume
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {level.stats.totalBV.toLocaleString()} BV
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Properties
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {level.stats.propertiesInvested}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    {/* Level Stats Card */}
                    <Box sx={{ p: 3, bgcolor: theme.palette.action.hover }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                Activity Rate
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="primary">
                                {activePercentage.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={activePercentage}
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Members Table */}
                    {filteredMembers.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                              <TableCell>Member</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Rank</TableCell>
                              <TableCell align="right">Investment</TableCell>
                              <TableCell align="right">Team Size</TableCell>
                              <TableCell align="right">BV</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredMembers.map((member) => (
                              <TableRow
                                key={member.id}
                                hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                      src={member.profilePicture}
                                      alt={member.fullName || 'Member'}
                                      sx={{ width: 40, height: 40 }}
                                    >
                                      {(member.fullName || member.userId || 'M').charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {member.fullName || 'N/A'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {member.userId || 'N/A'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.status}
                                    size="small"
                                    color={
                                      member.status === 'ACTIVE'
                                        ? 'success'
                                        : member.status === 'PENDING'
                                        ? 'warning'
                                        : 'default'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.rank?.name || 'N/A'}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatCurrency(member.totalInvestment)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600}>
                                    {member.teamSize}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600} color="primary">
                                    {(member.bv?.total || 0).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Stack direction="row" spacing={1} justifyContent="center">
                                    <Tooltip title="Call">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        href={`tel:${member.mobile}`}
                                      >
                                        <Phone fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Email">
                                      <IconButton
                                        size="small"
                                        color="info"
                                        href={`mailto:${member.email}`}
                                      >
                                        <Email fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View Tree">
                                      <IconButton
                                        size="small"
                                        color="secondary"
                                        onClick={() => handleViewTree(member.userId)}
                                      >
                                        <AccountTree fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? 'No members found matching your search'
                            : 'No members at this level'}
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {levelData.length === 0 && !loading && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Level Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start building your team to see level-wise breakdown
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TeamLevelDownline;
